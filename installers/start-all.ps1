Set-Location (Join-Path $PSScriptRoot "..")
$apps = @{
  api      = @{ dir = 'cueit-api';      cmd = 'node cueit-api/index.js' }
  admin    = @{ dir = 'cueit-admin';    cmd = 'npm --prefix cueit-admin run dev' }
  activate = @{ dir = 'cueit-activate'; cmd = 'npm --prefix cueit-activate run dev' }
  slack    = @{ dir = 'cueit-slack';    cmd = 'node cueit-slack/index.js' }
}

$input = Read-Host "Apps to start (api,admin,activate,slack or all) [all]"
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

$nameStr = [string]::Join(',', $names)
npx concurrently -k -n $nameStr $commands

