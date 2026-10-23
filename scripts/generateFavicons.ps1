Add-Type -AssemblyName System.Drawing
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$srcPath = Join-Path $rootDir "frontend\assets\images\kishor-mobiles-logo.jpg"
$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)

function Resize-Image($size, $relPath) {
    $destPath = Join-Path $rootDir $relPath
    $parent = Split-Path -Parent $destPath
    if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
    }
    $destBmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($destBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($srcBmp, 0, 0, $size, $size)
    $g.Dispose()
    $destBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destBmp.Dispose()
    Write-Output "Generated: $relPath ($size x $size)"
}

Resize-Image 16 "frontend\assets\images\favicon-16x16.png"
Resize-Image 32 "frontend\assets\images\favicon-32x32.png"
Resize-Image 48 "frontend\assets\images\favicon-48x48.png"
Resize-Image 180 "frontend\assets\images\apple-touch-icon.png"
Resize-Image 192 "frontend\assets\images\android-chrome-192x192.png"
Resize-Image 512 "frontend\assets\images\android-chrome-512x512.png"
Resize-Image 512 "frontend\assets\images\kishor-mobiles-logo.png"

$srcBmp.Dispose()
Write-Output "Done generating PNG favicons."
