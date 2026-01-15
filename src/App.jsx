// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import FindID from "./pages/FindID.jsx";
import FindPassword from "./pages/FindPassword.jsx";
import MainPage from "./pages/MainPage.jsx";
import DiagnosisHome from "./pages/DiagnosisHome.jsx";
import EasyLogin from "./pages/EasyLogin.jsx";

export default function App() {
  return (
    <Routes>
      {/* ✅ 메인 페이지 경로 2개 지원 (/ , /main) */}
      <Route path="/" element={<Login />} />
      <Route path="/main" element={<MainPage />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/findid" element={<FindID />} />
      <Route path="/findpw" element={<FindPassword />} />

      <Route path="/diagnosis" element={<DiagnosisHome />} />
      <Route path="/easylogin" element={<EasyLogin />} />

      {/* 없는 경로는 메인으로 */}
      <Route path="*" element={<Navigate to="/main" replace />} />
    </Routes>
  );
}
