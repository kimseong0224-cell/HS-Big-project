// src/pages/MainPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import analyzeCompany from "../Image/main_image/companyanalyze.png";
import makeset from "../Image/main_image/Brandingconsult.png";
import story from "../Image/main_image/PromotionalConsulting.png";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import SiteHeader from "../components/SiteHeader.jsx";

export default function MainPage({ onLogout }) {
  const navigate = useNavigate();

  const handleDiagnosisClick = () => navigate("/diagnosis");
  const handleBrandPage = () => navigate("/brandconsulting");

  // ✅ 약관/방침 모달
  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  return (
    <div className="main-page">
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
      <SiteHeader
        onLogout={onLogout}
        onBrandPick={(action) => {
          // MainPage에서 드롭다운 선택 시 section 전달은 헤더에서 이미 처리함
          // 여기서는 추가로 뭔가 하고 싶을 때만 작성
          // 예: console.log("brand pick:", action);
        }}
      />

      <main className="main-content">
        <h2 className="section-title">컨설팅 시작하기</h2>

        <div className="card-grid">
          <article
            className="info-card"
            role="button"
            tabIndex={0}
            onClick={handleDiagnosisClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleDiagnosisClick();
            }}
          >
            <div className="card-image">
              <img src={analyzeCompany} alt="기업 진단 & 인터뷰" />
            </div>
            <div className="card-body">
              <p className="card-tag">Company Analyze</p>
              <h3>기업 진단 &amp; 인터뷰</h3>
              <p className="card-desc">
                기업의 현황을 정밀하게 분석하고 핵심 인사이트를 제공합니다.
              </p>
            </div>
          </article>

          <article
            className="info-card"
            role="button"
            tabIndex={0}
            onClick={handleBrandPage}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleBrandPage();
            }}
          >
            <div className="card-image alt">
              <img src={makeset} alt="브랜드 컨설팅" />
            </div>
            <div className="card-body">
              <p className="card-tag">Brand Consulting</p>
              <h3>브랜드 컨설팅</h3>
              <p className="card-desc">
                기업의 이미지와 정체성을 정교하게 다듬습니다.
              </p>
            </div>
          </article>

          <article
            className="info-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate("/promotion")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/promotion");
            }}
          >
            <div className="card-image third">
              <img src={story} alt="홍보물 컨설팅" />
            </div>
            <div className="card-body">
              <p className="card-tag">Promotional Consulting</p>
              <h3>홍보물 컨설팅</h3>
              <p className="card-desc">
                기업 전반의 소개와 홍보 과정을 기획 단계부터 제안합니다.
              </p>
            </div>
          </article>
        </div>

        <section className="deal-board" aria-label="투자 유치 게시판">
          <div className="deal-header">
            <div>
              <p className="deal-eyebrow">초기 스타트업과 함께 해주세요!</p>
              <h3 className="deal-title">스타트업 투자유치</h3>
            </div>

            <button
              type="button"
              className="deal-more"
              onClick={() => navigate("/investment")}
            >
              전체보기 &gt;
            </button>
          </div>

          <div className="deal-grid">
            <article className="deal-card">
              <div className="deal-card-head">
                <div>
                  <h4>셀타스퀘어</h4>
                  <p>AI 전구약알림 서비스, AI CRO</p>
                  <p>Pre A, TIPS, Series A 투자 완료</p>
                </div>
                <div className="deal-logo">SELTA</div>
              </div>
              <div className="deal-tags">
                <span>AI헬스</span>
                <span>포켓투자유치 A,B 받은팀</span>
              </div>
              <div className="deal-footer">
                <strong>[series A] 92억+ TIPS 투자유치</strong>
                <button type="button" onClick={() => alert("뉴스 (테스트)")}>
                  투자성과 뉴스
                </button>
              </div>
            </article>

            <article className="deal-card">
              <div className="deal-card-head">
                <div>
                  <h4>링크플로우</h4>
                  <p>인공지능(AI) 웨어러블 전문 링크플로우</p>
                  <p>Series B 라운드 준비 완료</p>
                </div>
                <div className="deal-logo">LINK</div>
              </div>
              <div className="deal-tags">
                <span>AI,웨어러블</span>
                <span>포켓투자유치 A,B 받은팀</span>
              </div>
              <div className="deal-footer">
                <strong>[series C 이상] 409억 투자유치</strong>
                <button type="button" onClick={() => alert("뉴스 (테스트)")}>
                  투자성과 뉴스
                </button>
              </div>
            </article>

            <article className="deal-card">
              <div className="deal-card-head">
                <div>
                  <h4>빔웍스</h4>
                  <p>초음파 AI 진단 센서 기반 고가치</p>
                  <p>서비스/임상기업 운영, Pre-IPO 완료</p>
                </div>
                <div className="deal-logo">BEAM</div>
              </div>
              <div className="deal-tags">
                <span>헬스케어, AI</span>
                <span>포켓투자유치 A,B 받은팀</span>
              </div>
              <div className="deal-footer">
                <strong>[pre-IPO] 170억 투자완료</strong>
                <button type="button" onClick={() => alert("뉴스 (테스트)")}>
                  투자성과 뉴스
                </button>
              </div>
            </article>

            <article className="deal-card">
              <div className="deal-card-head">
                <div>
                  <h4>노바리프</h4>
                  <p>친환경 소재 기반 패키징 솔루션</p>
                  <p>Seed, Pre A 투자 유치</p>
                </div>
                <div className="deal-logo">NOVA</div>
              </div>
              <div className="deal-tags">
                <span>그린테크</span>
                <span>제조혁신</span>
              </div>
              <div className="deal-footer">
                <strong>[seed] 18억 투자완료</strong>
                <button type="button" onClick={() => alert("뉴스 (테스트)")}>
                  투자성과 뉴스
                </button>
              </div>
            </article>

            <article className="deal-card">
              <div className="deal-card-head">
                <div>
                  <h4>바이오루프</h4>
                  <p>정밀 건강관리 바이오 데이터 플랫폼</p>
                  <p>Series A 라운드 진행 중</p>
                </div>
                <div className="deal-logo">BIO</div>
              </div>
              <div className="deal-tags">
                <span>바이오</span>
                <span>데이터</span>
              </div>
              <div className="deal-footer">
                <strong>[series A] 65억 투자유치</strong>
                <button type="button" onClick={() => alert("뉴스 (테스트)")}>
                  투자성과 뉴스
                </button>
              </div>
            </article>

            <article className="deal-card">
              <div className="deal-card-head">
                <div>
                  <h4>클라우드웨이브</h4>
                  <p>제조 특화 SaaS 운영 자동화</p>
                  <p>Series B 투자 유치 확정</p>
                </div>
                <div className="deal-logo">CW</div>
              </div>
              <div className="deal-tags">
                <span>SaaS</span>
                <span>제조</span>
              </div>
              <div className="deal-footer">
                <strong>[series B] 210억 투자완료</strong>
                <button type="button" onClick={() => alert("뉴스 (테스트)")}>
                  투자성과 뉴스
                </button>
              </div>
            </article>
          </div>
        </section>
      </main>

      <SiteFooter onOpenPolicy={setOpenType} />
    </div>
  );
}
