import axios from "axios";

// ✅ 기본값: 로컬 백엔드(환경변수 없을 때)
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
).replace(/\/+$/, "");

const TOKEN_KEY = "accessToken";

export const getAccessToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAccessToken = (token) => {
  if (!token) return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    return;
  }
};

export const clearAccessToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    return;
  }
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ 요청에 토큰 자동 첨부
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers?.Authorization) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

// ✅ 응답에서 토큰 갱신 + 에러 메시지 통일
apiClient.interceptors.response.use(
  (response) => {
    // axios는 기본적으로 header key를 소문자로 내려줌
    const authHeader =
      response?.headers?.authorization ||
      response?.headers?.Authorization ||
      response?.headers?.["access-token"] ||
      response?.headers?.["x-access-token"];

    if (authHeader) {
      const raw = Array.isArray(authHeader) ? authHeader[0] : authHeader;
      const token =
        typeof raw === "string" && raw.startsWith("Bearer ")
          ? raw.slice(7)
          : raw;
      if (token) setAccessToken(token);
    }

    return response;
  },
  (error) => {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "요청 실패";
    error.userMessage = msg;
    return Promise.reject(error);
  },
);

export const apiRequest = async (path, options = {}) => {
  const response = await apiClient.request({
    url: path,
    ...options,
  });
  return response.data;
};
