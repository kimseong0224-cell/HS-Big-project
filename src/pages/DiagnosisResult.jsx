// src/pages/DiagnosisResult.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

const STORAGE_KEY = "diagnosisInterviewDraft_v1";
const HOME_PROGRESS_KEY = "diagnosisDraft";

const INDUSTRY_OPTIONS = [
  { value: "saas", label: "SaaS/플랫폼" },
  { value: "manufacturing", label: "제조/하드웨어" },
  { value: "commerce", label: "커머스" },
  { value: "education", label: "교육" },
  { value: "healthcare", label: "헬스케어" },
  { value: "finance", label: "금융" },
  { value: "content", label: "콘텐츠/미디어" },
  { value: "mobility", label: "모빌리티/운송" },
  { value: "etc", label: "기타" },
];

const STAGE_OPTIONS = [
  { value: "idea", label: "아이디어 단계" },
  { value: "mvp", label: "MVP 개발/테스트 중" },
  { value: "early_revenue", label: "초기 매출 발생" },
  { value: "pmf", label: "PMF 탐색" },
  { value: "scaleup", label: "스케일업" },
];

const PERSONA_OPTIONS = [
  { value: "trend_2030", label: "2030 트렌드 세터" },
  { value: "worker_3040", label: "3040 직장인" },
  { value: "startup_ceo", label: "초기 스타트업 대표" },
  { value: "mid_manager", label: "중견기업 팀장" },
  { value: "professional", label: "전문직(의/법/회계 등)" },
  { value: "student", label: "학생/취준생" },
  { value: "etc", label: "기타" },
];

const getLabel = (value, options) => {
  const v = String(value || "").trim();
  if (!v) return "-";
  const found = options.find((o) => o.value === v);
  return found ? found.label : v;
};

export default function DiagnosisResult({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ DiagnosisInterview에서 넘겨준 next 경로(없으면 기본값)
  const nextPath = String(location.state?.next || "/brandconsulting");

  // ✅ 약관/방침 모달 UI
  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  // ✅ draft 로딩 (현재는 localStorage)
  const draft = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const form = draft?.form || {};

  // ✅ 리포트 표시용 값 꺼내기 + 레거시 키 대응
  const oneLine = String(form?.oneLine || "").trim();
  const industry = String(form?.industry || "").trim();
  const stage = String(form?.stage || "").trim();
  const customerProblem = String(form?.customerProblem || "").trim();
  const usp = String(form?.usp || "").trim();

  const targetPersona = String(
    form?.targetPersona || form?.targetCustomer || "",
  ).trim();

  const visionHeadline = String(
    form?.visionHeadline || form?.goal12m || "",
  ).trim();

  // ✅ 필수 항목 기반 진행률 계산
  const requiredKeys = useMemo(
    () => [
      "oneLine",
      "industry",
      "stage",
      "customerProblem",
      "targetPersona",
      "usp",
      "visionHeadline",
    ],
    [],
  );

  const requiredStatus = useMemo(() => {
    const status = {};
    status.oneLine = Boolean(oneLine);
    status.industry = Boolean(industry);
    status.stage = Boolean(stage);
    status.customerProblem = Boolean(customerProblem);
    status.targetPersona = Boolean(targetPersona);
    status.usp = Boolean(usp);
    status.visionHeadline = Boolean(visionHeadline);
    return status;
  }, [
    oneLine,
    industry,
    stage,
    customerProblem,
    targetPersona,
    usp,
    visionHeadline,
  ]);

  const completedRequired = useMemo(
    () => requiredKeys.filter((k) => requiredStatus[k]).length,
    [requiredKeys, requiredStatus],
  );

  const progress = useMemo(() => {
    if (requiredKeys.length === 0) return 0;
    return Math.round((completedRequired / requiredKeys.length) * 100);
  }, [completedRequired, requiredKeys.length]);

  const isCompleted = progress === 100;

  const lastSaved = useMemo(() => {
    const t = draft?.updatedAt;
    if (!t) return "-";
    const d = new Date(t);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
  }, [draft]);

  // ✅ 옵션 라벨 변환
  const industryLabel = useMemo(
    () => getLabel(industry, INDUSTRY_OPTIONS),
    [industry],
  );

  const stageLabel = useMemo(() => {
    const s = String(stage || "");
    if (s === "revenue") return "매출 발생";
    if (s === "invest") return "투자 유치 진행";
    return getLabel(s, STAGE_OPTIONS);
  }, [stage]);

  const personaLabel = useMemo(
    () => getLabel(targetPersona, PERSONA_OPTIONS),
    [targetPersona],
  );

  const currentSectionLabel = useMemo(() => {
    if (!oneLine || !industry || !stage) return "비즈니스 정의";
    if (!customerProblem || !targetPersona) return "고객/문제";
    if (!usp) return "차별화 포인트";
    if (!visionHeadline) return "비전(5년)";
    return "완료";
  }, [
    oneLine,
    industry,
    stage,
    customerProblem,
    targetPersona,
    usp,
    visionHeadline,
  ]);

  // ✅ 프론트 룰 기반 더미 팁
  const tips = useMemo(() => {
    const out = [];

    if (oneLine.length < 20)
      out.push(
        "한 줄 정의가 너무 짧아요. ‘대상 + 문제 + 해결’ 형태로 더 구체화해보세요.",
      );
    if (customerProblem.length < 30)
      out.push(
        "핵심 문제를 ‘상황-불편-손실’ 구조로 더 디테일하게 적으면 분석이 좋아져요.",
      );
    if (usp.length < 30)
      out.push(
        "차별화 포인트를 경쟁사 비교 관점(속도/비용/품질/자동화)으로 강화해보세요.",
      );
    if (visionHeadline.length < 15)
      out.push(
        "5년 뒤 헤드라인은 조금 더 구체적으로(성과/규모/영향)를 포함하면 좋아요.",
      );

    if (out.length === 0)
      out.push(
        "입력이 탄탄해요. 다음 단계(네이밍/로고/홍보/웹사이트)로 확장하기 좋은 상태입니다.",
      );

    return out;
  }, [oneLine, customerProblem, usp, visionHeadline]);

  const handleResetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(HOME_PROGRESS_KEY);

    alert("진단 입력/진행률 데이터를 초기화했습니다.");
    navigate("/diagnosisinterview", { state: { reset: true } });
  };

  const handleGoInterview = () => navigate("/diagnosisinterview");
  const handleGoHome = () => navigate("/diagnosis");

  const handleGoBrandConsulting = () => {
    navigate(nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          <div className="diagResult__titleRow">
            <div>
              <h1 className="diagResult__title">초기 진단 결과 리포트</h1>
              <p className="diagResult__sub">
                입력 내용을 기반으로 요약 리포트를 생성했습니다. (현재는
                UI/연결용 더미 리포트)
              </p>
            </div>

            <div className="diagResult__topActions">
              <button
                type="button"
                className="btn ghost"
                onClick={handleGoHome}
              >
                진단 홈
              </button>
              <button type="button" className="btn" onClick={handleGoInterview}>
                인터뷰로 돌아가기
              </button>
            </div>
          </div>

          <div className="diagResult__grid">
            {/* ✅ Left: 리포트 본문 */}
            <section className="diagResult__left">
              <div className="card">
                <div className="card__head">
                  <h2>요약</h2>
                  <p>핵심 정보만 빠르게 확인합니다.</p>
                </div>

                <div className="summaryGrid">
                  <div className="summaryItem">
                    <div className="k">회사/프로젝트명</div>
                    <div className="v">{form.companyName || "-"}</div>
                  </div>
                  <div className="summaryItem">
                    <div className="k">산업 카테고리</div>
                    <div className="v">{industryLabel}</div>
                  </div>
                  <div className="summaryItem">
                    <div className="k">성장 단계</div>
                    <div className="v">{stageLabel}</div>
                  </div>
                  <div className="summaryItem">
                    <div className="k">한 줄 정의</div>
                    <div className="v">{oneLine || "-"}</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card__head">
                  <h2>고객/문제</h2>
                  <p>문제 정의가 명확할수록 다음 단계 추천이 정교해집니다.</p>
                </div>

                <div className="block">
                  <div className="block__title">타겟 고객 페르소나</div>
                  <div className="block__body">{personaLabel}</div>
                </div>

                <div className="block">
                  <div className="block__title">핵심 문제</div>
                  <div className="block__body">{customerProblem || "-"}</div>
                </div>
              </div>

              <div className="card">
                <div className="card__head">
                  <h2>차별화 / 비전</h2>
                  <p>
                    차별화 포인트와 방향성(비전)을 기반으로 개선 힌트를
                    제공합니다.
                  </p>
                </div>

                <div className="block">
                  <div className="block__title">차별화 포인트(무기)</div>
                  <div className="block__body">{usp || "-"}</div>
                </div>

                <div className="block">
                  <div className="block__title">
                    5년 뒤 뉴스 헤드라인(Vision)
                  </div>
                  <div className="block__body">{visionHeadline || "-"}</div>
                </div>

                <div className="tips">
                  <div className="tips__title">추천 개선 포인트</div>
                  <ul className="tips__list">
                    {tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="card">
                <div className="card__head">
                  <h2>추가 입력(선택)</h2>
                  <p>없어도 되지만 있으면 참고할 수 있어요.</p>
                </div>

                <div className="summaryGrid">
                  <div className="summaryItem">
                    <div className="k">웹사이트/소개 링크</div>
                    <div className="v">{form.website || "-"}</div>
                  </div>

                  <div className="summaryItem">
                    <div className="k">(레거시) KPI</div>
                    <div className="v">{form.kpi || "-"}</div>
                  </div>
                  <div className="summaryItem">
                    <div className="k">(레거시) 예산</div>
                    <div className="v">{form.budget || "-"}</div>
                  </div>
                  <div className="summaryItem">
                    <div className="k">(레거시) 팀 구성</div>
                    <div className="v">{form.team || "-"}</div>
                  </div>
                </div>

                <div className="block" style={{ marginTop: 10 }}>
                  <div className="block__title">(레거시) 현재 가장 막힌 점</div>
                  <div className="block__body">{form.constraints || "-"}</div>
                </div>
              </div>
            </section>

            {/* ✅ Right: 사이드 카드들 */}
            <aside className="diagResult__right">
              {/* 1) 기존 진행/상태 카드 */}
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
                    <span className="v">{currentSectionLabel}</span>
                  </div>
                  <div className="sideMeta__row">
                    <span className="k">필수 완료</span>
                    <span className="v">
                      {completedRequired}/{requiredKeys.length}
                    </span>
                  </div>
                  <div className="sideMeta__row">
                    <span className="k">마지막 저장</span>
                    <span className="v">{lastSaved}</span>
                  </div>
                </div>

                <div className="divider" />

                <button
                  type="button"
                  className="btn w100"
                  onClick={handleGoInterview}
                >
                  입력 수정하기
                </button>

                <button
                  type="button"
                  className="btn ghost w100"
                  onClick={handleResetAll}
                  style={{ marginTop: 10 }}
                >
                  처음부터 다시하기(초기화)
                </button>

                <p className="hint" style={{ marginTop: 10 }}>
                  * 이 페이지는 “결과 화면 연결”을 위한 리포트 UI입니다. 실제 AI
                  분석 결과를 붙이면 완성됩니다.
                </p>
              </div>

              {/* 2) ✅ 새로 추가: 완료 안내 + 브랜드 컨설팅 이동 카드 */}
              <div className="sideCard" style={{ marginTop: 14 }}>
                <div className="sideCard__titleRow">
                  <h3>다음 단계</h3>
                  <span className="badge">
                    {isCompleted ? "완료" : "진행중"}
                  </span>
                </div>

                {isCompleted ? (
                  <>
                    <p style={{ marginTop: 8, opacity: 0.85, lineHeight: 1.5 }}>
                      <b>기업 진단이 완료되었습니다.</b>
                      <br />
                      이제 브랜드 컨설팅에서 네이밍 · 컨셉 · 로고 · 스토리까지
                      이어서 도와드릴게요.
                    </p>

                    <button
                      type="button"
                      className="btn primary w100"
                      onClick={handleGoBrandConsulting}
                      style={{ marginTop: 12 }}
                    >
                      브랜드 컨설팅으로 이동
                    </button>

                    <p className="hint" style={{ marginTop: 10 }}>
                      * 다음 단계에서 선택한 컨설팅 입력값이 최종 결과물에
                      반영됩니다.
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ marginTop: 8, opacity: 0.85, lineHeight: 1.5 }}>
                      필수 입력이 모두 완료되면 브랜드 컨설팅으로 자연스럽게
                      이어갈 수 있어요.
                    </p>

                    <button
                      type="button"
                      className={`btn primary w100 ${isCompleted ? "" : "disabled"}`}
                      onClick={handleGoBrandConsulting}
                      disabled={!isCompleted}
                      style={{ marginTop: 12 }}
                    >
                      브랜드 컨설팅으로 이동
                    </button>

                    <p className="hint" style={{ marginTop: 10 }}>
                      * 아직 완료 전이라면 “입력 수정하기”로 돌아가 마무리해
                      주세요.
                    </p>
                  </>
                )}
              </div>

              {/* 필요하면 여기 아래에 또 다른 사이드 카드도 계속 추가 가능 */}
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter onOpenPolicy={setOpenType} />
    </div>
  );
}
