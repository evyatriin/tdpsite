// Client-safe storage utilities for TDP Social Network

// Extract YouTube video ID from various URL formats
export function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/, // Just the ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Get YouTube thumbnail URL from video ID
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string {
    const qualityMap = {
        default: 'default',
        medium: 'mqdefault',
        high: 'hqdefault',
        maxres: 'maxresdefault',
    };
    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

// Generate thumbnail preview for social links
export function getSocialLinkThumbnail(platform: string, url: string): string | null {
    if (platform === 'YOUTUBE') {
        const videoId = extractYouTubeId(url);
        if (videoId) return getYouTubeThumbnail(videoId);
    }
    // For other platforms, we could use Open Graph scraping, but keeping simple for MVP
    return null;
}
