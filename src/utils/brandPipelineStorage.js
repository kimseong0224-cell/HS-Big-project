// src/utils/brandPipelineStorage.js
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
    for (const k of keys) localStorage.removeItem(k);
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
  return safeParse(localStorage.getItem(PIPELINE_KEY)) || {};
}

export function writePipeline(next) {
  const payload = { ...(next || {}), updatedAt: Date.now() };
  localStorage.setItem(PIPELINE_KEY, JSON.stringify(payload));
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
  localStorage.setItem(PIPELINE_KEY, JSON.stringify(next));
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
    const parsed = safeParse(localStorage.getItem(k));
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

    const raw = safeParse(localStorage.getItem(key));
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
