@echo off
echo ========================================
echo Starting Call Girls App Development
echo ========================================

echo.
echo Starting API Server...
cd api
start "API Server" cmd /k "npm run dev"

echo.
echo Starting Client Server...
cd ..\client
start "Client Server" cmd /k "npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo.
echo API: http://localhost:5000
echo Client: http://localhost:5173
echo.
echo Please wait a moment for servers to start...
echo ========================================
pause

