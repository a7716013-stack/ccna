param([int]$StartPage=1,[int]$EndPage=454)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null=[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime]
$null=[Windows.Storage.Streams.IRandomAccessStream,Windows.Storage.Streams,ContentType=WindowsRuntime]
$null=[Windows.Graphics.Imaging.BitmapDecoder,Windows.Graphics.Imaging,ContentType=WindowsRuntime]
$null=[Windows.Graphics.Imaging.SoftwareBitmap,Windows.Graphics.Imaging,ContentType=WindowsRuntime]
$null=[Windows.Media.Ocr.OcrEngine,Windows.Foundation,ContentType=WindowsRuntime]
$null=[Windows.Media.Ocr.OcrResult,Windows.Foundation,ContentType=WindowsRuntime]
$null=[Windows.Globalization.Language,Windows.Globalization,ContentType=WindowsRuntime]
$asTask=([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethodDefinition -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
function Await-OcrOperation($Operation,[Type]$ResultType) {
    $task=$asTask.MakeGenericMethod($ResultType).Invoke($null,@($Operation))
    $task.Wait()
    return $task.Result
}
$engine=[Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage([Windows.Globalization.Language]::new('en-US'))
if(-not $engine){throw 'English OCR language is unavailable.'}
$root=Split-Path -Parent $PSScriptRoot
$utf8=[System.Text.UTF8Encoding]::new($false)
for($pageNumber=$StartPage;$pageNumber -le $EndPage;$pageNumber++) {
    $filename='{0:0000}' -f $pageNumber
    $inputPath=Join-Path $root "artifacts/pdf-import/ocr-input/$filename.png"
    $outputPath=Join-Path $root "artifacts/pdf-import/ocr-output/$filename.json"
    if(Test-Path -LiteralPath $outputPath){continue}
    if(-not(Test-Path -LiteralPath $inputPath)){throw "Missing page image: $inputPath"}
    $file=Await-OcrOperation ([Windows.Storage.StorageFile]::GetFileFromPathAsync($inputPath)) ([Windows.Storage.StorageFile])
    $stream=Await-OcrOperation ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
    $decoder=Await-OcrOperation ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $bitmap=Await-OcrOperation ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
    $result=Await-OcrOperation ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
    $lines=@(foreach($line in $result.Lines){
        $words=@(foreach($word in $line.Words){@{text=$word.Text;x=$word.BoundingRect.X;y=$word.BoundingRect.Y;width=$word.BoundingRect.Width;height=$word.BoundingRect.Height}})
        @{text=$line.Text;words=$words}
    })
    $json=@{page=$pageNumber;engine='Windows.Media.Ocr/en-US';lines=$lines}|ConvertTo-Json -Depth 7 -Compress
    [System.IO.File]::WriteAllText($outputPath,$json,$utf8)
    $bitmap.Dispose()
    $stream.Dispose()
    if($pageNumber%10 -eq 0){Write-Output "OCR $pageNumber / $EndPage"}
}
Write-Output 'OCR complete.'
