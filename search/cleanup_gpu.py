#!/usr/bin/env python3
"""
GPU Cleanup Utility
Kills all GPU processes and clears GPU cache
"""

import subprocess
import sys
import torch

def kill_gpu_processes():
    """Kill all compute processes using the GPU"""
    try:
        # Get all GPU process PIDs
        result = subprocess.run(
            ['nvidia-smi', '--query-compute-apps=pid', '--format=csv,noheader'],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print("❌ nvidia-smi not found or no GPU available")
            return False
        
        pids = result.stdout.strip().split('\n')
        pids = [pid.strip() for pid in pids if pid.strip()]
        
        if not pids:
            print("✅ No GPU compute processes found")
            return True
        
        # Kill each process
        killed_count = 0
        for pid in pids:
            try:
                subprocess.run(['kill', '-9', pid], check=True)
                print(f"🔪 Killed process {pid}")
                killed_count += 1
            except subprocess.CalledProcessError:
                print(f"⚠️  Could not kill process {pid}")
        
        print(f"✅ Killed {killed_count} GPU processes")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def clear_gpu_cache():
    """Clear PyTorch GPU cache"""
    try:
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            print("🧹 Cleared PyTorch GPU cache")
            return True
        else:
            print("⚠️  CUDA not available")
            return False
    except Exception as e:
        print(f"❌ Error clearing cache: {e}")
        return False

def show_gpu_status():
    """Show current GPU status"""
    try:
        result = subprocess.run(
            ['nvidia-smi', '--query-gpu=index,name,temperature.gpu,utilization.gpu,memory.used,memory.total',
             '--format=csv,noheader'],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print("\n📊 GPU Status:")
            print("-" * 60)
            lines = result.stdout.strip().split('\n')
            for line in lines:
                parts = [p.strip() for p in line.split(',')]
                if len(parts) >= 6:
                    idx, name, temp, util, mem_used, mem_total = parts
                    print(f"GPU {idx}: {name}")
                    print(f"  Temperature: {temp}")
                    print(f"  Utilization: {util}")
                    print(f"  Memory: {mem_used} / {mem_total}")
            print("-" * 60)
        else:
            print("⚠️  Could not get GPU status")
            
    except Exception as e:
        print(f"❌ Error getting status: {e}")

def main():
    print("=" * 60)
    print("🔧 GPU CLEANUP UTILITY")
    print("=" * 60)
    print()
    
    # Show initial status
    print("Before cleanup:")
    show_gpu_status()
    print()
    
    # Kill GPU processes
    print("Killing GPU processes...")
    kill_gpu_processes()
    print()
    
    # Clear cache
    print("Clearing GPU cache...")
    clear_gpu_cache()
    print()
    
    # Show final status
    print("After cleanup:")
    show_gpu_status()
    print()
    
    print("=" * 60)
    print("✅ GPU cleanup complete!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(1)

