#!/usr/bin/env python3
"""
Embeddings Search Module
Handles CLIP model loading, frame extraction, and embedding-based search
"""

import cv2
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import numpy as np
import os
from typing import List, Tuple

# Global variables for this module
processor = None
model = None
embeddings = None
timestamps = None
interrupt_requested = False

def set_interrupt_flag(value: bool):
    """Set the interrupt flag"""
    global interrupt_requested
    interrupt_requested = value

def load_clip_model(model_id: str) -> bool:
    """Load CLIP model and processor with memory optimization"""
    global processor, model
    
    if interrupt_requested:
        return False
    
    try:
        print("Loading CLIP model...")
        
        # Clear GPU cache before loading
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        processor = CLIPProcessor.from_pretrained(model_id)
        model = CLIPModel.from_pretrained(model_id)
        
        if torch.cuda.is_available():
            model = model.to('cuda')
            print(f"Device set to use cuda:0")
            print(f"GPU Memory: {torch.cuda.memory_allocated(0) / 1024**2:.0f}MB allocated")
        else:
            print("Using CPU")
        
        print("CLIP model loaded successfully")
        return True
        
    except Exception as e:
        print(f"Error loading CLIP model: {e}")
        # Try to clear GPU cache and retry
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        return False

def extract_frames_and_create_embeddings(video_path: str, embeddings_dir: str, frame_interval_seconds: float) -> bool:
    """Extract frames from video and create embeddings"""
    global embeddings, timestamps
    
    if interrupt_requested:
        return False
    
    try:
        print("Extracting frames and creating embeddings...")
        
        # Create embeddings directory
        os.makedirs(embeddings_dir, exist_ok=True)
        
        embeddings_path = os.path.join(embeddings_dir, "embeddings.npy")
        timestamps_path = os.path.join(embeddings_dir, "timestamps.npy")
        
        # Check if embeddings already exist
        if os.path.exists(embeddings_path) and os.path.exists(timestamps_path):
            print("Loading existing embeddings...")
            embeddings = np.load(embeddings_path)
            timestamps = np.load(timestamps_path)
            print(f"Loaded {len(embeddings)} existing embeddings")
            return True
        
        # Extract frames and create embeddings
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"Error opening video file: {video_path}")
            return False

        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_interval = int(fps * frame_interval_seconds)

        frame_embeddings = []
        frame_timestamps = []
        frame_count = 0

        while True:
            if interrupt_requested:
                break

            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_count % frame_interval == 0:
                # Convert BGR to RGB
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frame_pil = Image.fromarray(frame_rgb)
                
                # Create embedding
                inputs = processor(images=frame_pil, return_tensors="pt")
                if torch.cuda.is_available():
                    inputs = {k: v.to('cuda') for k, v in inputs.items()}
                
                with torch.no_grad():
                    image_features = model.get_image_features(**inputs)
                    embedding = image_features.cpu().numpy().flatten()
                
                frame_embeddings.append(embedding)
                frame_timestamps.append(frame_count / fps)
                
                if len(frame_embeddings) % 100 == 0:
                    print(f"Processed {len(frame_embeddings)} frames...")

            frame_count += 1

        cap.release()

        if interrupt_requested:
            return False
        
        # Save embeddings
        embeddings = np.array(frame_embeddings)
        timestamps = np.array(frame_timestamps)
        
        np.save(embeddings_path, embeddings)
        np.save(timestamps_path, timestamps)
        
        print(f"Created {len(embeddings)} embeddings")
        return True
        
    except Exception as e:
        print(f"Error creating embeddings: {e}")
        return False

def load_existing_embeddings(embeddings_dir: str) -> bool:
    """Load existing embeddings from directory"""
    global embeddings, timestamps
    
    try:
        embeddings_path = os.path.join(embeddings_dir, "embeddings.npy")
        timestamps_path = os.path.join(embeddings_dir, "timestamps.npy")
        
        if os.path.exists(embeddings_path) and os.path.exists(timestamps_path):
            print(f"Loading existing embeddings from {embeddings_dir}...")
            embeddings = np.load(embeddings_path)
            timestamps = np.load(timestamps_path)
            print(f"Loaded {len(embeddings)} existing embeddings")
            return True
        else:
            print(f"No embeddings found in {embeddings_dir}")
            return False
            
    except Exception as e:
        print(f"Error loading embeddings: {e}")
        return False

def search_frames(query_text: str, top_k: int = 10) -> List[Tuple[float, float]]:
    """Search for frames using CLIP embeddings with memory optimization"""
    global embeddings, timestamps, processor, model
    
    if interrupt_requested:
        return []
    
    # Check if model and embeddings are loaded
    if processor is None or model is None:
        print("Error: CLIP model not loaded. Call load_clip_model() first.")
        return []
    
    if embeddings is None or timestamps is None:
        print("Error: Embeddings not loaded. Call load_existing_embeddings() first.")
        return []
    
    try:
        print(f"Searching for: '{query_text}'")
        
        # Create text embedding
        inputs = processor(text=query_text, return_tensors="pt", padding=True, truncation=True)
        if torch.cuda.is_available():
            inputs = {k: v.to('cuda') for k, v in inputs.items()}
        
        with torch.no_grad():
            text_features = model.get_text_features(**inputs)
            text_embedding = text_features.cpu().numpy().flatten()
        
        # Clear GPU cache after inference
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        # Calculate similarities
        similarities = np.dot(embeddings, text_embedding) / (
            np.linalg.norm(embeddings, axis=1) * np.linalg.norm(text_embedding)
        )
        
        # Get top results
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            results.append((timestamps[idx], similarities[idx]))
    
        return results
        
    except Exception as e:
        print(f"Error searching frames: {e}")
        import traceback
        traceback.print_exc()
        # Clear GPU cache on error
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        return []

def display_frame(video_path: str, timestamp: float, query_text: str):
    """Display a specific frame from the video"""
    try:
        print(f"\nDisplaying best match at {timestamp:.2f} seconds...")
        
        # Open video and seek to timestamp
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_number = int(timestamp * fps)
        
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        ret, frame = cap.read()
        
        if ret:
            # Display frame
            cv2.imshow(f"Best Match: {query_text}", frame)
            cv2.waitKey(5000)  # Display for 5 seconds
            cv2.destroyAllWindows()
        else:
            print("Could not read frame")
        
        cap.release()

    except Exception as e:
        print(f"Error displaying result: {e}")

