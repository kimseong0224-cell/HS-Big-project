// src/pages/BrandConsultingResult.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

const KEY_MAP = {
  logo: "brandInterview_logo_v1",
  naming: "brandInterview_naming_v1",
  homepage: "brandInterview_homepage_v1",
};

const LABEL_MAP = {
  logo: "로고 컨설팅",
  naming: "네이밍 컨설팅",
  homepage: "홈페이지 컨설팅",
};

const INTERVIEW_ROUTE = {
  logo: "/logoconsulting",
  naming: "/nameconsulting",
  homepage: "/homepageconsulting",
};

export default function BrandConsultingResult({ onLogout }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ 약관/방침 모달
  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  // ✅ service=logo|naming|homepage
  const service = useMemo(() => {
    const s = searchParams.get("service");
    if (s === "logo" || s === "naming" || s === "homepage") return s;
    return "logo";
  }, [searchParams]);

  const storageKey = KEY_MAP[service];
  const title = LABEL_MAP[service];

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

  // ✅ 더미 추천(나중에 AI 결과로 교체)
  const recommendations = useMemo(() => {
    const out = [];

    if (service === "logo") {
      const brand = String(form?.brandName || "").trim();
      const vibe = String(form?.vibe || "").trim();
      const usage = String(form?.usage || "").trim();
      const avoid = String(form?.avoid || "").trim();

      out.push(
        brand
          ? `브랜드명(${brand}) 기준으로, 심볼/워드마크/콤비네이션 중 1순위를 먼저 결정해요.`
          : "브랜드명을 먼저 확정하면 로고 방향(워드마크/심볼)이 빨라져요."
      );
      out.push(
        vibe
          ? `원하는 톤(${vibe})에 맞게 ‘컬러 2~3개 + 폰트 1개’를 먼저 고정하면 통일감이 생겨요.`
          : "원하는 분위기(키워드 3개)를 먼저 정하면 시안 품질이 좋아져요."
      );
      out.push(
        usage
          ? `사용처(${usage})별로 최소 사이즈(파비콘/앱아이콘/명함)를 고려해 가독성을 확보해요.`
          : "사용처(웹/앱/인쇄/간판)를 정하면 규격 대응이 쉬워요."
      );
      if (avoid)
        out.push(
          "‘피하고 싶은 요소’를 금지 리스트로 유지하면 시안 품질이 빨리 올라가요."
        );
    }

    if (service === "naming") {
      const concept = String(form?.concept || "").trim();
      const target = String(form?.target || "").trim();
      const style = String(form?.style || "").trim();
      const avoid = String(form?.avoid || "").trim();

      out.push(
        concept
          ? `컨셉(${concept})을 1문장으로 줄인 뒤, 핵심 키워드 3개를 뽑아 네이밍 후보군을 확장해요.`
          : "컨셉을 1문장으로 정리하면 네이밍 후보가 빨리 나와요."
      );
      out.push(
        target
          ? `타깃(${target})이 ‘발음/기억/검색’하기 쉬운 길이(2~4음절 권장)를 우선으로 잡아요.`
          : "타깃이 정해지면 발음 난이도/길이 기준이 명확해져요."
      );
      out.push(
        style
          ? `원하는 스타일(${style})에 맞게 ‘한글/영문/혼합’ 전략을 먼저 정해요.`
          : "한글/영문/혼합 중 한 방향을 먼저 고르면 후보가 정리돼요."
      );
      if (avoid)
        out.push("피하고 싶은 단어/뉘앙스를 미리 적어두면 리스크가 줄어요.");
    }

    if (service === "homepage") {
      const goal = String(form?.goal || "").trim();
      const target = String(form?.target || "").trim();
      const pages = String(form?.pages || "").trim();
      const avoid = String(form?.avoid || "").trim();

      out.push(
        goal
          ? `홈페이지 목표(${goal})를 ‘전환’ 기준으로 정의하면 구조가 깔끔해져요. (예: 문의/신청/구매)`
          : "홈페이지 목표(문의/신청/구매/다운로드)를 먼저 확정해요."
      );
      out.push(
        target
          ? `타깃(${target})이 궁금해하는 ‘문제 → 해결 → 근거’ 순서로 섹션을 배치해요.`
          : "타깃이 궁금해하는 질문 순서대로 섹션을 정하면 좋아요."
      );
      out.push(
        pages
          ? `필요 페이지(${pages}) 기준으로 MVP 구조(홈/소개/서비스/문의)를 먼저 만들고 확장해요.`
          : "필요 페이지 목록을 먼저 뽑으면 와이어프레임이 빨라져요."
      );
      if (avoid)
        out.push(
          "피하고 싶은 요소는 디자인 금지 리스트로 유지하면 통일감이 생겨요."
        );
    }

    if (out.length === 0)
      out.push("입력 데이터가 부족해요. 인터뷰를 먼저 채워주세요.");
    return out;
  }, [service, form]);

  const handleGoInterview = () => navigate(INTERVIEW_ROUTE[service]);
  const handleGoBrandHome = () => navigate("/brandconsulting");

  const handleReset = () => {
    localStorage.removeItem(storageKey);
    alert("해당 브랜드 컨설팅 인터뷰 데이터를 초기화했습니다.");
    navigate(INTERVIEW_ROUTE[service], { state: { reset: true } });
  };

  return (
    <div className="brandResult">
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

      <main className="brandResult__main">
        <div className="brandResult__container">
          <div className="brandResult__titleRow">
            <div>
              <h1 className="brandResult__title">{title} 결과 리포트</h1>
              <p className="brandResult__sub">
                인터뷰 입력을 기반으로 결과 요약을 보여줍니다. (현재는 UI/연결용
                더미 리포트)
              </p>
            </div>

            <div className="brandResult__topActions">
              <button
                type="button"
                className="btn ghost"
                onClick={handleGoBrandHome}
              >
                브랜드 컨설팅 홈
              </button>
              <button type="button" className="btn" onClick={handleGoInterview}>
                인터뷰로 돌아가기
              </button>
            </div>
          </div>

          <div className="brandResult__grid">
            {/* left */}
            <section className="brandResult__left">
              <div className="card">
                <div className="card__head">
                  <h2>입력 요약</h2>
                  <p>작성한 답변을 그대로 보여줍니다.</p>
                </div>

                <div className="qa">
                  {/* 공통 키로 최대한 보여주기(페이지별 form 구조가 달라도 깨지지 않게) */}
                  <div className="qa__item">
                    <div className="q">주요 입력</div>
                    <div className="a">
                      {Object.keys(form || {}).length === 0
                        ? "—"
                        : JSON.stringify(form, null, 2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card__head">
                  <h2>추천 요약(더미)</h2>
                  <p>실제 AI 결과가 들어갈 자리입니다.</p>
                </div>

                <ul className="recoList">
                  {recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>

                <div className="note">
                  * 다음 단계로 “시안 생성 / 후보명 생성 / 와이어프레임 제안”
                  등을 붙이면 완성됩니다.
                </div>
              </div>
            </section>

            {/* right sticky */}
            <aside className="brandResult__right">
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
