Set-Location (Join-Path $PSScriptRoot "..")
$apps = @{
  api      = @{ dir = 'cueit-api';      cmd = 'npm --prefix cueit-api start' }
  admin    = @{ dir = 'cueit-admin';    cmd = 'npm --prefix cueit-admin run dev' }
  slack    = @{ dir = 'cueit-slack';    cmd = 'npm --prefix cueit-slack start' }
}

$input = Read-Host "Apps to start (api,admin,slack or all) [all]"
if ([string]::IsNullOrWhiteSpace($input) -or $input -eq 'all') {
  $selected = $apps.Keys
} else {
  $selected = $input.Split(',') | ForEach-Object { $_.Trim() }
}

$names = @()
$commands = @()
foreach ($app in $selected) {
  if (-not $apps.ContainsKey($app)) {
    Write-Host "Unknown app: $app" -ForegroundColor Red
    exit 1
  }
  $dir = $apps[$app].dir
  if (-not (Test-Path "$dir/.env")) {
    Write-Host "Error: $dir/.env not found. Copy $dir/.env.example to $dir/.env." -ForegroundColor Red
    exit 1
  }
  if (-not (Test-Path "$dir/node_modules")) {
    Write-Host "Installing dependencies for $dir..."
    npm --prefix $dir install
  }
  $names += $app
$commands += $apps[$app].cmd
}

if (-not $Env:TLS_CERT_PATH -and (Test-Path cert.pem)) {
  $Env:TLS_CERT_PATH = Join-Path (Get-Location) 'cert.pem'
}
if (-not $Env:TLS_KEY_PATH -and (Test-Path key.pem)) {
  $Env:TLS_KEY_PATH = Join-Path (Get-Location) 'key.pem'
}

$nameStr = [string]::Join(',', $names)
npx concurrently -k -n $nameStr $commands

