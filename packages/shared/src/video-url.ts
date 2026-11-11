export interface ParsedVideoUrl {
  platform: 'youtube' | 'instagram';
  /** Canonical URL to store */
  url: string;
  /** YouTube video id or Instagram shortcode */
  id: string;
}

const YT_ID = /^[\w-]{11}$/;
const IG_CODE = /^[\w-]+$/;

/** Accepts YouTube (watch, youtu.be, shorts) and Instagram (p, reel) links; returns null otherwise. */
export function parseVideoUrl(input: string): ParsedVideoUrl | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.replace(/^(www\.|m\.)/, '');
  const parts = url.pathname.split('/').filter(Boolean);

  let ytId: string | undefined;
  if (host === 'youtube.com') {
    if (parts[0] === 'watch') ytId = url.searchParams.get('v') ?? undefined;
    else if (parts[0] === 'shorts') ytId = parts[1];
  } else if (host === 'youtu.be') {
    ytId = parts[0];
  }
  if (ytId !== undefined) {
    return YT_ID.test(ytId) ? { platform: 'youtube', id: ytId, url: `https://www.youtube.com/watch?v=${ytId}` } : null;
  }

  if (host === 'instagram.com' && (parts[0] === 'p' || parts[0] === 'reel') && parts[1]) {
    const code = parts[1];
    return IG_CODE.test(code)
      ? { platform: 'instagram', id: code, url: `https://www.instagram.com/${parts[0]}/${code}/` }
      : null;
  }
  return null;
}
