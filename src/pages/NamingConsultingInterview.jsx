// src/pages/NamingConsultingInterview.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

import ConsultingFlowPanel from "../components/ConsultingFlowPanel.jsx";
import ConsultingFlowMini from "../components/ConsultingFlowMini.jsx";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

const STORAGE_KEY = "namingConsultingInterviewDraft_v1";
const RESULT_KEY = "namingConsultingInterviewResult_v1";
const LEGACY_KEY = "brandInterview_naming_v1";

// ✅ 선택 옵션
const INDUSTRY_OPTIONS = [
  "IT/SaaS",
  "브랜딩/마케팅",
  "컨설팅/에이전시",
  "이커머스/리테일",
  "교육/에듀테크",
  "헬스케어/바이오",
  "금융/핀테크",
  "부동산/프롭테크",
  "푸드/프랜차이즈",
  "콘텐츠/미디어",
  "제조/하드웨어",
  "모빌리티/물류",
  "여행/레저",
  "공공/지자체",
];

const TARGET_OPTIONS = [
  "초기 창업자/대표",
  "마케팅/브랜딩 담당자",
  "B2B 구매/도입 담당자",
  "소상공인/자영업자",
  "중소기업 실무자",
  "개인 크리에이터",
  "학생/취업준비생",
  "일반 소비자(B2C)",
];

function stageLabel(stage) {
  const s = String(stage || "");
  if (s === "idea") return "아이디어";
  if (s === "mvp") return "MVP/테스트";
  if (s === "pmf") return "PMF 탐색";
  if (s === "revenue") return "매출 발생";
  if (s === "invest") return "투자 유치";
  if (s === "rebrand") return "리브랜딩";
  return s || "-";
}

function safeText(v, fallback = "") {
  const s = String(v ?? "").trim();
  return s ? s : fallback;
}

function pickKeywords(text, max = 8) {
  const raw = String(text || "")
    .split(/[,\n\t]/g)
    .map((s) => s.trim())
    .filter(Boolean);
  const uniq = Array.from(new Set(raw));
  return uniq.slice(0, max);
}

function generateNamingCandidates(form, seed = 0) {
  const industry = safeText(form?.industry, "분야");
  const target = safeText(form?.targetCustomer, "고객");
  const tone = safeText(form?.tone, "신뢰/미니멀");
  const kws = pickKeywords(form?.keywords, 10);
  const avoid = pickKeywords(form?.avoidWords || "", 8);
  const lang = safeText(form?.language, "ko");
  const style = safeText(form?.namingStyle, "브랜드형");
  const emotion = safeText(form?.targetEmotion, "신뢰감");
  const goal = safeText(form?.goal, "기억하기 쉬운 이름");

  const pick = (arr, idx) => arr[(idx + seed) % arr.length];

  const baseRootsKo = [
    "브랜",
    "파일럿",
    "스파크",
    "웨이브",
    "그로우",
    "루트",
    "코어",
    "링크",
    "퀘스트",
    "플랜",
  ];
  const baseRootsEn = [
    "Pilot",
    "Spark",
    "Grow",
    "Core",
    "Link",
    "Wave",
    "Quest",
    "Plan",
    "Forge",
    "Bloom",
  ];

  const mkKo = (prefix, root, suffix = "") =>
    `${prefix}${root}${suffix}`.replace(/\s+/g, "");
  const mkEn = (prefix, root, suffix = "") =>
    `${prefix}${root}${suffix}`.replace(/\s+/g, "");

  const makeSamples = (mode) => {
    const roots = mode === "en" ? baseRootsEn : baseRootsKo;
    const p1 = pick(
      mode === "en"
        ? ["", "Neo", "Pro", "Meta", "Bright"]
        : ["", "뉴", "프로", "메타", "브랜드"],
      0,
    );
    const s1 = pick(
      mode === "en" ? ["", "ly", "io", "lab", "works"] : ["", "온", "랩", "웍스", "플랜"],
      1,
    );

    const list = [];
    for (let i = 0; i < 6; i += 1) {
      const r = pick(roots, i);
      if (mode === "en") list.push(mkEn(p1, r, s1));
      else list.push(mkKo(p1, r, s1));
    }
    return Array.from(new Set(list)).slice(0, 6);
  };

  const mode = lang === "en" ? "en" : "ko";

  return [
    {
      id: `nameA_${seed}`,
      name: "A · 브랜드형(기억/발음 중심)",
      oneLiner: `${goal}을 우선으로, 짧고 단단한 브랜드 네임`,
      keywords: Array.from(
        new Set(["간결", "가독", "브랜드형", emotion, ...kws.slice(0, 4)]),
      ).slice(0, 10),
      style: `${style} · ${tone}`,
      samples: makeSamples(mode),
      rationale: `타깃(${target})이 한 번 듣고도 기억할 수 있게 2~3음절(또는 5~8자) 중심으로 제안합니다. 업종(${industry})에서도 범용 확장에 유리합니다.`,
      checks: ["발음/철자 난이도 낮음", "검색 중복 가능성 점검", "도메인/상표 사전 조사 권장"],
      avoid,
    },
    {
      id: `nameB_${seed}`,
      name: "B · 의미형(문제/해결 강조)",
      oneLiner: `업종(${industry})의 ‘가치/해결’을 담은 의미 중심 네이밍`,
      keywords: Array.from(new Set(["의미", "가치", "해결", emotion, ...kws.slice(0, 4)])).slice(0, 10),
      style: `${style} · 메시지형`,
      samples: makeSamples(mode)
        .map((s) => (mode === "en" ? `${s}Solve` : `${s}솔브`))
        .slice(0, 6),
      rationale: `고객이 ‘무슨 서비스인지’를 빠르게 이해하도록 설계합니다. 소개 문구(원라인)와 함께 쓸 때 전환에 유리합니다.`,
      checks: ["의미 과잉/직설적 표현 주의", "경쟁사 유사 키워드 회피", "슬로건과 조합 권장"],
      avoid,
    },
    {
      id: `nameC_${seed}`,
      name: "C · 테크/프리미엄(느낌 중심)",
      oneLiner: `톤(${tone})을 살려 ‘프리미엄/테크’ 무드를 만드는 네이밍`,
      keywords: Array.from(new Set(["테크", "프리미엄", "세련", emotion, ...kws.slice(0, 4)])).slice(0, 10),
      style: `${style} · 프리미엄`,
      samples: makeSamples(mode)
        .map((s) => (mode === "en" ? `Aurum${s}` : `오룸${s}`))
        .slice(0, 6),
      rationale: `로고/브랜드 톤과의 결을 맞춰 ‘보는 순간 느낌이 오는’ 이름을 제안합니다. 투자/제휴 문서에서도 신뢰 인상을 강화합니다.`,
      checks: ["발음이 어려워지지 않게 길이 제한", "특정 업종과 오해되지 않게 의미 보완", "영문 표기 통일"],
      avoid,
    },
  ].slice(0, 3);
}

export default function NamingConsultingInterview({ onLogout }) {
  const navigate = useNavigate();

  // ✅ 약관/방침 모달
  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  // ✅ industry / target 선택 모드
  const [industryMode, setIndustryMode] = useState("select"); // select | custom
  const [industrySelect, setIndustrySelect] = useState("");

  const [targetMode, setTargetMode] = useState("select"); // select | custom
  const [targetSelect, setTargetSelect] = useState("");

  // ✅ 폼 상태
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    stage: "",
    website: "",

    oneLine: "",
    brandDesc: "",

    targetCustomer: "",
    tone: "",
    keywords: "",
    avoidWords: "",
    language: "ko",
    lengthPref: "mid",
    namingStyle: "",
    targetEmotion: "",

    mustInclude: "",
    competitorNames: "",
    domainNeed: "",

    goal: "",
    useCase: "",
    notes: "",
  });

  // ✅ 저장 상태 UI
  const [saveMsg, setSaveMsg] = useState("");
  const [lastSaved, setLastSaved] = useState("-");

  // ✅ 결과(후보/선택) 상태
  const [analyzing, setAnalyzing] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [regenSeed, setRegenSeed] = useState(0);
  const refResult = useRef(null);

  // ✅ 필수 항목(최소)
  const requiredKeys = useMemo(
    () => [
      "companyName",
      "industry",
      "stage",
      "oneLine",
      "targetCustomer",
      "tone",
      "keywords",
      "goal",
    ],
    [],
  );

  const requiredStatus = useMemo(() => {
    const status = {};
    requiredKeys.forEach((k) => {
      status[k] = Boolean(String(form?.[k] || "").trim());
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

  // ✅ draft 로드
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);

      if (parsed?.form) {
        const f = parsed.form;
        setForm((prev) => ({ ...prev, ...f }));

        // industry init
        if (typeof f.industry === "string" && f.industry.trim()) {
          if (INDUSTRY_OPTIONS.includes(f.industry)) {
            setIndustryMode("select");
            setIndustrySelect(f.industry);
          } else {
            setIndustryMode("custom");
            setIndustrySelect("__custom__");
          }
        }

        // target init
        if (typeof f.targetCustomer === "string" && f.targetCustomer.trim()) {
          if (TARGET_OPTIONS.includes(f.targetCustomer)) {
            setTargetMode("select");
            setTargetSelect(f.targetCustomer);
          } else {
            setTargetMode("custom");
            setTargetSelect("__custom__");
          }
        }
      }

      if (parsed?.updatedAt) {
        const d = new Date(parsed.updatedAt);
        if (!Number.isNaN(d.getTime())) setLastSaved(d.toLocaleString());
      }
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

  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const scrollToResult = () => {
    if (!refResult?.current) return;
    refResult.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
    // 🔌 BACKEND 연동 포인트 (네이밍 컨설팅 - AI 분석 요청 버튼)
    // - 현재 로직: 프론트에서 더미 후보(3안) 생성 → 1개 선택 → 다음 단계로 이동
    // - 백엔드 연동 시(명세서 기준):
    //   A) 인터뷰 저장(공통): POST /brands/interview
    //   B) 네이밍 생성:      POST /brands/naming
    //      → 이후 결과 조회: GET  /brands/naming
    if (!canAnalyze) {
      alert("필수 항목을 모두 입력하면 요청이 가능합니다.");
      return;
    }

    setAnalyzing(true);
    try {
      const nextSeed = mode === "regen" ? regenSeed + 1 : regenSeed;
      if (mode === "regen") setRegenSeed(nextSeed);

      await new Promise((r) => setTimeout(r, 450));
      const nextCandidates = generateNamingCandidates(form, nextSeed);

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
    // ✅ 다음 단계: 컨셉 컨설팅 인터뷰
    navigate("/conceptconsulting");
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

    setForm({
      companyName: "",
      industry: "",
      stage: "",
      website: "",
      oneLine: "",
      brandDesc: "",
      targetCustomer: "",
      tone: "",
      keywords: "",
      avoidWords: "",
      language: "ko",
      lengthPref: "mid",
      namingStyle: "",
      targetEmotion: "",
      mustInclude: "",
      competitorNames: "",
      domainNeed: "",
      goal: "",
      useCase: "",
      notes: "",
    });

    setIndustryMode("select");
    setIndustrySelect("");
    setTargetMode("select");
    setTargetSelect("");

    setCandidates([]);
    setSelectedId(null);
    setRegenSeed(0);
    setSaveMsg("");
    setLastSaved("-");
  };

  // ✅ handlers: industry/target select
  const handleIndustrySelect = (v) => {
    if (!v) {
      setIndustrySelect("");
      setIndustryMode("select");
      setValue("industry", "");
      return;
    }
    if (v === "__custom__") {
      setIndustrySelect("__custom__");
      setIndustryMode("custom");
      setValue("industry", "");
      return;
    }
    setIndustrySelect(v);
    setIndustryMode("select");
    setValue("industry", v);
  };

  const handleTargetSelect = (v) => {
    if (!v) {
      setTargetSelect("");
      setTargetMode("select");
      setValue("targetCustomer", "");
      return;
    }
    if (v === "__custom__") {
      setTargetSelect("__custom__");
      setTargetMode("custom");
      setValue("targetCustomer", "");
      return;
    }
    setTargetSelect(v);
    setTargetMode("select");
    setValue("targetCustomer", v);
  };

  // 결과 강조 스타일 (컨셉 인터뷰와 동일 톤)
  const resultCardStyle = {
    border: "1px solid rgba(99,102,241,0.22)",
    boxShadow: "0 10px 30px rgba(99,102,241,0.08)",
  };

  const resultBannerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(99,102,241,0.08)",
    border: "1px dashed rgba(99,102,241,0.25)",
    marginTop: 10,
  };

  const pillStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(99,102,241,0.12)",
    border: "1px solid rgba(99,102,241,0.22)",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.2,
    whiteSpace: "nowrap",
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
              <h1 className="diagInterview__title">네이밍 컨설팅 인터뷰</h1>
              <p className="diagInterview__sub">
                타깃/톤/키워드가 명확할수록 네이밍 후보가 깔끔하게 나옵니다.
              </p>
            </div>

            <div className="diagInterview__topActions">
              <button
                type="button"
                className="btn ghost"
                onClick={() => navigate("/brandconsulting")}
              >
                브랜드 컨설팅으로
              </button>
            </div>
          </div>

          {/* ✅ 전체 4단계 진행 표시 */}
          <ConsultingFlowPanel activeKey="naming" />

          <div className="diagInterview__grid">
            {/* ✅ 왼쪽 */}
            <section className="diagInterview__left">
              {/* 1) BASIC */}
              <div className="card">
                <div className="card__head">
                  <h2>1. 기본 정보</h2>
                  <p>브랜드 맥락(산업/단계)을 먼저 정리해요.</p>
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label>
                      회사/프로젝트명 <span className="req">*</span>
                    </label>
                    <input
                      value={form.companyName}
                      onChange={(e) => setValue("companyName", e.target.value)}
                      placeholder="예) BRANDPILOT"
                    />
                  </div>

                  <div className="field">
                    <label>
                      산업/분야 <span className="req">*</span>
                    </label>
                    <select
                      value={industrySelect}
                      onChange={(e) => handleIndustrySelect(e.target.value)}
                    >
                      <option value="">선택</option>
                      {INDUSTRY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                      <option value="__custom__">기타(직접 입력)</option>
                    </select>

                    {industryMode === "custom" ? (
                      <input
                        value={form.industry}
                        onChange={(e) => setValue("industry", e.target.value)}
                        placeholder="산업/분야를 직접 입력"
                        style={{ marginTop: 8 }}
                      />
                    ) : null}
                  </div>

                  <div className="field">
                    <label>
                      성장 단계 <span className="req">*</span>
                    </label>
                    <select
                      value={form.stage}
                      onChange={(e) => setValue("stage", e.target.value)}
                    >
                      <option value="">선택</option>
                      <option value="idea">아이디어 단계</option>
                      <option value="mvp">MVP/테스트 중</option>
                      <option value="pmf">PMF 탐색</option>
                      <option value="revenue">매출 발생</option>
                      <option value="invest">투자 유치 진행</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>웹사이트/소개 링크 (선택)</label>
                    <input
                      value={form.website}
                      onChange={(e) => setValue("website", e.target.value)}
                      placeholder="예) https://..."
                    />
                  </div>
                </div>

                <div className="field">
                  <label>
                    한 줄 소개 <span className="req">*</span>
                  </label>
                  <input
                    value={form.oneLine}
                    onChange={(e) => setValue("oneLine", e.target.value)}
                    placeholder="예) 초기 스타트업을 위한 AI 브랜딩 컨설팅 플랫폼"
                  />
                </div>

                <div className="field">
                  <label>브랜드/서비스 상세 설명 (선택)</label>
                  <textarea
                    value={form.brandDesc}
                    onChange={(e) => setValue("brandDesc", e.target.value)}
                    placeholder="예) 기업 진단 → 전략 도출 → 실행 체크리스트 제공까지..."
                    rows={4}
                  />
                </div>
              </div>

              {/* 2) DIRECTION */}
              <div className="card">
                <div className="card__head">
                  <h2>2. 네이밍 방향</h2>
                  <p>타깃/톤/키워드가 이름의 결을 결정합니다.</p>
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label>
                      타깃 고객 <span className="req">*</span>
                    </label>
                    <select
                      value={targetSelect}
                      onChange={(e) => handleTargetSelect(e.target.value)}
                    >
                      <option value="">선택</option>
                      {TARGET_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                      <option value="__custom__">기타(직접 입력)</option>
                    </select>

                    {targetMode === "custom" ? (
                      <input
                        value={form.targetCustomer}
                        onChange={(e) =>
                          setValue("targetCustomer", e.target.value)
                        }
                        placeholder="타깃 고객을 직접 입력"
                        style={{ marginTop: 8 }}
                      />
                    ) : null}
                  </div>

                  <div className="field">
                    <label>
                      브랜드 톤/분위기 <span className="req">*</span>
                    </label>
                    <input
                      value={form.tone}
                      onChange={(e) => setValue("tone", e.target.value)}
                      placeholder="예) 신뢰감, 전문적, 테크, 미니멀, 따뜻함"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>
                    핵심 키워드(3~10개) <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.keywords}
                    onChange={(e) => setValue("keywords", e.target.value)}
                    placeholder="예) AI, 성장, 로드맵, 실행, 신뢰, 속도"
                    rows={4}
                  />
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label>언어(표기) (선택)</label>
                    <select
                      value={form.language}
                      onChange={(e) => setValue("language", e.target.value)}
                    >
                      <option value="ko">한글 중심</option>
                      <option value="en">영문 중심</option>
                      <option value="mix">혼합</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>길이 선호 (선택)</label>
                    <select
                      value={form.lengthPref}
                      onChange={(e) => setValue("lengthPref", e.target.value)}
                    >
                      <option value="short">짧게(2~3음절)</option>
                      <option value="mid">중간(3~4음절)</option>
                      <option value="long">길게(설명형)</option>
                    </select>
                  </div>
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label>네이밍 스타일 (선택)</label>
                    <input
                      value={form.namingStyle}
                      onChange={(e) => setValue("namingStyle", e.target.value)}
                      placeholder="예) 브랜드형 / 의미형 / 합성어 / 약어"
                    />
                  </div>

                  <div className="field">
                    <label>전달하고 싶은 감정/인상 (선택)</label>
                    <input
                      value={form.targetEmotion}
                      onChange={(e) =>
                        setValue("targetEmotion", e.target.value)
                      }
                      placeholder="예) 신뢰감, 친근함, 프리미엄, 혁신"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>피하고 싶은 단어/느낌 (선택)</label>
                  <input
                    value={form.avoidWords}
                    onChange={(e) => setValue("avoidWords", e.target.value)}
                    placeholder="예) 유치함, 과장됨, 너무 복잡함"
                  />
                </div>
              </div>

              {/* 3) CONSTRAINTS/GOAL */}
              <div className="card">
                <div className="card__head">
                  <h2>3. 제약/목표</h2>
                  <p>반드시 포함/제외할 요소와 목표를 정리해요.</p>
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label>반드시 포함할 요소 (선택)</label>
                    <input
                      value={form.mustInclude}
                      onChange={(e) => setValue("mustInclude", e.target.value)}
                      placeholder="예) 이니셜 BP / 특정 단어"
                    />
                  </div>

                  <div className="field">
                    <label>경쟁사/유사 네임 (선택)</label>
                    <input
                      value={form.competitorNames}
                      onChange={(e) =>
                        setValue("competitorNames", e.target.value)
                      }
                      placeholder="예) 경쟁사 이름/톤 (피하고 싶은 방향)"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>도메인 필요 여부 (선택)</label>
                  <input
                    value={form.domainNeed}
                    onChange={(e) => setValue("domainNeed", e.target.value)}
                    placeholder="예) .com 확보 필요 / .io 가능 / 상관없음"
                  />
                </div>

                <div className="field">
                  <label>
                    네이밍 목표 <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.goal}
                    onChange={(e) => setValue("goal", e.target.value)}
                    placeholder="예) 투자자/고객에게 신뢰감 전달, 확장성 있는 이름"
                    rows={4}
                  />
                </div>

                <div className="field">
                  <label>사용 맥락(어디에 쓰는가) (선택)</label>
                  <input
                    value={form.useCase}
                    onChange={(e) => setValue("useCase", e.target.value)}
                    placeholder="예) 서비스명 / 앱명 / 회사명 / 제품 라인업"
                  />
                </div>

                <div className="field">
                  <label>추가 메모 (선택)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setValue("notes", e.target.value)}
                    placeholder="예) 한글/영문 표기 모두 필요해요. 발음이 쉬웠으면 좋겠어요."
                    rows={4}
                  />
                </div>
              </div>

              {/* 결과 anchor */}
              <div ref={refResult} />

              {analyzing ? (
                <div className="card" style={resultCardStyle}>
                  <div className="card__head">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <h2 style={{ margin: 0 }}>네이밍 후보 생성 중</h2>
                      <span style={pillStyle}>⏳ 생성 중</span>
                    </div>
                    <p>입력 내용을 바탕으로 네이밍 3안을 만들고 있어요.</p>
                  </div>

                  <div style={resultBannerStyle}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ fontSize: 18 }}>🧠</span>
                      <div style={{ fontWeight: 900 }}>잠시만 기다려주세요…</div>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                      완료되면 아래에 네이밍 3안이 표시됩니다
                    </div>
                  </div>
                </div>
              ) : hasResult ? (
                <div className="card" style={resultCardStyle}>
                  <div className="card__head">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <h2 style={{ margin: 0 }}>네이밍 후보 3안</h2>
                      <span style={pillStyle}>✅ 결과</span>
                    </div>
                    <p>마음에 드는 방향 1개를 선택해 주세요.</p>

                    <div style={resultBannerStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 18 }}>✨</span>
                        <div style={{ fontWeight: 900 }}>결과가 생성되었습니다</div>
                      </div>

                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                      >
                        위로
                      </button>
                    </div>
                  </div>

                  <div className="divider" />

                  {/* 세로 1열 */}
                  <div
                    className="summaryGrid"
                    style={{
                      marginTop: 10,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {candidates.map((c) => {
                      const isSelected = c.id === selectedId;

                      return (
                        <div
                          key={c.id}
                          className="summaryItem"
                          style={{
                            width: "100%",
                            padding: 14,
                            borderRadius: 14,
                            border: isSelected
                              ? "1px solid rgba(99,102,241,0.5)"
                              : "1px solid rgba(0,0,0,0.08)",
                            boxShadow: isSelected
                              ? "0 12px 30px rgba(99,102,241,0.10)"
                              : "none",
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
                              <div style={{ fontWeight: 900, fontSize: 15 }}>{c.name}</div>
                              <div style={{ marginTop: 6, opacity: 0.9 }}>{c.oneLiner}</div>
                            </div>
                            <span style={{ ...pillStyle, height: "fit-content" }}>
                              {isSelected ? "선택됨" : "후보"}
                            </span>
                          </div>

                          <div style={{ marginTop: 10 }}>
                            <div className="k" style={{ fontWeight: 800, marginBottom: 6 }}>
                              키워드
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {c.keywords.map((kw) => (
                                <span key={kw} style={pillStyle}>
                                  #{kw}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.9 }}>
                            <div>
                              <b>스타일</b> · {c.style}
                            </div>
                            <div style={{ marginTop: 6 }}>
                              <b>샘플</b>
                              <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {c.samples.map((s) => (
                                  <span
                                    key={s}
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
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div style={{ marginTop: 10, opacity: 0.85 }}>
                              <b>근거</b> · {c.rationale}
                            </div>

                            <div style={{ marginTop: 8, opacity: 0.85 }}>
                              <b>체크</b> · {c.checks.join(" · ")}
                            </div>

                            {c.avoid?.length ? (
                              <div style={{ marginTop: 8, opacity: 0.85 }}>
                                <b>피해야 할 단어</b> · {c.avoid.join(", ")}
                              </div>
                            ) : null}
                          </div>

                          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
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

                  {canGoNext ? (
                    <div
                      style={{
                        marginTop: 14,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button type="button" className="btn primary" onClick={handleGoNext}>
                        다음 단계로
                      </button>
                    </div>
                  ) : (
                    <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
                      * 후보 1개를 선택하면 다음 단계로 진행할 수 있어요.
                    </div>
                  )}
                </div>
              ) : null}
            </section>

            {/* ✅ 오른쪽 */}
            <aside className="diagInterview__right">
              <div className="sideCard">
                {/* ✅ 전체 단계(네이밍→컨셉→스토리→로고) 미니 표시 */}
                <ConsultingFlowMini activeKey="naming" />

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
                  <div className="progressBar__fill" style={{ width: `${progress}%` }} />
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
                  onClick={() => handleGenerateCandidates(hasResult ? "regen" : "generate")}
                  disabled={!canAnalyze || analyzing}
                  style={{ width: "100%", marginBottom: 8 }}
                >
                  {analyzing ? "생성 중..." : hasResult ? "AI 분석 재요청" : "AI 분석 요청"}
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
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter onOpenPolicy={setOpenType} />
    </div>
  );
}
