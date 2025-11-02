# start-db.ps1
# Starts a MySQL Docker container (requires Docker Desktop) and waits until it is healthy.

$compose = Join-Path (Get-Location) 'docker-compose.yml'
if (!(Test-Path $compose)) { Write-Error "docker-compose.yml not found"; exit 1 }

Write-Host "Starting MySQL via docker-compose..." -ForegroundColor Green
docker-compose -f $compose up -d

Write-Host "Waiting for MySQL to become healthy (up to ~60s)..." -ForegroundColor Yellow
$tries = 0
while ($tries -lt 20) {
  $hc = docker inspect --format='{{json .State.Health.Status}}' $(docker ps -q -f ancestor=mysql:8.0) 2>$null
  if ($hc -and $hc -match '"healthy"') { Write-Host "MySQL healthy" -ForegroundColor Green; break }
  Start-Sleep -Seconds 3
  $tries++
}
if ($tries -ge 20) { Write-Warning "MySQL did not become healthy in time. Check 'docker logs <container>'" }

Write-Host "You can now run (in server/):`n`$env:NO_INMEM_FALLBACK='1'; node index.js" -ForegroundColor Cyan
