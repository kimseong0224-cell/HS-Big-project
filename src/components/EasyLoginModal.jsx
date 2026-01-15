// src/components/EasyLoginModal.jsx
import { useEffect, useState } from "react";
import "../styles/EasyLoginModal.css";

/**
 * 간편로그인 모달(UI)
 * - ESC로 닫기
 * - 오버레이 클릭으로 닫기
 * - provider 클릭 시 테스트 동작(실제 OAuth는 TODO)
 */
export default function EasyLoginModal({ open, onClose, onSuccess }) {
  const [loadingProvider, setLoadingProvider] = useState("");

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    // 모달 열릴 때 배경 스크롤 방지
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleProvider = async (provider) => {
    setLoadingProvider(provider);

    try {
      // TODO: 실제 서비스에서는 OAuth 시작 (리다이렉트/팝업 등)
      await new Promise((r) => setTimeout(r, 700)); // 테스트용
      alert(`${provider} 간편로그인 (테스트)`);

      // 성공 콜백(로그인 성공 가정)
      if (typeof onSuccess === "function") onSuccess(provider);
      else onClose?.();
    } finally {
      setLoadingProvider("");
    }
  };

  return (
    <div
      className="easyModal__overlay"
      role="dialog"
      aria-modal="true"
      aria-label="간편 로그인"
      onMouseDown={(e) => {
        // 오버레이 클릭으로 닫기 (모달 박스 내부 클릭은 무시)
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="easyModal__panel">
        <div className="easyModal__head">
          <div>
            <h2 className="easyModal__title">간편 로그인</h2>
            <p className="easyModal__desc">
              자주 쓰는 계정으로 빠르게 로그인하세요.
            </p>
          </div>

          <button
            type="button"
            className="easyModal__close"
            onClick={() => onClose?.()}
            aria-label="닫기"
            disabled={!!loadingProvider}
          >
            ✕
          </button>
        </div>

        <div className="easyModal__providers">
          <button
            type="button"
            className="easyModal__providerBtn"
            onClick={() => handleProvider("Google")}
            disabled={!!loadingProvider}
          >
            <span className="easyModal__icon" aria-hidden="true">
              G
            </span>
            <span className="easyModal__text">Google로 계속하기</span>
            <span className="easyModal__right">
              {loadingProvider === "Google" ? "진행 중..." : "→"}
            </span>
          </button>

          <button
            type="button"
            className="easyModal__providerBtn"
            onClick={() => handleProvider("Kakao")}
            disabled={!!loadingProvider}
          >
            <span className="easyModal__icon" aria-hidden="true">
              K
            </span>
            <span className="easyModal__text">Kakao로 계속하기</span>
            <span className="easyModal__right">
              {loadingProvider === "Kakao" ? "진행 중..." : "→"}
            </span>
          </button>

          <button
            type="button"
            className="easyModal__providerBtn"
            onClick={() => handleProvider("Naver")}
            disabled={!!loadingProvider}
          >
            <span className="easyModal__icon" aria-hidden="true">
              N
            </span>
            <span className="easyModal__text">Naver로 계속하기</span>
            <span className="easyModal__right">
              {loadingProvider === "Naver" ? "진행 중..." : "→"}
            </span>
          </button>

          <button
            type="button"
            className="easyModal__providerBtn"
            onClick={() => handleProvider("Apple")}
            disabled={!!loadingProvider}
          >
            <span className="easyModal__icon" aria-hidden="true">
              
            </span>
            <span className="easyModal__text">Apple로 계속하기</span>
            <span className="easyModal__right">
              {loadingProvider === "Apple" ? "진행 중..." : "→"}
            </span>
          </button>
        </div>

        <div className="easyModal__divider" />

        <div className="easyModal__bottom">
          <button
            type="button"
            className="easyModal__ghost"
            onClick={() => onClose?.()}
            disabled={!!loadingProvider}
          >
            나중에 할게요
          </button>
          <p className="easyModal__footnote">
            * 실제 서비스에서는 제공자 인증 후 로그인됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
