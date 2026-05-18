param(
  [ValidateSet('dir', 'dist')]
  [string] $Target = 'dir'
)

$ErrorActionPreference = 'Stop'

$appRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$cacheRoot = Join-Path $appRoot 'tmp'
$electronCache = Join-Path $cacheRoot 'electron-cache'
$electronBuilderCache = Join-Path $cacheRoot 'electron-builder-cache'
$electronTemp = Join-Path $cacheRoot 'electron-builder-temp'

New-Item -ItemType Directory -Force -Path $electronCache, $electronBuilderCache, $electronTemp | Out-Null

$env:electron_config_cache = $electronCache
$env:ELECTRON_CACHE = $electronCache
$env:ELECTRON_BUILDER_CACHE = $electronBuilderCache
$env:CSC_IDENTITY_AUTO_DISCOVERY = 'false'
$env:TEMP = $electronTemp
$env:TMP = $electronTemp

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$outputDir = if ($Target -eq 'dist') {
  Join-Path 'out' "dist-$stamp"
} else {
  Join-Path 'out' "unpacked-$stamp"
}

$builderArgs = if ($Target -eq 'dist') {
  @('--win', 'nsis', 'zip', '--publish=never', "--config.directories.output=$outputDir")
} else {
  @('--win', 'dir', '--publish=never', "--config.directories.output=$outputDir")
}

Push-Location $appRoot
try {
  Write-Host "Packaging output: $outputDir"
  & npx electron-builder @builderArgs
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }

  & (Join-Path $PSScriptRoot 'verify-package-output.ps1') -OutputDir (Join-Path $appRoot $outputDir) -Target $Target
} finally {
  Pop-Location
}
