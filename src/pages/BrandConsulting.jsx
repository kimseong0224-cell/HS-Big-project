// src/pages/BrandConsulting.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import bannerImage from "../Image/banner_image/Banner.png";
import Logocon from "../Image/brandcon_image/logocon.png";
import namecon from "../Image/brandcon_image/namecon.png";
import pagecon from "../Image/brandcon_image/pagecon.png"; // ✅ story에서도 이 png 재사용

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

import SiteFooter from "../components/SiteFooter.jsx";
import SiteHeader from "../components/SiteHeader.jsx";

/**
 * [BrandConsulting] 브랜드 컨설팅 허브(랜딩) 페이지
 * ------------------------------------------------------------
 * ✅ 화면 목적
 * - 브랜드 컨설팅의 서비스 목록(로고/네이밍/홈페이지/브랜드 스토리)을 카드로 보여주고
 * - 카드 클릭 시 해당 서비스의 "인터뷰 페이지"로 라우팅
 *
 * ✅ 현재 프론트 구현 상태
 * - 서비스 목록은 하드코딩(정적 카드)
 * - MainPage에서 location.state.section을 받아올 수 있음(선택 메뉴 강조 같은 용도)
 * - 약관/개인정보 모달 UI 포함
 *
 * ✅ BACKEND 연동 포인트(핵심)
 * 1) "로그인 상태/권한" 체크
 *   - 서비스는 로그인 사용자만 가능하다면:
 *     - 이 페이지 진입 시 또는 카드 클릭 시 토큰 유효성 확인 필요
 *     - 미로그인이라면 /login으로 리다이렉트
 *
 * 2) 서비스별 "진행중 draft/히스토리" 연동
 *   - 카드 클릭 시:
 *     - (선택) 서버에서 최근 draft 존재 여부 확인 후
 *       - "이어서 진행" / "새로 시작" 선택 UI를 띄울 수 있음
 *     - (또는) 인터뷰 페이지에서 draft를 조회하도록 위임할 수도 있음
 *
 * 3) 서비스 목록을 "서버에서 내려받는 방식"으로 확장 가능
 *   - 예: GET /services/brand -> 카드 목록(이름/설명/이미지/활성여부)
 *   - 지금은 하드코딩이라 백 연동 없어도 동작하지만,
 *     추후 A/B, 기능 ON/OFF(Feature flag) 등을 하려면 서버화가 편함
 */

export default function BrandConsulting({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  // =========================================================
  // ✅ 개인정보/이용약관 모달 상태
  // - openType: "privacy" | "terms" | null
  // =========================================================
  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  // =========================================================
  // ✅ MainPage에서 state.section 받을 수 있음 (logo / naming / homepage / story)
  // - 현재는 "표시용"으로만 사용(주석 처리된 부분)
  // - pickedSection이 있으면 해당 서비스 카드 강조/스크롤 등도 가능
  //
  // BACKEND:
  // - 일반적으로는 프론트 라우팅 state로 충분
  // - 다만 “유저 선호/최근 사용 서비스” 같은 개인화는 서버 데이터가 될 수 있음
  // =========================================================
  const pickedSection = location.state?.section || null;

  // labelMap: 섹션 값을 한국어 라벨로 변환(표시용)
  const labelMap = {
    logo: "로고 컨설팅",
    naming: "네이밍 컨설팅",
    homepage: "홈페이지 컨설팅",
    story: "브랜드 스토리 컨설팅",
  };

  /**
   * [goInterview] 카드 클릭 시 서비스별 인터뷰 페이지로 이동
   * ------------------------------------------------------------
   * ✅ 지금
   * - service 값에 따라 routeMap으로 경로 결정 후 navigate
   * - navigate(to, { state: { service } })
   *
   * ✅ BACKEND 연동 시 바뀔 수 있는 지점(중요)
   * 1) 인증/인가 체크
   *   - accessToken 없거나 만료면 /login으로 보내기
   *   - 또는 인터뷰 페이지에서 공통 가드(ProtectedRoute)로 처리
   *
   * 2) “새로 시작 vs 이어서 진행”
   *   - 서버에 draft가 있으면:
   *     - 여기서 API로 확인 후 모달 띄우고 분기
   *     - 혹은 인터뷰 페이지가 진입하자마자 draft 조회해서 자동 resume
   *
   * 3) 라우팅 설계 개선 가능
   *   - 지금은 서비스마다 route가 다름
   *   - 대안: /brand/:service/interview 형태로 통일(유지보수 쉬움)
   */
  const goInterview = (service) => {
    const routeMap = {
      logo: "/brand/logo/interview",
      naming: "/brand/naming/interview",
      homepage: "/brand/homepage/interview",

      // ✅ NEW: 브랜드 스토리 인터뷰
      // App.jsx에 /brandstoryconsulting 라우트가 있어야 함
      story: "/brandstoryconsulting",
    };

    const to = routeMap[service];
    if (!to) return;

    // TODO(BACKEND - 선택):
    // 1) 로그인 체크 예시(구현 위치는 프로젝트 구조에 따라 다름)
    // const token = localStorage.getItem("accessToken");
    // if (!token) {
    //   navigate("/login", { state: { from: "/brandconsulting" } });
    //   return;
    // }

    // TODO(BACKEND - 선택):
    // 2) draft 존재 여부 확인 후 분기
    // - 예: GET /brand/draft?service=logo
    // - 결과에 따라 "resume" 모드로 이동하거나 "start"로 이동
    // const hasDraft = await api.checkBrandDraft(service);
    // navigate(to, { state: { service, mode: hasDraft ? "resume" : "start" } });

    // 현재는 단순 이동
    navigate(to, { state: { service } });
  };

  return (
    <div className="brand-page">
      {/* =====================================================
          ✅ 약관/개인정보 모달
          - SiteFooter에서도 onOpenPolicy로 열 수 있음(다른 페이지들과 패턴 통일)
         ===================================================== */}
      <PolicyModal
        open={openType === "privacy"}
        title="개인정보 처리방침"
        onClose={closeModal}
      >
        <PrivacyContent />
      </PolicyModal>

      <PolicyModal
        open={openType === "terms"}
        title="이용약관"
        onClose={closeModal}
      >
        <TermsContent />
      </PolicyModal>

      {/* ✅ 공통 헤더 사용 */}
      <SiteHeader onLogout={onLogout} />

      {/* =====================================================
          ✅ Hero 섹션(배너 + 캐러셀 텍스트)
          - 현재는 정적 UI (백 연동 불필요)
          - 추후 "공지/이벤트/추천 서비스"를 서버에서 내려주려면 연동 포인트
         ===================================================== */}
      <section className="brand-hero">
        <div className="brand-hero-inner">
          <div className="hero-banner" aria-label="브랜딩 컨설팅 소개">
            <img
              src={bannerImage}
              alt="브랜딩 컨설팅 배너"
              className="hero-banner-image"
            />
            <div className="hero-banner-text">
              <div className="hero-carousel">
                {/* 캐러셀 슬라이드(정적) */}
                <div className="hero-slide">
                  <strong>브랜드 컨설팅</strong>
                  <span>여러분의 이미지를 표현하세요.</span>
                </div>
                <div className="hero-slide">
                  <strong>로고 컨설팅</strong>
                  <span>여러분의 개성을 담아보세요.</span>
                </div>
                <div className="hero-slide">
                  <strong>네이밍 컨설팅</strong>
                  <span>여러분의 첫인상을 그려보세요.</span>
                </div>
                <div className="hero-slide">
                  <strong>홈페이지 컨설팅</strong>
                  <span>여러분의 얼굴을 만들어보세요.</span>
                </div>

                {/* ✅ NEW */}
                <div className="hero-slide">
                  <strong>브랜드 스토리 컨설팅</strong>
                  <span>브랜드의 ‘이야기’를 설계해보세요.</span>
                </div>
              </div>

              {/* =================================================
                  (선택) MainPage에서 넘어온 pickedSection 표시
                  - 현재 UI에서는 주석 처리되어 있음
                  - 원하면 여기서 선택 서비스 강조/안내 가능
                 ================================================= */}
              {/* {pickedSection ? (
                <div style={{ marginTop: 14, fontSize: 14, opacity: 0.9 }}>
                  선택된 메뉴: <b>{labelMap[pickedSection] ?? pickedSection}</b>
                </div>
              ) : null} */}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ✅ 서비스 카드 그리드
          - 클릭 시 해당 인터뷰로 이동
          - role="button" + tabIndex + Enter/Space 처리로 접근성 강화
          - 현재 하드코딩이지만, 나중에 서버에서 카드 리스트로 교체 가능
         ===================================================== */}
      <main className="brand-content">
        <h2 className="section-title">컨설팅 시작하기</h2>

        <div className="service-grid">
          {/* 로고 */}
          <article
            className="service-card"
            role="button"
            tabIndex={0}
            onClick={() => goInterview("logo")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") goInterview("logo");
            }}
            // BACKEND(선택):
            // - 서비스가 비활성화 상태라면 disabled 스타일/클릭 방지 필요
            // - 서버에서 서비스 활성 여부 받아오면 여기서 분기 가능
          >
            <div className="service-image">
              <img src={Logocon} alt="로고 컨설팅" />
            </div>
            <p className="service-tag">Logo Consulting</p>
            <h3>로고 컨설팅</h3>
            <div className="service-meta">
              <span>스타트업의 로고를 만들어 드립니다.</span>
              <span>↗</span>
            </div>
          </article>

          {/* 네이밍 */}
          <article
            className="service-card"
            role="button"
            tabIndex={0}
            onClick={() => goInterview("naming")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") goInterview("naming");
            }}
          >
            <div className="service-image">
              <img src={namecon} alt="네이밍 컨설팅" />
            </div>
            <p className="service-tag">Naming Consulting</p>
            <h3>네이밍 컨설팅</h3>
            <div className="service-meta">
              <span>경쟁력있는 이름을 만들어 드립니다.</span>
              <span>↗</span>
            </div>
          </article>

          {/* 홈페이지 */}
          <article
            className="service-card"
            role="button"
            tabIndex={0}
            onClick={() => goInterview("homepage")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") goInterview("homepage");
            }}
          >
            <div className="service-image">
              <img src={pagecon} alt="홈페이지 컨설팅" />
            </div>
            <p className="service-tag">Webpage Consulting</p>
            <h3>홈페이지 컨설팅</h3>
            <div className="service-meta">
              <span>사용자 최적의 웹페이지 제안 해드립니다.</span>
              <span>↗</span>
            </div>
          </article>

          {/* ✅ NEW: 브랜드 스토리 */}
          <article
            className="service-card"
            role="button"
            tabIndex={0}
            onClick={() => goInterview("story")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") goInterview("story");
            }}
          >
            <div className="service-image">
              <img src={pagecon} alt="브랜드 스토리 컨설팅" />
            </div>
            <p className="service-tag">Brand Story Consulting</p>
            <h3>브랜드 스토리 컨설팅</h3>
            <div className="service-meta">
              <span>브랜드의 시작·문제·해결을 스토리로 정리합니다.</span>
              <span>↗</span>
            </div>
          </article>
        </div>
      </main>

      {/* ✅ 공통 푸터 (약관 모달 열기 콜백 전달) */}
      <SiteFooter onOpenPolicy={setOpenType} />
    </div>
  );
}
