import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api-client';

const MAX_RETRIES = 2;

function isClientError(error: Error) {
  return error instanceof ApiError && error.status < 500;
}

function shouldRetry(failureCount: number, error: Error) {
  return !isClientError(error) && failureCount < MAX_RETRIES;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: shouldRetry },
  },
});
