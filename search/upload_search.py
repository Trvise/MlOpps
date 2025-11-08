#!/usr/bin/env python3
"""
Universal Video Search - Upload and Search Script
Simplified interface for uploading video and CSV, then searching
"""

import os
import sys
import argparse

# Add tokenizer_tools to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'tokenizer_tools'))

def main():
    parser = argparse.ArgumentParser(
        description='Universal Video Search System - Upload any video and CSV to search',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Start web interface in upload mode (default)
  %(prog)s

  # Start with default files from config
  %(prog)s --use-defaults

  # Start on different port
  %(prog)s --port 8080

  # Start in debug mode
  %(prog)s --debug

  # Combine options
  %(prog)s --host 0.0.0.0 --port 8080 --debug

Workflow:
  1. Upload your video file (MP4, AVI, MOV, etc.)
  2. Upload your CSV data file
  3. Configure frame sampling rate
  4. Start tokenization (creates CLIP embeddings)
  5. Initialize search system
  6. Search using natural language queries

Query Examples:
  - "car at 50 kmph"
  - "person with temperature over 25 celsius"
  - "vehicle with speed greater than 60 and acceleration over 10"
  - "assembly line at 10 units per minute"

For more details, see UPLOAD_GUIDE.md
        """
    )
    
    parser.add_argument('--use-defaults', action='store_true',
                       help='Initialize with default video and CSV from config (skip upload mode)')
    parser.add_argument('--host', default='0.0.0.0',
                       help='Host to bind to (default: 0.0.0.0)')
    parser.add_argument('--port', type=int, default=5000,
                       help='Port to bind to (default: 5000)')
    parser.add_argument('--debug', action='store_true',
                       help='Enable debug mode')
    
    args = parser.parse_args()
    
    # Print banner
    print()
    print("=" * 70)
    print("  🎥 UNIVERSAL VIDEO SEARCH SYSTEM")
    print("  Upload, Tokenize, and Search Any Video with Data")
    print("=" * 70)
    print()
    
    # Check dependencies
    print("📦 Checking dependencies...")
    try:
        import flask
        import torch
        import cv2
        import pandas as pd
        import numpy as np
        from transformers import CLIPProcessor, CLIPModel
        print("✅ All dependencies installed")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print()
        print("Please install requirements:")
        print("  pip install -r requirements.txt")
        print()
        return 1
    
    # Import and run app
    print()
    if args.use_defaults:
        print("📁 MODE: Using default files from config")
        print("   Video:", os.path.abspath('F_Car_Video_Generated.mp4') if os.path.exists('F_Car_Video_Generated.mp4') else 'NOT FOUND')
        print("   CSV:", os.path.abspath('car_data.csv') if os.path.exists('car_data.csv') else 'NOT FOUND')
    else:
        print("📤 MODE: Upload your own files")
        print("   You can upload any video and CSV file")
        print()
        print("WORKFLOW:")
        print("  1️⃣  Upload video file (MP4, AVI, MOV, etc.)")
        print("  2️⃣  Upload CSV data file")
        print("  3️⃣  Configure tokenization (frame sampling)")
        print("  4️⃣  Start tokenization (creates embeddings)")
        print("  5️⃣  Initialize search system")
        print("  6️⃣  Search with natural language queries!")
    
    print()
    print(f"🌐 Starting web server on {args.host}:{args.port}...")
    print(f"   Open http://localhost:{args.port} in your browser")
    print()
    print("💡 TIP: Press Ctrl+C to stop the server")
    print("=" * 70)
    print()
    
    # Run Flask app
    try:
        import app as flask_app
        flask_app.app.run(debug=args.debug, host=args.host, port=args.port)
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down gracefully...")
        return 0
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())

