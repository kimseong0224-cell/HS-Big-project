// src/pages/PromotionResult.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

const KEY_MAP = {
  digital: "promoInterview_digital_v1",
  offline: "promoInterview_offline_v1",
  video: "promoInterview_video_v1",
};

const LABEL_MAP = {
  digital: "디지털 이미지 컨설팅",
  offline: "오프라인 이미지 컨설팅",
  video: "홍보 영상 컨설팅",
};

const INTERVIEW_ROUTE = {
  digital: "/promotion/digital/interview",
  offline: "/promotion/offline/interview",
  video: "/promotion/video/interview",
};

export default function PromotionResult({ onLogout }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ 약관/방침 모달
  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  const service = useMemo(() => {
    const s = searchParams.get("service");
    if (s === "digital" || s === "offline" || s === "video") return s;
    return "digital";
  }, [searchParams]);

  const storageKey = KEY_MAP[service];
  const title = LABEL_MAP[service];
  // 🔌 BACKEND 연동 포인트 (홍보물 결과 화면)
  // - 현재: localStorage에서 service별 결과를 읽어 표시
  // - 백엔드 연동 시(명세서 기준) 결과 데이터 출처 후보:
  //   - 포스터: GET /brands/posters
  //   - SNS:   GET /brands/sns
  //   - 영상:  GET /brands/videos
  // - 실제로 service(digital/offline/video) ↔ 엔드포인트 매핑은 팀과 확정 필요

  const draft = useMemo(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [storageKey]);

  const form = draft?.form || {};
  const lastSaved = useMemo(() => {
    const t = draft?.updatedAt;
    if (!t) return "-";
    const d = new Date(t);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
  }, [draft]);

  const recommendations = useMemo(() => {
    // UI 더미 추천(나중에 실제 AI 결과로 교체)
    const purpose = String(form?.purpose || "").trim();
    const target = String(form?.target || "").trim();
    const brandAsset = String(form?.brandAsset || "").trim();
    const avoid = String(form?.avoid || "").trim();

    const out = [];
    if (purpose)
      out.push(
        `목적(${purpose})에 맞게 ‘한 문장 메시지 + 핵심 CTA’를 상단에 고정하는 구성을 추천해요.`,
      );
    else
      out.push(
        "목적(사용처)을 먼저 확정하면 디자인 방향이 빨라져요. (예: SNS, 배너, 상세페이지 등)",
      );

    if (target)
      out.push(
        `타깃(${target})에게 통하는 톤(신뢰/캐주얼/프리미엄)을 먼저 정하고 컬러/폰트를 맞춰요.`,
      );
    else out.push("타깃이 정해지면 색/이미지/카피 톤이 크게 좋아져요.");

    if (brandAsset)
      out.push(
        "브랜드 자산(로고/컬러/폰트)이 있으면 통일감이 생겨요. 가이드 유무를 체크해요.",
      );
    else
      out.push(
        "로고/컬러/폰트 가이드가 없으면 기본 세트를 먼저 정하는 걸 추천해요.",
      );

    if (avoid)
      out.push(
        "‘빼고 싶은 요소’를 명확히 하면 시안 품질이 빨리 올라가요. 금지 요소 리스트는 유효합니다.",
      );
    return out;
  }, [form]);

  const handleGoInterview = () => navigate(INTERVIEW_ROUTE[service]);
  const handleGoPromotion = () => navigate("/promotion");

  const handleReset = () => {
    localStorage.removeItem(storageKey);
    alert("해당 홍보물 인터뷰 데이터를 초기화했습니다.");
    navigate(INTERVIEW_ROUTE[service], { state: { reset: true } });
  };

  return (
    <div className="promoResult">
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

      <main className="promoResult__main">
        <div className="promoResult__container">
          <div className="promoResult__titleRow">
            <div>
              <h1 className="promoResult__title">{title} 결과 리포트</h1>
              <p className="promoResult__sub">
                입력한 답변을 기반으로 결과 요약을 보여줍니다. (현재는 UI/연결용
                더미 리포트)
              </p>
            </div>

            <div className="promoResult__topActions">
              <button
                type="button"
                className="btn ghost"
                onClick={handleGoPromotion}
              >
                홍보물 컨설팅 홈
              </button>
              <button type="button" className="btn" onClick={handleGoInterview}>
                인터뷰로 돌아가기
              </button>
            </div>
          </div>

          <div className="promoResult__grid">
            {/* left */}
            <section className="promoResult__left">
              <div className="card">
                <div className="card__head">
                  <h2>입력 요약</h2>
                  <p>작성한 답변을 그대로 보여줍니다.</p>
                </div>

                <div className="qa">
                  <div className="qa__item">
                    <div className="q">1) 사용 목적</div>
                    <div className="a">{form.purpose || "—"}</div>
                  </div>

                  <div className="qa__item">
                    <div className="q">2) 타깃</div>
                    <div className="a">{form.target || "—"}</div>
                  </div>

                  <div className="qa__item">
                    <div className="q">3) 브랜드 자산(로고/컬러/폰트 등)</div>
                    <div className="a">{form.brandAsset || "—"}</div>
                  </div>

                  <div className="qa__item">
                    <div className="q">4) 피하고 싶은 요소</div>
                    <div className="a">{form.avoid || "—"}</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card__head">
                  <h2>추천 구성(더미)</h2>
                  <p>실제 AI 결과가 들어갈 자리입니다.</p>
                </div>

                <ul className="recoList">
                  {recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>

                <div className="note">
                  * 이후 “시안 생성/템플릿 추천/카피라이팅” 등으로 확장하기
                  좋습니다.
                </div>
              </div>
            </section>

            {/* right sticky */}
            <aside className="promoResult__right">
              <div className="sideCard">
                <div className="sideCard__titleRow">
                  <h3>상태</h3>
                  <span className="badge">{service}</span>
                </div>

                <div className="sideMeta">
                  <div className="sideMeta__row">
                    <span className="k">마지막 저장</span>
                    <span className="v">{lastSaved}</span>
                  </div>
                </div>

                <div className="divider" />

                <button
                  type="button"
                  className="btn primary w100"
                  onClick={handleGoInterview}
                >
                  입력 수정하기
                </button>

                <button
                  type="button"
                  className="btn ghost w100"
                  style={{ marginTop: 10 }}
                  onClick={handleReset}
                >
                  처음부터 다시하기(초기화)
                </button>

                <p className="hint">
                  * “분석 요청” 버튼을 누르면 이 페이지로 이동하도록 연결하면
                  됩니다.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter onOpenPolicy={setOpenType} />
    </div>
  );
}
