// src/pages/EasyLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/EasyLogin.css";

export default function EasyLogin() {
  const navigate = useNavigate();
  const [loadingProvider, setLoadingProvider] = useState("");

  const handleProvider = async (provider) => {
    setLoadingProvider(provider);

    try {
      // TODO: 실제 서비스에서는 여기서 OAuth 시작
      // 예) window.location.href = `${API_BASE}/auth/${provider}`;
      await new Promise((r) => setTimeout(r, 600)); // 테스트용 딜레이

      alert(`${provider} 간편로그인 (테스트)`);
      navigate("/main"); // 로그인 성공했다고 가정
    } finally {
      setLoadingProvider("");
    }
  };

  return (
    <div className="easy-page">
      <main className="easy-card">
        <div className="easy-head">
          <h1 className="easy-title">간편 로그인</h1>
          <p className="easy-subtitle">
            자주 쓰는 계정으로 빠르게 로그인하세요.
          </p>
        </div>

        <div className="easy-providers" aria-label="간편 로그인 제공자">
          <button
            type="button"
            className="provider-btn"
            onClick={() => handleProvider("Google")}
            disabled={!!loadingProvider}
          >
            <span className="provider-icon" aria-hidden="true">
              G
            </span>
            <span className="provider-text">Google로 계속하기</span>
            <span className="provider-right">
              {loadingProvider === "Google" ? "진행 중..." : "→"}
            </span>
          </button>

          <button
            type="button"
            className="provider-btn"
            onClick={() => handleProvider("Kakao")}
            disabled={!!loadingProvider}
          >
            <span className="provider-icon" aria-hidden="true">
              K
            </span>
            <span className="provider-text">Kakao로 계속하기</span>
            <span className="provider-right">
              {loadingProvider === "Kakao" ? "진행 중..." : "→"}
            </span>
          </button>

          <button
            type="button"
            className="provider-btn"
            onClick={() => handleProvider("Naver")}
            disabled={!!loadingProvider}
          >
            <span className="provider-icon" aria-hidden="true">
              N
            </span>
            <span className="provider-text">Naver로 계속하기</span>
            <span className="provider-right">
              {loadingProvider === "Naver" ? "진행 중..." : "→"}
            </span>
          </button>

          <button
            type="button"
            className="provider-btn"
            onClick={() => handleProvider("Apple")}
            disabled={!!loadingProvider}
          >
            <span className="provider-icon" aria-hidden="true">
              
            </span>
            <span className="provider-text">Apple로 계속하기</span>
            <span className="provider-right">
              {loadingProvider === "Apple" ? "진행 중..." : "→"}
            </span>
          </button>
        </div>

        <div className="easy-divider" />

        <div className="easy-actions">
          <button
            type="button"
            className="easy-secondary"
            onClick={() => navigate("/login")}
            disabled={!!loadingProvider}
          >
            일반 로그인으로 돌아가기
          </button>
          <button
            type="button"
            className="easy-ghost"
            onClick={() => navigate("/signup")}
            disabled={!!loadingProvider}
          >
            아직 계정이 없어요 (회원가입)
          </button>
        </div>

        <p className="easy-footnote">
          * 실제 서비스에서는 간편로그인 제공자의 인증 절차 후 로그인됩니다.
        </p>
      </main>

      <footer className="easy-footer">
        <div className="footer-inner">
          <div>
            <strong>BRANDPILOT</strong>
          </div>
          <div>
            BRANDPILOT | 대전광역시 서구 문정로48번길 30 (탄방동, KT타워)
          </div>
          <div>KT AIVLE 7반 15조 </div>
          <div className="hero-footer-copy">
            © 2026 Team15 Corp. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
