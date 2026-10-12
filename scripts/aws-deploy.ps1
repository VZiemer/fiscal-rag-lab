param(
  [ValidateSet('Validate', 'Start', 'Status', 'Finish', 'EnableOrigin', 'Failure', 'Retry')][string]$Action = 'Validate',
  [string]$CredentialCsv = '.\cursor_accessKeys.csv',
  [string]$Region = 'us-east-1'
)
$ErrorActionPreference = 'Stop'
$stackName = 'fiscal-rag-lab-demo'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location -LiteralPath $root
$credentialPath = (Resolve-Path -LiteralPath $CredentialCsv).Path
$credentialRows = @(Import-Csv -LiteralPath $credentialPath)
if ($credentialRows.Count -ne 1 -or !$credentialRows[0].'Access key ID' -or !$credentialRows[0].'Secret access key') { throw 'Invalid AWS CSV schema' }
$previousKey = $env:AWS_ACCESS_KEY_ID; $previousSecret = $env:AWS_SECRET_ACCESS_KEY; $previousRegion = $env:AWS_DEFAULT_REGION; $previousPager = $env:AWS_PAGER
$env:AWS_ACCESS_KEY_ID = $credentialRows[0].'Access key ID'
$env:AWS_SECRET_ACCESS_KEY = $credentialRows[0].'Secret access key'
$env:AWS_DEFAULT_REGION = $Region; $env:AWS_PAGER = ''
function Invoke-ProjectAws([string[]]$Arguments) {
  $lines = & aws @Arguments --output json --no-cli-pager 2>&1
  if ($LASTEXITCODE -ne 0) {
    $message = ($lines | Out-String).Replace($env:AWS_ACCESS_KEY_ID, '[REDACTED]').Replace($env:AWS_SECRET_ACCESS_KEY, '[REDACTED]')
    throw "AWS $($Arguments[0]) $($Arguments[1]) failed: $message"
  }
  $json = $lines | Out-String
  if ($json.Trim()) { return $json | ConvertFrom-Json }
}
try {
  if ($Action -eq 'Validate') {
    $identity = Invoke-ProjectAws @('sts', 'get-caller-identity')
    $null = Invoke-ProjectAws @('cloudformation', 'validate-template', '--template-body', 'file://deploy/aws/template.json')
    Write-Output 'AWS identity and CloudFormation template validated; no credentials printed.'
    return
  }
  if ($Action -eq 'Start') {
    $null = Invoke-ProjectAws @('cloudformation', 'validate-template', '--template-body', 'file://deploy/aws/template.json')
    $identity = Invoke-ProjectAws @('sts', 'get-caller-identity')
    New-Item -ItemType Directory -Path '.data/aws' -Force | Out-Null
    if (Test-Path -LiteralPath '.data/aws/deployment.json') { throw 'Deployment state already exists; inspect Status before creating anything.' }
    $suffix = [Guid]::NewGuid().ToString('N').Substring(0, 10)
    $bucket = "fiscal-rag-artifacts-$($identity.Account)-$suffix"
    $null = Invoke-ProjectAws @('s3api', 'create-bucket', '--bucket', $bucket, '--region', $Region)
    $null = Invoke-ProjectAws @('s3api', 'put-public-access-block', '--bucket', $bucket, '--public-access-block-configuration', 'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true')
    $null = Invoke-ProjectAws @('s3api', 'put-bucket-encryption', '--bucket', $bucket, '--server-side-encryption-configuration', '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}')
    $zip = Join-Path $root '.data/aws/lambda.zip'
    if (Test-Path -LiteralPath $zip) { throw 'Lambda ZIP already exists; avoid overwriting deployment artifacts.' }
    Compress-Archive -LiteralPath @('.data/aws/package/index.mjs', '.data/aws/package/corpus.json') -DestinationPath $zip
    $codeKey = "lambda-$suffix.zip"
    $null = Invoke-ProjectAws @('s3api', 'put-object', '--bucket', $bucket, '--key', $codeKey, '--body', $zip)
    $bytes = [byte[]]::new(32); [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    $originSecret = [Convert]::ToHexString($bytes).ToLowerInvariant()
    @(
      @{ ParameterKey = 'CodeBucket'; ParameterValue = $bucket },
      @{ ParameterKey = 'CodeKey'; ParameterValue = $codeKey },
      @{ ParameterKey = 'OriginSecret'; ParameterValue = $originSecret }
    ) | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath '.data/aws/parameters.json' -Encoding utf8
    @{ stack = $stackName; region = $Region; artifactBucket = $bucket; codeKey = $codeKey; createdAt = [DateTime]::UtcNow.ToString('o') } | ConvertTo-Json | Set-Content -LiteralPath '.data/aws/deployment.json' -Encoding utf8
    $null = Invoke-ProjectAws @('cloudformation', 'create-stack', '--stack-name', $stackName, '--template-body', 'file://deploy/aws/template.json', '--parameters', 'file://.data/aws/parameters.json', '--capabilities', 'CAPABILITY_IAM', '--tags', 'Key=Project,Value=fiscal-rag-lab', 'Key=Purpose,Value=educational-demo')
    Write-Output 'Isolated AWS stack creation started. Use Status to follow progress.'
    return
  }
  if ($Action -eq 'Failure') {
    $events = Invoke-ProjectAws @('cloudformation', 'describe-stack-events', '--stack-name', $stackName)
    $events.StackEvents | Where-Object { $_.ResourceStatus -match 'FAILED' } | Select-Object LogicalResourceId,ResourceStatus,ResourceStatusReason | ConvertTo-Json -Depth 5
    return
  }
  $description = Invoke-ProjectAws @('cloudformation', 'describe-stacks', '--stack-name', $stackName)
  $stack = $description.Stacks[0]
  if ($Action -eq 'Status') {
    $events = Invoke-ProjectAws @('cloudformation', 'describe-stack-events', '--stack-name', $stackName)
    $resources = Invoke-ProjectAws @('cloudformation', 'describe-stack-resources', '--stack-name', $stackName)
    [pscustomobject]@{Status=$stack.StackStatus; Pending=@($resources.StackResources | Where-Object {$_.ResourceStatus -match 'IN_PROGRESS'} | Select-Object LogicalResourceId,ResourceStatus); Recent=@($events.StackEvents | Select-Object -First 3 LogicalResourceId,ResourceStatus)} | ConvertTo-Json -Depth 5
    return
  }
  if ($Action -eq 'Retry') {
    if ($stack.StackStatus -ne 'ROLLBACK_COMPLETE' -or !($stack.Tags | Where-Object { $_.Key -eq 'Project' -and $_.Value -eq 'fiscal-rag-lab' })) {
      throw 'Retry is restricted to this project stack after completed rollback.'
    }
    $null = Invoke-ProjectAws @('cloudformation', 'validate-template', '--template-body', 'file://deploy/aws/template.json')
    $null = Invoke-ProjectAws @('cloudformation', 'delete-stack', '--stack-name', $stackName)
    Start-Sleep -Seconds 3
    $remaining = Invoke-ProjectAws @('cloudformation', 'list-stacks', '--stack-status-filter', 'DELETE_IN_PROGRESS')
    if ($remaining.StackSummaries | Where-Object { $_.StackName -eq $stackName }) { throw 'Failed stack deletion is still running; wait and retry creation separately.' }
    $null = Invoke-ProjectAws @('cloudformation', 'create-stack', '--stack-name', $stackName, '--template-body', 'file://deploy/aws/template.json', '--parameters', 'file://.data/aws/parameters.json', '--capabilities', 'CAPABILITY_IAM', '--tags', 'Key=Project,Value=fiscal-rag-lab', 'Key=Purpose,Value=educational-demo')
    Write-Output 'Project stack recreated after completed rollback; artifacts reused.'
    return
  }
  if ($stack.StackStatus -notin @('CREATE_COMPLETE','UPDATE_COMPLETE')) { throw "Stack is $($stack.StackStatus); wait before continuing." }
  $outputs = @{}; foreach ($entry in $stack.Outputs) { $outputs[$entry.OutputKey] = $entry.OutputValue }
  if ($Action -eq 'EnableOrigin') {
    @(
      @{ ParameterKey = 'CodeBucket'; UsePreviousValue = $true },
      @{ ParameterKey = 'CodeKey'; UsePreviousValue = $true },
      @{ ParameterKey = 'OriginSecret'; UsePreviousValue = $true },
      @{ ParameterKey = 'PublicOrigin'; ParameterValue = $outputs.PublicOrigin }
    ) | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath '.data/aws/origin-parameters.json' -Encoding utf8
    $null = Invoke-ProjectAws @('cloudformation', 'update-stack', '--stack-name', $stackName, '--use-previous-template', '--parameters', 'file://.data/aws/origin-parameters.json', '--capabilities', 'CAPABILITY_IAM')
    Write-Output 'Public Origin validation update started.'
    return
  }
  if ($Action -eq 'Finish') {
    $state = Get-Content -LiteralPath '.data/aws/deployment.json' -Raw | ConvertFrom-Json
    $state | Add-Member -NotePropertyName outputs -NotePropertyValue $outputs -Force
    $state | Add-Member -NotePropertyName status -NotePropertyValue $stack.StackStatus -Force
    $state | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath '.data/aws/deployment.json' -Encoding utf8
    $null = Invoke-ProjectAws @('s3api', 'put-object', '--bucket', $outputs.PublicBucket, '--key', 'index.html', '--body', '.data/aws/public/index.html', '--content-type', 'text/html; charset=utf-8', '--cache-control', 'max-age=300')
    $null = Invoke-ProjectAws @('s3api', 'put-object', '--bucket', $outputs.PublicBucket, '--key', 'privacy', '--body', '.data/aws/public/privacy.txt', '--content-type', 'text/plain; charset=utf-8', '--cache-control', 'max-age=300')
    $null = Invoke-ProjectAws @('s3api', 'put-object', '--bucket', $outputs.PublicBucket, '--key', 'support', '--body', '.data/aws/public/support.txt', '--content-type', 'text/plain; charset=utf-8', '--cache-control', 'max-age=300')
    $null = Invoke-ProjectAws @('s3api', 'put-object', '--bucket', $outputs.PublicBucket, '--key', 'terms', '--body', '.data/aws/public/terms.txt', '--content-type', 'text/plain; charset=utf-8', '--cache-control', 'max-age=300')
    $null = Invoke-ProjectAws @('cloudfront', 'create-invalidation', '--distribution-id', $outputs.DistributionId, '--paths', '/', '/index.html', '/privacy', '/support', '/terms')
    Write-Output $outputs.Endpoint
  }
} finally {
  $env:AWS_ACCESS_KEY_ID = $previousKey; $env:AWS_SECRET_ACCESS_KEY = $previousSecret; $env:AWS_DEFAULT_REGION = $previousRegion; $env:AWS_PAGER = $previousPager
}
