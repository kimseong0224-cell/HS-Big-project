// src/pages/InvestmentBoard.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

export default function InvestmentBoard({ onLogout }) {
  const navigate = useNavigate();

  // ✅ 약관/방침 모달
  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  // ✅ 검색/필터
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("all");
  const [sort, setSort] = useState("popular"); // popular | newest

  // ✅ 더미 데이터 (나중에 API로 교체)
  const items = useMemo(
    () => [
      {
        id: "seltasq",
        name: "셀타스퀘어",
        oneLiner: "AI 전구약 알림 서비스 · AI CRO",
        stage: "Series A",
        location: "서울",
        tags: ["AI헬스", "B2C"],
        amount: "92억+ TIPS",
        status: "투자 완료",
        popularity: 98,
        updatedAt: "2026-01-10",
      },
      {
        id: "linkflow",
        name: "링크플로우",
        oneLiner: "인공지능(AI) 웨어러블 전문",
        stage: "Series B",
        location: "경기",
        tags: ["AI", "웨어러블"],
        amount: "409억",
        status: "라운드 준비",
        popularity: 91,
        updatedAt: "2026-01-12",
      },
      {
        id: "beamworks",
        name: "빔웍스",
        oneLiner: "초음파 AI 진단 센서 기반 헬스케어",
        stage: "Pre-IPO",
        location: "대전",
        tags: ["헬스케어", "AI"],
        amount: "170억",
        status: "투자 완료",
        popularity: 86,
        updatedAt: "2026-01-08",
      },
      {
        id: "novaleaf",
        name: "노바리프",
        oneLiner: "친환경 소재 기반 패키징 솔루션",
        stage: "Seed",
        location: "부산",
        tags: ["그린테크", "제조혁신"],
        amount: "18억",
        status: "투자 완료",
        popularity: 77,
        updatedAt: "2026-01-05",
      },
      {
        id: "bioloop",
        name: "바이오루프",
        oneLiner: "정밀 건강관리 바이오 데이터 플랫폼",
        stage: "Series A",
        location: "서울",
        tags: ["바이오", "데이터"],
        amount: "65억",
        status: "진행 중",
        popularity: 82,
        updatedAt: "2026-01-14",
      },
      {
        id: "cloudwave",
        name: "클라우드웨이브",
        oneLiner: "제조 특화 SaaS 운영 자동화",
        stage: "Series B",
        location: "대구",
        tags: ["SaaS", "제조"],
        amount: "210억",
        status: "투자 완료",
        popularity: 79,
        updatedAt: "2026-01-03",
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    let out = items.filter((it) => {
      const hit =
        !keyword ||
        it.name.toLowerCase().includes(keyword) ||
        it.oneLiner.toLowerCase().includes(keyword) ||
        it.tags.join(" ").toLowerCase().includes(keyword);

      const stageOk = stage === "all" ? true : it.stage === stage;
      return hit && stageOk;
    });

    if (sort === "newest") {
      out = out.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    } else {
      out = out.sort((a, b) => b.popularity - a.popularity);
    }

    return out;
  }, [items, q, stage, sort]);

  const stageOptions = [
    "all",
    "Seed",
    "Pre A",
    "Series A",
    "Series B",
    "Pre-IPO",
  ];

  return (
    <div className="invest-page">
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

      <SiteHeader onLogout={onLogout} />

      <main className="invest-main">
        <section className="invest-hero">
          <div className="invest-hero-inner">
            <div>
              <h1 className="invest-title">투자 라운지</h1>
              <p className="invest-sub">
                스타트업 투자유치/성과 정보를 한곳에서 확인하세요. (현재는 더미
                데이터)
              </p>
            </div>

            <div className="invest-hero-actions">
              <button
                type="button"
                className="btn ghost"
                onClick={() => navigate("/main")}
              >
                메인으로
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => alert("등록 기능 (준비중)")}
              >
                게시글 등록
              </button>
            </div>
          </div>

          <div className="invest-toolbar">
            <div className="invest-search">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="회사명/키워드/태그로 검색"
                aria-label="투자유치 게시판 검색"
              />
            </div>

            <div className="invest-controls">
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                aria-label="단계 필터"
              >
                {stageOptions.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "전체 단계" : s}
                  </option>
                ))}
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="정렬"
              >
                <option value="popular">인기순</option>
                <option value="newest">최신순</option>
              </select>
            </div>
          </div>

          <div className="invest-chips">
            {stageOptions.map((s) => (
              <button
                key={s}
                type="button"
                className={`chip ${stage === s ? "is-active" : ""}`}
                onClick={() => setStage(s)}
              >
                {s === "all" ? "전체" : s}
              </button>
            ))}
          </div>
        </section>

        <section className="invest-grid" aria-label="투자유치 게시글 목록">
          {filtered.map((it) => (
            <article
              key={it.id}
              className="invest-card"
              role="button"
              tabIndex={0}
              onClick={() => alert(`${it.name} 상세 페이지 (준비중)`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  alert(`${it.name} 상세 페이지 (준비중)`);
              }}
            >
              <div className="invest-card-head">
                <div className="invest-logo" aria-hidden="true">
                  {it.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="invest-head-text">
                  <h3>{it.name}</h3>
                  <p>{it.oneLiner}</p>
                </div>
              </div>

              <div className="invest-meta">
                <span className="pill">{it.stage}</span>
                <span className="pill ghost">{it.location}</span>
                <span
                  className={`pill ${it.status === "투자 완료" ? "success" : "warning"}`}
                >
                  {it.status}
                </span>
              </div>

              <div className="invest-tags">
                {it.tags.map((t) => (
                  <span key={t}>#{t}</span>
                ))}
              </div>

              <div className="invest-footer">
                <strong>{it.amount}</strong>
                <span className="arrow">↗</span>
              </div>

              <div className="invest-updated">업데이트: {it.updatedAt}</div>
            </article>
          ))}
        </section>
      </main>

      <SiteFooter onOpenPolicy={setOpenType} />
    </div>
  );
}
