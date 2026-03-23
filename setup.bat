@echo off
setlocal
echo ===================================================
echo     Smart Health Simplifier - Master Setup
echo ===================================================
echo.

echo [1/4] Installing Frontend Dependencies (React/Vite)...
cd frontend
call npm install
cd ..
echo [SUCCESS] Frontend setup complete.
echo.

echo [2/4] Installing Backend Node.js Dependencies (Express)...
cd backend
call npm install
cd ..
echo [SUCCESS] Backend Node.js setup complete.
echo.

echo [3/4] Installing AI Service Dependencies (Python/FastAPI)...
cd backend\ai-service
call pip install -r requirements.txt
cd ..\..
echo [SUCCESS] Python AI Service setup complete.
echo.

echo [4/4] Downloading Ollama AI Model (llama3)...
echo Note: This requires Ollama to be installed and running on your system!
echo Download Ollama from: https://ollama.com/ if you haven't already.
call ollama pull llama3
echo [SUCCESS] Model download complete.
echo.

echo ===================================================
echo   Setup Complete! All dependencies are installed.
echo ===================================================
pause
