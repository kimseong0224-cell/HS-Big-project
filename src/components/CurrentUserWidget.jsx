// src/components/CurrentUserWidget.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/CurrentUserWidget.css";

import { apiRequest, clearAccessToken } from "../api/client.js";
import {
  getCurrentUserId,
  getIsLoggedIn,
  clearCurrentUserId,
  clearIsLoggedIn,
} from "../api/auth.js";

/**
 * ✅ 우측 상단(헤더 아래) "현재 로그인 계정" 플로팅 위젯
 * - 프론트만으로 가능: Login.jsx에서 localStorage에 저장해둔 currentUserId를 읽어 표시
 * - 헤더 높이가 바뀌어도, 실제 header(.main-header) 아래로 자동 배치
 * - 클릭하면 미니 메뉴(마이페이지/로그아웃)
 */
export default function CurrentUserWidget() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return getIsLoggedIn();
    } catch {
      return false;
    }
  });

  const [userId, setUserId] = useState(() => {
    try {
      return getCurrentUserId();
    } catch {
      return null;
    }
  });

  const [topPx, setTopPx] = useState(86);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const label = useMemo(() => {
    const id = String(userId ?? "").trim();
    if (!id) return "";
    // 길면 앞/뒤만 보여주기
    if (id.length <= 18) return id;
    return `${id.slice(0, 9)}…${id.slice(-6)}`;
  }, [userId]);

  // ✅ 로그인 상태 sync
  useEffect(() => {
    const sync = () => {
      try {
        setIsLoggedIn(getIsLoggedIn());
      } catch {
        setIsLoggedIn(false);
      }
      try {
        setUserId(getCurrentUserId());
      } catch {
        setUserId(null);
      }
    };

    sync();

    const onStorage = (e) => {
      if (
        e.key === "currentUserId" ||
        e.key === "isLoggedIn" ||
        e.key === null
      ) {
        sync();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ✅ 헤더 아래 위치 계산(페이지 이동/리사이즈 시)
  useEffect(() => {
    const updateTop = () => {
      const header = document.querySelector(".main-header");
      if (!header) {
        setTopPx(18);
        return;
      }
      const rect = header.getBoundingClientRect();
      // header가 화면 위로 스크롤될 수 있으니 최소값 보장
      const next = Math.max(10, rect.bottom + 10);
      setTopPx(next);
    };

    // 렌더 타이밍/레이아웃 안정화를 위해 두 번 체크
    updateTop();
    const t1 = window.setTimeout(updateTop, 0);
    const t2 = window.setTimeout(updateTop, 120);

    window.addEventListener("resize", updateTop);
    window.addEventListener("scroll", updateTop, { passive: true });

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", updateTop);
      window.removeEventListener("scroll", updateTop);
    };
  }, [pathname]);

  // ✅ 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return;

    const onDown = (e) => {
      const root = rootRef.current;
      if (!root) return;
      if (root.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("touchstart", onDown, { passive: true });
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  const handleLogout = async () => {
    const ok = window.confirm("로그아웃 하시겠습니까?");
    if (!ok) return;

    try {
      // 백에 logout 엔드포인트가 있으면 호출 (없으면 무시)
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }

    clearAccessToken();
    clearCurrentUserId();
    clearIsLoggedIn();

    setOpen(false);
    navigate("/login", { replace: true });
  };

  if (!isLoggedIn || !userId) return null;

  return (
    <div
      ref={rootRef}
      className={`current-user-widget ${open ? "is-open" : ""}`}
      style={{ top: `${topPx}px` }}
      aria-label="현재 로그인 계정"
    >
      <button
        type="button"
        className="current-user-pill"
        onClick={() => setOpen((v) => !v)}
        title="현재 로그인 계정"
      >
        <span className="current-user-dot" aria-hidden="true" />
        <span className="current-user-text">
          <span className="current-user-label">로그인</span>
          <span className="current-user-id">{label}</span>
        </span>
        <span className="current-user-chev" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <div className="current-user-menu" role="menu">
          <button
            type="button"
            className="current-user-menu-item"
            onClick={() => {
              setOpen(false);
              navigate("/mypage");
            }}
          >
            마이페이지
          </button>
          <button
            type="button"
            className="current-user-menu-item danger"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </div>
      ) : null}
    </div>
  );
}
