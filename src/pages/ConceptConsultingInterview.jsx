// src/pages/ConceptConsultingInterview.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

import ConsultingFlowPanel from "../components/ConsultingFlowPanel.jsx";
import ConsultingFlowMini from "../components/ConsultingFlowMini.jsx";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

const STORAGE_KEY = "conceptInterviewDraft_homepage_v6";
const RESULT_KEY = "conceptInterviewResult_homepage_v6";
const LEGACY_KEY = "brandInterview_homepage_v1";
const NEXT_PATH = "/brand/story";

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
            className="chip"
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

function generateConceptCandidates(form, seed = 0) {
  const brandName = safeText(form?.brandName, "브랜드");
  const category = safeText(form?.category, "분야");
  const stage = stageLabel(form?.stage);
  const target = safeText(form?.targetCustomer, "고객");
  const oneLine = safeText(form?.oneLine, "");

  const coreValues = Array.isArray(form?.core_values) ? form.core_values : [];
  const brandVoice = Array.isArray(form?.brand_voice) ? form.brand_voice : [];
  const brandArchetype = Array.isArray(form?.brand_archetype)
    ? form.brand_archetype
    : [];

  const keyMessage = safeText(form?.key_message, "고객이 기억해야 할 한 문장");
  const trustFactors = safeText(form?.trust_factors, "신뢰 포인트");
  const vibe = safeText(form?.concept_vibe, "담백하고 신뢰감");
  const sloganKw = safeText(form?.slogan_keywords, "");

  const pick = (arr, idx) => arr[(idx + seed) % arr.length];

  const tonePresets = [
    { tone: "미니멀/신뢰", vibeHint: "차분 · 정돈 · 확신" },
    { tone: "테크/선명", vibeHint: "명확 · 속도 · 정확" },
    { tone: "따뜻/친근", vibeHint: "따뜻 · 쉬움 · 공감" },
  ];

  const slogans = [
    "복잡함을 단순하게",
    "신뢰로 선택을 돕다",
    "성장을 설계하다",
    "실행을 이어가다",
    "확신을 만드는 한 걸음",
  ];

  const mk = (id, preset, archeFallback, voiceFallback) => {
    const arche = brandArchetype[0] || archeFallback;
    const voice = brandVoice[0] || voiceFallback;
    const core = coreValues.length
      ? coreValues.slice(0, 2).join(" · ")
      : "신뢰 · 단순함";

    const slogan = sloganKw
      ? `${sloganKw}로 더 ${preset.tone.split("/")[0]}하게`
      : pick(slogans, 0);

    const keywords = Array.from(
      new Set([
        ...coreValues,
        arche,
        voice,
        vibe,
        ...(sloganKw ? [sloganKw] : []),
        preset.tone.split("/")[0],
      ]),
    ).slice(0, 10);

    return {
      id,
      title: `${brandName} · ${preset.tone} 컨셉`,
      summary: `${category}(${stage})에서 ${target}에게 '${keyMessage}'를 전달하는 ${arche}형 브랜드`,
      tone: `${voice} · ${preset.tone}`,
      coreValues: coreValues.length ? coreValues : ["신뢰", "단순함"],
      brandVoice: brandVoice.length ? brandVoice : [voice],
      brandArchetype: brandArchetype.length ? brandArchetype : [arche],
      keyMessage,
      trustFactors,
      conceptVibe: vibe || preset.vibeHint,
      slogan,
      keywords,
      oneLine: oneLine ? `“${oneLine}”` : `“${keyMessage}”`,
      note: `핵심가치(${core}) 기반으로 ‘톤/아키타입/시각 분위기’를 정렬한 방향입니다.`,
    };
  };

  const p1 = pick(tonePresets, 0);
  const p2 = pick(tonePresets, 1);
  const p3 = pick(tonePresets, 2);

  return [
    mk("concept_1", p1, "현자(Sage)", "전문적인 박사님"),
    mk("concept_2", p2, "창조자(Creator)", "친절한 가이드"),
    mk("concept_3", p3, "영웅(Hero)", "위트 있는 친구"),
  ];
}

const CORE_VALUE_OPTIONS = ["혁신", "신뢰", "단순함"];
const BRAND_VOICE_OPTIONS = [
  "전문적인 박사님",
  "친절한 가이드",
  "위트 있는 친구",
];
const ARCHETYPE_OPTIONS = ["현자(Sage)", "영웅(Hero)", "창조자(Creator)"];

const INITIAL_FORM = {
  // ✅ 기업 진단에서 자동 반영(편집 X)
  brandName: "",
  category: "",
  stage: "",
  oneLine: "",
  targetCustomer: "",
  referenceLink: "",

  // ✅ Step 3. 브랜드 컨셉/톤 (편집 O)
  core_values: [], // multiple
  brand_voice: [], // multiple
  brand_archetype: [], // multiple
  key_message: "",
  trust_factors: "",
  concept_vibe: "",
  slogan_keywords: "", // optional
  notes: "", // 선택 메모(유지)
};

export default function ConceptConsultingInterview({ onLogout }) {
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
  const refConcept = useRef(null);
  const refNotes = useRef(null);

  const sections = useMemo(
    () => [
      { id: "basic", label: "기본 정보", ref: refBasic },
      { id: "concept", label: "브랜드 컨셉/톤", ref: refConcept },
      { id: "notes", label: "추가 요청", ref: refNotes },
    ],
    [],
  );

  // ✅ 필수 항목(이번 Step3 질문 기준)
  const requiredKeys = useMemo(
    () => [
      "core_values",
      "brand_voice",
      "brand_archetype",
      "key_message",
      "trust_factors",
      "concept_vibe",
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

  // ✅ draft 로드
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.form && typeof parsed.form === "object") {
        setForm((prev) => ({ ...prev, ...parsed.form }));
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
        brandName: safeText(
          diag.companyName || diag.brandName || diag.projectName,
          "",
        ),
        category: safeText(diag.industry || diag.category || diag.field, ""),
        stage: safeText(diag.stage, ""),
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
        referenceLink: safeText(
          diag.website || diag.homepage || diag.siteUrl,
          "",
        ),
      };

      setForm((prev) => ({
        ...prev,
        brandName: next.brandName || prev.brandName,
        category: next.category || prev.category,
        stage: next.stage || prev.stage,
        oneLine: next.oneLine || prev.oneLine,
        targetCustomer: next.targetCustomer || prev.targetCustomer,
        referenceLink: next.referenceLink || prev.referenceLink,
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
    // 🔌 BACKEND 연동 포인트 (컨셉 컨설팅 - AI 분석 요청 버튼)
    // - 백엔드 연동 시(명세서 기준):
    //   A) 인터뷰 저장(공통): POST /brands/interview
    //   B) 컨셉 생성:       POST /brands/concept (또는 유사)
    if (!canAnalyze) {
      alert("필수 항목을 모두 입력하면 요청이 가능합니다.");
      return;
    }

    setAnalyzing(true);
    try {
      const nextSeed = mode === "regen" ? regenSeed + 1 : regenSeed;
      if (mode === "regen") setRegenSeed(nextSeed);

      await new Promise((r) => setTimeout(r, 450));
      const nextCandidates = generateConceptCandidates(form, nextSeed);

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
      base.brandName = safeText(
        diag.companyName || diag.brandName || diag.projectName,
        "",
      );
      base.category = safeText(
        diag.industry || diag.category || diag.field,
        "",
      );
      base.stage = safeText(diag.stage, "");
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
      base.referenceLink = safeText(
        diag.website || diag.homepage || diag.siteUrl,
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
              <h1 className="diagInterview__title">컨셉 컨설팅 인터뷰</h1>
              <p className="diagInterview__sub">
                기업 진단에서 입력한 기본 정보는 자동 반영되며, 여기서는 브랜드
                컨셉/톤(가치·말투·아키타입·키메시지·신뢰·분위기)을 입력합니다.
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

          <ConsultingFlowPanel activeKey="concept" />

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
                      value={form.brandName}
                      disabled
                      placeholder="기업 진단에서 자동 반영"
                    />
                  </div>

                  <div className="field">
                    <label>산업/분야</label>
                    <input
                      value={form.category}
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
                      value={form.referenceLink}
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
                  <label>회사/서비스 한 줄 소개</label>
                  <textarea
                    value={form.oneLine}
                    disabled
                    placeholder="기업 진단에서 자동 반영"
                    rows={3}
                  />
                </div>
              </div>

              {/* 2) Step 3. 브랜드 컨셉/톤 */}
              <div className="card" ref={refConcept}>
                <div className="card__head">
                  <h2>2. 브랜드 컨셉/톤 (Concept)</h2>
                  <p>
                    브랜드의 중심 가치, 말투, 성격(아키타입)을 정하고
                    메시지/신뢰/분위기를 정리합니다.
                  </p>
                </div>

                <div className="field">
                  <label>
                    절대 포기할 수 없는 가치 2가지{" "}
                    <span className="req">*</span>
                  </label>
                  <div className="hint" style={{ marginTop: 6 }}>
                    최대 2개까지 선택되도록 저장됩니다.
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <MultiChips
                      value={form.core_values}
                      options={CORE_VALUE_OPTIONS}
                      max={2}
                      onChange={(next) => setValue("core_values", next)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label>
                    고객에게 말 건다면 말투 <span className="req">*</span>
                  </label>
                  <div className="hint" style={{ marginTop: 6 }}>
                    여러 개 선택 가능 (추천: 1~2개)
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <MultiChips
                      value={form.brand_voice}
                      options={BRAND_VOICE_OPTIONS}
                      onChange={(next) => setValue("brand_voice", next)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label>
                    브랜드 성격(아키타입) <span className="req">*</span>
                  </label>
                  <div className="hint" style={{ marginTop: 6 }}>
                    여러 개 선택 가능 (추천: 1개를 대표로)
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <MultiChips
                      value={form.brand_archetype}
                      options={ARCHETYPE_OPTIONS}
                      onChange={(next) => setValue("brand_archetype", next)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label>
                    고객이 기억해야 할 한 문장(키 메시지){" "}
                    <span className="req">*</span>
                  </label>
                  <input
                    value={form.key_message}
                    onChange={(e) => setValue("key_message", e.target.value)}
                    placeholder="예) 우리는 당신의 결정을 더 빠르고 확실하게 만듭니다."
                  />
                </div>

                <div className="field">
                  <label>
                    고객을 안심시키는 근거(신뢰 포인트){" "}
                    <span className="req">*</span>
                  </label>
                  <input
                    value={form.trust_factors}
                    onChange={(e) => setValue("trust_factors", e.target.value)}
                    placeholder="예) 실제 데이터 기반 추천 / 검증된 파트너 / 성과 지표"
                  />
                </div>

                <div className="field">
                  <label>
                    브랜드 전체 분위기(시각/심리) <span className="req">*</span>
                  </label>
                  <input
                    value={form.concept_vibe}
                    onChange={(e) => setValue("concept_vibe", e.target.value)}
                    placeholder="예) 미니멀, 차분, 선명, 고급스러움, 따뜻함"
                  />
                </div>

                <div className="field">
                  <label>슬로건에 들어갈 핵심 단어(선택)</label>
                  <input
                    value={form.slogan_keywords}
                    onChange={(e) =>
                      setValue("slogan_keywords", e.target.value)
                    }
                    placeholder="예) 신뢰 / 실행 / 성장 / 단순"
                  />
                </div>
              </div>

              {/* 3) NOTES */}
              <div className="card" ref={refNotes}>
                <div className="card__head">
                  <h2>3. 추가 요청 (선택)</h2>
                  <p>
                    추가로 반영하고 싶은 조건이나 강조 포인트가 있으면
                    적어주세요.
                  </p>
                </div>

                <div className="field">
                  <label>추가 메모</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setValue("notes", e.target.value)}
                    placeholder="예) 너무 과장되지 않게, 1~2문장으로 짧고 선명하게"
                    rows={5}
                  />
                </div>
              </div>

              {/* 결과 영역 */}
              <div ref={refResult} />

              {analyzing ? (
                <div className="card" style={{ marginTop: 14 }}>
                  <div className="card__head">
                    <h2>컨셉 후보 생성 중</h2>
                    <p>입력 내용을 바탕으로 후보 3안을 만들고 있어요.</p>
                  </div>
                  <div className="hint">잠시만 기다려주세요…</div>
                </div>
              ) : hasResult ? (
                <div className="card" style={{ marginTop: 14 }}>
                  <div className="card__head">
                    <h2>컨셉 후보 3안</h2>
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
                                {c.title}
                              </div>
                              <div style={{ marginTop: 6, opacity: 0.9 }}>
                                {c.summary}
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
                            }}
                          >
                            <div>
                              <b>톤</b> · {c.tone}
                            </div>
                            <div style={{ marginTop: 6 }}>
                              <b>핵심가치</b> ·{" "}
                              {(c.coreValues || []).join(" · ")}
                            </div>
                            <div style={{ marginTop: 6 }}>
                              <b>아키타입</b> ·{" "}
                              {(c.brandArchetype || []).join(" · ")}
                            </div>
                            <div style={{ marginTop: 6 }}>
                              <b>키 메시지</b> · {c.keyMessage}
                            </div>
                            <div style={{ marginTop: 6 }}>
                              <b>신뢰 포인트</b> · {c.trustFactors}
                            </div>
                            <div style={{ marginTop: 6 }}>
                              <b>분위기</b> · {c.conceptVibe}
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

                            <div style={{ marginTop: 10, opacity: 0.9 }}>
                              <b>슬로건</b> · {c.slogan}
                            </div>

                            <div style={{ marginTop: 6, opacity: 0.9 }}>
                              <b>원라인</b> · {c.oneLine}
                            </div>

                            {c.note ? (
                              <div style={{ marginTop: 10, opacity: 0.85 }}>
                                <b>메모</b> · {c.note}
                              </div>
                            ) : null}
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
                      ? "✅ 사이드 카드에서 ‘스토리 단계로 이동’ 버튼을 눌러주세요."
                      : "* 후보 1개를 선택하면 사이드 카드에 다음 단계 버튼이 표시됩니다."}
                  </div>
                </div>
              ) : null}
            </section>

            {/* ✅ 오른쪽: 진행률 */}
            <aside className="diagInterview__right">
              <div className="sideCard">
                <ConsultingFlowMini activeKey="concept" />

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
                    스토리 단계로 이동
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
