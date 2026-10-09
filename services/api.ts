import { i18n } from "@/i18n";
import { getDatabaseService, store } from "@/redux";
import { AppMessagesEnum } from "@/shared/enum/AppMessagesEnum";
import { StatusCodeEnum } from "@/shared/enum/StatusCodeEnum";
import axios from "axios";
import { AuthServices } from "./AuthServices";
import { log } from "@/shared/utils/log";
import { logoutUser } from "@/redux/slices/authSlice";
import { API_TIMEOUT } from "@/shared/constants/general";
import { BASE_URL } from "@/shared/constants/envConstants";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    try {
      if (
        error.response &&
        error.response.status === StatusCodeEnum.UNAUTHORIZED &&
        error.response.data &&
        error.response.data.message === StatusCodeEnum.JWT_EXPIRED
      ) {
        // Token expirado, tenta renovar

        // Implementação do refresh token
        const newToken = await refreshToken();

        // Recupera a requisição original que falhou
        const originalRequest = error.config;

        // Atualiza o token na requisição original
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Refaz a requisição original com o novo token
        return axios(originalRequest);
      }

      if (
        error?.code === StatusCodeEnum.GATEWAY_TIMEOUT ||
        (error?.response && error?.response.status === 504)
      ) {
        throw new Error(i18n.translate(AppMessagesEnum.GATEWAY_TIMEOUT));
      }

      if (error?.code === StatusCodeEnum.ERR_NETWORK) {
        throw new Error(i18n.translate(AppMessagesEnum.UNKNOWN));
      }

      return Promise.reject(error);
    } catch (e) {
      return Promise.reject(e);
    }
  },
);

const refreshToken = async (): Promise<string> => {
  const localDataBase = getDatabaseService();
  log("Iniciando processo de refresh token...");

  try {
    if (!localDataBase)
      throw new Error(
        i18n.translate(AppMessagesEnum.LOCAL_DATA_BASE_UNAVAILABLE),
      );

    log("Tentando renovar token com refresh token...");
    const response = await AuthServices.refreshToken("");
    log("Resposta do refresh token:", response);
    const newToken = response.token;
    const newGoogleTokens = response.googleTokens;

    localDataBase.userLocalService.updateUserTokens({
      token: newToken,
      googleTokens: newGoogleTokens,
    });

    log("Refresh token bem-sucedido.");

    return newToken;
  } catch (e) {
    await store.dispatch(logoutUser(AppMessagesEnum.SESSION_EXPIRED));

    throw new Error(i18n.translate(AppMessagesEnum.SESSION_EXPIRED));
  }
};

const get = async <Response>(url: string) => {
  const { data } = await api.get<Response>(url);
  return data;
};

const post = async <Request, Response>(url: string, data: Request) => {
  const response = await api.post<Response>(url, data);
  return response.data;
};
const put = async <Request, Response>(url: string, data: Request) => {
  const response = await api.put<Response>(url, data);
  return response.data;
};

const remove = async <Response, Request = any>(url: string, data?: Request) => {
  const response = await api.delete<Response>(url, { data });
  return response.data;
};
const patch = async <Request, Response>(url: string, data: Request) => {
  const response = await api.patch<Response>(url, data);
  return response.data;
};

export { api, get, post, put, remove, patch };
