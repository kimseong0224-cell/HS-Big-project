import bannerImage from "../banner_image/Banner.png";
import Logocon from "../brandcon_image/logocon.png";
import namecon from "../brandcon_image/namecon.png";
import pagecon from "../brandcon_image/pagecon.png";

export default function BrandConsulting({ onBack, onLogout }) {
  return (
    <div className="brand-page">
      <header className="brand-header">
        <div className="brand-header-inner">
          <div className="brand-logo">BRANDPILOT</div>
          <nav className="brand-nav" aria-label="주요 메뉴">
            <button type="button" className="nav-link">
              기업 진단 & 인터뷰
            </button>
            <button type="button" className="nav-link">
              브랜드 컨설팅
            </button>
            <button type="button" className="nav-link">
              홍보물 컨설팅
            </button>
          </nav>
          <div className="brand-account">
            <button type="button" className="nav-link" onClick={onBack}>
              홈
            </button>
            <button type="button" className="nav-link">
              마이페이지
            </button>
            <button type="button" className="nav-link" onClick={onLogout}>
              로그아웃
            </button>
          </div>
        </div>
      </header>

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

      <main className="brand-content">
        <h2 className="section-title">컨설팅 시작하기</h2>
        <div className="service-grid">
          <article className="service-card">
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
          <article className="service-card">
            <div className="service-image">
              <img src={namecon} alt="네이밍 컨설팅" />
            </div>
            <p className="service-tag">Nameing Consulting</p>
            <h3>네이밍 컨설팅</h3>
            <div className="service-meta">
              <span>경쟁력있는 이름을 만들어 드립니다.</span>
              <span>↗</span>
            </div>
          </article>
          <article className="service-card">
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

      <footer className="brand-footer">
        <div className="footer-inner">
          <div className="footer-links">
            <button type="button" className="footer-link">
              개인정보 처리방침
            </button>
            <span className="footer-sep">|</span>
            <button type="button" className="footer-link">
              이용약관
            </button>
          </div>
          <div className="footer-text">
            BRANDPILOT | 대전광역시 서구 문정로48번길 30 (탄방동, KT타워)
          </div>
          <div className="footer-text">KT AIVLE 7반 15조</div>
          <div className="footer-text">© 2026 Team15 Corp. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
