// api.ts
import { i18n } from '@/i18n';
import { getDatabaseService, store } from '@/redux';
import { AppMessagesEnum } from '@/shared/enum/AppMessagesEnum';
import { StatusCodeEnum } from '@/shared/enum/StatusCodeEnum';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AuthServices } from './AuthServices';
import { log } from '@/shared/utils/log';
import { logoutUser } from '@/redux/slices/authSlice';
import { API_TIMEOUT } from '@/shared/constants/general';
import { BASE_URL, NODE_ENV } from '@/shared/constants/envConstants';

// ─── Validate on startup ──────────────────────────────────────────────────────
if (!BASE_URL) {
  console.error('❌ [api] BASE_URL is undefined!', {
    NODE_ENV,
    hint: 'Check .env and app.config.js extra.BASE_URL',
  });
} else {
  console.log(`🌐 [api] Base URL: ${BASE_URL} (${NODE_ENV})`);
}

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const localDataBase = getDatabaseService();
      if (localDataBase) {
        const user = await localDataBase.userLocalService.getUser();
        const token = user?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      log('⚠️ [api] Could not attach auth token:', e);
    }

    log(`➡️ [${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Refresh Token Queue ──────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token!);
  });
  failedQueue = [];
};

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    log(`✅ [${response.status}] ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // ── 401 + JWT expired → try refresh ──────────────────────────────────────
    if (
      error.response?.status === StatusCodeEnum.UNAUTHORIZED &&
      error.response?.data?.message === StatusCodeEnum.JWT_EXPIRED &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
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

      try {
        const newToken = await refreshToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 504 Gateway Timeout ───────────────────────────────────────────────────
    if (
      error?.code === StatusCodeEnum.GATEWAY_TIMEOUT ||
      error?.response?.status === 504
    ) {
      return Promise.reject(
        new Error(i18n.translate(AppMessagesEnum.GATEWAY_TIMEOUT)),
      );
    }

    // ── Network Error ─────────────────────────────────────────────────────────
    if (error?.code === StatusCodeEnum.ERR_NETWORK) {
      return Promise.reject(
        new Error(i18n.translate(AppMessagesEnum.UNKNOWN)),
      );
    }

    log(`❌ [api] Error [${error?.response?.status}]:`, error?.response?.data);
    return Promise.reject(error);
  },
);

// ─── Refresh Token ────────────────────────────────────────────────────────────
const refreshToken = async (): Promise<string> => {
  const localDataBase = getDatabaseService();
  log('🔄 [api] Starting refresh token...');

  if (!localDataBase) {
    throw new Error(i18n.translate(AppMessagesEnum.LOCAL_DATA_BASE_UNAVAILABLE));
  }

  try {
    const response = await AuthServices.refreshToken('');
    const { token: newToken, googleTokens: newGoogleTokens } = response;

    await localDataBase.userLocalService.updateUserTokens({
      token: newToken,
      googleTokens: newGoogleTokens,
    });

    log('✅ [api] Refresh token successful');
    return newToken;
  } catch (e) {
    log('❌ [api] Refresh token failed:', e);
    await store.dispatch(logoutUser(AppMessagesEnum.SESSION_EXPIRED));
    throw new Error(i18n.translate(AppMessagesEnum.SESSION_EXPIRED));
  }
};

// ─── HTTP Methods ─────────────────────────────────────────────────────────────
const get = async <Response>(url: string): Promise<Response> => {
  const { data } = await api.get<Response>(url);
  return data;
};

const post = async <Request, Response>(
  url: string,
  body: Request,
): Promise<Response> => {
  const { data } = await api.post<Response>(url, body);
  return data;
};

const put = async <Request, Response>(
  url: string,
  body: Request,
): Promise<Response> => {
  const { data } = await api.put<Response>(url, body);
  return data;
};

const remove = async <Response, Request = unknown>(
  url: string,
  body?: Request,
): Promise<Response> => {
  const { data } = await api.delete<Response>(url, { data: body });
  return data;
};

const patch = async <Request, Response>(
  url: string,
  body: Request,
): Promise<Response> => {
  const { data } = await api.patch<Response>(url, body);
  return data;
};

export { api, get, post, put, remove, patch };