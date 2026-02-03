import { useAuthStore } from "@/features/auth/authStore";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // include cookies in requests, backend must allow it
});

// req interceptor: automatically adds JWT access token to Authorization header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// res interceptor: Automatic Token Refresh
/*
 * When a request fails with 401 (Unauthorized):
 * 1. Check if we have a refresh token
 * 2. Call the refresh endpoint to get new access token
 * 3. Update the store with new tokens
 * 4. Retry the original failed request
 * 5. If refresh fails, logout the user
 */

let isRefreshing = false;
// queue of requests waiting for token refresh
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else if (token) {
      request.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  // success handler, just return the response
  (response) => response,

  // error handler, check for 401 and attempt refresh
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { tokens, logout, setTokens, user } = useAuthStore.getState();

      // if no refresh token, logout immediately
      if (!tokens?.refreshToken || !user?.id) {
        logout();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // call refresh endpoint
        // note: using axios directly to avoid interceptor loop
        const response = await axios.post(`${baseURL}/Auth/refresh-token`, {
          userId: user.id,
          refreshToken: tokens.refreshToken,
        });

        const newTokens = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          accessTokenExpiresAt: response.data.accessTokenExpiresAt,
        };

        // update tokens in store
        setTokens(newTokens);

        // process queued requests with new token
        processQueue(null, newTokens.accessToken);

        // retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // refresh failed, session is invalid -> logout user
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For non-401 errors, just reject
    return Promise.reject(error);
  },
);
