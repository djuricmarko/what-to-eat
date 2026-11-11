const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  console.warn('EXPO_PUBLIC_API_URL is not set; copy apps/mobile/.env.example to .env.local');
}

export const config = {
  apiUrl: (apiUrl ?? 'http://localhost:3000').replace(/\/$/, ''),
};
