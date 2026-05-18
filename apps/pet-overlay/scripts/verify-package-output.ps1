param(
  [string] $OutputDir = '',
  [ValidateSet('auto', 'dir', 'dist')]
  [string] $Target = 'auto'
)

$ErrorActionPreference = 'Stop'

$appRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$outRoot = Join-Path $appRoot 'out'

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
  if (-not (Test-Path -LiteralPath $outRoot)) {
    throw "No package output folder exists at $outRoot."
  }

  $latestOutput = Get-ChildItem -LiteralPath $outRoot -Directory |
    Where-Object { $_.Name -like 'unpacked-*' -or $_.Name -like 'dist-*' } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if (-not $latestOutput) {
    throw "No package output folder was found under $outRoot."
  }

  $OutputDir = $latestOutput.FullName
}

$resolvedOutput = Resolve-Path -LiteralPath $OutputDir
$outputPath = $resolvedOutput.Path

function Assert-File {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Path,
    [Parameter(Mandatory = $true)]
    [string] $Label
  )

  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    throw "Missing $Label at $Path."
  }
}

function Assert-Directory {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Path,
    [Parameter(Mandatory = $true)]
    [string] $Label
  )

  if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
    throw "Missing $Label at $Path."
  }
}

function Test-ManifestHashes {
  param([string] $ManifestPath)

  if (-not (Test-Path -LiteralPath $ManifestPath -PathType Leaf)) {
    return
  }

  $manifest = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
  foreach ($artifact in @($manifest.artifacts)) {
    $artifactPath = Join-Path $appRoot ([string] $artifact.path)
    Assert-File -Path $artifactPath -Label "release artifact $($artifact.path)"

    $actualHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $artifactPath).Hash.ToLowerInvariant()
    if ($actualHash -ne [string] $artifact.sha256) {
      throw "Hash mismatch for $($artifact.path)."
    }
  }
}

$checked = New-Object System.Collections.Generic.List[string]
$winUnpacked = Join-Path $outputPath 'win-unpacked'

if (Test-Path -LiteralPath $winUnpacked -PathType Container) {
  Assert-File -Path (Join-Path $winUnpacked 'Codex Pet Overlay.exe') -Label 'unpacked executable'
  Assert-File -Path (Join-Path $winUnpacked 'resources\app.asar') -Label 'app.asar'
  Assert-Directory -Path (Join-Path $winUnpacked 'resources\pets') -Label 'bundled pets'
  Assert-File -Path (Join-Path $winUnpacked 'resources\scripts\keyboard-activity-hook.ps1') -Label 'keyboard activity helper'
  $checked.Add('win-unpacked')
}

if ($Target -eq 'dist' -or $Target -eq 'auto') {
  $installer = Get-ChildItem -LiteralPath $outputPath -File -Filter '*.exe' | Select-Object -First 1
  $zip = Get-ChildItem -LiteralPath $outputPath -File -Filter '*.zip' | Select-Object -First 1

  if ($installer) {
    Assert-File -Path $installer.FullName -Label 'installer artifact'
    $checked.Add('installer')
  }

  if ($zip) {
    Assert-File -Path $zip.FullName -Label 'zip artifact'
    $checked.Add('zip')
  }
}

Test-ManifestHashes -ManifestPath (Join-Path $outputPath 'release-manifest.json')

if ($checked.Count -eq 0) {
  throw "No recognizable package artifacts were found under $outputPath."
}

Write-Host "Package output verified: $outputPath"
Write-Host "Checked: $($checked -join ', ')"
