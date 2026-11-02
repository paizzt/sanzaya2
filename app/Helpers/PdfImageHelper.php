<?php

namespace App\Helpers;

use GuzzleHttp\Client;
use GuzzleHttp\Promise\Utils;
use Illuminate\Support\Facades\Log;

class PdfImageHelper
{
    private static array $memoryCache = [];

    /**
     * Normalize ImgBB URLs from blocked/dead i.ibb.co to active i.ibb.co.com CDN
     */
    public static function normalizeUrl(string $url): string
    {
        $url = trim($url);
        if (str_contains($url, '://i.ibb.co/')) {
            $url = str_replace('://i.ibb.co/', '://i.ibb.co.com/', $url);
        }
        return $url;
    }

    /**
     * Preload multiple remote image URLs in parallel using Guzzle async promises
     * with IPv4 resolution, local file caching, and a strict time budget so
     * LiteSpeed / web servers never time out.
     */
    public static function preloadUrls(array $pathsOrUrls, int $maxWidth = 240, float $maxBudgetSeconds = 15.0): void
    {
        $startTime = microtime(true);
        $remoteUrls = [];

        foreach ($pathsOrUrls as $item) {
            if (empty($item) || !is_string($item)) {
                continue;
            }
            $origUrl = trim($item);
            if (str_starts_with($origUrl, 'http://') || str_starts_with($origUrl, 'https://')) {
                $cacheKey = self::getCacheKey($origUrl, $maxWidth);
                if (array_key_exists($cacheKey, self::$memoryCache)) {
                    continue;
                }
                $diskCached = self::readDiskCache($cacheKey);
                if ($diskCached !== null) {
                    self::$memoryCache[$cacheKey] = $diskCached;
                    continue;
                }
                $remoteUrls[$origUrl] = self::normalizeUrl($origUrl);
            }
        }

        if (empty($remoteUrls)) {
            return;
        }

        $client = self::createHttpClient(4.5);

        // Fetch in parallel batches of 20
        foreach (array_chunk($remoteUrls, 20, true) as $chunk) {
            if ((microtime(true) - $startTime) >= $maxBudgetSeconds) {
                // Time budget reached: mark remaining as empty in memory so toBase64 won't block sequentially
                foreach ($chunk as $origUrl => $normUrl) {
                    $ck = self::getCacheKey($origUrl, $maxWidth);
                    if (!array_key_exists($ck, self::$memoryCache)) {
                        self::$memoryCache[$ck] = '';
                    }
                }
                continue;
            }

            try {
                $promises = [];
                foreach ($chunk as $origUrl => $normUrl) {
                    $promises[$origUrl] = $client->getAsync($normUrl);
                }

                $results = Utils::settle($promises)->wait();

                foreach ($chunk as $origUrl => $normUrl) {
                    $cacheKey = self::getCacheKey($origUrl, $maxWidth);
                    $res = $results[$origUrl] ?? null;

                    if ($res && ($res['state'] ?? '') === 'fulfilled' && isset($res['value'])) {
                        $body = (string) $res['value']->getBody();
                        $dataUri = self::bytesToDataUri($body, $maxWidth);
                        if ($dataUri !== '') {
                            self::$memoryCache[$cacheKey] = $dataUri;
                            self::writeDiskCache($cacheKey, $dataUri);
                            continue;
                        }
                    }

                    // Mark as empty in memory so we do NOT retry sequentially during PDF rendering
                    self::$memoryCache[$cacheKey] = '';
                }
            } catch (\Throwable $e) {
                Log::warning('PdfImageHelper preload batch error: ' . $e->getMessage());
                foreach ($chunk as $origUrl => $normUrl) {
                    $ck = self::getCacheKey($origUrl, $maxWidth);
                    if (!array_key_exists($ck, self::$memoryCache)) {
                        self::$memoryCache[$ck] = '';
                    }
                }
            }
        }
    }

    /**
     * Resolve a local storage path, remote URL (e.g. ImgBB), or existing data URI
     * into a DomPDF-safe base64 data URI string.
     * Always returns either 'data:image/...;base64,...' or '' (never a slow remote URL).
     */
    public static function toPdfSrc(?string $pathOrUrl, int $maxWidth = 240): string
    {
        return self::toBase64($pathOrUrl, $maxWidth);
    }

    /**
     * Resolve a local storage path, remote URL (e.g. ImgBB), or existing data URI
     * into a DomPDF-safe base64 data URI string.
     */
    public static function toBase64(?string $pathOrUrl, int $maxWidth = 240): string
    {
        if (empty($pathOrUrl) || !is_string($pathOrUrl)) {
            return '';
        }

        $pathOrUrl = trim($pathOrUrl);

        // 1. Already a base64 data URI
        if (str_starts_with($pathOrUrl, 'data:image/')) {
            return preg_replace('/\s+/', '', $pathOrUrl);
        }

        // 2. Check local filesystem paths
        $cleanRel = ltrim($pathOrUrl, '/\\');
        $candidatePaths = [
            storage_path('app/public/' . $cleanRel),
            public_path('storage/' . $cleanRel),
            public_path($cleanRel),
            storage_path($cleanRel),
        ];

        foreach ($candidatePaths as $localPath) {
            if (file_exists($localPath) && is_file($localPath)) {
                try {
                    $bytes = @file_get_contents($localPath);
                    if ($bytes !== false && !empty($bytes)) {
                        $dataUri = self::bytesToDataUri($bytes, $maxWidth);
                        if ($dataUri !== '') {
                            return $dataUri;
                        }
                    }
                } catch (\Throwable $e) {
                    Log::warning('PdfImageHelper local read error: ' . $e->getMessage());
                }
            }
        }

        // 3. Remote URL (http / https, e.g. https://i.ibb.co/...)
        if (str_starts_with($pathOrUrl, 'http://') || str_starts_with($pathOrUrl, 'https://')) {
            $cacheKey = self::getCacheKey($pathOrUrl, $maxWidth);

            if (array_key_exists($cacheKey, self::$memoryCache)) {
                return self::$memoryCache[$cacheKey];
            }

            $diskCached = self::readDiskCache($cacheKey);
            if ($diskCached !== null) {
                self::$memoryCache[$cacheKey] = $diskCached;
                return $diskCached;
            }

            $normUrl = self::normalizeUrl($pathOrUrl);
            $urlsToTry = [$normUrl];
            if ($normUrl !== $pathOrUrl) {
                $urlsToTry[] = $pathOrUrl;
            }

            $client = self::createHttpClient(4.5);

            foreach ($urlsToTry as $tryUrl) {
                try {
                    $response = $client->get($tryUrl);
                    if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
                        $body = (string) $response->getBody();
                        if (!empty($body)) {
                            $dataUri = self::bytesToDataUri($body, $maxWidth);
                            if ($dataUri !== '') {
                                self::$memoryCache[$cacheKey] = $dataUri;
                                self::writeDiskCache($cacheKey, $dataUri);
                                return $dataUri;
                            }
                        }
                    }
                } catch (\Throwable $e) {
                    // Continue to next candidate
                }
            }

            self::$memoryCache[$cacheKey] = '';
        }

        return '';
    }

    private static function createHttpClient(float $timeoutSeconds = 4.5): Client
    {
        $curlOptions = [];
        if (defined('CURLOPT_IPRESOLVE') && defined('CURL_IPRESOLVE_V4')) {
            $curlOptions[CURLOPT_IPRESOLVE] = CURL_IPRESOLVE_V4;
        }

        return new Client([
            'verify' => false,
            'timeout' => $timeoutSeconds,
            'connect_timeout' => 3.0,
            'http_errors' => false,
            'curl' => $curlOptions,
            'headers' => [
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept' => 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
            ],
        ]);
    }

    /**
     * Validate raw image bytes, resize to thumbnail so DomPDF renders fast,
     * and convert to a DomPDF-compatible base64 data URI.
     */
    private static function bytesToDataUri(string $bytes, int $maxWidth = 240): string
    {
        if (empty($bytes)) {
            return '';
        }

        $info = @getimagesizefromstring($bytes);
        if ($info === false || empty($info['mime'])) {
            return '';
        }

        $mime = strtolower(trim(explode(';', $info['mime'])[0]));
        $width = $info[0] ?? 0;
        $height = $info[1] ?? 0;

        // Resize larger images or convert WebP via GD so DomPDF processes them in milliseconds
        $needsGdConversion = ($mime === 'image/webp') || ($maxWidth > 0 && $width > $maxWidth);
        if ($needsGdConversion && function_exists('imagecreatefromstring')) {
            $srcImg = @imagecreatefromstring($bytes);
            if ($srcImg !== false) {
                $targetW = $width;
                $targetH = $height;

                if ($maxWidth > 0 && $width > $maxWidth && $height > 0) {
                    $targetW = $maxWidth;
                    $targetH = max(1, (int) round($height * ($maxWidth / $width)));
                }

                $dstImg = imagecreatetruecolor($targetW, $targetH);
                if ($mime === 'image/png' || $mime === 'image/webp' || $mime === 'image/gif') {
                    imagealphablending($dstImg, false);
                    imagesavealpha($dstImg, true);
                    $transparent = imagecolorallocatealpha($dstImg, 255, 255, 255, 127);
                    imagefilledrectangle($dstImg, 0, 0, $targetW, $targetH, $transparent);
                } else {
                    $white = imagecolorallocate($dstImg, 255, 255, 255);
                    imagefilledrectangle($dstImg, 0, 0, $targetW, $targetH, $white);
                }

                imagecopyresampled($dstImg, $srcImg, 0, 0, 0, 0, $targetW, $targetH, $width, $height);

                ob_start();
                if ($mime === 'image/png' || $mime === 'image/webp' || $mime === 'image/gif') {
                    imagepng($dstImg, null, 6);
                    $outMime = 'image/png';
                } else {
                    imagejpeg($dstImg, null, 78);
                    $outMime = 'image/jpeg';
                }
                $convertedBytes = ob_get_clean();
                imagedestroy($srcImg);
                imagedestroy($dstImg);

                if (!empty($convertedBytes)) {
                    return 'data:' . $outMime . ';base64,' . base64_encode($convertedBytes);
                }
            }
        }

        if (!in_array($mime, ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'])) {
            return '';
        }

        return 'data:' . $mime . ';base64,' . base64_encode($bytes);
    }

    private static function getCacheKey(string $url, int $maxWidth): string
    {
        return md5(self::normalizeUrl($url) . '_' . $maxWidth);
    }

    private static function getCacheFilePath(string $cacheKey): string
    {
        $dir = storage_path('framework/cache/pdf_img');
        if (!is_dir($dir)) {
            @mkdir($dir, 0775, true);
        }
        return $dir . DIRECTORY_SEPARATOR . $cacheKey . '.b64';
    }

    private static function readDiskCache(string $cacheKey): ?string
    {
        try {
            $file = self::getCacheFilePath($cacheKey);
            if (is_file($file)) {
                // Valid for 7 days
                if ((time() - @filemtime($file)) < 604800) {
                    $content = @file_get_contents($file);
                    if (is_string($content) && str_starts_with($content, 'data:image/')) {
                        return $content;
                    }
                }
            }
        } catch (\Throwable $e) {
            // Ignore disk cache read error
        }
        return null;
    }

    private static function writeDiskCache(string $cacheKey, string $dataUri): void
    {
        try {
            $file = self::getCacheFilePath($cacheKey);
            @file_put_contents($file, $dataUri);
        } catch (\Throwable $e) {
            // Ignore disk cache write error
        }
    }
}
