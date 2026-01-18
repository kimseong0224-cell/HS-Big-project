// src/pages/Promotion.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import bannerImage from "../Image/banner_image/Banner.png";
import digitalImage from "../Image/promotion_image/Digital image.png";
import offlineImage from "../Image/promotion_image/Offline image.png";
import promoVideoImage from "../Image/promotion_image/PromoVideo.png";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

export default function PromotionPage({ onLogout }) {
  const navigate = useNavigate(); // ✅ 이게 없어서 이동이 안 됐음
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // ✅ 약관/방침 모달
  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  // ✅ 헤더 드롭다운에서 선택된 service (query or state)
  const pickedService = useMemo(() => {
    const q = searchParams.get("service");
    if (q) return q;
    return location.state?.service || null;
  }, [searchParams, location.state]);

  // ✅ 카드 클릭 이동
  const handleDigital = () => navigate("/promotion/digital/interview");
  const handleOffline = () => navigate("/promotion/offline/interview");
  const handleVideo = () => navigate("/promotion/video/interview");

  const onPromoPick = (action) => {
    // 필요하면 여기서 추가 동작 가능 (지금은 알럿만 유지)
    const map = {
      digital: "디지털 디자인",
      offline: "오프라인 디자인",
      video: "홍보 영상",
    };
    // alert(`${map[action]} 이동(테스트)`);
  };

  return (
    <div className="promo-page">
      {/* ✅ 약관/방침 모달 */}
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

      {/* ✅ 공통 헤더 */}
      <SiteHeader onLogout={onLogout} onPromoPick={onPromoPick} />

      {/* ✅ Hero */}
      <section className="promo-hero">
        <div className="promo-hero-inner">
          <div className="promo-banner" aria-label="홍보물컨설팅 소개">
            <img
              src={bannerImage}
              alt="홍보물컨설팅 배너"
              className="promo-banner-image"
            />
            <div className="promo-banner-text">
              <div className="promo-carousel">
                <div className="promo-slide">
                  <strong>홍보물컨설팅</strong>
                  <span>브랜드 메시지를 효과적으로 전달합니다.</span>
                </div>
                <div className="promo-slide">
                  <strong>디지털 디자인</strong>
                  <span>SNS에 맞는 비주얼을 제안합니다.</span>
                </div>
                <div className="promo-slide">
                  <strong>오프라인 디자인</strong>
                  <span>인쇄 매체에 최적화된 구성을 제안합니다.</span>
                </div>
                <div className="promo-slide">
                  <strong>홍보 영상</strong>
                  <span>영상 스토리라인과 모션을 함께 제공합니다.</span>
                </div>
              </div>

              {/* 필요하면 사용 */}
              {/* {pickedService ? (
                <div style={{ marginTop: 14, fontSize: 14, opacity: 0.9 }}>
                  선택된 메뉴: <b>{pickedService}</b>
                </div>
              ) : null} */}
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Content */}
      <main className="promo-content">
        <section className="promo-intro">
          <h2 className="section-title">컨설팅 시작하기</h2>
        </section>

        <section className="promo-grid">
          <div className="promo-cards">
            <article
              className="promo-card"
              role="button"
              tabIndex={0}
              onClick={handleDigital}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleDigital();
              }}
            >
              <div className="promo-card-image">
                <img src={digitalImage} alt="디지털 디자인" />
              </div>
              <p className="promo-card-tag">Digital Consulting</p>
              <h3>디지털 디자인</h3>
              <div className="promo-card-meta">
                <span>채널에 최적화된 비주얼과 카피를 구성합니다.</span>
                <span>↗</span>
              </div>
            </article>

            <article
              className="promo-card"
              role="button"
              tabIndex={0}
              onClick={handleOffline}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleOffline();
              }}
            >
              <div className="promo-card-image">
                <img src={offlineImage} alt="오프라인 디자인" />
              </div>
              <p className="promo-card-tag">Offline Consulting</p>
              <h3>오프라인 디자인</h3>
              <div className="promo-card-meta">
                <span>인쇄물에 맞춘 비주얼과 메시지를 구성합니다.</span>
                <span>↗</span>
              </div>
            </article>

            <article
              className="promo-card"
              role="button"
              tabIndex={0}
              onClick={handleVideo}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleVideo();
              }}
            >
              <div className="promo-card-image">
                <img src={promoVideoImage} alt="홍보 영상" />
              </div>
              <p className="promo-card-tag">Promo Video Consulting</p>
              <h3>홍보 영상</h3>
              <div className="promo-card-meta">
                <span>영상 스토리라인과 모션을 함께 제공합니다.</span>
                <span>↗</span>
              </div>
            </article>
          </div>
        </section>
      </main>

      {/* ✅ 공통 푸터 */}
      <SiteFooter onOpenPolicy={setOpenType} />
    </div>
  );
}
