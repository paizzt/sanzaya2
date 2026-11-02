<?php

namespace App\Helpers;

use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PdfImageHelper
{
    private static array $memoryCache = [];

    /**
     * Preload multiple remote image URLs in parallel using Http::pool
     * and store their base64 data URIs in cache so PDF generation is fast.
     */
    public static function preloadUrls(array $pathsOrUrls, int $maxWidth = 300): void
    {
        $remoteUrls = [];

        foreach ($pathsOrUrls as $item) {
            if (empty($item) || !is_string($item)) {
                continue;
            }
            $item = trim($item);
            if (str_starts_with($item, 'http://') || str_starts_with($item, 'https://')) {
                $cacheKey = self::getCacheKey($item, $maxWidth);
                if (!isset(self::$memoryCache[$cacheKey]) && !self::safeCacheHas($cacheKey)) {
                    $remoteUrls[$item] = $item;
                }
            }
        }

        if (empty($remoteUrls)) {
            return;
        }

        foreach (array_chunk($remoteUrls, 25, true) as $chunk) {
            try {
                $responses = Http::pool(function (Pool $pool) use ($chunk, $maxWidth) {
                    foreach ($chunk as $originalUrl) {
                        $proxyUrl = 'https://wsrv.nl/?url=' . urlencode($originalUrl)
                            . ($maxWidth > 0 ? '&w=' . $maxWidth : '');

                        $pool->as($originalUrl)
                            ->withoutVerifying()
                            ->timeout(8)
                            ->withHeaders([
                                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                            ])
                            ->get($proxyUrl);
                    }
                });

                foreach ($chunk as $originalUrl) {
                    $resp = $responses[$originalUrl] ?? null;
                    if ($resp instanceof \Illuminate\Http\Client\Response && $resp->successful()) {
                        $dataUri = self::bytesToDataUri($resp->body(), $maxWidth);
                        if ($dataUri) {
                            $cacheKey = self::getCacheKey($originalUrl, $maxWidth);
                            self::$memoryCache[$cacheKey] = $dataUri;
                            self::safeCachePut($cacheKey, $dataUri);
                        }
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('PdfImageHelper preload pool error: ' . $e->getMessage());
            }
        }
    }

    /**
     * Resolve a local storage path, remote URL (e.g. ImgBB), or existing data URI
     * into a DomPDF-safe base64 data URI string (with remote proxy fallback).
     */
    public static function toPdfSrc(?string $pathOrUrl, int $maxWidth = 300): string
    {
        $base64 = self::toBase64($pathOrUrl, $maxWidth);
        if (!empty($base64)) {
            return $base64;
        }

        if (!empty($pathOrUrl) && is_string($pathOrUrl)) {
            $trimmed = trim($pathOrUrl);
            if (str_starts_with($trimmed, 'http://') || str_starts_with($trimmed, 'https://')) {
                return str_contains($trimmed, 'i.ibb.co')
                    ? 'https://wsrv.nl/?url=' . urlencode($trimmed) . ($maxWidth > 0 ? '&w=' . $maxWidth : '')
                    : $trimmed;
            }
        }

        return '';
    }

    /**
     * Resolve a local storage path, remote URL (e.g. ImgBB), or existing data URI
     * into a DomPDF-safe base64 data URI string.
     */
    public static function toBase64(?string $pathOrUrl, int $maxWidth = 300): string
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
                        if ($dataUri) {
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

            if (isset(self::$memoryCache[$cacheKey])) {
                return self::$memoryCache[$cacheKey];
            }

            $cached = self::safeCacheGet($cacheKey);
            if (!empty($cached) && is_string($cached)) {
                self::$memoryCache[$cacheKey] = $cached;
                return $cached;
            }

            $proxyUrl = 'https://wsrv.nl/?url=' . urlencode($pathOrUrl)
                . ($maxWidth > 0 ? '&w=' . $maxWidth : '');

            $urlsToTry = str_contains($pathOrUrl, 'i.ibb.co')
                ? [$proxyUrl, $pathOrUrl]
                : [$pathOrUrl, $proxyUrl];

            foreach ($urlsToTry as $tryUrl) {
                try {
                    $response = Http::withoutVerifying()
                        ->timeout(10)
                        ->withHeaders([
                            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                        ])
                        ->get($tryUrl);

                    if ($response->successful() && !empty($response->body())) {
                        $dataUri = self::bytesToDataUri($response->body(), $maxWidth);
                        if ($dataUri) {
                            self::$memoryCache[$cacheKey] = $dataUri;
                            self::safeCachePut($cacheKey, $dataUri);
                            return $dataUri;
                        }
                    }
                } catch (\Throwable $e) {
                    Log::warning("PdfImageHelper remote fetch error ($tryUrl): " . $e->getMessage());
                }
            }
        }

        return '';
    }

    /**
     * Validate raw image bytes and convert to a DomPDF-compatible base64 data URI.
     * Automatically converts WebP to PNG/JPEG if GD is available so DomPDF never fails.
     */
    private static function bytesToDataUri(string $bytes, int $maxWidth = 300): string
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

        $needsGdConversion = ($mime === 'image/webp') || ($maxWidth > 0 && $width > ($maxWidth * 2));
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
                imagealphablending($dstImg, false);
                imagesavealpha($dstImg, true);
                $transparent = imagecolorallocatealpha($dstImg, 255, 255, 255, 127);
                imagefilledrectangle($dstImg, 0, 0, $targetW, $targetH, $transparent);
                imagecopyresampled($dstImg, $srcImg, 0, 0, 0, 0, $targetW, $targetH, $width, $height);

                ob_start();
                if ($mime === 'image/png' || $mime === 'image/webp' || $mime === 'image/gif') {
                    imagepng($dstImg, null, 7);
                    $outMime = 'image/png';
                } else {
                    imagejpeg($dstImg, null, 82);
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
        return 'pdf_img_b64_v2_' . md5($url . '_' . $maxWidth);
    }

    private static function safeCacheHas(string $key): bool
    {
        try {
            return Cache::has($key);
        } catch (\Throwable $e) {
            return false;
        }
    }

    private static function safeCacheGet(string $key): ?string
    {
        try {
            $val = Cache::get($key);
            return is_string($val) ? $val : null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    private static function safeCachePut(string $key, string $value): void
    {
        try {
            Cache::put($key, $value, now()->addHours(24));
        } catch (\Throwable $e) {
            // Ignore cache storage errors
        }
    }
}
