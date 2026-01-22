// src/pages/InvestmentPostDetail.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

const POSTS_STORAGE_KEY = "investmentPosts";

export default function InvestmentPostDetail({ onLogout }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  const item = useMemo(() => {
    try {
      const raw = localStorage.getItem(POSTS_STORAGE_KEY);
      if (!raw) return null;
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return null;
      return list.find((entry) => entry.id === id) || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [id]);

  const tags = useMemo(() => {
    if (!item || !Array.isArray(item.hashtags)) return [];
    return item.hashtags.map((tag) => tag.trim()).filter(Boolean);
  }, [item]);

  const metaItems = useMemo(() => {
    if (!item) return [];
    const locationText = Array.isArray(item.locations)
      ? item.locations.join(", ")
      : item.location || "";
    const sizeText = Array.isArray(item.companySizes)
      ? item.companySizes.join(", ")
      : item.companySize || "";
    return [sizeText, locationText].filter(Boolean);
  }, [item]);

  const companyName = item?.company || item?.name || "회사명 없음";
  const oneLiner = item?.oneLiner || "한 줄 소개가 없습니다.";
  const locationText = Array.isArray(item?.locations)
    ? item.locations.join(", ")
    : item?.location || "-";
  const detailAddress = item?.detailAddress || "-";


  if (!item) {
    return (
      <div className="invest-detail-page">
        <SiteHeader onLogout={onLogout} />
        <main className="invest-detail-main">
          <div className="invest-detail-empty">
            <h2>게시글을 찾을 수 없습니다.</h2>
            <button
              type="button"
              className="btn"
              onClick={() => navigate("/investment")}
            >
              목록으로
            </button>
          </div>
        </main>
        <SiteFooter onOpenPolicy={setOpenType} />
      </div>
    );
  }

  return (
    <div className="invest-detail-page">
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

      <SiteHeader onLogout={onLogout} />

      <main className="invest-detail-main">
        <div className="invest-detail-hero">
          <div>
            <h1>상세 정보</h1>
            <p className="invest-detail-sub">
              투자 라운지에 등록된 기업의 상세 정보를 확인할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            className="btn ghost"
            onClick={() => navigate("/investment")}
          >
            목록으로
          </button>
        </div>

        <div className="invest-detail-grid">
          <section className="invest-detail-block invest-detail-overview-main">
            <div className="invest-detail-header">
              <div className="invest-detail-logo">
                {item.logoImageUrl ? (
                  <img src={item.logoImageUrl} alt={`${companyName} 로고`} />
                ) : (
                  companyName.slice(0, 2)
                )}
              </div>
              <div className="invest-detail-title">
                <h2>{companyName}</h2>
              </div>
            </div>
            <p className="invest-detail-oneliner">{oneLiner}</p>
          </section>

          <section className="invest-detail-block invest-detail-overview-side">
            <div className="invest-detail-overview-panel">
              <div className="invest-detail-panel-section">
                <div className="invest-detail-panel-title">회사 규모·지역</div>
                <div className="invest-detail-right-meta">
                  {metaItems.map((value) => (
                    <span key={value}>{value}</span>
                  ))}
                </div>
              </div>
              <div className="invest-detail-panel-divider" />
              <div className="invest-detail-panel-section">
                <div className="invest-detail-panel-title">해시태그</div>
                <div className="invest-detail-right-tags">
                  {tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="invest-detail-row invest-detail-row-balanced">
            <section className="invest-detail-block invest-detail-summary">
              <h3>상세 소개</h3>
              <p>{item.summary || "상세 소개가 아직 없습니다."}</p>
            </section>

            <section className="invest-detail-block invest-detail-fields">
              <h3>등록 정보</h3>
              <ul>
                <li>
                  <strong>지역</strong>
                  <span>{locationText}</span>
                </li>
                <li>
                  <strong>상세 주소</strong>
                  <span>{detailAddress}</span>
                </li>
                <li className="invest-detail-fields-group">
                  <strong>홈페이지</strong>
                  {item.website ? (
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.website}
                    </a>
                  ) : (
                    <span>-</span>
                  )}
                </li>
                <li>
                  <strong>담당자</strong>
                  <span>{item.contactName || "-"}</span>
                </li>
                <li>
                  <strong>이메일</strong>
                  <span>{item.contactEmail || "-"}</span>
                </li>
              </ul>
            </section>
          </div>

          <section className="invest-detail-block invest-detail-footer">
            <span>업데이트: {item.updatedAt || "-"}</span>
          </section>
        </div>
      </main>

      <SiteFooter onOpenPolicy={setOpenType} />
    </div>
  );
}
