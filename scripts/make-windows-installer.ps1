$ErrorActionPreference = 'Stop'
param(
  [string]$Version = '1.0.0'
)

Set-Location (Join-Path $PSScriptRoot '..')

npm --prefix nova-core install
npm --prefix nova-core run build

$RES_DIR = Join-Path (Get-Location) 'dist\resources'
if (-not (Test-Path $RES_DIR)) { New-Item -ItemType Directory -Path $RES_DIR | Out-Null }

Copy-Item nova-api, nova-core, nova-comms, design -Destination $RES_DIR -Recurse -Force
Copy-Item installers\start-all.sh $RES_DIR\installers -Force

foreach ($pkg in 'nova-api','nova-core','nova-comms') {
  Copy-Item (Join-Path $pkg '.env.example') (Join-Path $RES_DIR $pkg '.env') -Force
}

$cert = Join-Path (Get-Location) 'cert.pem'
$key = Join-Path (Get-Location) 'key.pem'
if (Test-Path $cert -and Test-Path $key) {
  Copy-Item $cert $RES_DIR -Force
  Copy-Item $key $RES_DIR -Force
}

Write-Host "Windows installer resources prepared at $RES_DIR"
