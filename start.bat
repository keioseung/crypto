@echo off
echo 🚀 CryptoAI Platform Starting...
echo.

echo 📦 Installing dependencies...
call npm run install:all

echo.
echo 🔧 Setting up environment...
if not exist "backend\.env" (
    echo Creating .env file from template...
    copy "backend\env.example" "backend\.env"
)

echo.
echo 🌐 Starting development servers...
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.

call npm run dev

pause
