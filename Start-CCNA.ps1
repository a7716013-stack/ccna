param([int]$Port = 5181, [switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$ccnaRoot = $PSScriptRoot
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else { 'C:\Program Files\nodejs\node.exe' }
if (-not (Test-Path -LiteralPath $nodePath)) { throw 'Node.js 20 or newer is required.' }
$ccnaUrl = "http://localhost:$Port"
$running = $false
try { $health = Invoke-RestMethod -Uri "$ccnaUrl/health" -TimeoutSec 2; $running = $health.app -eq 'ccna-learning-lab' } catch { }
if (-not $running) {
    $env:PORT = $Port
    $artifactPath = Join-Path $ccnaRoot 'artifacts'
    New-Item -ItemType Directory -Path $artifactPath -Force | Out-Null
    $serverPath = Join-Path $ccnaRoot 'server.mjs'
    $serverProcess = Start-Process -FilePath $nodePath -ArgumentList ('"' + $serverPath + '"') -WorkingDirectory $ccnaRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $artifactPath 'server.stdout.log') -RedirectStandardError (Join-Path $artifactPath 'server.stderr.log') -PassThru
    $serverProcess.Id | Set-Content -LiteralPath (Join-Path $artifactPath 'server.pid')
    for ($attempt = 0; $attempt -lt 40; $attempt++) {
        Start-Sleep -Milliseconds 300
        try { $health = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/health" -TimeoutSec 2; if ($health.app -eq 'ccna-learning-lab') { $running = $true; break } } catch { }
        $serverProcess.Refresh()
        if ($serverProcess.HasExited) { break }
    }
    if (-not $running) { throw "CCNA could not start. Check port $Port and artifacts/server.stderr.log." }
}
Write-Output "CCNA Lab is running: $ccnaUrl"
if (-not $NoBrowser) { Start-Process $ccnaUrl }
