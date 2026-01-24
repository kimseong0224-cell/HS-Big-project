// src/pages/BrandConsulting.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import bannerImage from "../Image/banner_image/Banner.png";
import Logocon from "../Image/brandcon_image/logocon.png";
import namecon from "../Image/brandcon_image/namecon.png";
import pagecon from "../Image/brandcon_image/pagecon.png"; // ✅ story에서도 이 png 재사용

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

import SiteFooter from "../components/SiteFooter.jsx";
import SiteHeader from "../components/SiteHeader.jsx";

/**
 * [BrandConsulting] 브랜드 컨설팅 허브(랜딩) 페이지
 * ------------------------------------------------------------
 * ✅ 화면 목적
 * - 브랜드 컨설팅의 "전체 과정"(네이밍 → 컨셉 → 브랜드 스토리 → 로고)을 소개하고
 * - "브랜드 컨설팅 시작하기" 버튼으로 1단계(네이밍)부터 순차 진행
 *
 * ✅ 현재 프론트 구현 상태
 * - 서비스 과정 소개/설명은 정적(하드코딩)
 * - MainPage에서 location.state.section을 받아올 수 있음(선택 메뉴 강조 같은 용도)
 * - 약관/개인정보 모달 UI 포함
 *
 * ✅ BACKEND 연동 포인트(핵심)
 * 1) "로그인 상태/권한" 체크
 *   - 서비스는 로그인 사용자만 가능하다면:
 *     - 이 페이지 진입 시 또는 카드 클릭 시 토큰 유효성 확인 필요
 *     - 미로그인이라면 /login으로 리다이렉트
 *
 * 2) 서비스별 "진행중 draft/히스토리" 연동
 *   - 카드 클릭 시:
 *     - (선택) 서버에서 최근 draft 존재 여부 확인 후
 *       - "이어서 진행" / "새로 시작" 선택 UI를 띄울 수 있음
 *     - (또는) 인터뷰 페이지에서 draft를 조회하도록 위임할 수도 있음
 *
 * 3) 서비스 목록을 "서버에서 내려받는 방식"으로 확장 가능
 *   - 예: GET /services/brand -> 카드 목록(이름/설명/이미지/활성여부)
 *   - 지금은 하드코딩이라 백 연동 없어도 동작하지만,
 *     추후 A/B, 기능 ON/OFF(Feature flag) 등을 하려면 서버화가 편함
 */

export default function BrandConsulting({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  // =========================================================
  // ✅ 개인정보/이용약관 모달 상태
  // - openType: "privacy" | "terms" | null
  // =========================================================
  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  // =========================================================
  // ✅ MainPage에서 state.section 받을 수 있음 (logo / naming / homepage / story)
  // - 현재는 "표시용"으로만 사용(주석 처리된 부분)
  // - pickedSection이 있으면 해당 서비스 카드 강조/스크롤 등도 가능
  //
  // BACKEND:
  // - 일반적으로는 프론트 라우팅 state로 충분
  // - 다만 “유저 선호/최근 사용 서비스” 같은 개인화는 서버 데이터가 될 수 있음
  // =========================================================
  const pickedSection = location.state?.section || null;

  // =========================================================
  // ✅ (프론트 기준) 브랜드 컨설팅 '완료' 여부 판단
  // - 로그인/유저ID 기반으로 서버에서 판단하는 것이 정석이지만,
  //   현재는 localStorage에 저장된 4단계 선택 결과를 기준으로 판별
  // =========================================================
  const isBrandConsultingCompleted = useMemo(() => {
    const keys = [
      "brandInterview_naming_v1",
      "brandInterview_homepage_v1", // ✅ 컨셉(홈페이지 키를 재사용)
      "brandInterview_story_v1",
      "brandInterview_logo_v1",
    ];

    const read = (k) => {
      try {
        const raw = localStorage.getItem(k);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch {
        return null;
      }
    };

    const hasSelection = (obj) => Boolean(obj?.selectedId || obj?.selected);

    return keys.every((k) => hasSelection(read(k)));
  }, []);

  // labelMap: 섹션 값을 한국어 라벨로 변환(표시용)
  const labelMap = {
    logo: "로고 컨설팅",
    naming: "네이밍 컨설팅",
    homepage: "컨셉 컨설팅",
    story: "브랜드 스토리 컨설팅",
  };

  // =========================================================
  // ✅ 컨설팅 진행 순서(소개용)
  // - 실제 인터뷰 페이지 이동도 이 순서를 따름
  // =========================================================
  const steps = useMemo(
    () => [
      {
        key: "naming",
        title: "네이밍",
        sub: "기억되고, 검색되고, 확장 가능한 이름 3안을 제안",
        img: namecon,
        tag: "Naming",
      },
      {
        key: "concept",
        title: "컨셉",
        sub: "브랜드 방향/톤/차별점을 한 문장으로 정리해주는 컨셉 3안",
        img: pagecon,
        tag: "Concept",
      },
      {
        key: "story",
        title: "브랜드 스토리",
        sub: "시작 계기 → 문제 → 해결 흐름으로 설득력 있는 스토리 3안",
        img: pagecon,
        tag: "Story",
      },
      {
        key: "logo",
        title: "로고",
        sub: "컨셉/스토리에 맞춘 로고 방향(워드마크/심볼 등) 3안",
        img: Logocon,
        tag: "Logo",
      },
    ],
    [],
  );

  // =========================================================
  // ✅ 브랜드 컨설팅 시작하기
  // - 1단계(네이밍 인터뷰)부터 순차 진행
  // =========================================================
  const handleStart = () => {
    // TODO(BACKEND - 선택): 로그인 체크 / 이어서 진행 여부 확인
    // const token = localStorage.getItem("accessToken");
    // if (!token) return navigate("/login", { state: { from: "/brandconsulting" } });

    navigate("/brand/naming/interview", { state: { flow: "brand" } });
  };

  // =========================================================
  // ✅ 완료한 유저용: 최종 리포트(통합 결과) 바로 보기
  // - 완료 기준: 4단계 모두 '선택'이 저장되어 있을 때
  // =========================================================
  const handleViewFinalReport = () => {
    if (!isBrandConsultingCompleted) {
      alert("브랜드 컨설팅 4단계를 모두 완료하면 최종 리포트를 볼 수 있어요.");
      return;
    }
    navigate("/mypage/brand-results");
  };

  return (
    <div className="brand-page">
      {/* =====================================================
          ✅ 약관/개인정보 모달
          - SiteFooter에서도 onOpenPolicy로 열 수 있음(다른 페이지들과 패턴 통일)
         ===================================================== */}
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
      <SiteHeader onLogout={onLogout} />

      {/* =====================================================
          ✅ Hero 섹션(배너 + 캐러셀 텍스트)
          - 현재는 정적 UI (백 연동 불필요)
          - 추후 "공지/이벤트/추천 서비스"를 서버에서 내려주려면 연동 포인트
         ===================================================== */}
      <section className="brand-hero">
        <div className="brand-hero-inner">
          <div className="hero-banner" aria-label="브랜딩 컨설팅 소개">
            <img
              src={bannerImage}
              alt="브랜딩 컨설팅 배너"
              className="hero-banner-image"
            />
            <div className="hero-banner-text">
              <div className="bcHero">
                <p className="bcHero__pill">AI Brand Consulting</p>
                <h1 className="bcHero__title">브랜드 컨설팅</h1>
                <p className="bcHero__sub">
                  네이밍 → 컨셉 → 브랜드 스토리 → 로고 순서로 진행되며,
                  <br />
                  각 단계마다 <b>AI 컨설팅 3안</b> 중 하나를 선택해 기업 성장을
                  돕습니다.
                </p>

                {/* 상단(히어로) CTA 버튼은 중복으로 느껴질 수 있어 제거 */}
              </div>

              {/* =================================================
                  (선택) MainPage에서 넘어온 pickedSection 표시
                  - 현재 UI에서는 주석 처리되어 있음
                  - 원하면 여기서 선택 서비스 강조/안내 가능
                 ================================================= */}
              {/* {pickedSection ? (
                <div style={{ marginTop: 14, fontSize: 14, opacity: 0.9 }}>
                  선택된 메뉴: <b>{labelMap[pickedSection] ?? pickedSection}</b>
                </div>
              ) : null} */}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ✅ 서비스 카드 그리드
          - 클릭 시 해당 인터뷰로 이동
          - role="button" + tabIndex + Enter/Space 처리로 접근성 강화
          - 현재 하드코딩이지만, 나중에 서버에서 카드 리스트로 교체 가능
         ===================================================== */}
      <main className="brand-content">
        <h2 className="section-title">컨설팅 과정</h2>

        <div className="bcStepFlow" role="list" aria-label="브랜드 컨설팅 4단계 흐름">
          {steps.map((s, idx) => (
            <React.Fragment key={s.key}>
              <article className="service-card service-card--static bcStepCard" role="listitem">
                <div className="service-image">
                  <img src={s.img} alt={`${s.title} 예시 이미지`} />
                </div>
                <p className="service-tag">STEP {idx + 1} · {s.tag}</p>
                <h3>{s.title}</h3>
                <div className="service-meta">
                  <span>{s.sub}</span>
                </div>
                <div className="bcStepHint">
                  AI가 3안을 제안 → 1개 선택 → 다음 단계로
                </div>
              </article>

              {idx < steps.length - 1 ? (
                <div className="bcStepArrow" aria-hidden="true">
                  <span className="bcStepArrow__icon">→</span>
                </div>
              ) : null}
            </React.Fragment>
          ))}
        </div>

        <div className="bcIntroCard">
          <div className="bcIntroCard__left">
            <h3>한 번의 흐름으로 브랜드를 정리합니다</h3>
            {pickedSection ? (
              <p className="bcPicked">
                메인에서 선택한 메뉴: <b>{labelMap[pickedSection] ?? pickedSection}</b>
                <span className="bcPicked__note"> · 브랜드 컨설팅은 4단계 순차 진행입니다.</span>
              </p>
            ) : null}
            <p>
              브랜드 컨설팅은 <b>네이밍 → 컨셉 → 브랜드 스토리 → 로고</b> 순서로
              진행됩니다. 각 단계에서 AI가 <b>3가지 컨설팅 결과</b>를 제안하고,
              사용자가 1개를 선택하면 다음 단계로 이어져 결과가 점점 구체화됩니다.
            </p>
            <ul className="bcBullets">
              <li>각 단계는 인터뷰 기반으로 진행되어 결과의 근거가 명확합니다.</li>
              <li>선택한 결과는 다음 단계의 입력으로 사용되어 일관성이 유지됩니다.</li>
              <li>마지막에는 4단계 결과를 한 번에 모아 리포트로 확인할 수 있습니다.</li>
            </ul>
          </div>

          <div className="bcIntroCard__right">
            <div className="bcMiniFlow">
              <span className="bcMiniFlow__dot" />
              <span>4단계 진행</span>
              <span className="bcMiniFlow__sep">·</span>
              <span>단계별 3안 제안</span>
            </div>
            <div className="bcIntroCard__actions">
              <button type="button" className="btn primary" onClick={handleStart}>
                브랜드 컨설팅 시작하기
              </button>

              <button
                type="button"
                className={`btn ghost ${isBrandConsultingCompleted ? "" : "disabled"}`}
                onClick={handleViewFinalReport}
                disabled={!isBrandConsultingCompleted}
              >
                완료한 브랜드 리포트 보기
              </button>

              {!isBrandConsultingCompleted ? (
                <p className="bcIntroHint">* 4단계를 완료한 경우에만 열 수 있어요.</p>
              ) : null}
            </div>
          </div>
        </div>

        <p className="bcBottomCTA__hint" style={{ marginTop: 18 }}>
          * 시작 후에는 각 인터뷰 화면 상단의 “전체 단계 표시”에서 진행 상황을 확인할 수 있어요.
        </p>
      </main>

      {/* ✅ 공통 푸터 (약관 모달 열기 콜백 전달) */}
      <SiteFooter onOpenPolicy={setOpenType} />
    </div>
  );
}
