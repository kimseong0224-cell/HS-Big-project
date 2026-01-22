import { api } from "./client";

api.interceptors.request.use((config) => {
  const noAuthPaths = [
    "/actuator/health",
    "/actuator",
    "/swagger-ui",
    "/v3/api-docs",
  ];

  const isNoAuth = noAuthPaths.some((p) => config.url?.startsWith(p));
  if (isNoAuth) return config;

  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ Swagger에서 "자물쇠 없는" GET 엔드포인트로 바꿔
export const health = async () => {
  const res = await api.get("/"); // or "/api/health"
  return res.data;
};
