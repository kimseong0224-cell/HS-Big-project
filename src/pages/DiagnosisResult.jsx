// src/pages/DiagnosisResult.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

const DIAGNOSIS_RESULT_KEY = "diagnosisResult_v1";
const DIAGNOSIS_DRAFT_KEY = "diagnosisInterviewDraft_v1"; // 인터뷰 폼(회사명/문제/페르소나 등)
const HOME_SUMMARY_KEY = "diagnosisDraft"; // 진행상태(퍼센트/완료개수/마지막저장 등)

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const INDUSTRY_OPTIONS = [
  { value: "saas_platform", label: "SaaS/플랫폼" },
  { value: "commerce", label: "커머스" },
  { value: "healthcare", label: "헬스케어" },
  { value: "education", label: "교육" },
];

const STAGE_OPTIONS = [
  { value: "idea", label: "아이디어 단계" },
  { value: "mvp", label: "MVP 개발 중" },
  { value: "early_revenue", label: "초기 매출 발생" },
  { value: "scaleup", label: "스케일업" },
];

const PERSONA_OPTIONS = [
  { value: "trend_2030", label: "2030 트렌드 세터" },
  { value: "worker_3040", label: "3040 직장인" },
  { value: "startup_ceo", label: "초기 스타트업 대표" },
  { value: "mid_team_lead", label: "중견기업 팀장" },
  { value: "professional", label: "전문직" },
];

const getLabel = (value, options) => {
  const v = String(value || "").trim();
  if (!v) return "";
  return options.find((o) => o.value === v)?.label || v;
};

export default function DiagnosisResult({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 약관/방침 모달(기존 페이지들과 톤 통일)
  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  // ✅ state 우선
  const state = location.state || {};

  // ✅ 결과(localStorage)
  const storedResult = useMemo(() => {
    return safeParse(localStorage.getItem(DIAGNOSIS_RESULT_KEY));
  }, []);

  // ✅ 인터뷰 폼(localStorage) -> 요약 카드에 사용
  const storedDraft = useMemo(() => {
    return safeParse(localStorage.getItem(DIAGNOSIS_DRAFT_KEY));
  }, []);

  // ✅ 홈 진행 요약(localStorage) -> 우측 진행상태 카드에 사용
  const storedSummary = useMemo(() => {
    return safeParse(localStorage.getItem(HOME_SUMMARY_KEY));
  }, []);

  // ✅ 결과 데이터 우선순위: state → localStorage
  const brandId =
    state.brandId ?? storedResult?.brandId ?? storedResult?.id ?? null;

  const interviewReport =
    state.interviewReport ??
    storedResult?.interviewReport ??
    storedResult?.report ??
    storedResult ??
    null;

  // ✅ 백 응답이 { interviewReport: {...}, brandId } 형태로 한 번 감싸진 경우 방어
  const normalizedReport = interviewReport?.interviewReport
    ? interviewReport.interviewReport
    : interviewReport;

  // ✅ 백에서 내려온 핵심 결과
  const aiStage = String(normalizedReport?.stage ?? "").trim();
  const aiSummary = String(normalizedReport?.summary ?? "").trim();
  const aiTodo = Array.isArray(normalizedReport?.todo)
    ? normalizedReport.todo
    : [];

  const hasAI = Boolean(aiStage || aiSummary || aiTodo.length);

  // ✅ 인터뷰 입력값(요약/고객문제 섹션에 표시)
  const draftForm = storedDraft?.form || {};
  const companyName = String(draftForm.companyName || "").trim();
  const oneLine = String(draftForm.oneLine || "").trim();

  const industryLabel =
    getLabel(draftForm.industry, INDUSTRY_OPTIONS) ||
    String(draftForm.industry || "").trim();

  const stageLabel =
    getLabel(draftForm.stage, STAGE_OPTIONS) ||
    String(draftForm.stage || "").trim();

  const personaLabel =
    getLabel(draftForm.targetPersona, PERSONA_OPTIONS) ||
    String(draftForm.targetPersona || "").trim();

  const customerProblem = String(draftForm.customerProblem || "").trim();

  // ✅ 우측 진행상태(저장된 summary가 있으면 그걸 우선 사용)
  const progress =
    typeof storedSummary?.progress === "number"
      ? storedSummary.progress
      : hasAI
        ? 100
        : 0;

  const completedRequired =
    typeof storedSummary?.completedRequired === "number"
      ? storedSummary.completedRequired
      : null;

  const requiredTotal =
    typeof storedSummary?.requiredTotal === "number"
      ? storedSummary.requiredTotal
      : null;

  const stageStatusLabel = String(storedSummary?.stageLabel || "").trim();
  const lastSaved = storedSummary?.updatedAt
    ? new Date(storedSummary.updatedAt).toLocaleString()
    : "-";

  const handleEdit = () => {
    // ✅ “입력 수정하기” 느낌: 인터뷰로 돌아가서 미완성 섹션으로 스크롤(Interview에 resume 로직 있음)
    navigate("/diagnosisinterview", { state: { mode: "resume" } });
  };

  const handleReset = () => {
    // ✅ “처음부터 다시하기(초기화)”
    try {
      localStorage.removeItem(DIAGNOSIS_RESULT_KEY);
      localStorage.removeItem(DIAGNOSIS_DRAFT_KEY);
      localStorage.removeItem(HOME_SUMMARY_KEY);
    } catch {
      // ignore
    }
    navigate("/diagnosisinterview", { replace: true });
  };

  const handleGoNext = () => {
    // 다음 단계: 브랜드 컨설팅으로 이동(brandId 같이 넘겨주면 이후 /brands/{brandId}/naming 등에 사용 가능)
    navigate("/brandconsulting", { state: { brandId } });
  };

  return (
    <div className="diagResult">
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

      <main className="diagResult__main">
        <div className="diagResult__container">
          {/* ✅ 상단 타이틀 + 버튼 (스크린샷 느낌) */}
          <div className="diagResult__titleRow">
            <div>
              <h1 className="diagResult__title">초기 진단 결과 리포트</h1>
              <p className="diagResult__sub">
                입력 내용을 기반으로 요약 리포트를 생성했습니다.
                {brandId ? ` (brandId: ${brandId})` : ""}
              </p>
            </div>

            <div className="diagResult__actions">
              <button
                type="button"
                className="btn ghost"
                onClick={() => navigate("/diagnosis")}
              >
                진단 홈
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => navigate("/diagnosisinterview")}
              >
                인터뷰로 돌아가기
              </button>
            </div>
          </div>

          {/* ✅ 좌/우 2컬럼 (스크린샷 구조) */}
          <div className="diagResult__grid">
            {/* ---------------- LEFT ---------------- */}
            <section className="diagResult__left">
              {/* 1) 요약 */}
              <div className="card">
                <div className="card__head">
                  <h2>요약</h2>
                  <p>핵심 정보만 빠르게 확인합니다.</p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginTop: 10,
                  }}
                >
                  <div className="card" style={{ margin: 0, padding: 14 }}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      회사/프로젝트명
                    </div>
                    <div style={{ marginTop: 6, fontWeight: 700 }}>
                      {companyName || "-"}
                    </div>
                  </div>

                  <div className="card" style={{ margin: 0, padding: 14 }}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      산업 카테고리
                    </div>
                    <div style={{ marginTop: 6, fontWeight: 700 }}>
                      {industryLabel || "-"}
                    </div>
                  </div>

                  <div className="card" style={{ margin: 0, padding: 14 }}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>성장 단계</div>
                    <div style={{ marginTop: 6, fontWeight: 700 }}>
                      {stageLabel || "-"}
                    </div>
                  </div>

                  <div className="card" style={{ margin: 0, padding: 14 }}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>한 줄 정의</div>
                    <div style={{ marginTop: 6, fontWeight: 700 }}>
                      {oneLine || "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2) AI 진단 결과 */}
              <div className="card" style={{ marginTop: 14 }}>
                <div className="card__head">
                  <h2>AI 진단 결과</h2>
                  <p>백엔드에서 생성된 AI 요약/리포트를 표시합니다.</p>
                </div>

                {!hasAI ? (
                  <div style={{ marginTop: 10 }}>
                    <p style={{ opacity: 0.8 }}>
                      아직 AI 결과가 없습니다. 인터뷰에서 “AI 요약 결과 보기”를
                      다시 시도해 주세요.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 12, marginTop: 10 }}>
                    <div className="card" style={{ margin: 0, padding: 14 }}>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>리포트</div>
                      <div style={{ marginTop: 6 }}>
                        {aiSummary || "AI 인터뷰 진단 결과"}
                      </div>
                    </div>

                    <div className="card" style={{ margin: 0, padding: 14 }}>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        현재 단계
                      </div>
                      <div style={{ marginTop: 6 }}>{aiStage || "-"}</div>
                    </div>

                    <div className="card" style={{ margin: 0, padding: 14 }}>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        추천 TODO
                      </div>
                      <div style={{ marginTop: 6 }}>
                        {aiTodo.length === 0 ? (
                          "-"
                        ) : (
                          <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {aiTodo.map((t, idx) => (
                              <li key={`${t}-${idx}`}>{t}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3) 고객/문제 */}
              <div className="card" style={{ marginTop: 14 }}>
                <div className="card__head">
                  <h2>고객/문제</h2>
                  <p>문제 정의가 명확할수록 다음 단계 추천이 정교해집니다.</p>
                </div>

                <div style={{ display: "grid", gap: 12, marginTop: 10 }}>
                  <div className="card" style={{ margin: 0, padding: 14 }}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      타겟 고객/페르소나
                    </div>
                    <div style={{ marginTop: 6 }}>{personaLabel || "-"}</div>
                  </div>

                  <div className="card" style={{ margin: 0, padding: 14 }}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>핵심 문제</div>
                    <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                      {customerProblem || "-"}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ---------------- RIGHT ---------------- */}
            <aside className="diagResult__right">
              {/* 진행/상태 카드 */}
              <div className="sideCard">
                <div className="sideCard__titleRow">
                  <h3>진행/상태</h3>
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
                    <span className="k">현재 단계</span>
                    <span className="v">{stageStatusLabel || "완료"}</span>
                  </div>

                  <div className="sideMeta__row">
                    <span className="k">필수 완료</span>
                    <span className="v">
                      {completedRequired != null && requiredTotal != null
                        ? `${completedRequired}/${requiredTotal}`
                        : "-"}
                    </span>
                  </div>

                  <div className="sideMeta__row">
                    <span className="k">마지막 저장</span>
                    <span className="v">{lastSaved}</span>
                  </div>
                </div>

                <div className="divider" />

                <button type="button" className="btn" onClick={handleEdit}>
                  입력 수정하기
                </button>

                <button
                  type="button"
                  className="btn ghost"
                  style={{ marginTop: 10 }}
                  onClick={handleReset}
                >
                  처음부터 다시하기(초기화)
                </button>

                <p className="hint" style={{ marginTop: 10 }}>
                  * AI 결과는 인터뷰 페이지에서 “AI 요약 결과 보기” 요청이
                  성공하면 표시됩니다.
                </p>
              </div>

              {/* 다음 단계 카드 */}
              <div className="sideCard" style={{ marginTop: 14 }}>
                <div className="sideCard__titleRow">
                  <h3>다음 단계</h3>
                  <span className="badge">완료</span>
                </div>

                <p style={{ marginTop: 10, lineHeight: 1.5 }}>
                  기업 진단이 완료되었습니다.
                  <br />
                  이제 브랜드 컨설팅에서 네이밍 · 컨셉 · 로고 · 스토리까지
                  이어서 도와드릴게요.
                </p>

                <button
                  type="button"
                  className="btn primary"
                  style={{ width: "100%", marginTop: 12 }}
                  onClick={handleGoNext}
                >
                  브랜드 컨설팅으로 이동
                </button>

                <p className="hint" style={{ marginTop: 10 }}>
                  * 다음 단계에서 선택한 컨설팅 입력값이 최종 결과물에
                  반영됩니다.
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
