import { describe, expect, it } from 'vitest';
import { parseVideoUrl } from './video-url.js';

describe('parseVideoUrl', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://m.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
  ])('parses YouTube %s', (input, id) => {
    expect(parseVideoUrl(input)).toEqual({
      platform: 'youtube',
      id,
      url: `https://www.youtube.com/watch?v=${id}`,
    });
  });

  it('parses Instagram reels and posts', () => {
    expect(parseVideoUrl('https://www.instagram.com/reel/C1a2b3c4/?igsh=x')).toEqual({
      platform: 'instagram',
      id: 'C1a2b3c4',
      url: 'https://www.instagram.com/reel/C1a2b3c4/',
    });
    expect(parseVideoUrl('https://instagram.com/p/AbC_-1')?.platform).toBe('instagram');
  });

  it.each([
    'not a url',
    'https://vimeo.com/123',
    'https://youtube.com/watch?v=short',
    'https://instagram.com/someuser',
    'javascript:alert(1)',
  ])('rejects %s', (input) => {
    expect(parseVideoUrl(input)).toBeNull();
  });
});
