# Trvise Video Intelligence

Upload any video and CSV data, tokenize with CLIP, and search using natural language queries that combine visual and data criteria.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the app
python upload_search.py
```

Open http://localhost:5000 in your browser.

## Workflow

1. **Upload Video** - Any format (MP4, AVI, MOV, etc.), max 2GB
2. **Upload CSV** - Must have timestamp column matching video time
3. **Tokenize** - Configure frame sampling (default: 30 = 1 frame/sec)
4. **Initialize** - Load search system
5. **Search** - Natural language queries

## Query Examples

```
car at 50 kmph
vehicle with speed greater than 100 and acceleration over 10
person walking with temperature over 25 celsius
```

## Features

- **Visual Search** - CLIP-powered semantic understanding
- **Data Filtering** - AWS Bedrock query decomposition
- **Interpolation** - Smart timestamp matching with weighted averaging
- **Chain of Thought** - Collapsible reasoning visualization
- **Apple Design** - Premium dark UI inspired by Apple

## Command Line

```bash
# Use default files (skip upload)
python app.py --use-defaults

# Custom port
python app.py --port 8080

# Debug mode
python app.py --debug

# Cleanup GPU processes
python cleanup_gpu.py
```

## Project Structure

```
├── app.py                    # Main Flask application
├── agentic_search.py         # Query decomposition & data filtering
├── embeddings_search.py      # CLIP model & visual search
├── query_converter.py        # AWS Bedrock integration
├── config.py                 # Configuration
├── upload_search.py          # Launcher script
├── templates/
│   └── index_upload.html     # Main UI
└── tokenizer_tools/
    └── tokenize_media.py     # Video tokenization
```

## Requirements

- Python 3.8+
- GPU recommended (CPU works but slower)
- AWS credentials for Bedrock (query parsing)

## Tech Stack

- **Backend:** Flask, PyTorch, Transformers (CLIP)
- **Frontend:** Vanilla JS, Apple-inspired CSS
- **Models:** CLIP ViT-Large-Patch14, AWS Bedrock (Llama 3 70B)
- **Data:** NumPy, Pandas

---

**Trvise** - Video Intelligence Platform
