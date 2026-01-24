// src/pages/BrandAllResults.jsx
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

function stageLabel(stage) {
  const s = String(stage || "");
  if (s === "idea") return "아이디어 단계";
  if (s === "mvp") return "MVP/테스트 중";
  if (s === "pmf") return "PMF 탐색";
  if (s === "revenue") return "매출 발생";
  if (s === "invest") return "투자 유치 진행";
  return s || "-";
}

function pick(form, key) {
  const v = form?.[key];
  const str = String(v ?? "").trim();
  return str ? str : "-";
}

export default function BrandAllResults({ onLogout }) {
  const navigate = useNavigate();

  // ✅ 약관/방침 모달
  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);
  // 🔌 BACKEND 연동 포인트 (마이페이지용: 브랜드 컨설팅 전체 결과)
  // - 현재: localStorage(brandInterview_*_v1) 존재 여부로 완료/미진행 판단 + 화면 렌더
  // - 백엔드 연동 시(명세서 기준) 대체 흐름:
  //   1) 마이페이지 기본정보:        GET /mypage
  //   2) 생성한 브랜드 목록:        GET /mypage/brands
  //   3) 선택 브랜드 산출물(전체):  GET /mypage/brands/{brandId}/outputs
  //   4) 서비스별 산출물(상세):
  //      - 스토리: GET /mypage/brands/{brandId}/outputs/story
  //      - 네이밍: GET /mypage/brands/{brandId}/outputs/naming
  //      - 로고:   GET /mypage/brands/{brandId}/outputs/logo
  //   5) (옵션) 진단 리포트:        GET /mypage/brands/{brandId}/report
  // - 구현은 useEffect에서 호출 → state 저장 → 완료 여부는 응답 존재 여부로 판단

  const BRAND_SERVICES = useMemo(
    () => [
      {
        key: "logo",
        title: "로고 컨설팅",
        desc: "브랜드 성격/키워드 기반 로고 방향 요약",
        // ✅ 결과 저장 키 (브랜드 결과 페이지에서 쓰던 키)
        storageKeys: ["brandInterview_logo_v1"],
        // ✅ 인터뷰 이동 경로(네 프로젝트 기준)
        interviewPath: "/logoconsulting",
        // 요약으로 보여줄 필드(가능하면)
        summary: [
          "companyName",
          "industry",
          "stage",
          "oneLine",
          "targetCustomer",
          "brandPersonality",
          "keywords",
          "goal",
        ],
      },
      {
        key: "naming",
        title: "네이밍 컨설팅",
        desc: "타깃/톤/키워드 기반 네이밍 방향 요약",
        storageKeys: ["brandInterview_naming_v1"],
        interviewPath: "/nameconsulting",
        summary: [
          "companyName",
          "industry",
          "stage",
          "oneLine",
          "targetCustomer",
          "tone",
          "keywords",
          "goal",
        ],
      },
      {
        key: "homepage",
        title: "컨셉 컨설팅",
        desc: "사이트 목적/CTA/섹션 기반 구성 요약",
        storageKeys: ["brandInterview_homepage_v1"],
        interviewPath: "/conceptconsulting",
        summary: [
          "companyName",
          "industry",
          "stage",
          "oneLine",
          "siteGoal",
          "primaryAction",
          "mainSections",
        ],
      },
      {
        key: "story",
        title: "브랜드 스토리 컨설팅",
        desc: "브랜드 시작 계기/문제/해결/목표 기반 스토리 요약",
        storageKeys: ["brandInterview_story_v1"],
        // ✅ App.jsx에 /brand/story가 있고, alias로 /brandstoryconsulting도 추가(아래 App.jsx 수정본 참고)
        interviewPath: "/brand/story",
        summary: [
          "companyName",
          "industry",
          "stage",
          "oneLine",
          "targetCustomer",
          "brandCore",
          "goal",
          "originStory",
          "problemStory",
          "solutionStory",
        ],
      },
    ],
    [],
  );

  const results = useMemo(() => {
    return BRAND_SERVICES.map((svc) => {
      const saved = readFirstExisting(svc.storageKeys);
      return { ...svc, saved };
    });
  }, [BRAND_SERVICES]);

  const doneCount = useMemo(
    () => results.filter((r) => Boolean(r.saved)).length,
    [results],
  );

  const progress = useMemo(() => {
    if (results.length === 0) return 0;
    return Math.round((doneCount / results.length) * 100);
  }, [doneCount, results.length]);

  return (
    <div className="brandAll-page">
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

      <main className="brandAll-main">
        <div className="brandAll-container">
          <div className="brandAll-titleRow">
            <div>
              <h1 className="brandAll-title">브랜드 컨설팅 통합 결과 리포트</h1>
              <p className="brandAll-sub">
                로고 · 네이밍 · 컨셉 · 브랜드 스토리 결과를 한곳에서
                확인합니다. (저장된 localStorage 기준)
              </p>
            </div>

            <div className="brandAll-actions">
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
                onClick={() => navigate("/brandconsulting")}
              >
                브랜드 컨설팅 홈
              </button>
            </div>
          </div>

          <div className="brandAll-grid">
            {/* Left */}
            <section className="brandAll-left">
              {results.map((svc) => {
                const saved = svc.saved;
                const form = saved?.form || {};
                const lastSaved = fmtDate(saved?.updatedAt);

                return (
                  <article className="card brandAll-card" key={svc.key}>
                    <div className="card__head brandAll-cardHead">
                      <div>
                        <h2 className="brandAll-cardTitle">{svc.title}</h2>
                        <p className="brandAll-cardDesc">{svc.desc}</p>
                      </div>

                      {saved ? (
                        <span className="status-pill success">완료</span>
                      ) : (
                        <span className="status-pill ghost">미진행</span>
                      )}
                    </div>

                    {!saved ? (
                      <div className="brandAll-empty">
                        <p className="brandAll-emptyText">
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
                        <div className="brandAll-meta">
                          <div className="brandAll-metaRow">
                            <span className="k">마지막 저장</span>
                            <span className="v">{lastSaved}</span>
                          </div>
                        </div>

                        <div className="brandAll-summary">
                          {svc.summary.map((key) => {
                            const value =
                              key === "stage"
                                ? stageLabel(form.stage)
                                : pick(form, key);
                            return (
                              <div className="brandAll-sItem" key={key}>
                                <div className="k">{key}</div>
                                <div className="v">{value}</div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="brandAll-cardActions">
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
                              // ✅ “해당 서비스 결과만 초기화”
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
            <aside className="brandAll-right">
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

                <h4 className="sideSubTitle">빠른 이동</h4>
                <div className="jumpGrid">
                  {results.map((svc) => (
                    <button
                      key={svc.key}
                      type="button"
                      className="jumpBtn"
                      onClick={() => {
                        const el = document.getElementById(`svc-${svc.key}`);
                        if (el)
                          el.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        else {
                          // fallback: 첫 카드부터
                          const first =
                            document.querySelector(".brandAll-card");
                          if (first)
                            first.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                        }
                      }}
                    >
                      {svc.title}
                    </button>
                  ))}
                </div>

                <div className="divider" />

                <button
                  type="button"
                  className="btn primary w100"
                  onClick={() => navigate("/brandconsulting")}
                >
                  브랜드 컨설팅 홈으로
                </button>

                <p className="hint">
                  * 이 페이지는 localStorage에 저장된
                  결과(brandInterview_*_v1)가 있을 때만 “완료”로 표시됩니다.
                </p>
              </div>
            </aside>
          </div>

          {/* id 부여(빠른 이동) */}
          <div style={{ display: "none" }}>
            {results.map((svc) => (
              <div key={svc.key} id={`svc-${svc.key}`} />
            ))}
          </div>
        </div>
      </main>

      <SiteFooter onOpenPolicy={setOpenType} />
    </div>
  );
}
