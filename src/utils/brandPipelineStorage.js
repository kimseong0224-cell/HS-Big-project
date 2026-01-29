// src/utils/brandPipelineStorage.js
import {
  userGetItem,
  userSetItem,
  userRemoveItem,
  userSafeParse,
  removeLegacyKey,
} from "./userLocalStorage.js";

export const PIPELINE_KEY = "brandPipeline_v1";
const DIAG_KEYS = ["diagnosisInterviewDraft_v1", "diagnosisInterviewDraft"];

// ✅ 단계별 localStorage 키(이전 단계 수정 시, 다음 단계 결과를 확실히 초기화하기 위함)
const STEP_STORAGE_KEYS = {
  naming: [
    "namingConsultingInterviewDraft_v1",
    "namingConsultingInterviewResult_v1",
    "brandInterview_naming_v1",
  ],
  concept: [
    // 컨셉(구 홈페이지 컨설팅 키 포함)
    "conceptConsultingInterviewDraft_v1",
    "conceptConsultingInterviewResult_v1",
    "conceptInterviewDraft_homepage_v6",
    "conceptInterviewResult_homepage_v6",
    "conceptInterviewDraft_homepage_v5",
    "conceptInterviewResult_homepage_v5",
    "brandInterview_homepage_v1",
    "brandInterview_concept_v1",
  ],
  story: [
    "brandStoryConsultingInterviewDraft_v1",
    "brandStoryConsultingInterviewResult_v1",
    "brandInterview_story_v1",
  ],
  logo: [
    "logoConsultingInterviewDraft_v1",
    "logoConsultingInterviewResult_v1",
    "brandInterview_logo_v1",
  ],
};

function removeLocalStorageKeys(keys = []) {
  try {
    for (const k of keys) userRemoveItem(k);
  } catch {
    // ignore
  }
}

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function readPipeline() {
  return safeParse(userGetItem(PIPELINE_KEY)) || {};
}

export function writePipeline(next) {
  const payload = { ...(next || {}), updatedAt: Date.now() };
  userSetItem(PIPELINE_KEY, JSON.stringify(payload));
  return payload;
}

export function upsertPipeline(patch) {
  const cur = readPipeline();
  return writePipeline({ ...cur, ...(patch || {}) });
}

export function clearStepsFrom(stepKey) {
  const cur = readPipeline();
  const next = { ...cur };

  // stepKey 이후 단계들을 모두 초기화
  const stepsToClear = [];
  if (stepKey === "naming")
    stepsToClear.push("naming", "concept", "story", "logo");
  else if (stepKey === "concept") stepsToClear.push("concept", "story", "logo");
  else if (stepKey === "story") stepsToClear.push("story", "logo");
  else if (stepKey === "logo") stepsToClear.push("logo");

  for (const s of stepsToClear) delete next[s];

  // ✅ 다음 단계 결과가 localStorage에 남아 있으면, 홈 화면에서 다시 "완료"로 복구되는 문제가 생길 수 있어
  // → pipeline 초기화와 함께 legacy/result/draft 키도 같이 지워서 일관성 유지
  for (const s of stepsToClear) {
    removeLocalStorageKeys(STEP_STORAGE_KEYS[s] || []);
  }

  return writePipeline(next);
}

export function setStepResult(stepKey, data) {
  const cur = readPipeline();
  const next = {
    ...cur,
    [stepKey]: {
      ...(cur?.[stepKey] || {}),
      ...(data || {}),
      updatedAt: Date.now(),
    },
    updatedAt: Date.now(),
  };
  userSetItem(PIPELINE_KEY, JSON.stringify(next));
  return next;
}

export function getSelected(stepKey) {
  const cur = readPipeline();
  const step = cur?.[stepKey];
  if (!step) return null;
  if (step?.selected) return step.selected;
  if (step?.selectedId && Array.isArray(step?.candidates)) {
    return step.candidates.find((c) => c.id === step.selectedId) || null;
  }
  return null;
}

export function readDiagnosisDraftForm() {
  for (const k of DIAG_KEYS) {
    const parsed = userSafeParse(k);
    if (!parsed) continue;
    const form =
      parsed?.form && typeof parsed.form === "object" ? parsed.form : parsed;
    if (form && typeof form === "object") return form;
  }
  return null;
}

/**
 * ✅ 기업진단 draft를 "요약" 형태로 정리
 * - 이후 네이밍/컨셉/스토리/로고 AI 요청 payload의 공통 입력으로 사용
 */
export function buildDiagnosisSummaryFromDraft(form) {
  const f = form || {};
  const companyName = String(
    f.companyName || f.brandName || f.projectName || "",
  ).trim();
  const website = String(f.website || "").trim();

  const oneLine = String(f.oneLine || "").trim();
  const customerProblem = String(f.customerProblem || "").trim();
  const targetPersona = String(
    f.targetPersona || f.targetCustomer || "",
  ).trim();
  const usp = String(f.usp || "").trim();
  const stage = String(f.stage || "").trim();
  const industry = String(f.industry || "").trim();
  const visionHeadline = String(f.visionHeadline || f.goal12m || "").trim();

  const shortText = [
    companyName ? `${companyName}` : null,
    oneLine ? `${oneLine}` : null,
    targetPersona ? `타깃: ${targetPersona}` : null,
    industry ? `산업: ${industry}` : null,
    stage ? `단계: ${stage}` : null,
  ]
    .filter(Boolean)
    .slice(0, 4)
    .join(" · ");

  return {
    companyName,
    website,
    oneLine,
    customerProblem,
    targetPersona,
    usp,
    stage,
    industry,
    visionHeadline,
    shortText,
  };
}

/**
 * ✅ 단계 접근 가드
 */
export function ensureStepAccess(stepKey) {
  const p = readPipeline();

  const hasDiagnosis = Boolean(
    p?.diagnosisSummary?.companyName || p?.diagnosisSummary?.oneLine,
  );
  const hasNaming = Boolean(p?.naming?.selectedId || p?.naming?.selected);
  const hasConcept = Boolean(p?.concept?.selectedId || p?.concept?.selected);
  const hasStory = Boolean(p?.story?.selectedId || p?.story?.selected);

  if (stepKey === "naming") {
    if (!hasDiagnosis)
      return {
        ok: false,
        redirectTo: "/diagnosis",
        reason: "diagnosis_missing",
      };
    return { ok: true };
  }

  if (stepKey === "concept") {
    if (!hasDiagnosis)
      return {
        ok: false,
        redirectTo: "/diagnosis",
        reason: "diagnosis_missing",
      };
    if (!hasNaming)
      return {
        ok: false,
        redirectTo: "/brand/naming/interview",
        reason: "naming_missing",
      };
    return { ok: true };
  }

  if (stepKey === "story") {
    if (!hasDiagnosis)
      return {
        ok: false,
        redirectTo: "/diagnosis",
        reason: "diagnosis_missing",
      };
    if (!hasNaming)
      return {
        ok: false,
        redirectTo: "/brand/naming/interview",
        reason: "naming_missing",
      };
    if (!hasConcept)
      return {
        ok: false,
        redirectTo: "/brand/concept/interview",
        reason: "concept_missing",
      };
    return { ok: true };
  }

  if (stepKey === "logo") {
    if (!hasDiagnosis)
      return {
        ok: false,
        redirectTo: "/diagnosis",
        reason: "diagnosis_missing",
      };
    if (!hasNaming)
      return {
        ok: false,
        redirectTo: "/brand/naming/interview",
        reason: "naming_missing",
      };
    if (!hasConcept)
      return {
        ok: false,
        redirectTo: "/brand/concept/interview",
        reason: "concept_missing",
      };
    if (!hasStory)
      return { ok: false, redirectTo: "/brand/story", reason: "story_missing" };
    return { ok: true };
  }

  return { ok: true };
}

/**
 * ✅ 레거시(기존 localStorage 키들) → pipeline으로 마이그레이션(1회성)
 * - 기존 결과 페이지/통합 결과 페이지가 레거시 키를 쓰고 있어도,
 *   브랜드 컨설팅 홈의 잠금/해제 상태는 pipeline 기준으로 통일 가능
 */
export function migrateLegacyToPipelineIfNeeded() {
  const p = readPipeline();

  // 1) diagnosisSummary 없으면, diagnosis draft로 생성
  if (!p?.diagnosisSummary) {
    const diag = readDiagnosisDraftForm();
    if (diag) {
      const summary = buildDiagnosisSummaryFromDraft(diag);
      upsertPipeline({ diagnosisSummary: summary });
    }
  }

  // 2) 기존 단계 결과 키들(예전 구현)에서 pipeline 채우기

  const prevOf = { concept: "naming", story: "concept", logo: "story" };
  const isDone = (k) => Boolean(next?.[k]?.selectedId || next?.[k]?.selected);

  // 2) 기존 단계 결과 키들(예전 구현)에서 pipeline 채우기
  // - 주의: 이전 단계가 변경된 뒤(예: 네이밍 다시 선택) 다음 단계 결과 키가 localStorage에 남아 있으면
  //   홈 화면에서 "완료"로 다시 복구되는 문제가 생길 수 있음
  // - 해결: (1) 이전 단계가 완료되어야만 다음 단계 마이그레이션 허용
  //         (2) 이전 단계 updatedAt이 더 최신이면, 다음 단계(레거시)는 '무효'로 보고 마이그레이션 스킵
  const legacyMap = [
    // naming
    { step: "naming", key: "namingConsultingInterviewResult_v1" },
    { step: "naming", key: "brandInterview_naming_v1" },

    // concept
    { step: "concept", key: "conceptInterviewResult_homepage_v6" },
    { step: "concept", key: "conceptInterviewResult_homepage_v5" },
    { step: "concept", key: "conceptConsultingInterviewResult_v1" },
    { step: "concept", key: "brandInterview_homepage_v1" },
    { step: "concept", key: "brandInterview_concept_v1" },

    // story
    { step: "story", key: "brandStoryConsultingInterviewResult_v1" },
    { step: "story", key: "brandInterview_story_v1" },

    // logo
    { step: "logo", key: "logoConsultingInterviewResult_v1" },
    { step: "logo", key: "brandInterview_logo_v1" },
  ];

  const cur = readPipeline();
  let changed = false;
  const next = { ...cur };

  for (const { step, key } of legacyMap) {
    if (isDone(step)) continue;

    const prev = prevOf[step];
    if (prev && !isDone(prev)) continue;

    const raw = userSafeParse(key);
    if (!raw) continue;

    const rawUpdatedAt = Number(raw?.updatedAt || 0);
    const prevUpdatedAt = prev ? Number(next?.[prev]?.updatedAt || 0) : 0;

    // 이전 단계가 더 최신이면, 다음 단계 결과는 무효로 간주(오래된 결과가 다시 복구되는 문제 방지)
    if (prev && prevUpdatedAt && rawUpdatedAt && prevUpdatedAt > rawUpdatedAt)
      continue;
    if (prev && prevUpdatedAt && !rawUpdatedAt) continue;

    const selectedId = raw?.selectedId || null;
    const candidates = Array.isArray(raw?.candidates) ? raw.candidates : [];
    const selected = raw?.selected || null;

    if (selectedId || selected) {
      next[step] = {
        candidates,
        selectedId,
        selected,
        updatedAt: rawUpdatedAt || Date.now(),
      };
      changed = true;
    }
  }

  if (changed) writePipeline(next);
  return readPipeline();
}

/** =========================
 * ✅ Strict Brand Flow (네이밍 → 컨셉 → 스토리 → 로고)
 * - brandId 고정
 * - 진행 중 이탈 시: 네이밍부터 다시(단계 결과 초기화)
 * - 진행 중 이전 단계로 되돌아가기 차단
 * ========================= */

export const BRAND_FLOW_STEPS = ["naming", "concept", "story", "logo"];

const BRAND_FLOW_STEP_INDEX = {
  naming: 0,
  concept: 1,
  story: 2,
  logo: 3,
};

const BRAND_FLOW_ROUTE_BY_STEP = {
  naming: "/brand/naming/interview",
  concept: "/brand/concept/interview",
  story: "/brand/story",
  logo: "/brand/logo/interview",
};

export function getBrandFlow() {
  const p = readPipeline();
  return p?.brandFlow || null;
}

export function isBrandFlowActive() {
  const f = getBrandFlow();
  return Boolean(f?.active);
}

export function getBrandFlowCurrentStep() {
  const f = getBrandFlow();
  const cur = String(f?.currentStep || "naming");
  return BRAND_FLOW_STEP_INDEX[cur] != null ? cur : "naming";
}

export function getBrandFlowRouteForStep(stepKey) {
  return BRAND_FLOW_ROUTE_BY_STEP[stepKey] || "/brand/naming/interview";
}

/**
 * ✅ 브랜드 4종(네이밍/컨셉/스토리/로고) 진행 라우트인지 판별
 */
export function isBrandFlowRoute(pathname) {
  const p = String(pathname || "");
  if (!p) return false;

  // canonical
  if (p === "/brand/naming/interview") return true;
  if (p === "/brand/concept/interview") return true;
  if (p === "/brand/story" || p === "/brand/story/interview") return true;
  if (p === "/brand/logo/interview") return true;

  // legacy aliases (App.jsx 유지)
  if (p === "/nameconsulting" || p === "/namingconsulting") return true;
  if (p === "/conceptconsulting" || p === "/homepageconsulting") return true;
  if (p === "/brand/homepage/interview") return true;
  if (p === "/brandstoryconsulting") return true;
  if (p === "/logoconsulting") return true;

  return false;
}

/**
 * ✅ 진행 중 새로고침/탭닫기 등을 감지했을 때 표시(다음 진입 시 네이밍부터 리셋)
 */
export function markBrandFlowPendingAbort(reason = "interrupted") {
  const cur = readPipeline();
  const flow = cur?.brandFlow || {};
  if (!flow?.active) return cur;

  const next = {
    ...cur,
    brandFlow: {
      ...flow,
      pendingAbort: true,
      pendingReason: String(reason || "interrupted"),
      updatedAt: Date.now(),
    },
    updatedAt: Date.now(),
  };
  return writePipeline(next);
}

/**
 * ✅ pendingAbort가 있으면 1회 소비하면서 true 반환
 * - 페이지에서 alert 문구를 띄운 뒤, 네이밍부터 다시 시작하도록 유도
 */
export function consumeBrandFlowPendingAbort() {
  const cur = readPipeline();
  const flow = cur?.brandFlow;
  if (!flow?.active || !flow?.pendingAbort) return false;

  // pendingAbort를 소비(해제)
  const next = {
    ...cur,
    brandFlow: {
      ...flow,
      pendingAbort: false,
      pendingReason: null,
      updatedAt: Date.now(),
    },
    updatedAt: Date.now(),
  };
  writePipeline(next);
  return true;
}

/**
 * ✅ 진단 완료 후 "브랜드 컨설팅 시작" 시 호출
 * - 단계 결과 초기화(네이밍부터)
 * - brandFlow 활성화 + currentStep=naming
 */
export function startBrandFlow({ brandId } = {}) {
  // 1) 단계 결과 초기화(진단/brandId는 유지)
  const cleared = clearStepsFrom("naming");

  const normalized =
    brandId == null
      ? null
      : Number.isNaN(Number(brandId))
        ? brandId
        : Number(brandId);

  const next = {
    ...cleared,
    ...(normalized != null ? { brandId: normalized } : {}),
    brandFlow: {
      active: true,
      currentStep: "naming",
      startedAt: Date.now(),
      updatedAt: Date.now(),
      pendingAbort: false,
      pendingReason: null,
    },
    updatedAt: Date.now(),
  };

  return writePipeline(next);
}

/**
 * ✅ 현재 단계 갱신(이전 단계로 못 돌아가게 만드는 기준)
 */
export function setBrandFlowCurrent(stepKey) {
  const key = String(stepKey || "naming");
  const normalized = BRAND_FLOW_STEP_INDEX[key] != null ? key : "naming";

  const cur = readPipeline();
  const flow = cur?.brandFlow || {};

  // flow가 없으면 자동으로 생성(진단 이후 직접 단계 진입했을 때)
  const next = {
    ...cur,
    brandFlow: {
      active: true,
      currentStep: normalized,
      startedAt: flow?.startedAt || Date.now(),
      updatedAt: Date.now(),
      pendingAbort: false,
      pendingReason: null,
    },
    updatedAt: Date.now(),
  };
  return writePipeline(next);
}

/**
 * ✅ 진행 중 이탈(메뉴 이동/다른 페이지 이동/뒤로가기 등) 시
 * - 네이밍부터 다시 시작하도록 단계 결과를 삭제
 * - brandFlow 비활성화
 */
export function abortBrandFlow(reason = "leave") {
  const cleared = clearStepsFrom("naming");
  const cur = readPipeline(); // clearStepsFrom 이후 최신값
  const flow = cur?.brandFlow || {};

  const next = {
    ...cleared,
    brandFlow: {
      ...flow,
      active: false,
      currentStep: "naming",
      pendingAbort: false,
      pendingReason: null,
      abortedAt: Date.now(),
      abortReason: String(reason || "leave"),
      updatedAt: Date.now(),
    },
    updatedAt: Date.now(),
  };
  return writePipeline(next);
}

/**
 * ✅ 로고까지 완료 후 종료 처리(이탈 경고/리셋 방지)
 */
export function completeBrandFlow() {
  const cur = readPipeline();
  const flow = cur?.brandFlow || {};
  const next = {
    ...cur,
    brandFlow: {
      ...flow,
      active: false,
      completedAt: Date.now(),
      updatedAt: Date.now(),
    },
    updatedAt: Date.now(),
  };
  return writePipeline(next);
}

/**
 * ✅ Strict 접근 가드(순서 + 이전 단계 되돌아가기 차단)
 */
export function ensureStrictStepAccess(stepKey) {
  // 1) 기본 순서 가드(진단/선행 단계)
  const base = ensureStepAccess(stepKey);
  if (!base?.ok) return base;

  // 2) 진행 중 이전 단계 진입 차단
  const cur = readPipeline();
  const flow = cur?.brandFlow;

  if (flow?.active) {
    const curStep = getBrandFlowCurrentStep();
    const want = String(stepKey || "naming");
    const wantStep = BRAND_FLOW_STEP_INDEX[want] != null ? want : "naming";

    if (BRAND_FLOW_STEP_INDEX[wantStep] < BRAND_FLOW_STEP_INDEX[curStep]) {
      return {
        ok: false,
        redirectTo: getBrandFlowRouteForStep(curStep),
        reason: "no_back",
        currentStep: curStep,
      };
    }
  }

  return { ok: true };
}

// ✅ 중도 이탈/권한 이슈 등으로 "기업진단부터 재시작"이 필요할 때 사용
// - 기업진단 진행률(홈 0%)을 위해 diagnosis draft/result도 함께 제거
// - 마이페이지 히스토리(brandReportHistory)는 보존
export function resetBrandConsultingToDiagnosisStart(reason = "reset") {
  // 1) 브랜드 파이프라인 제거
  try {
    userRemoveItem(PIPELINE_KEY);
  } catch {
    // ignore
  }

  // 2) 브랜드 단계별 draft/result 제거
  try {
    Object.values(STEP_STORAGE_KEYS)
      .flat()
      .forEach((k) => userRemoveItem(k));
  } catch {
    // ignore
  }

  // 3) 기업진단 draft/result 제거(진행률 0%로)
  const DIAG_RESET_KEYS = [
    "diagnosisInterviewDraft_v1",
    "diagnosisInterviewDraft",
    "diagnosisDraft",
    "diagnosisResult_v1",
  ];
  try {
    DIAG_RESET_KEYS.forEach((k) => userRemoveItem(k));
  } catch {
    // ignore
  }

  // 4) 레거시(사용자 스코프 없는) 키도 함께 제거(안전)
  try {
    [
      PIPELINE_KEY,
      ...DIAG_RESET_KEYS,
      "diagnosisResult_v1_global",
      ...Object.values(STEP_STORAGE_KEYS).flat(),
    ].forEach((k) => removeLegacyKey(k));
  } catch {
    // ignore
  }

  return { ok: true, reason };
}
