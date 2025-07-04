$ErrorActionPreference = 'Stop'
param(
  [string]$Version = '1.0.0'
)

Set-Location (Join-Path $PSScriptRoot '..')

$AppDir = 'cueit-macos'

npm --prefix $AppDir install
npx --prefix $AppDir electron-packager $AppDir CueIT `
  --platform=win32 --arch=x64 --out "$AppDir/dist" --overwrite

$Source = Join-Path $AppDir 'dist/CueIT-win32-x64'
$Inno = "$env:ProgramFiles(x86)\Inno Setup 6\ISCC.exe"
if (-not (Test-Path $Inno)) {
  Write-Host "Inno Setup not found at $Inno. Install from https://jrsoftware.org/isinfo.php." -ForegroundColor Yellow
  exit 1
}

& $Inno 'installers/CueIT.iss' \
  /DAppVersion=$Version \
  /DSourceDir=$Source \
  /DOutputDir=$AppDir

Write-Host "Installer created at $AppDir\CueIT-$Version.exe"
