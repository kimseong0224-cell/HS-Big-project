// src/api/authApi.js

import api from "./client";

// Swagger 기준: POST /auth/register
export const register = async (payload) => {
  const res = await api.post("/auth/register", payload);
  return res.data;
};

// Swagger 기준: POST /auth/login  -> { accessToken: "..." }
export const login = async (payload) => {
  const res = await api.post("/auth/login", payload);
  return res.data;
};

// Swagger 기준: POST /auth/logout
export const logout = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};
