// src/pages/PromotionAllResults.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readFirstExisting(keys) {
  for (const k of keys) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    const parsed = safeParse(raw);
    if (parsed && parsed.form) return { storageKey: k, ...parsed };
  }
  return null;
}

function fmtDate(updatedAt) {
  if (!updatedAt) return "-";
  const d = new Date(updatedAt);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

function pick(form, key) {
  const v = form?.[key];
  const str = String(v ?? "").trim();
  return str ? str : "-";
}

/** ✅ 요약으로 보여줄 키 후보(홍보물 폼이 서로 달라도 공통으로 잡히게) */
const SUMMARY_PRIORITY = [
  "companyName",
  "brandName",
  "industry",
  "targetCustomer",
  "oneLine",
  "goal",
  "concept",
  "tone",
  "message",
  "keywords",
  "notes",
];

export default function PromotionAllResults({ onLogout }) {
  const navigate = useNavigate();

  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);
  // 🔌 BACKEND 연동 포인트 (마이페이지용: 홍보물 컨설팅 전체 결과)
  // - 현재: localStorage(promotionInterview_*_v1) 존재 여부로 완료/미진행 판단 + 화면 렌더
  // - 백엔드 연동 시(명세서 기준) 대체 흐름:
  //   - 포스터: GET /brands/posters
  //   - SNS:   GET /brands/sns
  //   - 영상:  GET /brands/videos
  //   (마이페이지에서 브랜드별로 구분해야 하면 /mypage/brands/{brandId}/outputs 쪽으로 확장 필요)
  // - 구현은 useEffect에서 호출 → state 저장 → 완료 여부는 응답 존재 여부로 판단

  const PROMO_SERVICES = useMemo(
    () => [
      {
        key: "digital",
        title: "디지털 이미지 컨설팅",
        desc: "SNS/배너/썸네일 등 디지털 소재 방향",
        // ✅ 키 후보들(프로젝트 실제 키가 다르면 여기에 추가)
        storageKeys: [
          "promotionInterview_digital_v1",
          "promoInterview_digital_v1",
          "promotion_digital_v1",
        ],
        interviewPath: "/promotion/digital/interview",
      },
      {
        key: "offline",
        title: "오프라인 이미지 컨설팅",
        desc: "전단/포스터/현수막 등 오프라인 소재 방향",
        storageKeys: [
          "promotionInterview_offline_v1",
          "promoInterview_offline_v1",
          "promotion_offline_v1",
        ],
        interviewPath: "/promotion/offline/interview",
      },
      {
        key: "video",
        title: "홍보 영상 컨설팅",
        desc: "광고 영상/숏폼 등 영상 소재 방향",
        storageKeys: [
          "promotionInterview_video_v1",
          "promoInterview_video_v1",
          "promotion_video_v1",
        ],
        interviewPath: "/promotion/video/interview",
      },
    ],
    [],
  );

  const results = useMemo(() => {
    return PROMO_SERVICES.map((svc) => {
      const saved = readFirstExisting(svc.storageKeys);
      return { ...svc, saved };
    });
  }, [PROMO_SERVICES]);

  const doneCount = useMemo(
    () => results.filter((r) => Boolean(r.saved)).length,
    [results],
  );

  const progress = useMemo(() => {
    if (results.length === 0) return 0;
    return Math.round((doneCount / results.length) * 100);
  }, [doneCount, results.length]);

  const buildSummary = (form) => {
    const items = [];
    for (const k of SUMMARY_PRIORITY) {
      const v = String(form?.[k] ?? "").trim();
      if (!v) continue;
      items.push({ k, v });
      if (items.length >= 8) break;
    }
    if (items.length === 0) {
      // 폼 구조가 달라도 최소 표시
      const keys = Object.keys(form || {});
      return keys.slice(0, 8).map((k) => ({ k, v: pick(form, k) }));
    }
    return items;
  };

  return (
    <div className="promoAll-page">
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

      <main className="promoAll-main">
        <div className="promoAll-container">
          <div className="promoAll-titleRow">
            <div>
              <h1 className="promoAll-title">홍보물 컨설팅 통합 결과 리포트</h1>
              <p className="promoAll-sub">
                디지털 · 오프라인 · 영상 컨설팅 결과를 한곳에서 확인합니다.
                (저장된 localStorage 기준)
              </p>
            </div>

            <div className="promoAll-actions">
              <button
                type="button"
                className="btn ghost"
                onClick={() => navigate("/mypage")}
              >
                마이페이지로
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => navigate("/promotion")}
              >
                홍보물 컨설팅 홈
              </button>
            </div>
          </div>

          <div className="promoAll-grid">
            {/* Left */}
            <section className="promoAll-left">
              {results.map((svc) => {
                const saved = svc.saved;
                const form = saved?.form || {};
                const lastSaved = fmtDate(saved?.updatedAt);

                return (
                  <article className="card promoAll-card" key={svc.key}>
                    <div className="card__head promoAll-cardHead">
                      <div>
                        <h2 className="promoAll-cardTitle">{svc.title}</h2>
                        <p className="promoAll-cardDesc">{svc.desc}</p>
                      </div>

                      {saved ? (
                        <span className="status-pill success">완료</span>
                      ) : (
                        <span className="status-pill ghost">미진행</span>
                      )}
                    </div>

                    {!saved ? (
                      <div className="promoAll-empty">
                        <p className="promoAll-emptyText">
                          아직 {svc.title} 결과가 없습니다. 인터뷰를
                          진행하시겠어요?
                        </p>
                        <button
                          type="button"
                          className="btn primary"
                          onClick={() => navigate(svc.interviewPath)}
                        >
                          컨설팅 진행하기
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="promoAll-meta">
                          <div className="promoAll-metaRow">
                            <span className="k">마지막 저장</span>
                            <span className="v">{lastSaved}</span>
                          </div>
                          <div className="promoAll-metaRow">
                            <span className="k">저장 키</span>
                            <span className="v">{saved?.storageKey}</span>
                          </div>
                        </div>

                        <div className="promoAll-summary">
                          {buildSummary(form).map((it) => (
                            <div className="promoAll-sItem" key={it.k}>
                              <div className="k">{it.k}</div>
                              <div className="v">{it.v}</div>
                            </div>
                          ))}
                        </div>

                        <div className="promoAll-cardActions">
                          <button
                            type="button"
                            className="btn ghost"
                            onClick={() => navigate(svc.interviewPath)}
                          >
                            인터뷰 수정하기
                          </button>

                          <button
                            type="button"
                            className="btn"
                            onClick={() => {
                              const ok = window.confirm(
                                `${svc.title} 결과를 초기화할까요?`,
                              );
                              if (!ok) return;
                              svc.storageKeys.forEach((k) =>
                                localStorage.removeItem(k),
                              );
                              window.location.reload();
                            }}
                          >
                            결과 초기화
                          </button>
                        </div>
                      </>
                    )}
                  </article>
                );
              })}
            </section>

            {/* Right */}
            <aside className="promoAll-right">
              <div className="sideCard">
                <div className="sideCard__titleRow">
                  <h3>진행 현황</h3>
                  <span className="badge">{progress}%</span>
                </div>

                <div
                  className="progressBar"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                >
                  <div
                    className="progressBar__fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="sideMeta">
                  <div className="sideMeta__row">
                    <span className="k">완료</span>
                    <span className="v">
                      {doneCount}/{results.length}
                    </span>
                  </div>
                </div>

                <div className="divider" />

                <button
                  type="button"
                  className="btn primary w100"
                  onClick={() => navigate("/promotion")}
                >
                  홍보물 컨설팅 홈으로
                </button>

                <p className="hint">
                  * 저장 키가 다르면 이 페이지에서 “미진행”으로 보일 수 있어요.
                  (위 storageKeys 후보에 실제 키 추가하면 해결)
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
