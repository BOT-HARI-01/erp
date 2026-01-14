
$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   STARTING PROJECT SETUP" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# INSTALL REQUIREMENTS
Write-Host "`n[STEP 1] Installing requirements from requirements.txt..." -ForegroundColor Yellow
if (Test-Path "requirements.txt") {
    pip install -r requirements.txt
    Write-Host "Requirements installed." -ForegroundColor Green
} else {
    Write-Host "requirements.txt not found! Skipping install..." -ForegroundColor Red
}

Write-Host"`n[STEP 2] Starting Backend Server" -ForegroundColor Blue
uvicorn app.main:app --reload
