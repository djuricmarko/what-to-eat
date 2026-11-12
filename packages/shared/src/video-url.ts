export interface ParsedVideoUrl {
  platform: 'youtube' | 'instagram';
  /** Canonical URL to store */
  url: string;
  /** YouTube video id or Instagram shortcode */
  id: string;
}

const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;
const INSTAGRAM_SHORTCODE_PATTERN = /^[\w-]+$/;
const SUBDOMAIN_PREFIX_PATTERN = /^(www\.|m\.)/;

function toHttpUrl(input: string): URL | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  const isHttp = url.protocol === 'https:' || url.protocol === 'http:';
  return isHttp ? url : null;
}

function findYoutubeId(url: URL, host: string, pathSegments: string[]): string | undefined {
  if (host === 'youtu.be') return pathSegments[0];

  const [pageType, shortsId] = pathSegments;
  if (pageType === 'watch') return url.searchParams.get('v') ?? undefined;
  if (pageType === 'shorts') return shortsId;
  return undefined;
}

function parseYoutubeUrl(url: URL, host: string, pathSegments: string[]): ParsedVideoUrl | null {
  const id = findYoutubeId(url, host, pathSegments);
  if (id === undefined || !YOUTUBE_ID_PATTERN.test(id)) return null;

  return { platform: 'youtube', id, url: `https://www.youtube.com/watch?v=${id}` };
}

function parseInstagramUrl(pathSegments: string[]): ParsedVideoUrl | null {
  const [postType, shortcode] = pathSegments;
  const isPostOrReel = postType === 'p' || postType === 'reel';
  if (!isPostOrReel || !shortcode || !INSTAGRAM_SHORTCODE_PATTERN.test(shortcode)) return null;

  return { platform: 'instagram', id: shortcode, url: `https://www.instagram.com/${postType}/${shortcode}/` };
}

/** Accepts YouTube (watch, youtu.be, shorts) and Instagram (p, reel) links; returns null otherwise. */
export function parseVideoUrl(input: string): ParsedVideoUrl | null {
  const url = toHttpUrl(input);
  if (url === null) return null;

  const host = url.hostname.replace(SUBDOMAIN_PREFIX_PATTERN, '');
  const pathSegments = url.pathname.split('/').filter(Boolean);

  if (host === 'youtube.com' || host === 'youtu.be') return parseYoutubeUrl(url, host, pathSegments);
  if (host === 'instagram.com') return parseInstagramUrl(pathSegments);
  return null;
}
