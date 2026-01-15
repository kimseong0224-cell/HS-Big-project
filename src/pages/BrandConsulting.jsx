// // src/pages/BrandConsulting.jsx
// import bannerImage from "../Image/banner_image/Banner.png";
// import Logocon from "../Image/brandcon_image/logocon.png";
// import namecon from "../Image/brandcon_image/namecon.png";
// import pagecon from "../Image/brandcon_image/pagecon.png";

// export default function BrandConsulting({ onBack, onLogout }) {
//   return (
//     <div className="brand-page">
//       <header className="brand-header">
//         <div className="brand-header-inner">
//           <div className="brand-logo">BRANDPILOT</div>
//           <nav className="brand-nav" aria-label="주요 메뉴">
//             <button type="button" className="nav-link">
//               기업 진단 & 인터뷰
//             </button>
//             <button type="button" className="nav-link">
//               브랜드 컨설팅
//             </button>
//             <button type="button" className="nav-link">
//               홍보물 컨설팅
//             </button>
//           </nav>
//           <div className="brand-account">
//             <button type="button" className="nav-link" onClick={onBack}>
//               홈
//             </button>
//             <button type="button" className="nav-link">
//               마이페이지
//             </button>
//             <button type="button" className="nav-link" onClick={onLogout}>
//               로그아웃
//             </button>
//           </div>
//         </div>
//       </header>

//       <section className="brand-hero">
//         <div className="brand-hero-inner">
//           <div className="hero-banner" aria-label="브랜딩 컨설팅 소개">
//             <img
//               src={bannerImage}
//               alt="브랜딩 컨설팅 배너"
//               className="hero-banner-image"
//             />
//             <div className="hero-banner-text">
//               <div className="hero-carousel">
//                 <div className="hero-slide">
//                   <strong>브랜드 컨설팅</strong>
//                   <span>여러분의 이미지를 표현하세요.</span>
//                 </div>
//                 <div className="hero-slide">
//                   <strong>로고 컨설팅</strong>
//                   <span>여러분의 개성을 담아보세요.</span>
//                 </div>
//                 <div className="hero-slide">
//                   <strong>네이밍 컨설팅</strong>
//                   <span>여러분의 첫인상을 그려보세요.</span>
//                 </div>
//                 <div className="hero-slide">
//                   <strong>홈페이지 컨설팅</strong>
//                   <span>여러분의 얼굴을 만들어보세요.</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       <main className="brand-content">
//         <h2 className="section-title">컨설팅 시작하기</h2>
//         <div className="service-grid">
//           <article className="service-card">
//             <div className="service-image">
//               <img src={Logocon} alt="로고 컨설팅" />
//             </div>
//             <p className="service-tag">Logo Consulting</p>
//             <h3>로고 컨설팅</h3>
//             <div className="service-meta">
//               <span>스타트업의 로고를 만들어 드립니다.</span>
//               <span>↗</span>
//             </div>
//           </article>
//           <article className="service-card">
//             <div className="service-image">
//               <img src={namecon} alt="네이밍 컨설팅" />
//             </div>
//             <p className="service-tag">Nameing Consulting</p>
//             <h3>네이밍 컨설팅</h3>
//             <div className="service-meta">
//               <span>경쟁력있는 이름을 만들어 드립니다.</span>
//               <span>↗</span>
//             </div>
//           </article>
//           <article className="service-card">
//             <div className="service-image">
//               <img src={pagecon} alt="홈페이지 컨설팅" />
//             </div>
//             <p className="service-tag">Webpage Consulting</p>
//             <h3>홈페이지 컨설팅</h3>
//             <div className="service-meta">
//               <span>사용자 최적의 웹페이지 제안 해드립니다.</span>
//               <span>↗</span>
//             </div>
//           </article>
//         </div>
//       </main>

//       <footer className="brand-footer">
//         <div className="footer-inner">
//           <div className="footer-links">
//             <button type="button" className="footer-link">
//               개인정보 처리방침
//             </button>
//             <span className="footer-sep">|</span>
//             <button type="button" className="footer-link">
//               이용약관
//             </button>
//           </div>
//           <div className="footer-text">
//             BRANDPILOT | 대전광역시 서구 문정로48번길 30 (탄방동, KT타워)
//           </div>
//           <div className="footer-text">KT AIVLE 7반 15조</div>
//           <div className="footer-text">
//             © 2026 Team15 Corp. All rights reserved.
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

// src/pages/BrandConsulting.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// ✅ (권장) 이 페이지 전용 스타일은 페이지에서 직접 import (확실히 적용됨)
// import "../styles/BrandConsulting.css";

import bannerImage from "../Image/banner_image/Banner.png";
import Logocon from "../Image/brandcon_image/logocon.png";
import namecon from "../Image/brandcon_image/namecon.png";
import pagecon from "../Image/brandcon_image/pagecon.png";

// ✅ 모달/콘텐츠(기존 재사용)
import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

// ✅ 공통 footer
import SiteFooter from "../components/SiteFooter.jsx";

export default function BrandConsulting() {
  const navigate = useNavigate();

  // ✅ 브랜드 컨설팅 드롭다운 (메인과 동일)
  const [brandOpen, setBrandOpen] = useState(false);
  const brandRef = useRef(null);

  // ✅ 개인정보/이용약관 모달
  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  useEffect(() => {
    const onDown = (e) => {
      if (!brandOpen) return;
      if (brandRef.current && !brandRef.current.contains(e.target)) {
        setBrandOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setBrandOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [brandOpen]);

  const handleDiagnosisClick = () => navigate("/diagnosis");

  // ✅ 드롭다운/카드 클릭 -> BrandConsulting 내에서 "서비스 선택"만 바꾸는 형태(라우팅 살아있음)
  const handleBrandItem = (action) => {
    setBrandOpen(false);
    navigate(`/brandconsulting?service=${action}`);

    // 필요하면 알럿도 가능(테스트)
    const map = {
      concept: "컨셉 컨설팅",
      naming: "네이밍 컨설팅",
      logo: "로고 컨설팅",
      homepage: "홈페이지 컨설팅",
    };
    alert(`${map[action]} 이동(테스트)`);
  };

  const handleLogout = () => navigate("/login");

  return (
    <div className="brand-page">
      {/* ✅ 개인정보/이용약관 모달 */}
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

      {/* ✅ Header: 기존(MainPage/DiagnosisHome) 디자인 그대로 사용 */}
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
            className="nav-link"
            onClick={handleDiagnosisClick}
          >
            기업 진단 &amp; 인터뷰
          </button>

          {/* ✅ 브랜드 컨설팅 드롭다운 (메인과 동일 UI) */}
          <div
            className={`nav-dropdown ${brandOpen ? "is-open" : ""}`}
            ref={brandRef}
          >
            <button
              type="button"
              className="nav-link nav-dropdown__btn"
              aria-expanded={brandOpen ? "true" : "false"}
              onClick={() => setBrandOpen((v) => !v)}
            >
              브랜드 컨설팅 <span className="nav-dropdown__chev">▾</span>
            </button>

            <div
              className="nav-dropdown__panel"
              role="menu"
              aria-label="브랜드 컨설팅 메뉴"
            >
              <button
                type="button"
                className="nav-dropdown__item"
                onClick={() => handleBrandItem("concept")}
              >
                컨셉 컨설팅
              </button>
              <button
                type="button"
                className="nav-dropdown__item"
                onClick={() => handleBrandItem("naming")}
              >
                네이밍 컨설팅
              </button>
              <button
                type="button"
                className="nav-dropdown__item"
                onClick={() => handleBrandItem("logo")}
              >
                로고 컨설팅
              </button>
              <button
                type="button"
                className="nav-dropdown__item"
                onClick={() => handleBrandItem("homepage")}
              >
                홈페이지 컨설팅
              </button>
            </div>
          </div>

          <button
            type="button"
            className="nav-link"
            onClick={() => alert("홍보물 컨설팅 (준비중)")}
          >
            홍보물 컨설팅
          </button>
        </nav>

        <div className="account-nav">
          <button
            type="button"
            className="nav-link"
            onClick={() => navigate("/main")}
          >
            홈
          </button>
          <button
            type="button"
            className="nav-link"
            onClick={() => alert("마이페이지 (준비중)")}
          >
            마이페이지
          </button>
          <button type="button" className="nav-link" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </header>

      {/* ✅ Hero (배너/캐러셀) */}
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Content */}
      <main className="brand-content">
        <h2 className="section-title">컨설팅 시작하기</h2>

        <div className="service-grid">
          <article
            className="service-card"
            role="button"
            tabIndex={0}
            onClick={() => handleBrandItem("logo")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleBrandItem("logo");
            }}
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

          <article
            className="service-card"
            role="button"
            tabIndex={0}
            onClick={() => handleBrandItem("naming")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleBrandItem("naming");
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

          <article
            className="service-card"
            role="button"
            tabIndex={0}
            onClick={() => handleBrandItem("homepage")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                handleBrandItem("homepage");
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
        </div>
      </main>

      {/* ✅ Footer: 기존 공통 footer로 통일 */}
      <SiteFooter onOpenPolicy={setOpenType} />
    </div>
  );
}
