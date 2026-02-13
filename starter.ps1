$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   STARTING PROJECT SETUP" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Root of project
$ROOT = $PSScriptRoot
$BACKEND_DIR = Join-Path $ROOT "Backend"
$FRONTEND_DIR = Join-Path $ROOT "FrontEnd"

# -----------------------------
# STEP 1: Install backend requirements
# -----------------------------
$requirementsFile = Join-Path $BACKEND_DIR "requirements.txt"

Write-Host "`n[STEP 1] Installing backend requirements..." -ForegroundColor Yellow
if (Test-Path $requirementsFile) {
    pip install -r $requirementsFile
    Write-Host "Requirements installed." -ForegroundColor Green
} else {
    Write-Host "requirements.txt not found in Backend!" -ForegroundColor Red
}

# -----------------------------
# STEP 2: Start Backend Server
# -----------------------------
Write-Host "`n[STEP 2] Starting Backend Server on port 8000..." -ForegroundColor Blue
Start-Process powershell `
    -WorkingDirectory $BACKEND_DIR `
    -ArgumentList "uvicorn app.main:app --reload --port 8000" `
    # -WindowStyle Hidden

# -----------------------------
# STEP 3: Start Frontend Server
# -----------------------------
Write-Host "`n[STEP 3] Starting Frontend Server on port 8080..." -ForegroundColor Blue
Start-Process powershell `
    -WorkingDirectory $FRONTEND_DIR `
    -ArgumentList "uvicorn main:app --reload --port 8080" `
    # -WindowStyle Hidden

Write-Host "`n[STEP 4] Opening Frontend in browser..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
Start-Process "http://127.0.0.1:8080"

Write-Host "`nServers started successfully:" -ForegroundColor Green
Write-Host "Backend  -> http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Frontend -> http://127.0.0.1:8080" -ForegroundColor Green
