#!/usr/bin/env python3
"""
Image/Video Tokenization Script
Extracts frames from videos or processes images and creates CLIP embeddings
"""

import cv2
import torch
import os
import argparse
import numpy as np
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
from typing import List, Tuple, Optional
import json
from pathlib import Path

class MediaTokenizer:
    """Tokenizes images and videos using CLIP embeddings"""
    
    def __init__(self, model_id: str = "openai/clip-vit-large-patch14", device: str = "auto"):
        """Initialize the tokenizer with CLIP model"""
        self.model_id = model_id
        self.device = self._get_device(device)
        self.processor = None
        self.model = None
        self.embeddings = []
        self.timestamps = []
        self.image_paths = []
        
    def _get_device(self, device: str) -> str:
        """Determine the best device to use"""
        if device == "auto":
            return "cuda" if torch.cuda.is_available() else "cpu"
        return device
    
    def load_model(self) -> bool:
        """Load CLIP model and processor"""
        try:
            print(f"Loading CLIP model: {self.model_id}")
            print(f"Using device: {self.device}")
            
            # Clear GPU cache if using CUDA
            if self.device == "cuda":
                torch.cuda.empty_cache()
            
            self.processor = CLIPProcessor.from_pretrained(self.model_id)
            self.model = CLIPModel.from_pretrained(self.model_id)
            
            if self.device == "cuda":
                self.model = self.model.to('cuda')
                print(f"GPU Memory: {torch.cuda.memory_allocated(0) / 1024**2:.0f}MB allocated")
            
            print("CLIP model loaded successfully")
            return True
            
        except Exception as e:
            print(f"Error loading CLIP model: {e}")
            return False
    
    def process_video(self, video_path: str, skip_frames: int = 1, max_frames: Optional[int] = None) -> bool:
        """Process video and extract frames with embeddings"""
        try:
            print(f"Processing video: {video_path}")
            
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                print(f"Error opening video file: {video_path}")
                return False
            
            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = total_frames / fps
            
            print(f"Video info: {total_frames} frames, {fps:.2f} FPS, {duration:.2f}s duration")
            print(f"Sampling every {skip_frames} frames")
            
            frame_count = 0
            processed_count = 0
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Skip frames based on skip_frames parameter
                if frame_count % skip_frames == 0:
                    # Convert BGR to RGB
                    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    frame_pil = Image.fromarray(frame_rgb)
                    
                    # Create embedding
                    embedding = self._create_embedding(frame_pil)
                    if embedding is not None:
                        timestamp = frame_count / fps
                        self.embeddings.append(embedding)
                        self.timestamps.append(timestamp)
                        self.image_paths.append(f"frame_{frame_count:06d}.jpg")
                        processed_count += 1
                        
                        if processed_count % 100 == 0:
                            print(f"Processed {processed_count} frames...")
                
                frame_count += 1
                
                # Stop if max_frames reached
                if max_frames and processed_count >= max_frames:
                    break
            
            cap.release()
            print(f"Video processing complete: {processed_count} frames processed")
            return True
            
        except Exception as e:
            print(f"Error processing video: {e}")
            return False
    
    def process_images(self, image_folder: str, skip_images: int = 1, max_images: Optional[int] = None) -> bool:
        """Process images from folder and create embeddings"""
        try:
            print(f"Processing images from: {image_folder}")
            
            # Get all image files
            image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif'}
            image_files = []
            
            for file_path in Path(image_folder).rglob('*'):
                if file_path.suffix.lower() in image_extensions:
                    image_files.append(file_path)
            
            if not image_files:
                print(f"No image files found in {image_folder}")
                return False
            
            image_files.sort()  # Sort for consistent ordering
            total_images = len(image_files)
            
            print(f"Found {total_images} images")
            print(f"Sampling every {skip_images} images")
            
            processed_count = 0
            
            for i, image_path in enumerate(image_files):
                # Skip images based on skip_images parameter
                if i % skip_images == 0:
                    try:
                        # Load image
                        image = Image.open(image_path)
                        if image.mode != 'RGB':
                            image = image.convert('RGB')
                        
                        # Create embedding
                        embedding = self._create_embedding(image)
                        if embedding is not None:
                            self.embeddings.append(embedding)
                            self.timestamps.append(float(i))  # Use index as timestamp
                            self.image_paths.append(str(image_path))
                            processed_count += 1
                            
                            if processed_count % 100 == 0:
                                print(f"Processed {processed_count} images...")
                    
                    except Exception as e:
                        print(f"Error processing {image_path}: {e}")
                        continue
                
                # Stop if max_images reached
                if max_images and processed_count >= max_images:
                    break
            
            print(f"Image processing complete: {processed_count} images processed")
            return True
            
        except Exception as e:
            print(f"Error processing images: {e}")
            return False
    
    def _create_embedding(self, image: Image.Image) -> Optional[np.ndarray]:
        """Create CLIP embedding for an image"""
        try:
            inputs = self.processor(images=image, return_tensors="pt")
            if self.device == "cuda":
                inputs = {k: v.to('cuda') for k, v in inputs.items()}
            
            with torch.no_grad():
                image_features = self.model.get_image_features(**inputs)
                embedding = image_features.cpu().numpy().flatten()
            
            return embedding
            
        except Exception as e:
            print(f"Error creating embedding: {e}")
            return None
    
    def save_embeddings(self, output_folder: str, metadata_file: str = "metadata.json") -> bool:
        """Save embeddings and metadata to folder"""
        try:
            print(f"Saving embeddings to: {output_folder}")
            
            # Create output folder
            os.makedirs(output_folder, exist_ok=True)
            
            if not self.embeddings:
                print("No embeddings to save")
                return False
            
            # Save embeddings as numpy array
            embeddings_path = os.path.join(output_folder, "embeddings.npy")
            np.save(embeddings_path, np.array(self.embeddings))
            
            # Save timestamps
            timestamps_path = os.path.join(output_folder, "timestamps.npy")
            np.save(timestamps_path, np.array(self.timestamps))
            
            # Save image paths
            paths_path = os.path.join(output_folder, "image_paths.npy")
            np.save(paths_path, np.array(self.image_paths))
            
            # Create metadata
            metadata = {
                "model_id": self.model_id,
                "device": self.device,
                "total_embeddings": len(self.embeddings),
                "embedding_dimension": len(self.embeddings[0]) if self.embeddings else 0,
                "timestamps": self.timestamps,
                "image_paths": self.image_paths,
                "model_info": {
                    "processor": str(type(self.processor).__name__),
                    "model": str(type(self.model).__name__)
                }
            }
            
            # Save metadata
            metadata_path = os.path.join(output_folder, metadata_file)
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            print(f"Saved {len(self.embeddings)} embeddings")
            print(f"Embedding dimension: {len(self.embeddings[0]) if self.embeddings else 0}")
            print(f"Files saved:")
            print(f"  - {embeddings_path}")
            print(f"  - {timestamps_path}")
            print(f"  - {paths_path}")
            print(f"  - {metadata_path}")
            
            return True
            
        except Exception as e:
            print(f"Error saving embeddings: {e}")
            return False
    
    def clear_cache(self):
        """Clear GPU cache"""
        if self.device == "cuda":
            torch.cuda.empty_cache()
            print("GPU cache cleared")

def main():
    parser = argparse.ArgumentParser(description="Tokenize images and videos using CLIP embeddings")
    
    # Input options
    parser.add_argument("--video", type=str, help="Path to video file")
    parser.add_argument("--images", type=str, help="Path to folder containing images")
    
    # Processing options
    parser.add_argument("--skip-frames", type=int, default=1, help="Skip every N frames for video (default: 1)")
    parser.add_argument("--skip-images", type=int, default=1, help="Skip every N images for image folder (default: 1)")
    parser.add_argument("--max-frames", type=int, help="Maximum number of frames to process")
    parser.add_argument("--max-images", type=int, help="Maximum number of images to process")
    
    # Model options
    parser.add_argument("--model", type=str, default="openai/clip-vit-large-patch14", 
                       help="CLIP model to use (default: openai/clip-vit-large-patch14)")
    parser.add_argument("--device", type=str, default="auto", choices=["auto", "cuda", "cpu"],
                       help="Device to use (default: auto)")
    
    # Output options
    parser.add_argument("--output", type=str, required=True, help="Output folder for embeddings")
    parser.add_argument("--metadata", type=str, default="metadata.json", help="Metadata filename")
    
    args = parser.parse_args()
    
    # Validate arguments
    if not args.video and not args.images:
        print("Error: Must specify either --video or --images")
        return 1
    
    if args.video and args.images:
        print("Error: Cannot specify both --video and --images")
        return 1
    
    # Initialize tokenizer
    tokenizer = MediaTokenizer(model_id=args.model, device=args.device)
    
    if not tokenizer.load_model():
        print("Failed to load CLIP model")
        return 1
    
    try:
        # Process media
        if args.video:
            if not os.path.exists(args.video):
                print(f"Error: Video file not found: {args.video}")
                return 1
            
            success = tokenizer.process_video(
                args.video, 
                skip_frames=args.skip_frames,
                max_frames=args.max_frames
            )
        else:  # args.images
            if not os.path.exists(args.images):
                print(f"Error: Image folder not found: {args.images}")
                return 1
            
            success = tokenizer.process_images(
                args.images,
                skip_images=args.skip_images,
                max_images=args.max_images
            )
        
        if not success:
            print("Failed to process media")
            return 1
        
        # Save embeddings
        if not tokenizer.save_embeddings(args.output, args.metadata):
            print("Failed to save embeddings")
            return 1
        
        print("Tokenization complete!")
        
    except KeyboardInterrupt:
        print("\nInterrupted by user")
        return 1
    except Exception as e:
        print(f"Unexpected error: {e}")
        return 1
    finally:
        tokenizer.clear_cache()
    
    return 0

if __name__ == "__main__":
    exit(main())
