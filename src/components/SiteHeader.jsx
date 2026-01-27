// src/components/SiteHeader.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/SiteHeader.css";

// ✅ JWT 미사용: 토큰 관련 함수 제거하고 loginId만 지움
// ✅ 팀 코드의 백 연동 방식으로 통일
import { apiRequest, clearAccessToken } from "../api/client.js";
import { clearCurrentUserId, clearIsLoggedIn } from "../api/auth.js";

import {
  ensureStepAccess,
  readPipeline,
} from "../utils/brandPipelineStorage.js";

// (선택) 백에 logout API가 있으면 호출해도 되고, 없으면 안 불러도 됨.
// 지금은 “토큰 없이” 연동이 목표라서 굳이 안 불러도 됨.
// import * as authApi from "../api/authApi";

// ✅ 컴포넌트 밖으로 빼면 렌더마다 객체 새로 안 만들어짐
// 브랜드 컨설팅은 "네이밍 → 컨셉 → 스토리 → 로고" 순서로 "원큐" 진행(헤더 메뉴도 이에 맞게 정리)
const BRAND_STEP_ROUTES = {
  // 소개/허브
  home: "/brandconsulting",

  // ✅ 리포트(기업진단 결과 페이지)
  // - 브랜드 컨설팅은 '기업진단 요약'을 기반으로 진행되므로,
  //   헤더의 '내 리포트'는 기업진단 결과 페이지로 연결
  report: "/diagnosis/result",

  // 단계 바로가기(인터뷰/진행)
  naming: "/brand/naming/interview",
  concept: "/brand/concept/interview",
  story: "/brand/story",
  logo: "/brand/logo/interview",
};

const BRAND_RESULTS_ROUTE = "/mypage/brand-results";

const BRAND_STEP_LABELS = {
  naming: "네이밍",
  concept: "컨셉",
  story: "스토리",
  logo: "로고",
};

const PROMO_INTERVIEW_ROUTES = {
  icon: "/promotion/icon/interview",
  aicut: "/promotion/aicut/interview",
  staging: "/promotion/staging/interview",
  poster: "/promotion/poster/interview",
};

// ✅ 홍보물 컨설팅: 소개/리포트 라우트
const PROMO_ROUTES = {
  home: "/promotion",
  report: "/mypage/promotion-results",
};

export default function SiteHeader({ onLogout, onBrandPick, onPromoPick }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // ✅ active 처리(진단/브랜드/홍보물/투자)
  const isDiagnosisRoute =
    pathname === "/diagnosis" ||
    pathname === "/diagnosisinterview" ||
    pathname.startsWith("/diagnosis/");

  // ✅ 브랜드 컨설팅 관련 라우트는 전부 active 처리
  const isBrandRoute =
    pathname === BRAND_STEP_ROUTES.home ||
    pathname === "/logoconsulting" ||
    pathname === "/nameconsulting" ||
    pathname === "/conceptconsulting" ||
    pathname === "/homepageconsulting" ||
    pathname === "/brandstoryconsulting" ||
    pathname === "/namingconsulting" ||
    pathname.startsWith("/brand/") ||
    pathname.startsWith("/brandconsulting/");

  const isPromotionRoute =
    pathname === "/promotion" || pathname.startsWith("/promotion/");

  const isInvestmentRoute =
    pathname === "/investment" || pathname.startsWith("/investment/");

  const isActiveExact = (path) => pathname === path;

  // ===== Brand Progress (for locking & 'Continue') =====
  const pipeline = useMemo(() => readPipeline(), [pathname]);

  const brandProgress = useMemo(() => {
    const p = pipeline || {};
    const hasDiagnosis = Boolean(
      p?.diagnosisSummary?.companyName || p?.diagnosisSummary?.oneLine,
    );
    const hasNaming = Boolean(p?.naming?.selectedId || p?.naming?.selected);
    const hasConcept = Boolean(p?.concept?.selectedId || p?.concept?.selected);
    const hasStory = Boolean(p?.story?.selectedId || p?.story?.selected);
    const hasLogo = Boolean(p?.logo?.selectedId || p?.logo?.selected);

    const nextKey = !hasDiagnosis
      ? "diagnosis"
      : !hasNaming
        ? "naming"
        : !hasConcept
          ? "concept"
          : !hasStory
            ? "story"
            : !hasLogo
              ? "logo"
              : "done";

    const nextRoute =
      nextKey === "diagnosis"
        ? "/diagnosis"
        : nextKey === "done"
          ? BRAND_RESULTS_ROUTE
          : BRAND_STEP_ROUTES[nextKey];

    return {
      hasDiagnosis,
      hasNaming,
      hasConcept,
      hasStory,
      hasLogo,
      nextKey,
      nextRoute,
    };
  }, [pipeline]);

  const brandContinueLabel = useMemo(() => {
    if (brandProgress.nextKey === "diagnosis")
      return "이어하기 · 기업진단 먼저";
    if (brandProgress.nextKey === "done") return "완료 리포트 보기";
    return `이어하기 · 다음: ${BRAND_STEP_LABELS[brandProgress.nextKey] || "다음 단계"}`;
  }, [brandProgress.nextKey]);

  // ===== Hover Dropdown: Brand =====
  const [brandOpen, setBrandOpen] = useState(false);
  const brandCloseTimerRef = useRef(null);

  const clearBrandCloseTimer = () => {
    if (brandCloseTimerRef.current) {
      clearTimeout(brandCloseTimerRef.current);
      brandCloseTimerRef.current = null;
    }
  };

  const openBrandMenu = () => {
    clearBrandCloseTimer();
    setBrandOpen(true);
  };

  const closeBrandMenu = (delay = 180) => {
    clearBrandCloseTimer();
    brandCloseTimerRef.current = setTimeout(() => setBrandOpen(false), delay);
  };

  // ===== Hover Dropdown: Promotion =====
  const [promoOpen, setPromoOpen] = useState(false);
  const promoCloseTimerRef = useRef(null);

  const clearPromoCloseTimer = () => {
    if (promoCloseTimerRef.current) {
      clearTimeout(promoCloseTimerRef.current);
      promoCloseTimerRef.current = null;
    }
  };

  const openPromoMenu = () => {
    clearPromoCloseTimer();
    setPromoOpen(true);
  };

  const closePromoMenu = (delay = 180) => {
    clearPromoCloseTimer();
    promoCloseTimerRef.current = setTimeout(() => setPromoOpen(false), delay);
  };

  useEffect(() => {
    return () => {
      clearBrandCloseTimer();
      clearPromoCloseTimer();
    };
  }, []);

  // ✅ 상단 메뉴 클릭
  const handleDiagnosisClick = () => navigate("/diagnosis");

  const handleBrandClick = () => {
    setPromoOpen(false);
    setBrandOpen(false);
    navigate(BRAND_STEP_ROUTES.home);
  };

  const closeAllMenus = () => {
    setBrandOpen(false);
    setPromoOpen(false);
  };

  const handleBrandNavigate = (to, pickKey) => {
    closeAllMenus();
    if (!to) return;
    navigate(to);
    if (typeof onBrandPick === "function" && pickKey) onBrandPick(pickKey);
  };

  const BRAND_GUARD_MESSAGE = {
    diagnosis_missing:
      "브랜드 컨설팅을 시작하려면 기업진단을 먼저 완료해 주세요.",
    naming_missing:
      "이 단계는 네이밍 완료 후 진행할 수 있어요. 네이밍으로 이동합니다.",
    concept_missing:
      "이 단계는 컨셉 완료 후 진행할 수 있어요. 컨셉으로 이동합니다.",
    story_missing:
      "이 단계는 스토리 완료 후 진행할 수 있어요. 스토리로 이동합니다.",
  };

  const guardBrandStep = (stepKey) => {
    const access = ensureStepAccess(stepKey);
    if (access?.ok) return true;

    const msg =
      BRAND_GUARD_MESSAGE[access?.reason] ||
      "이전 단계를 먼저 완료해 주세요. 해당 단계로 이동합니다.";

    // ✅ 순서가 필요한 서비스라, 헤더에서 바로가기를 눌러도 '선행 단계'로 보내기
    window.alert(msg);

    closeAllMenus();
    if (access?.redirectTo) navigate(access.redirectTo);
    return false;
  };

  const handleBrandStep = (stepKey) => {
    if (!guardBrandStep(stepKey)) return;
    const to = BRAND_STEP_ROUTES[stepKey];
    handleBrandNavigate(to, stepKey);
  };

  const handleBrandContinue = () => {
    closeAllMenus();
    if (!brandProgress.nextRoute) return;

    navigate(brandProgress.nextRoute);

    // ✅ 브랜드 단계 이동일 때만 pick 콜백 호출(부모에서 진행 상태 표시 등에 사용 가능)
    if (
      typeof onBrandPick === "function" &&
      ["naming", "concept", "story", "logo"].includes(brandProgress.nextKey)
    ) {
      onBrandPick(brandProgress.nextKey);
    }
  };

  // ✅ 홍보물 컨설팅: 공용 네비게이션(소개/리포트)
  const handlePromoNavigate = (to, pickKey) => {
    closeAllMenus();
    if (!to) return;
    navigate(to);
    if (typeof onPromoPick === "function" && pickKey) onPromoPick(pickKey);
  };

  const handlePromoClick = () => {
    setBrandOpen(false);
    setPromoOpen(false);
    navigate("/promotion");
  };

  const handlePromoItem = (action) => {
    setPromoOpen(false);
    setBrandOpen(false);

    const to = PROMO_INTERVIEW_ROUTES[action];
    if (!to) return;

    navigate(to);
    if (typeof onPromoPick === "function") onPromoPick(action);
  };

  const handleInvestmentClick = () => {
    setBrandOpen(false);
    setPromoOpen(false);
    navigate("/investment");
  };

  // ✅ JWT 미사용 로그아웃: 서버 호출 없이 localStorage만 정리
  const handleLogout = async () => {
    const ok = window.confirm("로그아웃 하시겠습니까?");
    if (!ok) return;

    try {
      // ✅ 백에 logout API가 있으면 호출(없어도 에러 무시)
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (error) {
      console.warn("logout API failed:", error);
    }

    // ✅ 토큰/로그인 상태 정리
    clearAccessToken();
    clearCurrentUserId();
    clearIsLoggedIn();

    // ✅ 부모에서 추가 정리하고 싶으면(onLogout) 호출
    if (typeof onLogout === "function") onLogout();

    // ✅ 로그인 화면으로 이동
    navigate("/login", { replace: true });
  };

  return (
    <header className="main-header">
      <div
        className="brand"
        role="button"
        tabIndex={0}
        onClick={() => navigate("/main")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") navigate("/main");
        }}
      >
        BRANDPILOT
      </div>

      <nav className="main-nav" aria-label="주요 메뉴">
        <button
          type="button"
          className={`nav-link ${isDiagnosisRoute ? "is-active" : ""}`}
          onClick={handleDiagnosisClick}
        >
          기업 진단 &amp; 인터뷰
        </button>

        {/* ✅ 브랜드 컨설팅 Hover 드롭다운 */}
        <div
          className={`nav-dropdown ${brandOpen ? "is-open" : ""}`}
          onMouseEnter={() => {
            openBrandMenu();
            setPromoOpen(false);
          }}
          onMouseLeave={() => closeBrandMenu(220)}
          onFocus={() => {
            openBrandMenu();
            setPromoOpen(false);
          }}
          onBlur={() => closeBrandMenu(120)}
        >
          <button
            type="button"
            className={`nav-link nav-dropdown__btn ${
              isBrandRoute ? "is-active" : ""
            }`}
            aria-expanded={brandOpen ? "true" : "false"}
            onClick={handleBrandClick}
            onKeyDown={(e) => {
              if (e.key === "Escape") setBrandOpen(false);
              if (e.key === "ArrowDown") openBrandMenu();
            }}
          >
            브랜드 컨설팅 <span className="nav-dropdown__chev">▾</span>
          </button>

          <div
            className="nav-dropdown__panel"
            role="menu"
            aria-label="브랜드 컨설팅 메뉴"
            onMouseEnter={openBrandMenu}
            onMouseLeave={() => closeBrandMenu(220)}
          >
            <button
              type="button"
              className="nav-dropdown__item"
              onClick={() =>
                handleBrandNavigate(BRAND_STEP_ROUTES.home, "home")
              }
            >
              시작하기 / 소개 및 홈
            </button>

            <button
              type="button"
              className="nav-dropdown__item"
              onClick={handleBrandContinue}
            >
              {brandContinueLabel}
            </button>

            <button
              type="button"
              className="nav-dropdown__item"
              onClick={() =>
                handleBrandNavigate(BRAND_STEP_ROUTES.report, "report")
              }
            >
              기업진단 리포트
            </button>

            <button
              type="button"
              className="nav-dropdown__item"
              onClick={() =>
                handleBrandNavigate(BRAND_RESULTS_ROUTE, "results")
              }
            >
              내 리포트 (브랜드)
            </button>

            <div className="nav-dropdown__divider" aria-hidden="true" />

            <div className="nav-dropdown__section-title">단계 바로가기</div>
            <div className="nav-dropdown__grid" role="none">
              <button
                type="button"
                className={`nav-dropdown__item nav-dropdown__item--mini ${
                  brandProgress.hasDiagnosis ? "" : "is-locked"
                }`}
                aria-disabled={brandProgress.hasDiagnosis ? "false" : "true"}
                onClick={() => handleBrandStep("naming")}
              >
                네이밍
                {!brandProgress.hasDiagnosis && (
                  <span className="nav-dropdown__lock">🔒</span>
                )}
              </button>

              <button
                type="button"
                className={`nav-dropdown__item nav-dropdown__item--mini ${
                  brandProgress.hasDiagnosis && brandProgress.hasNaming
                    ? ""
                    : "is-locked"
                }`}
                aria-disabled={
                  brandProgress.hasDiagnosis && brandProgress.hasNaming
                    ? "false"
                    : "true"
                }
                onClick={() => handleBrandStep("concept")}
              >
                컨셉
                {!(brandProgress.hasDiagnosis && brandProgress.hasNaming) && (
                  <span className="nav-dropdown__lock">🔒</span>
                )}
              </button>

              <button
                type="button"
                className={`nav-dropdown__item nav-dropdown__item--mini ${
                  brandProgress.hasDiagnosis &&
                  brandProgress.hasNaming &&
                  brandProgress.hasConcept
                    ? ""
                    : "is-locked"
                }`}
                aria-disabled={
                  brandProgress.hasDiagnosis &&
                  brandProgress.hasNaming &&
                  brandProgress.hasConcept
                    ? "false"
                    : "true"
                }
                onClick={() => handleBrandStep("story")}
              >
                스토리
                {!(
                  brandProgress.hasDiagnosis &&
                  brandProgress.hasNaming &&
                  brandProgress.hasConcept
                ) && <span className="nav-dropdown__lock">🔒</span>}
              </button>

              <button
                type="button"
                className={`nav-dropdown__item nav-dropdown__item--mini ${
                  brandProgress.hasDiagnosis &&
                  brandProgress.hasNaming &&
                  brandProgress.hasConcept &&
                  brandProgress.hasStory
                    ? ""
                    : "is-locked"
                }`}
                aria-disabled={
                  brandProgress.hasDiagnosis &&
                  brandProgress.hasNaming &&
                  brandProgress.hasConcept &&
                  brandProgress.hasStory
                    ? "false"
                    : "true"
                }
                onClick={() => handleBrandStep("logo")}
              >
                로고
                {!(
                  brandProgress.hasDiagnosis &&
                  brandProgress.hasNaming &&
                  brandProgress.hasConcept &&
                  brandProgress.hasStory
                ) && <span className="nav-dropdown__lock">🔒</span>}
              </button>
            </div>

            <div className="nav-dropdown__hint">
              🔒 이전 단계 완료 시 다음 단계가 열립니다.
            </div>
          </div>
        </div>

        {/* ✅ 홍보물 컨설팅 Hover 드롭다운 */}
        <div
          className={`nav-dropdown ${promoOpen ? "is-open" : ""}`}
          onMouseEnter={() => {
            openPromoMenu();
            setBrandOpen(false);
          }}
          onMouseLeave={() => closePromoMenu(220)}
          onFocus={() => {
            openPromoMenu();
            setBrandOpen(false);
          }}
          onBlur={() => closePromoMenu(120)}
        >
          <button
            type="button"
            className={`nav-link nav-dropdown__btn ${
              isPromotionRoute ? "is-active" : ""
            }`}
            aria-expanded={promoOpen ? "true" : "false"}
            onClick={handlePromoClick}
            onKeyDown={(e) => {
              if (e.key === "Escape") setPromoOpen(false);
              if (e.key === "ArrowDown") openPromoMenu();
            }}
          >
            홍보물 컨설팅 <span className="nav-dropdown__chev">▾</span>
          </button>

          <div
            className="nav-dropdown__panel"
            role="menu"
            aria-label="홍보물 컨설팅 메뉴"
            onMouseEnter={openPromoMenu}
            onMouseLeave={() => closePromoMenu(220)}
          >
            <button
              type="button"
              className="nav-dropdown__item"
              onClick={() => handlePromoNavigate(PROMO_ROUTES.home, "home")}
            >
              홍보물 컨설팅 소개 및 홈
            </button>

            <button
              type="button"
              className="nav-dropdown__item"
              onClick={() => handlePromoNavigate(PROMO_ROUTES.report, "report")}
            >
              내 리포트
            </button>

            <div className="nav-dropdown__divider" aria-hidden="true" />

            <div className="nav-dropdown__section-title">단계 바로가기</div>
            <div className="nav-dropdown__grid" role="none">
              <button
                type="button"
                className="nav-dropdown__item nav-dropdown__item--mini"
                onClick={() => handlePromoItem("icon")}
              >
                제품 아이콘
              </button>

              <button
                type="button"
                className="nav-dropdown__item nav-dropdown__item--mini"
                onClick={() => handlePromoItem("aicut")}
              >
                AI컷 모델
              </button>

              <button
                type="button"
                className="nav-dropdown__item nav-dropdown__item--mini"
                onClick={() => handlePromoItem("staging")}
              >
                제품 연출컷
              </button>

              <button
                type="button"
                className="nav-dropdown__item nav-dropdown__item--mini"
                onClick={() => handlePromoItem("poster")}
              >
                SNS 제품 포스터
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          className={`nav-link ${isInvestmentRoute ? "is-active" : ""}`}
          onClick={handleInvestmentClick}
        >
          투자 라운지
        </button>
      </nav>

      <div className="account-nav">
        <button
          type="button"
          className={`nav-link ${isActiveExact("/main") ? "is-active" : ""}`}
          onClick={() => navigate("/main")}
        >
          홈
        </button>

        <button
          type="button"
          className={`nav-link ${isActiveExact("/mypage") ? "is-active" : ""}`}
          onClick={() => navigate("/mypage")}
        >
          마이페이지
        </button>

        <button type="button" className="nav-link" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </header>
  );
}
