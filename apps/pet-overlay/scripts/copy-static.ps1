$ErrorActionPreference = 'Stop'

$appRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$distRoot = Join-Path $appRoot 'dist'

New-Item -ItemType Directory -Force -Path $distRoot | Out-Null
Copy-Item -LiteralPath (Join-Path $appRoot 'src\index.html') -Destination (Join-Path $distRoot 'index.html') -Force
Copy-Item -LiteralPath (Join-Path $appRoot 'src\styles.css') -Destination (Join-Path $distRoot 'styles.css') -Force
