# Trvise — Agentic Multimodal Search Pipeline
## Build Plan

---

## Goal

Replace the simulated dataset search with a real agentic pipeline that:
- Ingests robot episode recordings (RGB, audio, IMU/proprioception, telemetry)
- Encodes all modalities into a single shared embedding space via contrastive training
- Runs an agent loop to search, re-rank with a VLM, and curate dataset slices
- Outputs labeled good/bad frames ready for downstream RL training

---

## Architecture Overview

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  Vision         │   │  Audio          │   │  Sensor         │
│  SigLIP ViT-L   │   │  wav2vec 2.0    │   │  PatchTST       │
│  (freeze→tune)  │   │  (freeze→tune)  │   │  (train fresh)  │
│  (B, 1152)      │   │  (B, 1024)      │   │  (B, 256)       │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
    Proj(1152→512)        Proj(1024→512)         Proj(256→512)
    LayerNorm              LayerNorm              LayerNorm
    L2 norm                L2 norm                L2 norm
         │                     │                     │
         └─────────────┬───────────────────────────┘
                       │
                 shared 512-dim space
                 (unit hypersphere)
                       │
              Contrastive loss
              (synchronized pairs = positives)
```

**Training data:** synchronized multi-sensor robot recordings. No labels needed —
temporal synchronization provides positive pairs. ~50k timesteps to train projectors,
~500k+ to fine-tune encoders.

---

## Phase 0 — Infrastructure Setup
**Prerequisite. Do this before writing any ML code.**

### 0.1 — Vector store
- [ ] Install and run Qdrant locally via Docker
  ```bash
  docker run -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant
  ```
- [ ] Create a `robot_episodes` collection with named vectors (vision, audio, sensor), each 512-dim
- [ ] Verify the Qdrant dashboard loads at `localhost:6333/dashboard`

### 0.2 — Object storage
- [ ] Set up an S3 bucket (or MinIO locally for dev) to store raw frames, audio clips, sensor sequences
- [ ] Path schema: `s3://bucket/episodes/{episode_id}/{timestamp_ms}/{modality}.ext`

### 0.3 — GPU access
- [ ] Provision a GPU instance — Modal, Lambda Labs, or local GPU
- [ ] Confirm CUDA is available: `python -c "import torch; print(torch.cuda.is_available())"`
- [ ] Needed for SigLIP, wav2vec, sensor encoder training, and VLM re-ranker

### 0.4 — Migrate Flask → FastAPI
- [ ] Rewrite `search/app.py` as a FastAPI app
- [ ] Add lifespan startup: Qdrant client, S3 client, encoder model loading
- [ ] Keep existing CLIP/Bedrock search endpoints working during migration
- [ ] Add `/health` endpoint

---

## Phase 1 — Encoder Stack
**Build and verify each encoder independently before training together.**

### 1.1 — Vision encoder (SigLIP)
- [ ] Load SigLIP from HuggingFace:
  ```python
  from transformers import AutoModel, AutoProcessor
  model = AutoModel.from_pretrained("google/siglip-so400m-patch14-384")
  # pooler_output → (B, 1152)
  ```
- [ ] Write `encode_vision(image_path) → np.ndarray (1152,)`
- [ ] Freeze all weights initially — only the projector trains first
- [ ] Plan to unfreeze last 4 transformer blocks in Phase 3 fine-tuning

### 1.2 — Audio encoder (wav2vec 2.0)
- [ ] Load wav2vec from HuggingFace:
  ```python
  from transformers import Wav2Vec2Model
  model = Wav2Vec2Model.from_pretrained("facebook/wav2vec2-large-960h")
  # mean pool last hidden state → (B, 1024)
  ```
- [ ] Write `encode_audio(audio_path) → np.ndarray (1024,)`
  - Load 1-second window of audio synchronized to frame timestamp
  - Resample to 16kHz if needed
- [ ] Freeze all weights initially

### 1.3 — Sensor encoder (PatchTST)
Train this from scratch — no pretrained weights exist for your specific sensor config.

- [ ] Define input: `(B, seq_len, n_features)` e.g. `(B, 200, 6)` for 6-axis IMU @ 200Hz
- [ ] Implement PatchTST:
  - Divide time series into patches of length 16
  - Linear embed each patch → d_model=256
  - Prepend CLS token, add positional embeddings
  - 6-layer transformer encoder, 8 heads
  - Return CLS token → `(B, 256)`
- [ ] Write `encode_sensor(imu_sequence) → np.ndarray (256,)`
- [ ] Unit test: verify output shape and that gradients flow

### 1.4 — Projection heads
One shared projector class for all three encoders:
```python
class Projector(nn.Module):
    def __init__(self, in_dim, out_dim=512):
        self.net = nn.Sequential(
            nn.Linear(in_dim, out_dim * 2),
            nn.GELU(),
            nn.Linear(out_dim * 2, out_dim),
            nn.LayerNorm(out_dim),
        )
    def forward(self, x):
        return F.normalize(self.net(x), dim=-1)  # unit sphere
```
- [ ] Instantiate: `VisionProjector(1152→512)`, `AudioProjector(1024→512)`, `SensorProjector(256→512)`
- [ ] Verify all three projectors produce unit-norm vectors in the same 512-dim space

---

## Phase 2 — Contrastive Training
**Train the projectors (and eventually encoders) to align the three modalities.**

### 2.1 — Build training dataset
- [ ] Parse robot recordings into synchronized triplets: `(rgb_frame, audio_clip, sensor_seq)` at each timestep
- [ ] Store as HDF5 or a folder of `.npz` files — one per timestep
- [ ] Split: 80% train, 10% val, 10% test
- [ ] Minimum viable: 50k triplets to train projectors only

### 2.2 — Implement SigLIP contrastive loss
```python
def siglip_loss(emb_a, emb_b, temperature=0.07):
    B = emb_a.shape[0]
    logits = (emb_a @ emb_b.T) / temperature          # (B, B)
    labels = 2 * torch.eye(B, device=logits.device) - 1  # +1 diagonal, -1 off
    return -F.logsigmoid(labels * logits).mean()

def total_loss(vision_emb, audio_emb, sensor_emb):
    return (
        siglip_loss(vision_emb, audio_emb) +
        siglip_loss(vision_emb, sensor_emb) +
        siglip_loss(audio_emb, sensor_emb)
    ) / 3
```
- [ ] Verify loss decreases on a small batch (overfit sanity check)

### 2.3 — Training loop (Stage 1 — projectors only)
- [ ] Freeze all three pretrained encoders
- [ ] Train only the three projector heads
- [ ] Optimizer: AdamW, lr=1e-3, cosine schedule, warmup 500 steps
- [ ] Batch size: 256+ (contrastive loss needs large batches)
- [ ] Log: loss per pair (vision-audio, vision-sensor, audio-sensor), retrieval R@1 on val set
- [ ] Train until val R@1 plateaus — expect 5-10 epochs

### 2.4 — Training loop (Stage 2 — fine-tune encoders)
- [ ] Requires ~500k+ triplets — skip if data is limited
- [ ] Unfreeze last 4 transformer blocks of SigLIP and wav2vec
- [ ] Lower LR: 1e-5 for encoders, 1e-4 for projectors
- [ ] Use gradient checkpointing to fit on a single A10G/A100
- [ ] Monitor for catastrophic forgetting on standard vision benchmarks

### 2.5 — Evaluate alignment quality
- [ ] Cross-modal retrieval: embed 1000 val frames, query with sensor → retrieve matching vision frame
- [ ] Target: R@1 > 0.5 before proceeding (random = 0.001)
- [ ] Visualize: t-SNE of all three modalities in shared space — same-episode clusters should overlap

### 2.6 — Export
- [ ] Save encoder + projector weights as a single `MultimodalEncoder` class
- [ ] Write `encode_all(rgb, audio, sensor) → { vision: (512,), audio: (512,), sensor: (512,) }`
- [ ] This is the only interface the rest of the system uses

---

## Phase 3 — Ingest Pipeline
**Turn raw robot recordings into searchable embeddings stored in Qdrant.**

### 3.1 — Episode parser
- [ ] Define input format: ROS2 bag, HDF5, or folder of files
- [ ] Write parser that yields timesteps: `{ ts_ms, rgb_path, audio_path, sensor_seq, telemetry_dict }`
- [ ] Handle: variable frame rates, missing modalities, dropped packets

### 3.2 — Ingest worker
- [ ] For each timestep in an episode:
  1. Upload raw files to S3
  2. Run `encode_all()` → three 512-dim vectors
  3. Upsert to Qdrant with named vectors + metadata payload
- [ ] Payload schema:
  ```json
  {
    "episode_id": "ep042",
    "timestamp_ms": 1234,
    "robot_id": "robot-3",
    "task": "pick_and_place",
    "split": "unlabeled",
    "outcome": null,
    "telemetry": { "velocity": 0.3, "gripper_force": 12.4 },
    "s3_paths": { "rgb": "s3://...", "audio": "s3://...", "sensor": "s3://..." }
  }
  ```
- [ ] Run on one full episode end-to-end, verify in Qdrant dashboard
- [ ] Batch over all stored episodes

---

## Phase 4 — Agent Tools
**Build and test each tool independently before wiring the loop.**

### 4.1 — `embed_query(text, target_modality)`
- [ ] Use SigLIP text encoder to embed the query string → 512-dim (after projector)
- [ ] `target_modality` hints which vector namespace to search against
- [ ] Text lands in the same space as all three modalities — single query works everywhere

### 4.2 — `vector_search(query_vec, modality, filters, top_k)`
- [ ] Qdrant ANN search on named vector for the given modality
- [ ] Optional payload filter: e.g., `{ velocity: { gt: 0.5 }, task: "pick_and_place" }`
- [ ] Returns `[{ frame_id, score, payload }]`

### 4.3 — `describe_frame(frame_id, query)`
- [ ] Load RGB from S3 via payload `s3_paths.rgb`
- [ ] Call VLM: GPT-4V (start) or Qwen-VL-7B (self-hosted at scale)
- [ ] Prompt: `"Query: {query}. Does this frame match? Score 0-10. Label: positive/negative/unsure. One sentence reason."`
- [ ] Returns `{ score, label, reason }`
- [ ] Run as async background task — don't block the agent loop

### 4.4 — `filter_metadata(conditions)`
- [ ] Pure Qdrant payload filter, no vector search
- [ ] Use before expensive vector search to narrow the candidate pool

### 4.5 — `finalize(frame_ids, reason)`
- [ ] Terminates the loop
- [ ] Writes curated slice: `positive_frames/`, `negative_frames/`, `metadata.json`, `embeddings.npy`
- [ ] Updates Qdrant payload: sets `split="curated"`, writes `outcome` labels

---

## Phase 5 — Agent Loop
**Wire the tools into a real agent using Anthropic tool-use API.**

### 5.1 — Agent definition
- [ ] Register all 5 tools with JSON schemas
- [ ] System prompt instructs agent to: search → describe top candidates → refine if needed → finalize
- [ ] Max iterations guard (default: 8 rounds)
- [ ] Agent decides which modality to query based on the query type

### 5.2 — FastAPI streaming endpoint
```
POST /search/agentic
Body:  { query: string, min_results: int, filters?: object }
Response: SSE stream of { type: "tool_call"|"result"|"done", data: ... }
```
- [ ] Stream each agent step back to the frontend as Server-Sent Events
- [ ] Frontend shows reasoning trace in real time

### 5.3 — Connect to frontend
- [ ] Update `SearchDatasetPage.tsx` to call the real endpoint
- [ ] Display reasoning trace as the agent runs
- [ ] Show curated results with VLM labels and scores
- [ ] User accept/reject buttons → write corrections back to Qdrant as labels

---

## Phase 6 — RL Label Pipeline
**The VLM labels from Phase 5 become reward signal.**

- [ ] `outcome` field in Qdrant payload = label store (filled by VLM + human corrections)
- [ ] `export_labeled_dataset(task, split)` → queries Qdrant, returns HDF5 with positive/negative trajectories
- [ ] As new robot episodes arrive, ingest worker runs automatically → agent labels → labels accumulate → policy improves (flywheel)

---

## Phase 7 — Hardening
- [ ] Auth on FastAPI (JWT via Supabase)
- [ ] Ingest job queue (Modal or Celery + Redis) for large batches
- [ ] Rate limiting on VLM calls
- [ ] Monitoring: log every agent call, tool use, VLM score
- [ ] Qdrant snapshots
- [ ] Cost tracking

---

## Build order

```
Phase 0 (infra)
    └── Phase 1 (encoders — build & test each independently)
            └── Phase 2 (contrastive training)
                    └── Phase 3 (ingest pipeline)
                            └── Phase 4 (agent tools)
                                    └── Phase 5 (agent loop)
                                            └── Phase 6 (RL labels)
                                                    └── Phase 7 (hardening)
```

Phase 2 Stage 2 (encoder fine-tuning) is optional — skip if data-limited, do projectors only.

---

## Key decisions

| Decision | Choice | Reason |
|---|---|---|
| Vision encoder | SigLIP ViT-SO400M | Better than CLIP, sigmoid loss scales well |
| Audio encoder | wav2vec 2.0 large | Strong pretrained features, good for non-speech audio |
| Sensor encoder | PatchTST (custom) | Best architecture for time series, train from scratch |
| Shared dim | 512 | Sufficient capacity, cheaper than 1024 |
| Contrastive loss | SigLIP sigmoid loss | Better than InfoNCE for 3-way alignment |
| Vector store | Qdrant | Named vectors per modality, payload filters, self-hosted |
| VLM re-ranker | GPT-4V → Qwen-VL-7B | Speed first, cost efficiency at scale |
| Agent framework | Anthropic tool use API | Already on Bedrock, native tool calling |

---

## What's already built

| File | Status | Action |
|---|---|---|
| `search/app.py` | Flask, working | Migrate to FastAPI in Phase 0.4 |
| `search/embeddings_search.py` | CLIP encoder | Replace with SigLIP + projector in Phase 1.1 |
| `search/agentic_search.py` | Bedrock query decomp | Extend into full agent loop in Phase 5 |
| `search/query_converter.py` | Bedrock integration | Reuse for `embed_query` tool in Phase 4.1 |
| `src/pages/SearchDatasetPage.tsx` | UI, mock data | Wire to real endpoint in Phase 5.3 |