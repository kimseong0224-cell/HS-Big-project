// src/pages/AuthTest.jsx

import { useState } from "react";
import * as authApi from "../api/authApi";

export default function AuthTest() {
  const [registerForm, setRegisterForm] = useState({
    loginId: "",
    email: "",
    password: "",
    mobileNumber: "",
    username: "",
  });

  const [loginForm, setLoginForm] = useState({
    loginId: "",
    password: "",
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const show = (data) => {
    setError(null);
    setResult(data);
  };

  const showErr = (e) => {
    setResult(null);
    setError(e);
  };

  const onRegister = async () => {
    try {
      const data = await authApi.register(registerForm);
      show({ action: "register", data });
    } catch (e) {
      showErr(e);
    }
  };

  const onLogin = async () => {
    try {
      const data = await authApi.login(loginForm);

      // ✅ Swagger 응답 그대로: { accessToken: "..." }
      const token = data?.accessToken;
      if (token) localStorage.setItem("accessToken", token);

      show({ action: "login", savedToken: !!token, data });
    } catch (e) {
      showErr(e);
    }
  };

  const onLogout = async () => {
    try {
      const data = await authApi.logout();
      localStorage.removeItem("accessToken");
      show({ action: "logout", data });
    } catch (e) {
      showErr(e);
    }
  };

  const tokenNow = localStorage.getItem("accessToken");

  return (
    <div style={{ padding: 16, maxWidth: 760 }}>
      <h2>Auth 연결 테스트</h2>
      <div style={{ marginBottom: 8 }}>
        <b>BASE_URL:</b> {import.meta.env.VITE_API_BASE_URL}
      </div>
      <div style={{ marginBottom: 16 }}>
        <b>현재 토큰 저장 여부:</b> {tokenNow ? "있음" : "없음"}
      </div>

      <hr />

      <h3>회원가입 (POST /auth/register)</h3>
      <div style={{ display: "grid", gap: 8 }}>
        <input
          placeholder="loginId"
          value={registerForm.loginId}
          onChange={(e) =>
            setRegisterForm({ ...registerForm, loginId: e.target.value })
          }
        />
        <input
          placeholder="email"
          value={registerForm.email}
          onChange={(e) =>
            setRegisterForm({ ...registerForm, email: e.target.value })
          }
        />
        <input
          placeholder="password"
          type="password"
          value={registerForm.password}
          onChange={(e) =>
            setRegisterForm({ ...registerForm, password: e.target.value })
          }
        />
        <input
          placeholder="mobileNumber"
          value={registerForm.mobileNumber}
          onChange={(e) =>
            setRegisterForm({ ...registerForm, mobileNumber: e.target.value })
          }
        />
        <input
          placeholder="username"
          value={registerForm.username}
          onChange={(e) =>
            setRegisterForm({ ...registerForm, username: e.target.value })
          }
        />
        <button onClick={onRegister}>회원가입 호출</button>
      </div>

      <hr />

      <h3>로그인 (POST /auth/login)</h3>
      <div style={{ display: "grid", gap: 8 }}>
        <input
          placeholder="loginId"
          value={loginForm.loginId}
          onChange={(e) =>
            setLoginForm({ ...loginForm, loginId: e.target.value })
          }
        />
        <input
          placeholder="password"
          type="password"
          value={loginForm.password}
          onChange={(e) =>
            setLoginForm({ ...loginForm, password: e.target.value })
          }
        />
        <button onClick={onLogin}>로그인 호출</button>
      </div>

      <hr />

      <h3>로그아웃 (POST /auth/logout)</h3>
      <button onClick={onLogout}>로그아웃 호출</button>

      <hr />

      {result && (
        <pre
          style={{
            background: "#111",
            color: "#0f0",
            padding: 12,
            overflow: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}

      {error && (
        <pre
          style={{
            background: "#111",
            color: "#f66",
            padding: 12,
            overflow: "auto",
          }}
        >
          {JSON.stringify(error, null, 2)}
        </pre>
      )}
    </div>
  );
}
