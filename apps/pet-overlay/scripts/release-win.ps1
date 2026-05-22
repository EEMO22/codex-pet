param(
  [switch] $AllowDirty,
  [switch] $SkipValidation
)

$ErrorActionPreference = 'Stop'

$appRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$repoRoot = Resolve-Path (Join-Path $appRoot '..\..')
$gitSafeDirectory = $repoRoot.Path -replace '\\', '/'
$packagePath = Join-Path $appRoot 'package.json'
$packageJson = Get-Content -LiteralPath $packagePath -Raw | ConvertFrom-Json
$version = [string] $packageJson.version

if ([string]::IsNullOrWhiteSpace($version)) {
  throw 'package.json is missing a version.'
}

function Invoke-Npm {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $Arguments
  )

  Write-Host "npm $($Arguments -join ' ')"
  & npm @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "npm $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
  }
}

function Invoke-NpmWithRetry {
  param(
    [int] $Attempts = 2,
    [int] $DelayMilliseconds = 1500,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $Arguments
  )

  for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
    Write-Host "npm $($Arguments -join ' ')"
    & npm @Arguments
    if ($LASTEXITCODE -eq 0) {
      return
    }

    $exitCode = $LASTEXITCODE
    if ($attempt -ge $Attempts) {
      throw "npm $($Arguments -join ' ') failed with exit code $exitCode."
    }

    Write-Warning "npm $($Arguments -join ' ') failed with exit code $exitCode. Retrying in $DelayMilliseconds ms..."
    Start-Sleep -Milliseconds $DelayMilliseconds
  }
}

function Write-Utf8Json {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Path,
    [Parameter(Mandatory = $true)]
    [object] $Value
  )

  $json = $Value | ConvertTo-Json -Depth 8
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($Path, "$json`n", $utf8NoBom)
}

function Get-ReleaseFileSha256 {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Path
  )

  try {
    $hashCommand = Get-Command Get-FileHash -ErrorAction Stop
    return (& $hashCommand -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()
  } catch [System.Management.Automation.CommandNotFoundException] {
    # Fall through to the .NET implementation for PowerShell environments where
    # Microsoft.PowerShell.Utility is unavailable or not auto-loaded.
  }

  $stream = [System.IO.File]::OpenRead($Path)
  try {
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
      return (($sha256.ComputeHash($stream) | ForEach-Object { $_.ToString('x2') }) -join '')
    } finally {
      $sha256.Dispose()
    }
  } finally {
    $stream.Dispose()
  }
}

function Invoke-Git {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $Arguments
  )

  $output = @(& git -c "safe.directory=$gitSafeDirectory" @Arguments 2>&1)
  if ($LASTEXITCODE -ne 0) {
    throw "git $($Arguments -join ' ') failed: $($output -join "`n")"
  }

  return $output
}

Push-Location $appRoot
try {
  $gitCommit = 'unknown'
  try {
    $gitCommit = (Invoke-Git rev-parse --short HEAD | Select-Object -First 1).Trim()
  } catch {
    Write-Warning 'Unable to read git commit hash.'
  }

  $gitStatus = @()
  try {
    $gitStatus = @(Invoke-Git status --porcelain)
  } catch {
    throw "Unable to verify release working tree state. $($_.Exception.Message)"
  }

  if ($gitStatus.Count -gt 0 -and -not $AllowDirty) {
    $preview = ($gitStatus | Select-Object -First 12) -join "`n"
    throw @"
Release builds require a clean working tree because all local pets are bundled.

$preview

Commit, stash, remove, or move local work before releasing. For a local rehearsal
only, rerun with -AllowDirty.
"@
  }

  if (-not $SkipValidation) {
    Invoke-Npm run check
    Invoke-Npm run validate:pets
    Invoke-Npm run smoke
  } else {
    Write-Warning 'Skipping validation because -SkipValidation was provided.'
  }

  Invoke-NpmWithRetry -Attempts 2 -DelayMilliseconds 1500 run dist:win

  $outRoot = Join-Path $appRoot 'out'
  $latestOutput = Get-ChildItem -LiteralPath $outRoot -Directory -Filter 'dist-*' |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if (-not $latestOutput) {
    throw 'No dist output directory was created.'
  }

  $artifactExtensions = @('.exe', '.zip', '.yml', '.blockmap')
  $artifactFiles = Get-ChildItem -LiteralPath $latestOutput.FullName -File -Recurse |
    Where-Object { $artifactExtensions -contains $_.Extension } |
    Sort-Object FullName

  if ($artifactFiles.Count -eq 0) {
    throw "No release artifacts were found under $($latestOutput.FullName)."
  }

  $artifacts = @($artifactFiles | ForEach-Object {
    $relativePath = Resolve-Path -LiteralPath $_.FullName -Relative
    [ordered] @{
      path = $relativePath -replace '^\.[\\/]', ''
      bytes = $_.Length
      sha256 = Get-ReleaseFileSha256 -Path $_.FullName
    }
  })

  $manifest = [ordered] @{
    productName = [string] $packageJson.productName
    packageName = [string] $packageJson.name
    version = $version
    gitCommit = $gitCommit
    generatedAt = (Get-Date).ToUniversalTime().ToString('o')
    outputDir = (Resolve-Path -LiteralPath $latestOutput.FullName -Relative) -replace '^\.[\\/]', ''
    validationSkipped = [bool] $SkipValidation
    dirtyAllowed = [bool] $AllowDirty
    artifacts = $artifacts
  }

  $manifestPath = Join-Path $latestOutput.FullName 'release-manifest.json'
  Write-Utf8Json -Path $manifestPath -Value $manifest

  Write-Host "Release output: $($latestOutput.FullName)"
  Write-Host "Release manifest: $manifestPath"
} finally {
  Pop-Location
}
