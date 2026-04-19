# 4-Week Product Roadmap

Each week ships something independently sellable. Each week builds on the last.
Realistic scope: ~40hrs/week of focused work.

---

## Week 1 — Video & Sensor Search API
**"Natural language search over robot recordings"**

### What you're building
Take the existing `search/app.py` (CLIP + Bedrock), clean it up, add proper
endpoints, deploy it publicly. First real product.

### Deliverable
A hosted REST API that accepts video files + CSV sensor data and returns
semantically relevant clips in response to natural language queries.

```
POST /search
{
  "query": "robot arm approaching obstacle",
  "video_url": "s3://...",
  "sensor_csv_url": "s3://...",
  "top_k": 10
}

→ [{ "timestamp_ms": 1234, "score": 0.94, "clip_url": "..." }]
```

### Tasks
- [ ] Clean up `search/app.py` — remove debug code, add input validation
- [ ] Add `/upload` endpoint that accepts video + CSV directly (multipart)
- [ ] Add `/search` endpoint wrapping existing CLIP + agentic search
- [ ] Deploy to a public URL — Railway or Fly.io (~$5/month)
- [ ] Write a one-page API doc (Swagger auto-generates from FastAPI)
- [ ] Add a simple API key auth (header: `X-API-Key`)
- [ ] Build a minimal demo page: paste a YouTube URL, type a query, see results

### Who buys this
- ML engineers building video datasets (not just robotics)
- Research labs with large unlabeled video collections
- Any team doing RLHF that needs to find specific behaviors in recordings

### How to sell it
- Post on X/Twitter with a demo video
- List on RapidAPI marketplace
- Price: free tier (100 queries/month) → $49/month (5k queries) → $199/month (50k queries)

### What you already have
~70% of this is already in `search/app.py`, `embeddings_search.py`,
and `agentic_search.py`. This week is mostly productization.

---

## Week 2 — Multimodal Embedding API
**"One API to embed vision, audio, and sensor data into a shared space"**

### What you're building
A hosted embedding service. Send any combination of image, audio clip,
or sensor time series — get back a 512-dim vector. All modalities land
in the same space so you can do cross-modal similarity.

This is the SigLIP + wav2vec + PatchTST stack from the plan, exposed as an API.

### Deliverable
```
POST /embed
{
  "image_url": "s3://...",        # optional
  "audio_url": "s3://...",        # optional
  "sensor_data": [[ax,ay,az,...]],# optional (time series array)
}

→ {
    "vision":  [0.02, -0.11, ...],  # 512-dim, null if not provided
    "audio":   [0.08,  0.03, ...],  # 512-dim, null if not provided
    "sensor":  [0.14, -0.07, ...],  # 512-dim, null if not provided
  }
```

Also expose similarity:
```
POST /similarity
{ "vec_a": [...], "vec_b": [...] }
→ { "cosine": 0.87 }
```

### Tasks
- [ ] Train projectors only (freeze SigLIP + wav2vec) on whatever paired data you have
  - Even 5k synchronized pairs gives a useful projector
  - If no data: use ImageBind weights as initialization for the projector targets
- [ ] Implement PatchTST sensor encoder (from plan Phase 1.3)
- [ ] Wrap all three encoders + projectors in a single `MultimodalEncoder` class
- [ ] Expose as FastAPI endpoints, run on a Modal GPU function (pay-per-call)
- [ ] Add batching: accept up to 32 inputs per request
- [ ] Write Python SDK: `pip install trvise` → `trvise.embed(image=..., sensor=...)`

### Who buys this
- Robotics teams that want semantic search over their own sensor data
- Companies building multimodal RAG systems
- Research groups that don't want to manage GPU infrastructure for embeddings

### How to sell it
- This is a direct competitor to OpenAI's embeddings API but for robotics modalities
- Post the Python SDK on GitHub, drive installs
- Price: $0.0001 per embedding (same model as OpenAI) → $10/month minimum
- Enterprise: custom model fine-tuned on their sensor config

### What you need from Week 1
The deployed infrastructure (FastAPI, Railway/Modal, API key auth). Extend it.

---

## Week 3 — Agentic Dataset Curator
**"Describe what you want, get a labeled dataset"**

### What you're building
The full agentic search loop. User types a natural language description of
a behavior or scenario. The agent searches across all modalities, uses a VLM
to verify and label each result, and exports a curated dataset slice ready
for training.

This is the product that sits on top of Weeks 1 and 2.

### Deliverable
A web UI + API where you:
1. Connect your data source (S3 bucket, upload folder)
2. Describe what you want: `"episodes where the robot fails to grasp the object"`
3. Watch the agent search and label in real time
4. Download a curated dataset: `positive/`, `negative/`, `labels.json`

```
POST /curate
{
  "query": "robot fails to grasp object",
  "source": "s3://my-bucket/episodes/",
  "min_positive": 50,
  "min_negative": 50
}
→ SSE stream of agent steps, then:
→ { "dataset_url": "s3://results/...", "n_positive": 62, "n_negative": 58 }
```

### Tasks
- [ ] Set up Qdrant (Phase 0.1) and write the ingest worker (Phase 3 from plan)
- [ ] Implement the 5 agent tools (Phase 4 from plan)
- [ ] Wire agent loop using Anthropic tool-use API (Phase 5)
- [ ] Stream agent reasoning trace via SSE
- [ ] Wire `SearchDatasetPage.tsx` in the Vortex frontend to the real endpoint
- [ ] Add VLM re-ranking via GPT-4V API (`describe_frame` tool)
- [ ] Export curated dataset as downloadable zip

### Who buys this
- Anyone doing RLHF or behavior cloning that needs labeled trajectory data
- Robotics companies that have large unlabeled recording archives
- ML teams building fine-tuning datasets from video

### How to sell it
- This is the core Trvise product — **this is what the Vortex dashboard demos**
- Price: per curation job — $X per 1000 labeled frames
- Or: $299/month SaaS, unlimited jobs up to N frames/month
- Enterprise: on-premise deployment on their own GPU cluster

### What you need from Weeks 1 + 2
The embedding API (Week 2) provides the vectors. The search API (Week 1)
provides the Bedrock query decomposition. Week 3 wires them together with
the agent loop and Qdrant.

---

## Week 4 — Robot Learning Data Platform
**"The full flywheel: data in, better models out"**

### What you're building
Close the loop. New robot episodes are automatically ingested, the agent
labels them, the labels flow into a training pipeline, the policy improves.
The platform manages the whole ML lifecycle — which is exactly what the
Vortex dashboard shows.

This week you make the Vortex dashboard real.

### Deliverable
A complete platform:
- **Ingest:** drag-drop robot recording → automatically embedded + stored
- **Search & Curate:** (Week 3) natural language → labeled dataset
- **Train:** submit a training job on the curated data (even just a fine-tune call)
- **Evaluate:** run the exported model against a held-out set, get metrics
- **Export:** download ONNX / fine-tuned weights
- **History:** full audit trail of what data produced what model

### Tasks
- [ ] Automated ingest trigger: S3 event → ingest worker (Modal or Lambda)
- [ ] Training job submission: wrap HuggingFace Trainer or a LoRA fine-tune
  into a Modal function, expose as `POST /train`
- [ ] Model registry: store model versions with lineage (which dataset → which model)
- [ ] Wire the Vortex dashboard Train, Export, Deploy pages to real endpoints
- [ ] Replace all Zustand mock stores with React Query + real API calls
- [ ] Add Supabase auth so multiple users/orgs can have separate data

### Who buys this
- Robotics companies that want a managed ML lifecycle platform
- Teams that don't want to build this infrastructure themselves
- Enterprise: any company with recurring robot data collection needs

### How to sell it
- **This is the main Trvise product** — the others are the funnel
- Week 1 demo → "want to search ALL your data automatically? → Week 3"
- Week 3 demo → "want this to run continuously and train your models? → Week 4"
- Price: $999/month per workspace, enterprise contract for on-premise
- The Vortex dashboard IS the sales demo — it already looks production-ready

---

## How the weeks connect

```
Week 1: Search API          → standalone utility, drives signups
    └── Week 2: Embed API   → infrastructure for Week 3, standalone product
            └── Week 3: Curator   → the core product, Week 1+2 as services
                    └── Week 4: Platform  → full lifecycle, Week 3 as a feature
```

Each week's product becomes a feature of the next week's product.
You can sell Week 1 while building Week 2, etc.

---

## What to validate before building

Before writing code, spend 2 hours on each:
- **Week 1:** Find 3 people who search video data manually today. Would they pay $49/month?
- **Week 2:** Find 3 robotics engineers who deal with multi-sensor embeddings. What do they use now?
- **Week 3:** Find 3 people doing RLHF or behavior cloning. How do they currently label data?
- **Week 4:** Find 3 robotics companies. Who manages their ML pipeline today? What does it cost?

The answers will tell you which week's product to double down on.

---

## Risk log

| Risk | Mitigation |
|---|---|
| GPU costs blow up | Use Modal (pay-per-second), add request rate limiting from day 1 |
| No training data for Week 2 | Use ImageBind projector weights as init, skip contrastive training |
| VLM re-ranking too slow/expensive | Cache VLM responses by frame hash, batch calls |
| Week 4 scope creep | Time-box: only wire 3 Vortex pages (Train, Export, History) |