// Mirrors the web palette (apps/web/src/styles/globals.css)
export const colors = {
  light: {
    background: '#FFFBF7',
    foreground: '#292524',
    card: '#FFFFFF',
    primary: '#EA7A2C',
    primaryForeground: '#FFFFFF',
    muted: '#F3EFEA',
    mutedForeground: '#78716C',
    border: '#E7E2DC',
  },
  dark: {
    background: '#1C1917',
    foreground: '#F5F3F0',
    card: '#262220',
    primary: '#F08A3E',
    primaryForeground: '#FFFFFF',
    muted: '#2F2B28',
    mutedForeground: '#A8A29E',
    border: '#3A3532',
  },
} as const;

export type ThemeColors = (typeof colors)['light'];
