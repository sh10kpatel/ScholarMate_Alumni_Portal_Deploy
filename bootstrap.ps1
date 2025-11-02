<# bootstrap.ps1
Starts or ensures the following: 
 - MySQL (tries Windows service, then Docker Compose if docker is present)
 - Starts the API server (server/index.js) with NO_INMEM_FALLBACK=1
 - Starts a static file server for the frontend on port 3000

Run this from the project root: `.ootstrap.ps1`
#>

Write-Host "Bootstrap starting..." -ForegroundColor Cyan

# Determine repository root (script directory)
$scriptRoot = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Definition }
$serverDir = Join-Path $scriptRoot 'server'

function Start-MySqlService {
  $svc = Get-Service *mysql* -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'MySQL' -or $_.Name -match 'MySQL80' }
  if ($svc) {
    if ($svc.Status -ne 'Running') {
      Write-Host "Starting Windows MySQL service ($($svc.Name))..." -ForegroundColor Yellow
      try { Start-Service $svc.Name -ErrorAction Stop; Start-Sleep -Seconds 2 } catch { Write-Warning "Failed to start service $($svc.Name): $_"; return $false }
    }
    Write-Host "MySQL service is running." -ForegroundColor Green
    return $true
  }
  return $false
}

function Start-DockerComposeIfPresent {
  if (Get-Command docker-compose -ErrorAction SilentlyContinue -CommandType Application) {
    Write-Host "Starting docker-compose MySQL..." -ForegroundColor Yellow
    $composeFile = Join-Path $serverDir 'docker-compose.yml'
    Push-Location -Path $serverDir
    docker-compose -f $composeFile up -d
    Pop-Location
    return $true
  }
  if (Get-Command docker -ErrorAction SilentlyContinue -CommandType Application) {
    Write-Host "Docker is present but docker-compose command not found. Attempting 'docker compose'..." -ForegroundColor Yellow
    $composeFile = Join-Path $serverDir 'docker-compose.yml'
    Push-Location -Path $serverDir
    docker compose -f $composeFile up -d
    Pop-Location
    return $true
  }
  return $false
}

function Ensure-DockerEngine([int]$timeoutSeconds = 60) {
  # Wait for docker engine to respond to `docker info`. If not running and Docker Desktop found, start it.
  $end = (Get-Date).AddSeconds($timeoutSeconds)
  while ((Get-Date) -lt $end) {
    try {
      docker info > $null 2>&1
      return $true
    } catch {
      Start-Sleep -Seconds 2
    }
  }

  # Try to start Docker Desktop if installed (common paths)
  $possible = @(
    "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
    "$env:ProgramFiles(x86)\Docker\Docker\Docker Desktop.exe"
  )
  foreach ($p in $possible) {
    if (Test-Path $p) {
      Write-Host "Attempting to start Docker Desktop from $p" -ForegroundColor Yellow
      Start-Process -FilePath $p -ArgumentList '--quiet' -WindowStyle Hidden
      # wait for docker to become available
      $end2 = (Get-Date).AddSeconds($timeoutSeconds)
      while ((Get-Date) -lt $end2) {
        try { docker info > $null 2>&1; return $true } catch { Start-Sleep -Seconds 2 }
      }
    }
  }
  return $false
}

# 1) Try Windows service
$ok = Start-MySqlService
if (-not $ok) {
  Write-Host "Windows MySQL service not started or not present. Trying Docker..." -ForegroundColor Yellow
  # ensure docker engine running before attempting compose
  if (-not (Ensure-DockerEngine 30)) {
    Write-Warning "Docker engine not available. Please start Docker Desktop or ensure docker is on PATH. If MySQL is not running you'll get a fallback or server fail based on NO_INMEM_FALLBACK."
  } else {
    if (-not (Start-DockerComposeIfPresent)) {
      Write-Warning "Docker compose start failed or command missing. If MySQL is not running you'll get a fallback or server fail based on NO_INMEM_FALLBACK.";
    } else { Start-Sleep -Seconds 6 }
  }
}

# 2) Start API server
Write-Host "Starting API server (server/index.js) with NO_INMEM_FALLBACK=1..." -ForegroundColor Cyan
[System.Environment]::SetEnvironmentVariable('NO_INMEM_FALLBACK','1','Process')
Push-Location -Path $serverDir
Start-Process -FilePath node -ArgumentList 'index.js' -WorkingDirectory $serverDir -WindowStyle Hidden -PassThru | Select-Object Id,Path,StartTime
Pop-Location

Start-Sleep -Seconds 2

# 3) Start static server
Write-Host "Starting static server on port 3000..." -ForegroundColor Cyan
try {
  Start-Process -FilePath npx -ArgumentList 'http-server','-p','3000' -WorkingDirectory $scriptRoot -WindowStyle Hidden -PassThru | Out-Null
} catch {
  Write-Warning "Failed to start static server via npx. You can run 'npx http-server -p 3000' in the project root to serve the frontend."
}

Write-Host "Bootstrap finished. Open http://localhost:3000/mainad.html" -ForegroundColor Green
