#!/bin/bash
echo "==================================================="
echo "    Smart Health Simplifier - Master Setup"
echo "==================================================="
echo ""

echo "[1/4] Installing Frontend Dependencies (React/Vite)..."
cd frontend && npm install && cd ..
echo -e "[SUCCESS] Frontend setup complete.\n"

echo "[2/4] Installing Backend Node.js Dependencies (Express)..."
cd backend && npm install && cd ..
echo -e "[SUCCESS] Backend Node.js setup complete.\n"

echo "[3/4] Installing AI Service Dependencies (Python/FastAPI)..."
cd backend/ai-service && pip install -r requirements.txt && cd ../..
echo -e "[SUCCESS] Python AI Service setup complete.\n"

echo "[4/4] Downloading Ollama AI Model (llama3)..."
echo "Note: This requires Ollama to be installed and running on your system!"
echo "Download Ollama from: https://ollama.com/ if you haven't already."
ollama pull llama3
echo -e "[SUCCESS] Model download complete.\n"

echo "==================================================="
echo "  Setup Complete! All dependencies are installed."
echo "==================================================="
