#!/usr/bin/env python3
"""
Universal Agentic Search Configuration
Configure the system for any domain and data type
"""

import os
from typing import Dict, List, Any

class UniversalConfig:
    """Configuration for universal agentic search system"""
    
    def __init__(self):
        # File paths (customize these for your domain)
        self.data_file = 'car_data.csv'  # Your CSV data file
        self.video_file = 'F_Car_Video_Generated.mp4'  # Your video file
        self.embeddings_dir = 'video_embeddings'  # Where embeddings are stored
        
        # CLIP model configuration
        self.clip_model = "openai/clip-vit-large-patch14"
        
        # AWS Bedrock configuration
        self.aws_region = "us-east-1"
        self.bedrock_model = "meta.llama3-70b-instruct-v1:0"
        
        # Search configuration
        self.default_top_k = 10
        self.max_top_k = 50
        
        # Time column detection (customize for your CSV)
        self.time_columns = ['timestamp', 'time', 'time_seconds', 't', 'frame_time']
        
        # Generic unit mappings (extend for your domain)
        self.unit_mappings = {
            # Speed/Velocity
            'kmh': 'speed', 'kph': 'speed', 'kmph': 'speed', 'mph': 'speed',
            'm/s': 'velocity', 'mps': 'velocity',
            
            # Acceleration
            'm/s^2': 'acceleration', 'm/s²': 'acceleration', 'ms2': 'acceleration',
            'g': 'acceleration', 'g-force': 'acceleration',
            
            # Temperature
            'celsius': 'temperature', 'fahrenheit': 'temperature', 'kelvin': 'temperature',
            'c': 'temperature', 'f': 'temperature', 'k': 'temperature',
            
            # Pressure
            'pascal': 'pressure', 'psi': 'pressure', 'bar': 'pressure',
            'pa': 'pressure', 'atm': 'pressure',
            
            # Time
            'seconds': 'time', 'sec': 'time', 'minutes': 'time', 'hours': 'time',
            's': 'time', 'min': 'time', 'h': 'time',
            
            # Distance
            'meters': 'distance', 'feet': 'distance', 'inches': 'distance',
            'm': 'distance', 'ft': 'distance', 'in': 'distance',
            
            # Power/Energy
            'watts': 'power', 'volts': 'voltage', 'amps': 'current',
            'w': 'power', 'v': 'voltage', 'a': 'current',
            
            # Add more units for your domain...
        }
        
        # Generic synonyms (extend for your domain)
        self.synonyms = {
            'speed': ['velocity', 'rate', 'pace', 'quickness'],
            'acceleration': ['accel', 'deceleration', 'braking', 'thrust'],
            'temperature': ['temp', 'thermal', 'heat', 'cold'],
            'pressure': ['force', 'load', 'stress', 'compression'],
            'time': ['duration', 'period', 'interval', 'moment'],
            'distance': ['length', 'range', 'span', 'extent'],
            'power': ['energy', 'strength', 'force', 'capacity'],
            'voltage': ['volts', 'potential', 'electrical_pressure'],
            'current': ['amps', 'amperage', 'electrical_flow'],
            # Add more synonyms for your domain...
        }
        
        # Generic visual keywords (extend for your domain)
        self.visual_keywords = [
            'object', 'item', 'thing', 'element', 'component', 'part',
            'structure', 'system', 'process', 'operation', 'activity',
            'event', 'scene', 'view', 'image', 'frame', 'picture',
            'pattern', 'shape', 'form', 'design', 'layout'
        ]
        
        # Generic data keywords (comparison operators)
        self.data_keywords = [
            'faster', 'slower', 'higher', 'lower', 'more', 'less', 'than',
            'over', 'under', 'above', 'below', 'greater', 'smaller', 'equal',
            'at', 'exactly', 'around', 'approximately', 'near', 'close'
        ]
    
    def get_data_file(self) -> str:
        """Get the data file path"""
        return self.data_file
    
    def get_video_file(self) -> str:
        """Get the video file path"""
        return self.video_file
    
    def get_embeddings_dir(self) -> str:
        """Get the embeddings directory"""
        return self.embeddings_dir
    
    def get_time_columns(self) -> List[str]:
        """Get list of possible time column names"""
        return self.time_columns
    
    def get_unit_mappings(self) -> Dict[str, str]:
        """Get unit to field mappings"""
        return self.unit_mappings
    
    def get_synonyms(self) -> Dict[str, List[str]]:
        """Get synonym mappings"""
        return self.synonyms
    
    def get_visual_keywords(self) -> List[str]:
        """Get visual object keywords"""
        return self.visual_keywords
    
    def get_data_keywords(self) -> List[str]:
        """Get data-related keywords"""
        return self.data_keywords
    
    def validate_files(self) -> bool:
        """Validate that required files exist"""
        if not os.path.exists(self.data_file):
            print(f"❌ Data file not found: {self.data_file}")
            return False
        
        if not os.path.exists(self.video_file):
            print(f"❌ Video file not found: {self.video_file}")
            return False
        
        if not os.path.exists(self.embeddings_dir):
            print(f"❌ Embeddings directory not found: {self.embeddings_dir}")
            return False
        
        print(f"✅ All required files found")
        return True
    
    def print_config(self):
        """Print current configuration"""
        print("🔧 Universal Agentic Search Configuration:")
        print(f"  Data file: {self.data_file}")
        print(f"  Video file: {self.video_file}")
        print(f"  Embeddings: {self.embeddings_dir}")
        print(f"  CLIP model: {self.clip_model}")
        print(f"  Time columns: {self.time_columns}")
        print(f"  Unit mappings: {len(self.unit_mappings)} units")
        print(f"  Visual keywords: {len(self.visual_keywords)} keywords")
        print(f"  Data keywords: {len(self.data_keywords)} keywords")

# Global configuration instance
config = UniversalConfig()

# Example usage for different domains:
def configure_for_cars():
    """Configure for automotive domain"""
    config.data_file = 'car_data.csv'
    config.video_file = 'car_video.mp4'
    config.embeddings_dir = 'car_embeddings'
    
    # Add car-specific units
    config.unit_mappings.update({
        'rpm': 'engine_speed',
        'torque': 'engine_torque',
        'fuel': 'fuel_level',
        'gear': 'transmission'
    })
    
    # Add car-specific visual keywords
    config.visual_keywords.extend([
        'car', 'vehicle', 'truck', 'motorcycle', 'engine', 'wheel',
        'road', 'highway', 'street', 'traffic', 'intersection'
    ])

def configure_for_manufacturing():
    """Configure for manufacturing domain"""
    config.data_file = 'manufacturing_data.csv'
    config.video_file = 'production_line.mp4'
    config.embeddings_dir = 'manufacturing_embeddings'
    
    # Add manufacturing-specific units
    config.unit_mappings.update({
        'units': 'production_count',
        'defects': 'defect_rate',
        'efficiency': 'production_efficiency',
        'cycle': 'cycle_time'
    })
    
    # Add manufacturing-specific visual keywords
    config.visual_keywords.extend([
        'factory', 'manufacturing', 'production', 'assembly', 'machine',
        'robot', 'conveyor', 'quality', 'inspection', 'worker'
    ])

def configure_for_medical():
    """Configure for medical domain"""
    config.data_file = 'medical_data.csv'
    config.video_file = 'surgery.mp4'
    config.embeddings_dir = 'medical_embeddings'
    
    # Add medical-specific units
    config.unit_mappings.update({
        'bpm': 'heart_rate',
        'mmhg': 'blood_pressure',
        'celsius': 'body_temperature',
        'ml': 'fluid_volume'
    })
    
    # Add medical-specific visual keywords
    config.visual_keywords.extend([
        'patient', 'doctor', 'nurse', 'surgery', 'operation', 'procedure',
        'instrument', 'monitor', 'equipment', 'treatment', 'therapy'
    ])

if __name__ == "__main__":
    # Print current configuration
    config.print_config()
    
    # Example: Configure for cars
    print("\n🚗 Configuring for automotive domain...")
    configure_for_cars()
    config.print_config()
    
    # Validate files
    print("\n📁 Validating files...")
    config.validate_files()
