@echo off
echo Starting local web server...
echo.
echo The server will be available at: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server.
echo.

cd /d "%~dp0"

REM Try Python 3 first
python -m http.server 8000 2>nul
if errorlevel 1 (
    REM Try Python 2
    python -m SimpleHTTPServer 8000 2>nul
    if errorlevel 1 (
        echo Python is not installed or not in PATH.
        echo Please install Python or use VS Code Live Server extension.
        pause
    )
)

