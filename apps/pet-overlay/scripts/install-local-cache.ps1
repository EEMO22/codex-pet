$ErrorActionPreference = 'Stop'

$appRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$cacheRoot = Join-Path $appRoot 'tmp'
$electronCache = Join-Path $cacheRoot 'electron-cache'
$electronTemp = Join-Path $cacheRoot 'electron-download-temp'

New-Item -ItemType Directory -Force -Path $electronCache, $electronTemp | Out-Null

$env:electron_config_cache = $electronCache
$env:TEMP = $electronTemp
$env:TMP = $electronTemp

npm install
