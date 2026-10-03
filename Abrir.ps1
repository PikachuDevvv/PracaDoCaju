$ErrorActionPreference = 'Stop'
$runtime = Get-Command node -ErrorAction SilentlyContinue
if ($runtime) { $nodePath = $runtime.Source } else { $nodePath = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
if (-not (Test-Path -LiteralPath $nodePath)) { throw 'Instale Node.js para abrir o site.' }
Start-Process -FilePath $nodePath -ArgumentList ('"' + (Join-Path $PSScriptRoot 'server.cjs') + '"') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
