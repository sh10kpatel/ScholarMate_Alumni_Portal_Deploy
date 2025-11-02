<#
start-all.ps1

Purpose:
 - Ensure the Alumni API server is running (start Node server if not).
 - Wait until the API reports healthy via /health.
 - Open the default browser to the alumni listing page when ready.

Usage:
 - Right-click -> Run with PowerShell, or run in PowerShell:
     powershell -ExecutionPolicy Bypass -File .\start-all.ps1

Notes:
 - The script prefers an existing running API on localhost:4000.
 - If Node is missing it will error; install Node.js (LTS) first.
 - Optionally start MySQL separately (or use sqlite fallback built into the server).
#>
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Info([string]$s) { Write-Host "[INFO] $s" -ForegroundColor Cyan }
function Write-Warn([string]$s) { Write-Host "[WARN] $s" -ForegroundColor Yellow }
function Write-Err([string]$s) { Write-Host "[ERROR] $s" -ForegroundColor Red }

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverDir = Join-Path $root 'server'
$apiUrl = 'http://localhost:4000'

Write-Info "Script root: $root"
Write-Info "Server folder: $serverDir"

if (-not (Test-Path $serverDir)) {
  Write-Err "Server folder not found at $serverDir. Run this script from the project root."; exit 1
}

function Test-Api() {
  try {
    $r = Test-NetConnection -ComputerName 'localhost' -Port 4000 -WarningAction SilentlyContinue
    return $r.TcpTestSucceeded -eq $true
  } catch { return $false }
}

if (Test-Api) {
  Write-Info "API appears to be already listening on port 4000."
} else {
  Write-Info "API not reachable on port 4000. Starting Node server..."

  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Err "Node.js not found in PATH. Install Node.js (LTS) first: https://nodejs.org/"
    exit 1
  }

  # Start Node in the background. Start-Process returns the process object.
  $nodeExe = (Get-Command node).Source
  $startInfo = Start-Process -FilePath $nodeExe -ArgumentList 'index.js' -WorkingDirectory $serverDir -PassThru -WindowStyle Hidden
  Write-Info "Started node (PID: $($startInfo.Id)). Waiting for API to become healthy..."

  # Wait for /health to succeed (up to 30s)
  $maxSeconds = 30
  $i = 0
  while ($i -lt $maxSeconds) {
    try {
      $h = Invoke-RestMethod -Uri ($apiUrl + '/health') -TimeoutSec 2
      if ($h -and $h.ok) { Write-Info "API healthy"; break }
    } catch { }
    Start-Sleep -Seconds 1
    $i++
  }
  if ($i -ge $maxSeconds) { Write-Warn "API did not become healthy within $maxSeconds seconds. Check server logs in $serverDir" }
}

# Final check & open browser to the alumni page
try {
  $ok = $false
  try { $ok = (Invoke-RestMethod -Uri ($apiUrl + '/health') -TimeoutSec 3).ok -eq $true } catch { $ok = $false }
  if ($ok) {
    Write-Info "Opening alumni listing page in your default browser..."
    $page = Join-Path $root 'mainalu.html'
    if (-not (Test-Path $page)) { Write-Warn "mainalu.html not found; opening project root instead"; Start-Process $root } else { Start-Process $page }
  } else {
    Write-Warn "API not healthy. The frontend will fall back to local data unless the API is started. Opening the page anyway so you can see the diagnostics.";
    $page = Join-Path $root 'mainalu.html'
    if (Test-Path $page) { Start-Process $page } else { Start-Process $root }
  }
} catch {
  Write-Err "Unexpected error while opening page: $_"; exit 1
}

Write-Info "Done. If you want MySQL to be started automatically, see README_START.md for optional docker-compose instructions."
