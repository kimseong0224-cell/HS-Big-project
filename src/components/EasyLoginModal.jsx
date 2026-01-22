// src/components/EasyLoginModal.jsx
import { useEffect, useState } from "react";

/**
 * [EasyLoginModal] 간편로그인 모달(UI)
 * ------------------------------------------------------------
 * ✅ 목적
 * - 로그인 페이지(Login.jsx) 위에서 "간편로그인"을 모달로 제공
 * - ESC / 오버레이 클릭으로 닫기
 * - provider 클릭 시 OAuth 시작(현재는 테스트)
 *
 * ✅ Props
 * - open: 모달 열림 여부(boolean)
 * - onClose: 닫기 콜백
 * - onSuccess: 로그인 성공 시 콜백(선택)
 *
 * ✅ BACKEND 연동 포인트(핵심)
 * 1) provider 클릭 시 OAuth 시작
 *    - 페이지 리다이렉트 방식이면 모달을 닫는 개념이 아니라 "페이지가 이동"함
 *    - 팝업 방식이면 모달은 유지하고, 팝업 결과를 받아 onSuccess 호출 가능
 *
 * 2) onSuccess에서 해야 하는 일(보통 부모(Login.jsx)에서 처리)
 *    - accessToken 저장
 *    - 사용자 정보 조회 후 전역 로그인 상태 업데이트
 *    - /main으로 이동
 */
export default function EasyLoginModal({ open, onClose, onSuccess }) {
  const [loadingProvider, setLoadingProvider] = useState("");

  /**
   * ✅ 모달 열렸을 때만 ESC 닫기 + 배경 스크롤 잠금
   * - open이 false면 아무 것도 하지 않음
   * - cleanup에서 이벤트 제거 및 overflow 원복
   */
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

  // ✅ open이 false면 렌더링 자체를 안 함 (Portal 없이 단순 조건 렌더)
  if (!open) return null;

  /**
   * [handleProvider] 제공자 버튼 클릭 시 동작
   * ------------------------------------------------------------
   * ✅ 지금: 테스트 딜레이 후 alert → onSuccess 있으면 호출
   *
   * ✅ BACKEND 붙이면 여기서 바뀔 부분
   * - 여기서 OAuth 시작을 해야 함
   *
   * (A) 리다이렉트 방식(일반적)
   *   window.location.href = `${API_BASE}/auth/${provider.toLowerCase()}`
   *
   * (B) 팝업 방식
   *   popup으로 열고, callback에서 postMessage로 token 전달받아
   *   onSuccess(token) 호출하는 구조
   */
  const handleProvider = async (provider) => {
    setLoadingProvider(provider);

    try {
      // TODO(BACKEND): 실제 서비스에서는 OAuth 시작
      // --------------------------------------------------
      // ✅ 리다이렉트 방식이라면 여기서 바로 이동:
      // window.location.href = `${API_BASE}/auth/${provider.toLowerCase()}`;
      // return; // (이후 코드는 실행되지 않음)

      // ✅ 팝업 방식이라면:
      // const popup = window.open(`${API_BASE}/auth/${provider.toLowerCase()}`, ...);
      // 이후 메시지를 받아 토큰 처리

      // ✅ 현재는 테스트용
      await new Promise((r) => setTimeout(r, 700));
      alert(`${provider} 간편로그인 (테스트)`);

      // ✅ 성공 콜백
      // BACKEND 연동 시:
      // - onSuccess(provider)가 아니라 onSuccess({ token, provider, user }) 형태가 더 자연스러움
      // - 토큰 저장/라우팅은 부모(Login.jsx)에서 처리하는 걸 추천
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
        // ✅ 오버레이 클릭으로 닫기
        // - 모달 내부(panel) 클릭은 닫히지 않게 e.target 비교
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
