#!/usr/bin/env python3
"""
Flask UI for Agentic Video Search System with Upload & Tokenization
ChatGPT-style reasoning interface with chain of thought
Supports uploading any video and CSV file, tokenization, and search
"""

from flask import Flask, render_template, request, jsonify, session, send_from_directory
import json
import os
import numpy as np
from datetime import datetime
from agentic_search import LLMAgenticSearch
from embeddings_search import load_clip_model, search_frames, load_existing_embeddings
from config import config
import uuid
import tempfile
import shutil
from werkzeug.utils import secure_filename
from pathlib import Path
import threading
import time

# Import tokenizer
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'tokenizer_tools'))
from tokenize_media import MediaTokenizer

app = Flask(__name__)
app.secret_key = 'agentic_search_secret_key_2024'
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024 * 1024  # 2GB max file size

# Global variables
llm_search = None
clip_loaded = False
current_video_path = None
current_csv_path = None
current_embeddings_dir = None
tokenization_status = {
    'status': 'idle',  # idle, processing, complete, error
    'progress': 0,
    'message': '',
    'total_frames': 0,
    'processed_frames': 0
}

# Upload folder for temporary files
UPLOAD_FOLDER = tempfile.mkdtemp(prefix='video_search_')
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv'}
ALLOWED_CSV_EXTENSIONS = {'csv'}

class SearchSession:
    """Manage search sessions and results"""
    
    def __init__(self):
        self.session_id = str(uuid.uuid4())
        self.query = ""
        self.decomposition = None
        self.visual_results = []
        self.data_results = []
        self.combined_results = []
        self.reasoning_steps = []
        self.timestamp = datetime.now()
    
    def add_reasoning_step(self, step_type: str, content: str, data=None):
        """Add a reasoning step to the chain of thought"""
        step = {
            'id': len(self.reasoning_steps),
            'type': step_type,  # 'query', 'decomposition', 'visual_search', 'data_filter', 'combination', 'result'
            'content': content,
            'data': data,
            'timestamp': datetime.now().strftime("%H:%M:%S")
        }
        self.reasoning_steps.append(step)
    
    def to_dict(self):
        """Convert session to dictionary for JSON serialization"""
        def convert_numpy_types(obj):
            """Recursively convert numpy types to Python native types"""
            if isinstance(obj, dict):
                return {k: convert_numpy_types(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_numpy_types(item) for item in obj]
            elif isinstance(obj, (np.floating, np.integer)):
                return float(obj) if isinstance(obj, np.floating) else int(obj)
            elif hasattr(obj, '__dict__'):
                return convert_numpy_types(obj.__dict__)
            else:
                return obj
        
        return convert_numpy_types({
            'session_id': self.session_id,
            'query': self.query,
            'decomposition': self.decomposition.__dict__ if self.decomposition else None,
            'visual_results': self.visual_results,
            'data_results': self.data_results,
            'combined_results': self.combined_results,
            'reasoning_steps': self.reasoning_steps,
            'timestamp': self.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        })

def allowed_file(filename, allowed_extensions):
    """Check if file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def initialize_systems(video_path=None, csv_path=None, embeddings_dir=None):
    """Initialize the agentic search and CLIP systems"""
    global llm_search, clip_loaded, current_video_path, current_csv_path, current_embeddings_dir
    
    try:
        # Use provided paths or fall back to config defaults
        video_file = video_path or config.get_video_file()
        data_file = csv_path or config.get_data_file()
        emb_dir = embeddings_dir or config.get_embeddings_dir()
        
        # Update current paths
        current_video_path = video_file
        current_csv_path = data_file
        current_embeddings_dir = emb_dir
        
        # Initialize agentic search
        llm_search = LLMAgenticSearch()
        llm_search.initialize(data_path=data_file)
        
        # Always initialize CLIP model for search (needed for search_frames)
        # Even if tokenization already loaded it, we need it in the embeddings_search module
        print("Loading CLIP model for search...")
        clip_result = load_clip_model(config.clip_model)
        if not clip_result:
            print("Error: Failed to load CLIP model")
            return False
        clip_loaded = True
        
        # Load video embeddings
        embeddings_loaded = load_existing_embeddings(emb_dir)
        
        if not embeddings_loaded:
            print("Warning: Video embeddings not loaded")
            return False
        
        print("✅ System initialized successfully!")
        return True
    except Exception as e:
        print(f"Error initializing systems: {e}")
        import traceback
        traceback.print_exc()
        return False

def tokenize_video_async(video_path, output_dir, skip_frames=1, max_frames=None):
    """Tokenize video in background thread"""
    global tokenization_status, clip_loaded
    
    try:
        tokenization_status = {
            'status': 'processing',
            'progress': 0,
            'message': 'Initializing tokenization...',
            'total_frames': 0,
            'processed_frames': 0
        }
        
        # Create tokenizer
        tokenizer = MediaTokenizer(model_id=config.clip_model, device="auto")
        
        # Load CLIP model if not already loaded
        if not tokenizer.load_model():
            tokenization_status = {
                'status': 'error',
                'progress': 0,
                'message': 'Failed to load CLIP model',
                'total_frames': 0,
                'processed_frames': 0
            }
            return
        
        tokenization_status['message'] = 'Processing video frames...'
        
        # Process video with progress tracking
        import cv2
        cap = cv2.VideoCapture(video_path)
        if cap.isOpened():
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            tokenization_status['total_frames'] = total_frames // skip_frames
            cap.release()
        
        # Process video
        success = tokenizer.process_video(
            video_path,
            skip_frames=skip_frames,
            max_frames=max_frames
        )
        
        if not success:
            tokenization_status = {
                'status': 'error',
                'progress': 0,
                'message': 'Failed to process video',
                'total_frames': 0,
                'processed_frames': 0
            }
            return
        
        tokenization_status['message'] = 'Saving embeddings...'
        tokenization_status['progress'] = 90
        
        # Save embeddings
        if not tokenizer.save_embeddings(output_dir):
            tokenization_status = {
                'status': 'error',
                'progress': 0,
                'message': 'Failed to save embeddings',
                'total_frames': 0,
                'processed_frames': 0
            }
            return
        
        # Mark as clip loaded
        clip_loaded = True
        
        tokenization_status = {
            'status': 'complete',
            'progress': 100,
            'message': f'Tokenization complete! {len(tokenizer.embeddings)} frames processed',
            'total_frames': len(tokenizer.embeddings),
            'processed_frames': len(tokenizer.embeddings)
        }
        
        # Clear cache
        tokenizer.clear_cache()
        
    except Exception as e:
        tokenization_status = {
            'status': 'error',
            'progress': 0,
            'message': f'Error: {str(e)}',
            'total_frames': 0,
            'processed_frames': 0
        }

@app.route('/')
def index():
    """Main page - unified upload and search interface"""
    return render_template('index_upload.html')

@app.route('/api/upload/video', methods=['POST'])
def upload_video():
    """Handle video file upload"""
    global current_video_path
    
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename, ALLOWED_VIDEO_EXTENSIONS):
            return jsonify({'error': 'Invalid file type. Allowed: ' + ', '.join(ALLOWED_VIDEO_EXTENSIONS)}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, 'uploaded_video_' + filename)
        file.save(filepath)
        current_video_path = filepath
        
        # Get video info
        import cv2
        cap = cv2.VideoCapture(filepath)
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        cap.release()
        
        return jsonify({
            'success': True,
            'filename': filename,
            'path': filepath,
            'info': {
                'fps': fps,
                'total_frames': total_frames,
                'duration': duration,
                'width': width,
                'height': height
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload/csv', methods=['POST'])
def upload_csv():
    """Handle CSV file upload"""
    global current_csv_path
    
    try:
        if 'csv' not in request.files:
            return jsonify({'error': 'No CSV file provided'}), 400
        
        file = request.files['csv']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename, ALLOWED_CSV_EXTENSIONS):
            return jsonify({'error': 'Invalid file type. Must be CSV'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, 'uploaded_data_' + filename)
        file.save(filepath)
        current_csv_path = filepath
        
        # Get CSV info
        import pandas as pd
        df = pd.read_csv(filepath)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'path': filepath,
            'info': {
                'rows': len(df),
                'columns': list(df.columns),
                'column_count': len(df.columns)
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tokenize', methods=['POST'])
def tokenize():
    """Start video tokenization"""
    global current_video_path, current_embeddings_dir, tokenization_status
    
    try:
        if not current_video_path or not os.path.exists(current_video_path):
            return jsonify({'error': 'No video file uploaded'}), 400
        
        if tokenization_status['status'] == 'processing':
            return jsonify({'error': 'Tokenization already in progress'}), 400
        
        # Get parameters
        data = request.get_json() or {}
        skip_frames = int(data.get('skip_frames', 30))  # Default: sample every 30 frames
        max_frames = data.get('max_frames', None)
        if max_frames:
            max_frames = int(max_frames)
        
        # Create embeddings directory
        embeddings_dir = os.path.join(UPLOAD_FOLDER, 'embeddings')
        os.makedirs(embeddings_dir, exist_ok=True)
        current_embeddings_dir = embeddings_dir
        
        # Start tokenization in background thread
        thread = threading.Thread(
            target=tokenize_video_async,
            args=(current_video_path, embeddings_dir, skip_frames, max_frames)
        )
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': 'Tokenization started',
            'skip_frames': skip_frames,
            'max_frames': max_frames
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tokenize/status')
def tokenize_status():
    """Get tokenization status"""
    return jsonify(tokenization_status)

@app.route('/api/initialize', methods=['POST'])
def initialize():
    """Initialize search system with uploaded files"""
    global current_video_path, current_csv_path, current_embeddings_dir
    
    try:
        if not current_video_path:
            return jsonify({'error': 'No video file uploaded'}), 400
        
        if not current_csv_path:
            return jsonify({'error': 'No CSV file uploaded'}), 400
        
        if not current_embeddings_dir or not os.path.exists(current_embeddings_dir):
            return jsonify({'error': 'Video not tokenized yet'}), 400
        
        if tokenization_status['status'] != 'complete':
            return jsonify({'error': 'Tokenization not complete'}), 400
        
        # Initialize systems with uploaded files
        success = initialize_systems(
            video_path=current_video_path,
            csv_path=current_csv_path,
            embeddings_dir=current_embeddings_dir
        )
        
        if not success:
            return jsonify({'error': 'Failed to initialize search system'}), 500
        
        return jsonify({
            'success': True,
            'message': 'Search system initialized and ready',
            'video': os.path.basename(current_video_path),
            'csv': os.path.basename(current_csv_path)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search', methods=['POST'])
def search():
    """Handle search requests"""
    global llm_search, clip_loaded
    
    if not llm_search or not clip_loaded:
        return jsonify({'error': 'Systems not initialized'}), 500
    
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        top_k = int(data.get('top_k', 10))
        
        if not query:
            return jsonify({'error': 'Query cannot be empty'}), 400
        
        # Create new search session
        session_obj = SearchSession()
        session_obj.query = query
        
        # Step 1: Query Analysis
        session_obj.add_reasoning_step(
            'query',
            f"Analyzing query: \"{query}\"",
            {'query': query, 'top_k': top_k}
        )
        
        # Step 2: Query Decomposition
        session_obj.add_reasoning_step(
            'decomposition',
            "Breaking down query into visual and data components...",
            None
        )
        
        decomposition = llm_search.decompose_query(query)
        session_obj.decomposition = decomposition
        
        session_obj.add_reasoning_step(
            'decomposition',
            f"Query decomposed into:\n• Visual: \"{decomposition.visual_query}\"\n• Data criteria: {len(decomposition.data_criteria)} filters\n• Reasoning: {decomposition.reasoning}",
            {
                'visual_query': decomposition.visual_query,
                'data_criteria': decomposition.data_criteria,
                'reasoning': decomposition.reasoning
            }
        )
        
        # Step 3: Visual Search
        if decomposition.visual_query:
            session_obj.add_reasoning_step(
                'visual_search',
                f"Searching for visual content: \"{decomposition.visual_query}\"",
                {'visual_query': decomposition.visual_query}
            )
            
            visual_results = search_frames(decomposition.visual_query, top_k)
            session_obj.visual_results = [(float(t), float(s)) for t, s in visual_results]
            
            session_obj.add_reasoning_step(
                'visual_search',
                f"Found {len(visual_results)} visual matches with similarities: {[f'{s:.3f}' for t, s in visual_results[:3]]}...",
                {'results_count': len(visual_results), 'top_similarities': [s for t, s in visual_results[:3]]}
            )
        else:
            session_obj.add_reasoning_step(
                'visual_search',
                "No visual query identified, skipping visual search",
                None
            )
        
        # Step 4: Data Filtering
        if decomposition.data_criteria:
            session_obj.add_reasoning_step(
                'data_filter',
                f"Applying data filters: {decomposition.data_criteria}",
                {'criteria': decomposition.data_criteria}
            )
            
            # Get filtered results
            filtered_results = llm_search.search(query, session_obj.visual_results, top_k)
            session_obj.combined_results = [
                {
                    'timestamp': float(r.timestamp),
                    'similarity': float(r.similarity),
                    'data_values': {k: float(v) if isinstance(v, (np.floating, np.integer)) else v 
                                   for k, v in r.data.items()},
                    'matched_criteria': []
                }
                for r in filtered_results
            ]
            
            session_obj.add_reasoning_step(
                'data_filter',
                f"Applied {len(decomposition.data_criteria)} data filters, {len(filtered_results)} results match criteria",
                {'filters_applied': len(decomposition.data_criteria), 'results_after_filter': len(filtered_results)}
            )
        else:
            session_obj.add_reasoning_step(
                'data_filter',
                "No data criteria identified, using visual results only",
                None
            )
            session_obj.combined_results = [
                {
                    'timestamp': float(t),
                    'similarity': float(s),
                    'data_values': {},
                    'matched_criteria': []
                }
                for t, s in session_obj.visual_results
            ]
        
        # Step 5: Final Results
        session_obj.add_reasoning_step(
            'result',
            f"Search complete! Found {len(session_obj.combined_results)} results",
            {'total_results': len(session_obj.combined_results)}
        )
        
        # Store session
        session['current_search'] = session_obj.to_dict()
        
        return jsonify({
            'success': True,
            'session': session_obj.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/results/<int:result_index>')
def get_result_details(result_index):
    """Get detailed information about a specific result"""
    try:
        current_search = session.get('current_search')
        if not current_search or not current_search.get('combined_results'):
            return jsonify({'error': 'No search results available'}), 404
        
        results = current_search['combined_results']
        if result_index >= len(results):
            return jsonify({'error': 'Result index out of range'}), 404
        
        result = results[result_index]
        
        # Add more detailed information
        detailed_result = {
            'timestamp': result['timestamp'],
            'similarity': result['similarity'],
            'data_values': result['data_values'],
            'matched_criteria': result['matched_criteria'],
            'visual_query': current_search['decomposition']['visual_query'],
            'data_criteria': current_search['decomposition']['data_criteria']
        }
        
        return jsonify(detailed_result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/frame/<float:timestamp>')
def get_frame(timestamp):
    """Extract and serve video frame at specific timestamp with robust handling"""
    global current_video_path
    
    try:
        import cv2
        import base64
        from io import BytesIO
        
        # Video file path - use current uploaded video or fallback to config
        video_path = current_video_path or config.get_video_file()
        
        if not video_path or not os.path.exists(video_path):
            return jsonify({'error': 'Video file not found'}), 404
        
        # Open video
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return jsonify({'error': 'Could not open video file'}), 500
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0
        
        # Validate timestamp
        if timestamp < 0 or timestamp > duration:
            cap.release()
            return jsonify({'error': f'Timestamp {timestamp} out of range [0, {duration:.2f}]'}), 400
        
        # Calculate frame number
        frame_number = int(timestamp * fps)
        
        # Clamp frame number to valid range
        frame_number = max(0, min(frame_number, total_frames - 1))
        
        # Try multiple seek methods for robustness
        success = False
        frame = None
        
        # Method 1: Seek by frame number
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        ret, frame = cap.read()
        if ret and frame is not None:
            success = True
        
        # Method 2: If failed, try seeking by milliseconds
        if not success:
            cap.set(cv2.CAP_PROP_POS_MSEC, timestamp * 1000)
            ret, frame = cap.read()
            if ret and frame is not None:
                success = True
        
        # Method 3: If still failed, try nearby frames
        if not success:
            for offset in [-1, 1, -2, 2]:
                nearby_frame = frame_number + offset
                if 0 <= nearby_frame < total_frames:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, nearby_frame)
                    ret, frame = cap.read()
                    if ret and frame is not None:
                        success = True
                        frame_number = nearby_frame
                        break
        
        cap.release()
        
        if not success or frame is None:
            return jsonify({'error': f'Could not extract frame at timestamp {timestamp}'}), 500
        
        # Convert BGR to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Convert to base64
        from PIL import Image
        img = Image.fromarray(frame_rgb)
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=85)
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'image': f'data:image/jpeg;base64,{img_str}',
            'timestamp': timestamp,
            'frame_number': frame_number,
            'actual_timestamp': frame_number / fps
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/status')
def status():
    """Get system status"""
    global current_video_path, current_csv_path, current_embeddings_dir
    
    agentic_ready = llm_search is not None
    clip_ready = clip_loaded
    
    # Determine overall status
    if agentic_ready and clip_ready:
        status_text = 'ready'
    elif agentic_ready or clip_ready:
        status_text = 'initializing'
    else:
        status_text = 'starting'
    
    # Check if using uploaded files
    using_uploads = current_video_path and current_video_path.startswith(UPLOAD_FOLDER)
    
    return jsonify({
        'status': status_text,
        'agentic_search_ready': agentic_ready,
        'clip_loaded': clip_ready,
        'using_uploads': using_uploads,
        'has_video': current_video_path is not None,
        'has_csv': current_csv_path is not None,
        'has_embeddings': current_embeddings_dir is not None and os.path.exists(current_embeddings_dir),
        'tokenization_status': tokenization_status['status'],
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

@app.route('/api/reset', methods=['POST'])
def reset():
    """Reset system and clear uploaded files"""
    global llm_search, clip_loaded, current_video_path, current_csv_path, current_embeddings_dir, tokenization_status
    
    try:
        # Reset status
        tokenization_status = {
            'status': 'idle',
            'progress': 0,
            'message': '',
            'total_frames': 0,
            'processed_frames': 0
        }
        
        # Clear paths
        current_video_path = None
        current_csv_path = None
        current_embeddings_dir = None
        
        # Note: We don't clear llm_search or clip_loaded to avoid reloading CLIP model
        
        return jsonify({
            'success': True,
            'message': 'System reset. Ready for new uploads.'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cleanup_gpu', methods=['POST'])
def cleanup_gpu():
    """Cleanup GPU processes and clear cache"""
    import subprocess
    
    try:
        # Kill GPU processes
        result = subprocess.run(
            ['nvidia-smi', '--query-compute-apps=pid', '--format=csv,noheader'],
            capture_output=True,
            text=True
        )
        
        killed_count = 0
        if result.returncode == 0:
            pids = [pid.strip() for pid in result.stdout.strip().split('\n') if pid.strip()]
            for pid in pids:
                try:
                    subprocess.run(['kill', '-9', pid], check=False)
                    killed_count += 1
                except:
                    pass
        
        # Clear PyTorch cache
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        return jsonify({
            'success': True,
            'message': f'GPU cleanup complete. Killed {killed_count} processes.',
            'processes_killed': killed_count
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Agentic Video Search System with Upload Support')
    parser.add_argument('--use-defaults', action='store_true', 
                       help='Initialize with default video and CSV from config (skip upload mode)')
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind to')
    parser.add_argument('--port', type=int, default=5000, help='Port to bind to')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    args = parser.parse_args()
    
    print("=" * 60)
    print("🚀 Agentic Video Search System")
    print("=" * 60)
    
    if args.use_defaults:
        print("\n📁 Using default files from config...")
        if initialize_systems():
            print("✅ Systems initialized successfully")
        else:
            print("❌ Failed to initialize systems")
            print("⚠️  Server will start in upload mode")
    else:
        print("\n📤 Starting in UPLOAD MODE")
        print("   1. Upload your video file")
        print("   2. Upload your CSV file")
        print("   3. Configure and start tokenization")
        print("   4. Initialize search system")
        print("   5. Start searching!")
    
    print(f"\n🌐 Starting Flask server on {args.host}:{args.port}...")
    print(f"   Open http://localhost:{args.port} in your browser")
    print("=" * 60)
    
    try:
        app.run(debug=args.debug, host=args.host, port=args.port)
    finally:
        # Cleanup on exit
        if os.path.exists(UPLOAD_FOLDER):
            print(f"\n🧹 Cleaning up temporary files in {UPLOAD_FOLDER}...")
            try:
                shutil.rmtree(UPLOAD_FOLDER)
                print("✅ Cleanup complete")
            except Exception as e:
                print(f"⚠️  Cleanup warning: {e}")
