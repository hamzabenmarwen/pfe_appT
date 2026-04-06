$ErrorActionPreference = 'SilentlyContinue'

Write-Host 'Stopping frontend/backend dev processes...' -ForegroundColor Yellow
Get-CimInstance Win32_Process |
  Where-Object {
    ($_.Name -eq 'node.exe') -and (
      $_.CommandLine -like '*pfe_appT\\backend*src/app.ts*' -or
      $_.CommandLine -like '*pfe_appT\\frontend*vite*' -or
      $_.CommandLine -like '*pfe_appT\\frontend*npm run dev*' -or
      $_.CommandLine -like '*pfe_appT\\backend*npm run dev*'
    )
  } |
  ForEach-Object {
    Write-Host "Stopping PID $($_.ProcessId)"
    Stop-Process -Id $_.ProcessId -Force
  }

Write-Host 'Done.' -ForegroundColor Green
