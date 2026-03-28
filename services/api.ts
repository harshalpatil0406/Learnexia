import axios, { AxiosError } from "axios";
import { getRefreshToken, getToken, saveToken } from "../utils/secureStore";

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BASE_URL,
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to check if error is retryable
const isRetryableError = (error: AxiosError): boolean => {
  if (!error.response) {
    // Network errors (no response) are retryable
    return true;
  }

  const status = error.response.status;
  // Retry on 5xx server errors and 408 (timeout)
  return status >= 500 || status === 408;
};

// Response interceptor to handle token refresh and retries
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Handle 401 - Token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();

        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(
            `${process.env.EXPO_PUBLIC_BASE_URL}/users/refresh-token`,
            { refreshToken }
          );

          const newAccessToken = response.data?.data?.accessToken;

          if (newAccessToken) {
            await saveToken(newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, reject with original error
        return Promise.reject(error);
      }
    }

    // Handle retryable errors (network issues, server errors)
    if (isRetryableError(error) && !originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    if (
      isRetryableError(error) &&
      originalRequest._retryCount < MAX_RETRIES
    ) {
      originalRequest._retryCount += 1;

      console.log(
        `Retrying request (${originalRequest._retryCount}/${MAX_RETRIES})...`
      );

      // Exponential backoff
      await delay(RETRY_DELAY * originalRequest._retryCount);

      return api(originalRequest);
    }

    // Enhance error with user-friendly message
    const enhancedError: any = error;
    
    if (!error.response) {
      // Network error
      enhancedError.userMessage = "Network error. Please check your internet connection.";
    } else if (error.code === "ECONNABORTED") {
      // Timeout error
      enhancedError.userMessage = "Request timeout. Please try again.";
    } else if (error.response.status >= 500) {
      // Server error
      enhancedError.userMessage = "Server error. Please try again later.";
    } else if (error.response.status === 404) {
      enhancedError.userMessage = "Resource not found.";
    } else if (error.response.status === 403) {
      enhancedError.userMessage = "Access denied.";
    } else {
      const responseData = error.response.data as any;
      enhancedError.userMessage = responseData?.message || "An error occurred. Please try again.";
    }

    return Promise.reject(enhancedError);
  }
);

export default api;

// Export helper to get user-friendly error message
export const getErrorMessage = (error: any): string => {
  return error?.userMessage || error?.message || "An unexpected error occurred";
};