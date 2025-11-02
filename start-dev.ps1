# start-dev.ps1
# Stops existing node processes, starts the API server on PORT=4100, and serves the frontend on port 3000.

Write-Host "Stopping existing node processes (if any)..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Start API server
Write-Host "Starting API server on port 4100..." -ForegroundColor Green
Push-Location -Path .\server
$env:PORT = '4100'
Start-Process -FilePath node -ArgumentList 'index.js' -WorkingDirectory (Get-Location)
Pop-Location

Start-Sleep -Seconds 1

# Start static server for frontend
Write-Host "Starting static server on port 3000..." -ForegroundColor Green
Start-Process -FilePath npx -ArgumentList 'http-server -p 3000' -WorkingDirectory (Get-Location)

Write-Host "Started. Open http://localhost:3000/mainad.html and http://localhost:3000/create_profile.html" -ForegroundColor Cyan
