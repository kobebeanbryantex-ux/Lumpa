param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$TargetFile
)

$ErrorActionPreference = "Stop"
$required = @(
  "AZURE_CLIENT_ID",
  "AZURE_CLIENT_SECRET",
  "AZURE_TENANT_ID",
  "AZURE_SIGNING_ENDPOINT",
  "AZURE_SIGNING_ACCOUNT",
  "AZURE_CERT_PROFILE"
)
foreach ($name in $required) {
  if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name))) {
    throw "Windows signing configuration is incomplete: $name is missing."
  }
}

$resolved = (Resolve-Path -LiteralPath $TargetFile).Path
& artifact-signing-cli `
  -e $env:AZURE_SIGNING_ENDPOINT `
  -a $env:AZURE_SIGNING_ACCOUNT `
  -c $env:AZURE_CERT_PROFILE `
  -d "Lumpa" `
  $resolved
if ($LASTEXITCODE -ne 0) {
  throw "Azure Artifact Signing failed for $resolved with exit code $LASTEXITCODE."
}

$signature = Get-AuthenticodeSignature -LiteralPath $resolved
if ($signature.Status -ne "Valid") {
  throw "Authenticode validation failed for $resolved: $($signature.Status) $($signature.StatusMessage)"
}
