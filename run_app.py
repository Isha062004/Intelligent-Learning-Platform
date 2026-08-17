import sys
import subprocess
import time
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def run_backend():
    backend_dir = BASE_DIR / "backend"
    print("Starting FastAPI Backend Server on http://127.0.0.1:8000 ...")
    return subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=str(backend_dir)
    )

if __name__ == "__main__":
    print("==================================================")
    print("  Intelligent Learning Platform - Startup Launcher")
    print("==================================================")
    
    # Check dependencies
    backend_proc = run_backend()

    print("\nFastAPI Backend running. Press Ctrl+C to stop.")
    try:
        backend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping Backend server...")
        backend_proc.terminate()
