// src/pages/BrandStoryConsultingInterview.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

import ConsultingFlowPanel from "../components/ConsultingFlowPanel.jsx";
import ConsultingFlowMini from "../components/ConsultingFlowMini.jsx";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

const STORAGE_KEY = "brandStoryConsultingInterviewDraft_v1";
const RESULT_KEY = "brandStoryConsultingInterviewResult_v1";
const LEGACY_KEY = "brandInterview_story_v1";
const NEXT_PATH = "/logoconsulting";

const DIAG_KEYS = ["diagnosisInterviewDraft_v1", "diagnosisInterviewDraft"];

function safeText(v, fallback = "") {
  const s = String(v ?? "").trim();
  return s ? s : fallback;
}

function stageLabel(v) {
  const s = String(v || "")
    .trim()
    .toLowerCase();
  if (!s) return "-";
  if (s === "idea") return "아이디어";
  if (s === "mvp") return "MVP";
  if (s === "pmf") return "PMF";
  if (s === "revenue" || s === "early_revenue") return "매출";
  if (s === "invest") return "투자";
  if (s === "scaleup" || s === "scaling") return "스케일업";
  if (s === "rebrand") return "리브랜딩";
  return String(v);
}

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readDiagnosisForm() {
  for (const k of DIAG_KEYS) {
    const parsed = safeParse(localStorage.getItem(k));
    if (!parsed) continue;
    const form =
      parsed?.form && typeof parsed.form === "object" ? parsed.form : parsed;
    if (form && typeof form === "object") return form;
  }
  return null;
}

function isFilled(v) {
  if (Array.isArray(v)) return v.length > 0;
  return Boolean(String(v ?? "").trim());
}

/** ✅ multiple 선택용 칩 UI */
function MultiChips({ value, options, onChange, max = null }) {
  const current = Array.isArray(value) ? value : [];

  const toggle = (opt) => {
    const exists = current.includes(opt);
    let next = exists ? current.filter((x) => x !== opt) : [...current, opt];

    if (typeof max === "number" && max > 0 && next.length > max) {
      next = next.slice(0, max);
    }
    onChange(next);
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((opt) => {
        const active = current.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(opt)}
            style={{
              fontSize: 12,
              fontWeight: 800,
              padding: "6px 10px",
              borderRadius: 999,
              background: active ? "rgba(99,102,241,0.12)" : "rgba(0,0,0,0.04)",
              border: active
                ? "1px solid rgba(99,102,241,0.25)"
                : "1px solid rgba(0,0,0,0.10)",
              color: "rgba(0,0,0,0.78)",
              cursor: "pointer",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

const STORY_PLOT_OPTIONS = ["문제 해결형", "비전 제시형", "탄생 신화형"];
const STORY_EMOTION_OPTIONS = ["안도감", "호기심"];

function generateStoryCandidates(form, seed = 0) {
  const companyName = safeText(form?.companyName, "우리");
  const industry = safeText(form?.industry, "분야");
  const stage = stageLabel(form?.stage);
  const target = safeText(form?.targetCustomer, "고객");
  const oneLine = safeText(form?.oneLine, "");

  const founding = safeText(form?.founding_story, "");
  const transformation = safeText(form?.customer_transformation, "");
  const mission = safeText(form?.brand_mission, "");
  const conflict = safeText(form?.customer_conflict, "");
  const ultimate = safeText(form?.ultimate_goal, "");

  const plots = Array.isArray(form?.story_plot) ? form.story_plot : [];
  const emotions = Array.isArray(form?.story_emotion) ? form.story_emotion : [];

  const pick = (arr, idx) => arr[(idx + seed) % arr.length];

  const hooks = [
    "왜 좋은 선택이 늘 어려울까요?",
    "고객의 하루는 늘 방해물로 가득합니다.",
    "우리는 ‘당연한 불편’을 당연하게 넘기지 않았습니다.",
    "작은 결핍이 큰 포기로 이어지는 순간이 있습니다.",
  ];

  const endings = [
    "우리는 오늘도 고객이 더 쉽게, 더 확신 있게 앞으로 나아가도록 돕습니다.",
    "우리는 고객이 멈추는 지점에서 다시 움직이게 만드는 브랜드가 되겠습니다.",
    "우리는 더 나은 내일을 ‘실행 가능한 이야기’로 만들겠습니다.",
  ];

  const baseMeta = () => ({
    oneLiner: oneLine
      ? `“${oneLine}”`
      : `“${ultimate || mission || "브랜드 스토리"}”`,
    meta: `${industry} · ${stage} · 타깃: ${target}`,
    emotions: emotions.length ? emotions : ["안도감"],
  });

  const buildStory = (plotType) => {
    const hook = pick(hooks, 0);
    const end = pick(endings, 1);

    const pFounding = founding
      ? `【창업 계기】\n${founding}`
      : `【창업 계기】\n시작은 작은 질문에서 출발했습니다. “${hook}”`;

    const pConflict = conflict
      ? `【고객의 결핍/방해물】\n${conflict}`
      : `【고객의 결핍/방해물】\n${target}은(는) 중요한 순간에 ‘정보/시간/확신’의 결핍으로 흔들립니다.`;

    const pTransform = transformation
      ? `【사용 전/후 변화】\n${transformation}`
      : `【사용 전/후 변화】\n사용 전에는 고민이 길어지고 실행이 끊기지만, 사용 후에는 선택이 빨라지고 실행이 이어집니다.`;

    const pMission = mission
      ? `【미션】\n${mission}`
      : `【미션】\n우리는 수익을 넘어, 고객이 더 나은 결정을 내리고 지속적으로 성장하도록 돕고자 합니다.`;

    const pUltimate = ultimate
      ? `【궁극적 목표】\n${ultimate}`
      : `【궁극적 목표】\n우리는 ‘더 쉽고 더 신뢰할 수 있는 선택’이 당연한 세상을 만들고자 합니다.`;

    const emoLine = `【자극하고 싶은 감정】 ${(emotions.length
      ? emotions
      : ["안도감"]
    ).join(" · ")}`;

    // 플롯별 구조 차등
    if (plotType === "문제 해결형") {
      return {
        plot: plotType,
        story: [
          `【훅】 ${hook}`,
          pConflict,
          pFounding,
          pTransform,
          pMission,
          pUltimate,
          emoLine,
          `【마무리】 ${end}`,
        ].join("\n\n"),
        ending: end,
      };
    }

    if (plotType === "비전 제시형") {
      return {
        plot: plotType,
        story: [
          `【훅】 우리가 꿈꾸는 미래는 분명합니다.`,
          pUltimate,
          pMission,
          pConflict,
          pTransform,
          pFounding,
          emoLine,
          `【마무리】 ${end}`,
        ].join("\n\n"),
        ending: end,
      };
    }

    // 탄생 신화형
    return {
      plot: plotType,
      story: [
        `【훅】 이 이야기는 ‘왜 시작했는가’에서 시작합니다.`,
        pFounding,
        pMission,
        pConflict,
        pTransform,
        pUltimate,
        emoLine,
        `【마무리】 ${end}`,
      ].join("\n\n"),
      ending: end,
    };
  };

  const plotPool = plots.length ? plots : STORY_PLOT_OPTIONS;

  const p1 = pick(plotPool, 0);
  const p2 = pick(plotPool, 1);
  const p3 = pick(plotPool, 2);

  const mk = (id, name, plotType, variantSeed) => {
    const { plot, story, ending } = buildStory(plotType);
    const meta = baseMeta();

    const keywords = Array.from(
      new Set([
        industry,
        stage,
        plot,
        ...(meta.emotions || []),
        "스토리",
        "브랜드",
      ]),
    ).slice(0, 10);

    // 약간 변주: 훅/엔딩 시드 반영
    const altHook = pick(hooks, variantSeed);
    const altEnd = pick(endings, variantSeed);

    const story2 =
      variantSeed === 0
        ? story
        : story.replace(/【훅】.*\n?/m, (m) =>
            m.replace(/【훅】.*/, `【훅】 ${altHook}`),
          );

    return {
      id,
      name,
      oneLiner: meta.oneLiner,
      meta: meta.meta,
      plot,
      emotions: meta.emotions,
      story: story2,
      ending: variantSeed === 0 ? ending : altEnd,
      keywords,
    };
  };

  return [
    mk("story_1", "A · 문제 해결형", p1, 0),
    mk("story_2", "B · 비전 제시형", p2, 1),
    mk("story_3", "C · 탄생 신화형", p3, 2),
  ];
}

const INITIAL_FORM = {
  // ✅ 기업 진단에서 자동 반영(편집 X)
  companyName: "",
  industry: "",
  stage: "",
  website: "",
  oneLine: "",
  targetCustomer: "",

  // ✅ Step 4. 브랜드 스토리 (편집 O)
  founding_story: "", // long
  customer_transformation: "", // long
  brand_mission: "", // long
  story_plot: [], // multiple
  customer_conflict: "", // long
  story_emotion: [], // multiple
  ultimate_goal: "", // long

  // 선택 메모
  notes: "",
};

export default function BrandStoryConsultingInterview({ onLogout }) {
  const navigate = useNavigate();

  // ✅ 약관/방침 모달
  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  // ✅ 폼 상태
  const [form, setForm] = useState(INITIAL_FORM);

  // ✅ 저장 상태 UI
  const [saveMsg, setSaveMsg] = useState("");
  const [lastSaved, setLastSaved] = useState("-");

  // ✅ 결과(후보/선택) 상태
  const [analyzing, setAnalyzing] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [regenSeed, setRegenSeed] = useState(0);
  const refResult = useRef(null);

  // 섹션 ref
  const refBasic = useRef(null);
  const refMaterial = useRef(null);
  const refStyle = useRef(null);
  const refVision = useRef(null);
  const refNotes = useRef(null);

  const sections = useMemo(
    () => [
      { id: "basic", label: "기본 정보", ref: refBasic },
      { id: "material", label: "스토리 재료", ref: refMaterial },
      { id: "style", label: "플롯/감정", ref: refStyle },
      { id: "vision", label: "미션/목표", ref: refVision },
      { id: "notes", label: "추가 요청", ref: refNotes },
    ],
    [],
  );

  // ✅ 필수 항목(요청한 Step4 질문 기준)
  const requiredKeys = useMemo(
    () => [
      "founding_story",
      "customer_transformation",
      "brand_mission",
      "story_plot",
      "customer_conflict",
      "story_emotion",
      "ultimate_goal",
    ],
    [],
  );

  const requiredStatus = useMemo(() => {
    const status = {};
    requiredKeys.forEach((k) => {
      status[k] = isFilled(form?.[k]);
    });
    return status;
  }, [form, requiredKeys]);

  const completedRequired = useMemo(
    () => requiredKeys.filter((k) => requiredStatus[k]).length,
    [requiredKeys, requiredStatus],
  );

  const progress = useMemo(() => {
    if (requiredKeys.length === 0) return 0;
    return Math.round((completedRequired / requiredKeys.length) * 100);
  }, [completedRequired, requiredKeys.length]);

  const canAnalyze = completedRequired === requiredKeys.length;
  const hasResult = candidates.length > 0;
  const canGoNext = Boolean(hasResult && selectedId);

  const setValue = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const scrollToSection = (ref) => {
    if (!ref?.current) return;
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToResult = () => {
    if (!refResult?.current) return;
    refResult.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ✅ draft 로드 (+ 간단한 구버전 필드 마이그레이션)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const loaded =
        parsed?.form && typeof parsed.form === "object" ? parsed.form : null;
      if (loaded) {
        setForm((prev) => {
          const next = { ...prev, ...loaded };

          // 구버전 키가 남아있다면, 빈 값일 때만 최소 매핑
          if (
            !String(next.founding_story || "").trim() &&
            String(loaded.originStory || "").trim()
          ) {
            next.founding_story = loaded.originStory;
          }
          if (
            !String(next.customer_conflict || "").trim() &&
            String(loaded.problemStory || "").trim()
          ) {
            next.customer_conflict = loaded.problemStory;
          }
          if (
            !String(next.customer_transformation || "").trim() &&
            String(loaded.solutionStory || "").trim()
          ) {
            next.customer_transformation = loaded.solutionStory;
          }
          if (
            !String(next.ultimate_goal || "").trim() &&
            String(loaded.goal || "").trim()
          ) {
            next.ultimate_goal = loaded.goal;
          }
          if (
            !String(next.brand_mission || "").trim() &&
            String(loaded.brandCore || "").trim()
          ) {
            next.brand_mission = loaded.brandCore;
          }

          return next;
        });
      }
      if (parsed?.updatedAt) {
        const d = new Date(parsed.updatedAt);
        if (!Number.isNaN(d.getTime())) setLastSaved(d.toLocaleString());
      }
    } catch {
      // ignore
    }
  }, []);

  // ✅ 기업 진단&인터뷰 값 자동 반영
  useEffect(() => {
    try {
      const diag = readDiagnosisForm();
      if (!diag) return;

      const next = {
        companyName: safeText(
          diag.companyName || diag.brandName || diag.projectName,
          "",
        ),
        industry: safeText(diag.industry || diag.category || diag.field, ""),
        stage: safeText(diag.stage, ""),
        website: safeText(diag.website || diag.homepage || diag.siteUrl, ""),
        oneLine: safeText(
          diag.oneLine ||
            diag.companyIntro ||
            diag.intro ||
            diag.serviceIntro ||
            diag.shortIntro,
          "",
        ),
        targetCustomer: safeText(
          diag.targetCustomer ||
            diag.target ||
            diag.customerTarget ||
            diag.primaryCustomer,
          "",
        ),
      };

      setForm((prev) => ({
        ...prev,
        companyName: next.companyName || prev.companyName,
        industry: next.industry || prev.industry,
        stage: next.stage || prev.stage,
        website: next.website || prev.website,
        oneLine: next.oneLine || prev.oneLine,
        targetCustomer: next.targetCustomer || prev.targetCustomer,
      }));
    } catch {
      // ignore
    }
  }, []);

  // ✅ 결과 로드(후보/선택)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESULT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.candidates)) setCandidates(parsed.candidates);
      if (parsed?.selectedId) setSelectedId(parsed.selectedId);
      if (typeof parsed?.regenSeed === "number") setRegenSeed(parsed.regenSeed);
    } catch {
      // ignore
    }
  }, []);

  // ✅ 자동 저장(디바운스)
  useEffect(() => {
    setSaveMsg("");
    const t = setTimeout(() => {
      try {
        const payload = { form, updatedAt: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        setLastSaved(new Date(payload.updatedAt).toLocaleString());
        setSaveMsg("자동 저장됨");
      } catch {
        // ignore
      }
    }, 600);

    return () => clearTimeout(t);
  }, [form]);

  const persistResult = (nextCandidates, nextSelectedId, nextSeed) => {
    const updatedAt = Date.now();

    try {
      localStorage.setItem(
        RESULT_KEY,
        JSON.stringify({
          candidates: nextCandidates,
          selectedId: nextSelectedId,
          regenSeed: nextSeed,
          updatedAt,
        }),
      );
    } catch {
      // ignore
    }

    // ✅ legacy 저장(통합 결과/결과 리포트 페이지 호환)
    try {
      const selected =
        nextCandidates.find((c) => c.id === nextSelectedId) || null;
      localStorage.setItem(
        LEGACY_KEY,
        JSON.stringify({
          form,
          candidates: nextCandidates,
          selectedId: nextSelectedId,
          selected,
          regenSeed: nextSeed,
          updatedAt,
        }),
      );
    } catch {
      // ignore
    }
  };

  const handleGenerateCandidates = async (mode = "generate") => {
    // 🔌 BACKEND 연동 포인트 (브랜드 스토리 컨설팅 - AI 분석 요청 버튼)
    // - 백엔드 연동 시(명세서 기준):
    //   A) 인터뷰 저장(공통): POST /brands/interview
    //   B) 스토리 생성:     POST /brands/story (또는 유사)
    if (!canAnalyze) {
      alert("필수 항목을 모두 입력하면 요청이 가능합니다.");
      return;
    }

    setAnalyzing(true);
    try {
      const nextSeed = mode === "regen" ? regenSeed + 1 : regenSeed;
      if (mode === "regen") setRegenSeed(nextSeed);

      await new Promise((r) => setTimeout(r, 450));
      const nextCandidates = generateStoryCandidates(form, nextSeed);

      setCandidates(nextCandidates);
      setSelectedId(null);
      persistResult(nextCandidates, null, nextSeed);
      scrollToResult();
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectCandidate = (id) => {
    setSelectedId(id);
    persistResult(candidates, id, regenSeed);
  };

  const handleGoNext = () => {
    navigate(NEXT_PATH);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetAll = () => {
    const ok = window.confirm("입력/결과를 모두 초기화할까요?");
    if (!ok) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(RESULT_KEY);
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      // ignore
    }

    const diag = (() => {
      try {
        return readDiagnosisForm();
      } catch {
        return null;
      }
    })();

    const base = { ...INITIAL_FORM };
    if (diag) {
      base.companyName = safeText(
        diag.companyName || diag.brandName || diag.projectName,
        "",
      );
      base.industry = safeText(
        diag.industry || diag.category || diag.field,
        "",
      );
      base.stage = safeText(diag.stage, "");
      base.website = safeText(
        diag.website || diag.homepage || diag.siteUrl,
        "",
      );
      base.oneLine = safeText(
        diag.oneLine ||
          diag.companyIntro ||
          diag.intro ||
          diag.serviceIntro ||
          diag.shortIntro,
        "",
      );
      base.targetCustomer = safeText(
        diag.targetCustomer ||
          diag.target ||
          diag.customerTarget ||
          diag.primaryCustomer,
        "",
      );
    }

    setForm(base);
    setCandidates([]);
    setSelectedId(null);
    setRegenSeed(0);
    setSaveMsg("");
    setLastSaved("-");
  };

  return (
    <div className="diagInterview consultingInterview">
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

      <main className="diagInterview__main">
        <div className="diagInterview__container">
          <div className="diagInterview__titleRow">
            <div>
              <h1 className="diagInterview__title">
                브랜드 스토리 컨설팅 인터뷰
              </h1>
              <p className="diagInterview__sub">
                기업 진단에서 입력한 기본 정보는 자동 반영되며, 여기서는 브랜드
                스토리(계기·갈등·전환·미션·플롯·감정·궁극 목표)를 입력합니다.
              </p>
            </div>

            <div className="diagInterview__topActions">
              <button
                type="button"
                className="btn ghost"
                onClick={() => navigate("/brandconsulting")}
              >
                브랜드 컨설팅 홈
              </button>
            </div>
          </div>

          <ConsultingFlowPanel activeKey="story" />

          <div className="diagInterview__grid">
            <section className="diagInterview__left">
              {/* 1) BASIC (자동 반영) */}
              <div className="card" ref={refBasic}>
                <div className="card__head">
                  <h2>1. 기본 정보 (자동 반영)</h2>
                  <p>
                    기업 진단&인터뷰에서 입력한 정보를 자동으로 불러옵니다. (이
                    페이지에서 수정하지 않아요)
                  </p>
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label>회사/프로젝트명</label>
                    <input
                      value={form.companyName}
                      disabled
                      placeholder="기업 진단에서 자동 반영"
                    />
                  </div>

                  <div className="field">
                    <label>산업/분야</label>
                    <input
                      value={form.industry}
                      disabled
                      placeholder="기업 진단에서 자동 반영"
                    />
                  </div>

                  <div className="field">
                    <label>성장 단계</label>
                    <input
                      value={stageLabel(form.stage)}
                      disabled
                      placeholder="기업 진단에서 자동 반영"
                    />
                  </div>

                  <div className="field">
                    <label>웹사이트/소개 링크</label>
                    <input
                      value={form.website}
                      disabled
                      placeholder="기업 진단에서 자동 반영"
                    />
                  </div>
                </div>

                {String(form.targetCustomer || "").trim() ? (
                  <div className="field">
                    <label>타깃(진단 기준)</label>
                    <input value={form.targetCustomer} disabled />
                  </div>
                ) : null}

                <div className="field">
                  <label>회사/서비스 소개</label>
                  <textarea
                    value={form.oneLine}
                    disabled
                    placeholder="기업 진단에서 자동 반영"
                    rows={3}
                  />
                </div>
              </div>

              {/* 2) STORY MATERIAL */}
              <div className="card" ref={refMaterial}>
                <div className="card__head">
                  <h2>2. 스토리 재료</h2>
                  <p>
                    스토리의 사실/재료를 먼저 채우면, 플롯에 맞게 문장이
                    깔끔해져요.
                  </p>
                </div>

                <div className="field">
                  <label>
                    창업 계기/사건 <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.founding_story}
                    onChange={(e) => setValue("founding_story", e.target.value)}
                    placeholder="어떤 사건/불편/계기로 시작했나요? (구체적인 장면이 있을수록 좋아요)"
                    rows={5}
                  />
                </div>

                <div className="field">
                  <label>
                    고객이 겪는 가장 큰 결핍/방해물{" "}
                    <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.customer_conflict}
                    onChange={(e) =>
                      setValue("customer_conflict", e.target.value)
                    }
                    placeholder="고객이 지금 막히는 지점은 무엇인가요? (시간/정보/비용/신뢰/습관 등)"
                    rows={5}
                  />
                </div>

                <div className="field">
                  <label>
                    사용 전/후 고객의 변화 <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.customer_transformation}
                    onChange={(e) =>
                      setValue("customer_transformation", e.target.value)
                    }
                    placeholder="사용 전에는 어떤 상태였고, 사용 후에는 무엇이 달라지나요?"
                    rows={5}
                  />
                </div>
              </div>

              {/* 3) STYLE/EMOTION */}
              <div className="card" ref={refStyle}>
                <div className="card__head">
                  <h2>3. 원하는 플롯/감정</h2>
                  <p>
                    스토리텔링 스타일과 자극하고 싶은 감정을 선택하면, 같은
                    재료도 더 설득력 있게 구성돼요.
                  </p>
                </div>

                <div className="field">
                  <label>
                    원하는 스토리텔링 스타일 <span className="req">*</span>
                  </label>
                  <div className="hint" style={{ marginTop: 6 }}>
                    여러 개 선택 가능 (선택한 유형을 우선 반영해 후보를
                    만들어요)
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <MultiChips
                      value={form.story_plot}
                      options={STORY_PLOT_OPTIONS}
                      onChange={(next) => setValue("story_plot", next)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label>
                    스토리로 자극하고 싶은 감정 <span className="req">*</span>
                  </label>
                  <div className="hint" style={{ marginTop: 6 }}>
                    여러 개 선택 가능
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <MultiChips
                      value={form.story_emotion}
                      options={STORY_EMOTION_OPTIONS}
                      onChange={(next) => setValue("story_emotion", next)}
                    />
                  </div>
                </div>
              </div>

              {/* 4) MISSION / ULTIMATE GOAL */}
              <div className="card" ref={refVision}>
                <div className="card__head">
                  <h2>4. 미션/궁극적 목표</h2>
                  <p>
                    브랜드가 세상에 남기고 싶은 변화(미션)와 최종적으로 만들고
                    싶은 세상을 정리합니다.
                  </p>
                </div>

                <div className="field">
                  <label>
                    수익 외에 세상에 기여하려는 바(미션){" "}
                    <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.brand_mission}
                    onChange={(e) => setValue("brand_mission", e.target.value)}
                    placeholder="예) 누구나 더 쉽게, 더 안전하게, 더 확신 있게 결정할 수 있도록 돕는다"
                    rows={5}
                  />
                </div>

                <div className="field">
                  <label>
                    궁극적으로 만들고 싶은 세상의 모습{" "}
                    <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.ultimate_goal}
                    onChange={(e) => setValue("ultimate_goal", e.target.value)}
                    placeholder="예) 좋은 선택이 정보 격차에 의해 좌우되지 않는 세상"
                    rows={5}
                  />
                </div>
              </div>

              {/* 5) NOTES */}
              <div className="card" ref={refNotes}>
                <div className="card__head">
                  <h2>5. 추가 요청 (선택)</h2>
                  <p>
                    길이/문체/사용처 등 추가로 반영할 조건이 있으면 적어주세요.
                  </p>
                </div>

                <div className="field">
                  <label>추가 메모</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setValue("notes", e.target.value)}
                    placeholder="예) 랜딩페이지용으로 6~8문장 버전 + 2문장 요약도 같이"
                    rows={4}
                  />
                </div>
              </div>

              {/* 결과 영역 */}
              <div ref={refResult} />

              {analyzing ? (
                <div className="card" style={{ marginTop: 14 }}>
                  <div className="card__head">
                    <h2>스토리 후보 생성 중</h2>
                    <p>입력 내용을 바탕으로 후보 3안을 만들고 있어요.</p>
                  </div>
                  <div className="hint">잠시만 기다려주세요…</div>
                </div>
              ) : hasResult ? (
                <div className="card" style={{ marginTop: 14 }}>
                  <div className="card__head">
                    <h2>스토리 후보 3안</h2>
                    <p>
                      후보 1개를 선택하면 다음 단계로 진행할 수 있어요. (현재는
                      더미 생성)
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {candidates.map((c) => {
                      const isSelected = selectedId === c.id;
                      return (
                        <div
                          key={c.id}
                          style={{
                            borderRadius: 16,
                            padding: 14,
                            border: isSelected
                              ? "1px solid rgba(99,102,241,0.45)"
                              : "1px solid rgba(0,0,0,0.08)",
                            boxShadow: isSelected
                              ? "0 12px 30px rgba(99,102,241,0.10)"
                              : "none",
                            background: "rgba(255,255,255,0.6)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 10,
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 900, fontSize: 15 }}>
                                {c.name}
                              </div>
                              <div style={{ marginTop: 6, opacity: 0.9 }}>
                                {c.oneLiner}
                              </div>
                              <div
                                style={{
                                  marginTop: 6,
                                  opacity: 0.8,
                                  fontSize: 12,
                                }}
                              >
                                {c.meta}
                              </div>
                            </div>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 800,
                                padding: "4px 10px",
                                borderRadius: 999,
                                background: isSelected
                                  ? "rgba(99,102,241,0.12)"
                                  : "rgba(0,0,0,0.04)",
                                border: isSelected
                                  ? "1px solid rgba(99,102,241,0.25)"
                                  : "1px solid rgba(0,0,0,0.06)",
                                color: "rgba(0,0,0,0.75)",
                                height: "fit-content",
                              }}
                            >
                              {isSelected ? "선택됨" : "후보"}
                            </span>
                          </div>

                          <div
                            style={{
                              marginTop: 10,
                              fontSize: 13,
                              opacity: 0.92,
                              whiteSpace: "pre-wrap",
                              lineHeight: 1.55,
                            }}
                          >
                            {c.story}

                            <div style={{ marginTop: 10, opacity: 0.9 }}>
                              <b>플롯</b> · {c.plot}
                            </div>
                            <div style={{ marginTop: 6, opacity: 0.9 }}>
                              <b>감정</b> · {(c.emotions || []).join(" · ")}
                            </div>
                            <div style={{ marginTop: 6, opacity: 0.9 }}>
                              <b>마무리</b> · {c.ending}
                            </div>

                            <div style={{ marginTop: 10 }}>
                              <b>키워드</b>
                              <div
                                style={{
                                  marginTop: 6,
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 6,
                                }}
                              >
                                {(c.keywords || []).map((kw) => (
                                  <span
                                    key={kw}
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 800,
                                      padding: "4px 10px",
                                      borderRadius: 999,
                                      background: "rgba(0,0,0,0.04)",
                                      border: "1px solid rgba(0,0,0,0.06)",
                                      color: "rgba(0,0,0,0.75)",
                                    }}
                                  >
                                    #{kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{ marginTop: 12, display: "flex", gap: 8 }}
                          >
                            <button
                              type="button"
                              className={`btn primary ${isSelected ? "disabled" : ""}`}
                              disabled={isSelected}
                              onClick={() => handleSelectCandidate(c.id)}
                            >
                              {isSelected ? "선택 완료" : "이 방향 선택"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
                    {canGoNext
                      ? "✅ 사이드 카드에서 ‘로고 단계로 이동’ 버튼을 눌러주세요."
                      : "* 후보 1개를 선택하면 사이드 카드에 다음 단계 버튼이 표시됩니다."}
                  </div>
                </div>
              ) : null}
            </section>

            {/* ✅ 오른쪽: 진행률 */}
            <aside className="diagInterview__right">
              <div className="sideCard">
                <ConsultingFlowMini activeKey="story" />

                <div className="sideCard__titleRow">
                  <h3>진행 상태</h3>
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
                    <span className="k">필수 완료</span>
                    <span className="v">
                      {completedRequired}/{requiredKeys.length}
                    </span>
                  </div>
                  <div className="sideMeta__row">
                    <span className="k">마지막 저장</span>
                    <span className="v">{lastSaved}</span>
                  </div>
                  <div className="sideMeta__row">
                    <span className="k">단계</span>
                    <span className="v">{stageLabel(form.stage)}</span>
                  </div>
                </div>

                {saveMsg ? <p className="saveMsg">{saveMsg}</p> : null}

                <div className="divider" />

                <h4 className="sideSubTitle">빠른 작업</h4>

                <button
                  type="button"
                  className={`btn primary ${canAnalyze && !analyzing ? "" : "disabled"}`}
                  onClick={() =>
                    handleGenerateCandidates(hasResult ? "regen" : "generate")
                  }
                  disabled={!canAnalyze || analyzing}
                  style={{ width: "100%", marginBottom: 8 }}
                >
                  {analyzing
                    ? "생성 중..."
                    : hasResult
                      ? "AI 분석 재요청"
                      : "AI 분석 요청"}
                </button>

                <button
                  type="button"
                  className="btn ghost"
                  onClick={handleResetAll}
                  style={{ width: "100%" }}
                >
                  전체 초기화
                </button>

                {!canAnalyze ? (
                  <p className="hint" style={{ marginTop: 10 }}>
                    * 필수 항목을 채우면 분석 버튼이 활성화됩니다.
                  </p>
                ) : null}

                <div className="divider" />

                <h4 className="sideSubTitle">다음 단계</h4>
                {canGoNext ? (
                  <button
                    type="button"
                    className="btn primary"
                    onClick={handleGoNext}
                    style={{ width: "100%" }}
                  >
                    로고 단계로 이동
                  </button>
                ) : (
                  <p className="hint" style={{ marginTop: 10 }}>
                    * 후보 1개를 선택하면 다음 단계 버튼이 표시됩니다.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter onOpenPolicy={setOpenType} />
    </div>
  );
}
