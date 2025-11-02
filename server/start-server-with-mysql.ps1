<# start-server-with-mysql.ps1
Simple startup helper:
 - sets DB related env vars for the current process
 - attempts to start MySQL via Windows service or docker-compose
 - waits for port 3306 to respond
 - runs create_db.js (if present)
 - starts node index.js in foreground
#>

Write-Host "start-server-with-mysql: starting" -ForegroundColor Cyan

# set process environment variables
[System.Environment]::SetEnvironmentVariable('DB_HOST', '127.0.0.1', 'Process')
[System.Environment]::SetEnvironmentVariable('DB_USER', 'root', 'Process')
[System.Environment]::SetEnvironmentVariable('DB_PASSWORD', 'mysql', 'Process')
[System.Environment]::SetEnvironmentVariable('DB_NAME', 'alumni_db', 'Process')
[System.Environment]::SetEnvironmentVariable('NO_INMEM_FALLBACK', '1', 'Process')

Write-Host "Environment variables set (DB_HOST=127.0.0.1 DB_USER=root DB_NAME=alumni_db NO_INMEM_FALLBACK=1)" -ForegroundColor Cyan

# try Windows service
try {
	$svc = Get-Service -Name 'MySQL','MySQL80' -ErrorAction SilentlyContinue | Select-Object -First 1
	if ($svc -and $svc.Status -ne 'Running') { Write-Host "Starting service $($svc.Name)"; Start-Service $svc.Name -ErrorAction SilentlyContinue; Start-Sleep -Seconds 2 }
	if ($svc -and $svc.Status -eq 'Running') { Write-Host "Windows MySQL service running" -ForegroundColor Green }
} catch { }

# try docker-compose (if docker available)
if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
	try { docker-compose -f (Join-Path (Get-Location) 'docker-compose.yml') up -d } catch { }
} elseif (Get-Command docker -ErrorAction SilentlyContinue) {
	try { docker compose -f (Join-Path (Get-Location) 'docker-compose.yml') up -d } catch { }
}

# wait for MySQL port
function Wait-For-MySql([string]$h, [int]$p, [int]$timeoutSec) {
	$end = (Get-Date).AddSeconds($timeoutSec)
	while ((Get-Date) -lt $end) {
		$r = Test-NetConnection -ComputerName $h -Port $p -WarningAction SilentlyContinue
		if ($r -and $r.TcpTestSucceeded) { return $true }
		Start-Sleep -Seconds 2
	}
	return $false
}

if (-not (Wait-For-MySql '127.0.0.1' 3306 60)) {
	Write-Error "MySQL not reachable at 127.0.0.1:3306; exiting because NO_INMEM_FALLBACK=1"
	exit 1
}

# ensure DB
if (Test-Path '.\create_db.js') { try { node create_db.js } catch { Write-Warning 'create_db.js failed' } }

Write-Host "Starting Node API (foreground)" -ForegroundColor Cyan
# If something is already listening on the API port, attempt to stop it so node can bind.
$apiPort = 4000
try {
	$listeners = Get-NetTCPConnection -LocalPort $apiPort -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
	if ($listeners) {
		foreach ($l in $listeners) {
			$pid = $l.OwningProcess
			if ($pid) {
				try { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue; Write-Host ("Stopped process " + $pid + " listening on port " + $apiPort) -ForegroundColor Yellow } catch { Write-Warning ("Failed to stop process " + $pid) }
			}
		}
		Start-Sleep -Seconds 1
	}
} catch { }

# Start the server
node index.js

