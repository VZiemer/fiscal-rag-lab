param([string]$Archive = '.data/fiscal-rag-plugin.zip')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$resolved = (Resolve-Path -LiteralPath $Archive).Path
$zip = [System.IO.Compression.ZipFile]::OpenRead($resolved)
function Read-ZipText([string]$Path) {
  $entry = $zip.GetEntry($Path)
  if (!$entry) { throw "Missing archive component: $Path" }
  $reader = [System.IO.StreamReader]::new($entry.Open())
  try { return $reader.ReadToEnd() } finally { $reader.Dispose() }
}
try {
  foreach ($entry in $zip.Entries) {
    if ($entry.FullName -match '(^|/)\.app\.json$|\.env|\.csv$|node_modules|(^|/)\.\./') { throw 'Unexpected private or unrelated archive component' }
  }
  $manifest = Read-ZipText 'plugin.json' | ConvertFrom-Json
  $mcp = Read-ZipText 'mcp.json' | ConvertFrom-Json
  $listing = $manifest.extensions.'com.openai'.interface
  if ($manifest.'$schema' -ne 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json' -or $manifest.apps -or $manifest.extensions.'com.openai'.apps) { throw 'Invalid public manifest/binding' }
  if ($listing.displayName.Length -gt 30 -or $listing.shortDescription.Length -gt 30 -or $listing.longDescription.Length -gt 4000) { throw 'Listing text exceeds limits' }
  foreach ($field in @('displayName','shortDescription','longDescription','developerName','category')) { if (![string]$listing.$field) { throw "Missing listing field $field" } }
  if ($listing.category -notin @('Business & Operations','Communication','Creativity','Data & Analytics','Developer Tools','Education & Research','Entertainment','Finance','Healthcare','Other','Productivity','Scientific Research','Security','Travel')) { throw 'Unsupported listing category' }
  foreach ($field in @('websiteURL','supportURL','privacyPolicyURL','termsOfServiceURL')) {
    $url = [Uri]$listing.$field
    if ($url.Scheme -ne 'https' -or $url.UserInfo) { throw "Invalid listing URL $field" }
  }
  foreach ($field in @('logo','logoDark','composerIcon','composerIconDark')) {
    $path = ([string]$listing.$field).Replace('./','')
    $entry = $zip.GetEntry($path)
    if (!$entry -or $entry.Length -gt 5242880) { throw "Missing/oversized icon $field" }
    $stream = $entry.Open()
    try {
      $header = [byte[]]::new(24)
      if ($stream.Read($header,0,24) -ne 24 -or [Convert]::ToHexString($header[0..7]) -ne '89504E470D0A1A0A') { throw 'Public submission requires actual PNG assets' }
      $width = [System.Net.IPAddress]::NetworkToHostOrder([BitConverter]::ToInt32($header,16))
      $height = [System.Net.IPAddress]::NetworkToHostOrder([BitConverter]::ToInt32($header,20))
      if ($width -ne $height -or $width -lt 256 -or $width -gt 4096) { throw 'Invalid icon dimensions' }
    } finally { $stream.Dispose() }
  }
  $review = $manifest.extensions.'com.openai'.review
  if ($review.test_cases.positive.Count -ne 5 -or $review.test_cases.negative.Count -ne 3) { throw 'Expected exactly five positive and three negative cases' }
  foreach ($case in $review.test_cases.positive) { if (!$case.description -or !$case.prompt -or !$case.tools_triggered -or !$case.expected_behavior) { throw 'Incomplete positive review case' } }
  if ($mcp.mcpServers.fiscal.type -ne 'streamable-http' -or $mcp.mcpServers.fiscal.url -ne 'https://d2kvl1uo6lcsgz.cloudfront.net/mcp') { throw 'Unexpected server connection' }
  if ((Read-ZipText 'skills/fiscal-research/SKILL.md') -notmatch '(?s)^---\s+name: fiscal-research\s+description: .+?---') { throw 'Invalid skill frontmatter' }
  $gaps = @()
  if (!$review.demo_recording_url) { $gaps += 'verified demo recording URL' }
  if (!$manifest.extensions.'com.openai'.publication.PSObject.Properties['countries']) { $gaps += 'explicit country targeting' }
  if ($review.commerce -isnot [bool]) { $gaps += 'commerce declaration' }
  [pscustomobject]@{ archive = $Archive; packageChecks = 'Passed'; publicSubmissionReady = ($gaps.Count -eq 0); missingPreparation = $gaps; onlineChecks = 'Work tests, developer/domain verification and authorized attestations remain separate' } | ConvertTo-Json -Depth 5
} finally { $zip.Dispose() }
