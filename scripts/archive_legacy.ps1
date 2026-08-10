param(
  [string]$SourceRef = 'origin/master',
  [string]$SourceBase = 'https://zhang-haichao.github.io/',
  [string]$Proxy = ''
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$destination = [System.IO.Path]::GetFullPath((Join-Path $projectRoot 'public\legacy'))
$expectedDestination = [System.IO.Path]::GetFullPath((Join-Path $projectRoot 'public\legacy'))

if (-not $destination.Equals($expectedDestination, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to archive outside the expected destination: $expectedDestination"
}

$tempParent = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
$tempRoot = Join-Path $tempParent ("haichao-legacy-" + [System.Guid]::NewGuid().ToString('N'))
$archivePath = Join-Path $tempRoot 'legacy-source.zip'
$sourcePath = Join-Path $tempRoot 'source'
$utf8 = [System.Text.UTF8Encoding]::new($false)
$legacyPrefix = '/legacy/'
$sourceUri = [System.Uri]::new($SourceBase)

function Convert-LegacyHtml {
  param([string]$Content)

  $converted = $Content
  $converted = [regex]::Replace($converted, '(?is)<div\s+id=["'']gitalk-container["''][^>]*>.*?</div>', '')
  $converted = [regex]::Replace($converted, '(?is)<link\b[^>]*gitalk[^>]*>', '')
  $converted = [regex]::Replace($converted, '(?is)<script\b[^>]*gitalk[^>]*>\s*</script>', '')
  $converted = [regex]::Replace($converted, '(?is)<script\b(?:(?!</script>).)*new\s+Gitalk(?:(?!</script>).)*</script>', '')
  $converted = [regex]::Replace($converted, '(?im)^.*clientSecret.*(?:\r?\n)?', '')
  $converted = [regex]::Replace($converted, '(?is)<link\b[^>]*rel=["'']manifest["''][^>]*>', '')
  $converted = [regex]::Replace($converted, '(?is)<script\b(?:(?!</script>).)*serviceWorker(?:(?!</script>).)*</script>', '')

  $attributePattern = '(?i)(\b(?:href|src|action|poster)\s*=\s*["''])/(?!/|legacy/)'
  $converted = [regex]::Replace($converted, $attributePattern, {
    param($match)
    return $match.Groups[1].Value + $legacyPrefix
  })

  $cssUrlPattern = '(?i)(url\(\s*["'']?)/(?!/|legacy/)'
  $converted = [regex]::Replace($converted, $cssUrlPattern, {
    param($match)
    return $match.Groups[1].Value + $legacyPrefix
  })

  $legacyAbsoluteBase = $SourceBase.TrimEnd('/') + $legacyPrefix
  $converted = [regex]::Replace(
    $converted,
    [regex]::Escape($SourceBase) + '(?!legacy/)',
    $legacyAbsoluteBase,
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
  )

  if ($converted -notmatch '(?i)<meta\s+name=["'']robots["'']') {
    $converted = [regex]::Replace(
      $converted,
      '(?i)(<head\b[^>]*>)',
      '$1' + [Environment]::NewLine + '    <meta name="robots" content="noindex, nofollow, noarchive">',
      1
    )
  }

  return $converted
}

function Get-LegacyOutputPath {
  param([System.Uri]$Uri)

  $relative = [System.Uri]::UnescapeDataString($Uri.AbsolutePath.TrimStart('/'))
  if ([string]::IsNullOrWhiteSpace($relative)) {
    return Join-Path $destination 'index.html'
  }

  if ($relative.EndsWith('/') -or [string]::IsNullOrEmpty([System.IO.Path]::GetExtension($relative))) {
    $relative = $relative.TrimEnd('/') + '/index.html'
  }

  $relativePath = $relative.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
  return Join-Path $destination $relativePath
}

function Add-LegacyPage {
  param(
    [System.Collections.Generic.Queue[System.Uri]]$Queue,
    [System.Collections.Generic.HashSet[string]]$Seen,
    [System.Uri]$Candidate
  )

  if ($Candidate.Scheme -notin @('http', 'https') -or $Candidate.Host -ne $sourceUri.Host) {
    return
  }

  $extension = [System.IO.Path]::GetExtension($Candidate.AbsolutePath)
  $isPage = $Candidate.AbsolutePath.EndsWith('/') -or [string]::IsNullOrEmpty($extension) -or $extension -eq '.html'
  if (-not $isPage) {
    return
  }

  $key = $Candidate.GetLeftPart([System.UriPartial]::Path)
  if ($Seen.Add($key)) {
    $Queue.Enqueue([System.Uri]::new($key))
  }
}

New-Item -ItemType Directory -Path $tempRoot, $sourcePath -Force | Out-Null

try {
  & git archive --format=zip --output=$archivePath $SourceRef
  if ($LASTEXITCODE -ne 0) {
    throw "git archive failed for $SourceRef"
  }

  Expand-Archive -LiteralPath $archivePath -DestinationPath $sourcePath -Force

  if (Test-Path -LiteralPath $destination) {
    Remove-Item -LiteralPath $destination -Recurse -Force
  }
  New-Item -ItemType Directory -Path $destination -Force | Out-Null

  $preservedPaths = @(
    'css',
    'fonts',
    'img',
    'js',
    'picture',
    'post_img',
    'pwa',
    'CRAGRU',
    'CRAGRU.html',
    'feed.xml',
    'offline.html',
    'resume.pdf',
    'sw.js',
    'vip.html',
    'vip-parse.html'
  )

  foreach ($relativePath in $preservedPaths) {
    $sourceItem = Join-Path $sourcePath $relativePath
    if (-not (Test-Path -LiteralPath $sourceItem)) {
      continue
    }

    $targetItem = Join-Path $destination $relativePath
    $targetParent = Split-Path -Parent $targetItem
    New-Item -ItemType Directory -Path $targetParent -Force | Out-Null
    Copy-Item -LiteralPath $sourceItem -Destination $targetItem -Recurse -Force
  }

  Get-ChildItem -LiteralPath $destination -Filter '.DS_Store' -Recurse -Force -ErrorAction SilentlyContinue |
    Remove-Item -Force

  $queue = [System.Collections.Generic.Queue[System.Uri]]::new()
  $seen = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
  $seedPaths = @('/', '/404.html', '/about/', '/tags/', '/page2/', '/vip-parse/')
  foreach ($seedPath in $seedPaths) {
    Add-LegacyPage -Queue $queue -Seen $seen -Candidate ([System.Uri]::new($sourceUri, $seedPath))
  }

  while ($queue.Count -gt 0) {
    if ($seen.Count -gt 100) {
      throw 'Legacy crawl exceeded the 100-page safety limit.'
    }

    $pageUri = $queue.Dequeue()
    $request = @{
      Uri = $pageUri.AbsoluteUri
      UseBasicParsing = $true
      TimeoutSec = 15
    }
    if (-not [string]::IsNullOrWhiteSpace($Proxy)) {
      $request.Proxy = $Proxy
    }

    try {
      $response = Invoke-WebRequest @request
    } catch {
      Write-Warning "Skipping unavailable legacy page $($pageUri.AbsoluteUri): $($_.Exception.Message)"
      continue
    }

    $html = Convert-LegacyHtml -Content ([string]$response.Content)
    $outputPath = Get-LegacyOutputPath -Uri $pageUri
    $outputParent = Split-Path -Parent $outputPath
    New-Item -ItemType Directory -Path $outputParent -Force | Out-Null
    [System.IO.File]::WriteAllText($outputPath, $html, $utf8)

    foreach ($match in [regex]::Matches($response.Content, '(?i)href\s*=\s*["'']([^"''#]+)["'']')) {
      $href = $match.Groups[1].Value.Trim()
      if ([string]::IsNullOrWhiteSpace($href) -or $href.StartsWith('mailto:') -or $href.StartsWith('javascript:')) {
        continue
      }

      try {
        Add-LegacyPage -Queue $queue -Seen $seen -Candidate ([System.Uri]::new($pageUri, $href))
      } catch {
        Write-Warning "Ignoring invalid legacy link '$href' on $($pageUri.AbsoluteUri)"
      }
    }
  }

  Get-ChildItem -LiteralPath $destination -Filter '*.html' -Recurse | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    $converted = Convert-LegacyHtml -Content $content
    [System.IO.File]::WriteAllText($_.FullName, $converted, $utf8)
  }

  $manifestPath = Join-Path $destination 'pwa\manifest.json'
  if (Test-Path -LiteralPath $manifestPath) {
    $manifest = [System.IO.File]::ReadAllText($manifestPath)
    $manifest = [regex]::Replace($manifest, '(?i)("(?:start_url|scope)"\s*:\s*")/(?!/)', '$1/legacy/')
    [System.IO.File]::WriteAllText($manifestPath, $manifest, $utf8)
  }

  $feedPath = Join-Path $destination 'feed.xml'
  if (Test-Path -LiteralPath $feedPath) {
    $feed = [System.IO.File]::ReadAllText($feedPath)
    $feed = $feed.Replace($SourceBase, ($SourceBase.TrimEnd('/') + $legacyPrefix))
    [System.IO.File]::WriteAllText($feedPath, $feed, $utf8)
  }

  $textExtensions = @('.css', '.html', '.js', '.json', '.svg', '.txt', '.xml')
  Get-ChildItem -LiteralPath $destination -File -Recurse |
    Where-Object { $_.Extension.ToLowerInvariant() -in $textExtensions } |
    ForEach-Object {
      $text = [System.IO.File]::ReadAllText($_.FullName)
      $normalized = [regex]::Replace(
        $text,
        '[\t ]+(?=\r?$)',
        '',
        [System.Text.RegularExpressions.RegexOptions]::Multiline
      )
      $normalized = $normalized.Replace("`t", '    ')
      $normalized = [regex]::Replace($normalized, '(?:\r?\n)+\z', '') + [Environment]::NewLine
      if ($normalized -cne $text) {
        [System.IO.File]::WriteAllText($_.FullName, $normalized, $utf8)
      }
    }

  $unsafeMatches = Get-ChildItem -LiteralPath $destination -Filter '*.html' -Recurse |
    Select-String -Pattern 'clientSecret|new\s+Gitalk' -CaseSensitive:$false
  if ($unsafeMatches) {
    throw 'Legacy archive still contains Gitalk credential configuration.'
  }

  $archivedPages = (Get-ChildItem -LiteralPath $destination -Filter '*.html' -Recurse | Measure-Object).Count
  $archivedFiles = (Get-ChildItem -LiteralPath $destination -File -Recurse | Measure-Object).Count
  Write-Output "Archived $archivedPages legacy HTML pages and $archivedFiles total files to $destination"
} finally {
  $resolvedTemp = [System.IO.Path]::GetFullPath($tempRoot)
  if ($resolvedTemp.StartsWith($tempParent, [System.StringComparison]::OrdinalIgnoreCase) -and
      (Split-Path -Leaf $resolvedTemp).StartsWith('haichao-legacy-')) {
    Remove-Item -LiteralPath $resolvedTemp -Recurse -Force -ErrorAction SilentlyContinue
  }
}
