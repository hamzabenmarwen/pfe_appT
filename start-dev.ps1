$ErrorActionPreference = 'SilentlyContinue'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $root 'backend'
$frontendPath = Join-Path $root 'frontend'

Write-Host 'Stopping existing app processes...' -ForegroundColor Yellow
Get-CimInstance Win32_Process |
  Where-Object {
    ($_.Name -eq 'node.exe') -and (
      $_.CommandLine -like '*pfe_appT\\backend*src/app.ts*' -or
      $_.CommandLine -like '*pfe_appT\\frontend*vite*' -or
      $_.CommandLine -like '*pfe_appT\\frontend*npm run dev*' -or
      $_.CommandLine -like '*pfe_appT\\backend*npm run dev*'
    )
  } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }

Write-Host 'Starting backend...' -ForegroundColor Green
Start-Process powershell -ArgumentList '-NoExit', '-Command', "Set-Location '$backendPath'; npm run dev"

Start-Sleep -Seconds 1

Write-Host 'Starting frontend...' -ForegroundColor Green
Start-Process powershell -ArgumentList '-NoExit', '-Command', "Set-Location '$frontendPath'; npm run dev"

Write-Host 'Done. Two terminals were launched (backend + frontend).' -ForegroundColor Cyan
