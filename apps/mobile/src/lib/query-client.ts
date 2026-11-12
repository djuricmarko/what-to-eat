import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform, type AppStateStatus } from 'react-native';
import { ApiError } from './api-client';

const MAX_RETRIES = 2;

function isClientError(error: Error) {
  return error instanceof ApiError && error.status < 500;
}

function shouldRetry(failureCount: number, error: Error) {
  return !isClientError(error) && failureCount < MAX_RETRIES;
}

function syncQueryFocusWithAppState(appState: AppStateStatus) {
  if (Platform.OS !== 'web') focusManager.setFocused(appState === 'active');
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: shouldRetry },
  },
});

// Refetch when the app returns to the foreground (React Native has no window focus events).
AppState.addEventListener('change', syncQueryFocusWithAppState);
onlineManager.setOnline(true);
