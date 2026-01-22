// src/pages/DiagnosisResult.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

/**
 * [DiagnosisResult] 초기 진단 결과 리포트 페이지
 * ------------------------------------------------------------
 * ✅ 화면 목적
 * - Interview에서 입력한 값(현재는 localStorage draft)을 요약해서 “리포트 형태”로 보여줌
 * - 필수 입력 진행률 표시(오른쪽 Sticky)
 * - “입력 수정하기 / 초기화” 등 UX 제공
 *
 * ✅ 현재 프론트 구현 상태
 * - localStorage(STORAGE_KEY)에 저장된 draft(form + updatedAt)를 읽어서 렌더링
 * - 실제 AI 분석 결과는 아직 없음(더미 UI)
 * - 레거시 데이터(구버전 키)도 보여주는 fallback 포함
 *
 * ✅ BACKEND 연동 포인트(핵심)
 * 1) 결과 조회 방식 변경
 *   - 지금: localStorage draft 기반 표시
 *   - 백 연동 후:
 *     - Interview에서 분석 요청(POST /diagnosis/analyze) → reportId/requestId 받음
 *     - Result 페이지에서는 reportId로 서버에서 결과 조회
 *       예) GET /diagnosis/report/:reportId  또는 GET /diagnosis/result/:id
 *
 * 2) 비동기 분석(대부분 이렇게 함)
 *   - 분석 요청 직후 결과가 즉시 안 나올 수 있음
 *   - 결과 페이지에서:
 *     - status: "processing"이면 로딩 UI
 *     - 일정 간격 폴링(GET) 또는 SSE/WebSocket
 *     - 완료되면 분석 결과 렌더링
 *
 * 3) “초기화/삭제” 동작
 *   - 지금: localStorage removeItem
 *   - 백 연동 후:
 *     - DELETE /diagnosis/draft
 *     - (선택) DELETE /diagnosis/report/:id  (요구사항에 따라)
 */

// Interview draft 저장 키 (DiagnosisInterview.jsx와 동일해야 함)
const STORAGE_KEY = "diagnosisInterviewDraft_v1";

// Home에서 진행률 보여주기 위한 요약 키 (DiagnosisHome.jsx와 동일)
const HOME_PROGRESS_KEY = "diagnosisDraft";

// ✅ Interview.jsx와 동일한 선택지(라벨 매핑용)
// BACKEND:
// - 보통 코드 테이블(ENUM)이라 프론트 하드코딩 가능
// - 혹은 서버에서 옵션 리스트 내려주는 방식도 가능(다국어 등)
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

/**
 * [getLabel]
 * - select value(예: "saas")를 label(예: "SaaS/플랫폼")로 변환
 * - 옵션에 없으면 value를 그대로 보여줌(레거시/예외 데이터 대응)
 *
 * BACKEND:
 * - 서버에서 label까지 내려주면 이 함수가 필요 없을 수 있음
 * - 하지만 프론트에서 코드 → 라벨 매핑은 흔한 방식
 */
const getLabel = (value, options) => {
  const v = String(value || "").trim();
  if (!v) return "-";
  const found = options.find((o) => o.value === v);
  return found ? found.label : v;
};

export default function DiagnosisResult({ onLogout }) {
  const navigate = useNavigate();

  // =========================================================
  // ✅ 약관/방침 모달 UI
  // =========================================================
  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  // =========================================================
  // ✅ draft 로딩 (현재는 localStorage)
  // ---------------------------------------------------------
  // useMemo([])로 최초 1회만 읽기: 렌더링 중 반복 파싱 방지
  //
  // BACKEND(중요):
  // - 여기서 reportId 기반 서버 조회로 바뀌어야 함
  // - 예: const { reportId } = useParams() 또는 location.state로 전달받기
  // - 이후 useEffect로 GET /diagnosis/report/:reportId 호출
  // - 지금처럼 동기 useMemo로 끝내기 어려움(비동기)
  // =========================================================
  const draft = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // draft 구조: { form: {...}, updatedAt: number }
  const form = draft?.form || {};

  // =========================================================
  // ✅ "리포트 표시용" 값 꺼내기 + 레거시 키 대응
  // ---------------------------------------------------------
  // - 지금은 Interview의 입력값을 그대로 보여주는 "요약 리포트"
  // - 레거시 키(targetCustomer/goal12m 등)가 있을 수 있어 fallback 처리
  //
  // BACKEND:
  // - 결과 API가 생기면 여기 form이 아니라 report 데이터에서 가져오게 될 수 있음
  // - 예: report.summary.oneLine / report.analysis.risks ...
  // =========================================================
  const oneLine = String(form?.oneLine || "").trim();
  const industry = String(form?.industry || "").trim();
  const stage = String(form?.stage || "").trim();
  const customerProblem = String(form?.customerProblem || "").trim();
  const usp = String(form?.usp || "").trim();

  // 새 키: targetPersona / visionHeadline
  // 구버전: targetCustomer / goal12m
  const targetPersona = String(
    form?.targetPersona || form?.targetCustomer || "",
  ).trim();

  const visionHeadline = String(
    form?.visionHeadline || form?.goal12m || "",
  ).trim();

  // =========================================================
  // ✅ 필수 항목(초기 진단 7개) 기반 진행률 계산
  // - Interview와 동일한 필수 기준 유지
  // - Result 오른쪽 sticky에서 표시
  //
  // BACKEND:
  // - 서버에 "필수 완료 여부/진행률"도 저장할 수 있지만
  //   프론트에서 계산해도 충분한 영역
  // =========================================================
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

  // 레거시 키를 포함한 실질 값들로 완료 여부 판단
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

  // 마지막 저장 시간 표시(현재는 localStorage draft.updatedAt)
  // BACKEND: 서버 updatedAt로 대체 가능
  const lastSaved = useMemo(() => {
    const t = draft?.updatedAt;
    if (!t) return "-";
    const d = new Date(t);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
  }, [draft]);

  // =========================================================
  // ✅ 옵션 라벨 변환 (value → label)
  // ---------------------------------------------------------
  // stageLabel은 "구버전 stage값"도 임시 대응(revenue/invest)
  // =========================================================
  const industryLabel = useMemo(
    () => getLabel(industry, INDUSTRY_OPTIONS),
    [industry],
  );

  const stageLabel = useMemo(() => {
    const s = String(stage || "");
    // 구버전(stage가 revenue/invest 등)도 대응(임시 매핑)
    if (s === "revenue") return "매출 발생";
    if (s === "invest") return "투자 유치 진행";
    return getLabel(s, STAGE_OPTIONS);
  }, [stage]);

  const personaLabel = useMemo(
    () => getLabel(targetPersona, PERSONA_OPTIONS),
    [targetPersona],
  );

  // 현재 단계(진행 중인 섹션) 텍스트
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

  // =========================================================
  // ✅ "추천 개선 포인트" (현재는 프론트 룰 기반 더미)
  // ---------------------------------------------------------
  // - 입력 길이에 따라 가벼운 팁을 보여주는 UX
  //
  // BACKEND:
  // - 실제 AI 분석 결과가 생기면:
  //   - tips는 서버에서 내려주는 "개선 포인트"로 교체 가능
  //   - 혹은 프론트 룰 + AI 팁을 같이 보여줄 수도 있음
  // =========================================================
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

  /**
   * [handleResetAll] 입력/진행률 초기화
   * ------------------------------------------------------------
   * 현재:
   * - localStorage에서 draft와 요약 제거
   * - interview로 이동(reset flag 전달)
   *
   * BACKEND:
   * - 사용자별 서버 draft도 삭제해야 “진짜 초기화”가 됨
   *   예: await api.deleteDraft()
   * - 결과(리포트)를 저장하는 구조라면 report도 삭제할지 정책 결정 필요
   */
  const handleResetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(HOME_PROGRESS_KEY);

    // TODO(BACKEND):
    // - await api.deleteDiagnosisDraft()
    // - (정책에 따라) await api.deleteReport(reportId)

    alert("진단 입력/진행률 데이터를 초기화했습니다.");
    navigate("/diagnosisinterview", { state: { reset: true } });
  };

  // 단순 네비게이션
  const handleGoInterview = () => navigate("/diagnosisinterview");
  const handleGoHome = () => navigate("/diagnosis");

  return (
    <div className="diagResult">
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

      {/* ✅ 공통 헤더 */}
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

              {/* BACKEND:
                 - 실제로는 "분석 결과를 생성했습니다"가 아니라
                   - 처리중이면: "분석 중입니다..."
                   - 완료면: "분석이 완료되었습니다"
                   - 실패면: "분석에 실패했습니다"
                 같은 상태 문구로 바뀌는게 자연스럽다.
              */}
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
            {/* =====================================================
                ✅ Left: 리포트 본문
                - 입력값 기반 요약(현재는 더미 리포트)
               ===================================================== */}
            <section className="diagResult__left">
              {/* 요약 카드 */}
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

              {/* 고객/문제 카드 */}
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

              {/* 차별화/비전 카드 */}
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

                {/* tips는 현재 프론트 룰 기반 */}
                <div className="tips">
                  <div className="tips__title">추천 개선 포인트</div>
                  <ul className="tips__list">
                    {tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                {/* BACKEND:
                   - 실제 AI 분석 결과가 들어오면
                   - 여기 아래에 "리스크 요약 / 우선순위 / 4~12주 로드맵 / KPI 제안" 같은 섹션이 추가되면 완성됨
                */}
              </div>

              {/* 추가 입력(레거시 포함) */}
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

                  {/* ✅ 레거시 데이터가 남아있을 수 있어서 보여주되, 없으면 '-' */}
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

            {/* =====================================================
                ✅ Right Sticky: 진행률/상태 + 액션
               ===================================================== */}
            <aside className="diagResult__right">
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
                  className="btn primary w100"
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

                <p className="hint">
                  * 이 페이지는 “결과 화면 연결”을 위한 리포트 UI입니다. 실제 AI
                  분석 결과를 붙이면 완성됩니다.
                </p>

                {/* BACKEND:
                   - 결과가 "processing"이면 여기 버튼 대신 로딩 상태 + 취소 버튼(옵션) 가능
                   - 실패 시 재시도 버튼 제공 가능
                */}
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* ✅ 공통 푸터 */}
      <SiteFooter onOpenPolicy={setOpenType} />
    </div>
  );
}
