$ErrorActionPreference = 'Stop'
# Required-command and generated-output gate. Run test:collections and test:browser separately.
$env:COREPACK_HOME = Join-Path $PSScriptRoot '../.corepack'
corepack.cmd pnpm install --frozen-lockfile
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
foreach ($task in @('content:validate', 'test', 'check', 'build', 'test:build')) {
  corepack.cmd pnpm run $task
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
