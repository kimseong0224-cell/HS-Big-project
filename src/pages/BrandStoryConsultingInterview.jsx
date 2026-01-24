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

// ✅ 이전 버전 호환(과거 draft에서 OTHER 값 사용)
const OTHER_VALUE = "OTHER";

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

function toBulletList(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  return String(v)
    .split(/\n/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ✅ 더미 후보 생성(3안)
function generateStoryCandidates(form, seed = 0) {
  const company = safeText(form?.companyName, "브랜드");
  const industry = safeText(form?.industry, "분야");
  const stage = stageLabel(form?.stage);
  const core = safeText(form?.brandCore, "핵심 가치");
  const problem = safeText(form?.problem, "문제");
  const solution = safeText(form?.solution, "해결");
  const origin = safeText(form?.originStory, "시작 계기");
  const target = safeText(form?.targetCustomer, "고객");
  const tone = safeText(form?.tone, "신뢰/미니멀");
  const goal = safeText(form?.goal, "목표");
  const proof = safeText(form?.proof, "근거");
  const keywords = toBulletList(form?.keywords).slice(0, 8);

  const pick = (arr, idx) => arr[(idx + seed) % arr.length];

  const storyAngles = [
    "문제 해결 중심",
    "창업자/기원 중심",
    "고객 변화 중심",
    "미션/가치 중심",
    "테크/혁신 중심",
    "커뮤니티 중심",
  ];

  const headlineTemplates = [
    `${company}는 ${problem}을(를) ${solution}으로 바꿉니다`,
    `${industry}에서 ${target}의 성장을 돕는 ${company}`,
    `${origin}에서 시작해, ${target}의 내일을 만든 ${company}`,
    `${core}로 ${stage}의 기준을 다시 쓰는 ${company}`,
  ];

  const taglineTemplates = [
    `${core}로 더 빠른 실행`,
    `${target}의 성장을 설계하다`,
    `${industry}를 더 단단하게`,
    `오늘의 문제를 내일의 성과로`,
  ];

  const aboutTemplates = [
    [
      `우리는 ${industry}에서 ${target}가 마주한 ${problem}을 해결하기 위해 시작했습니다.`,
      `핵심은 ${core}입니다. 복잡한 것을 단순하게, 방향을 실행으로 바꿉니다.`,
      `${goal}을 달성하기 위해 ${solution}에 집중합니다.`,
    ],
    [
      `${origin}에서 출발했습니다. 작은 불편을 방치하지 않았습니다.`,
      `그 경험이 ${company}의 철학(${core})이 되었고, 지금도 제품/서비스에 녹아 있습니다.`,
      `${proof}을(를) 바탕으로 신뢰할 수 있는 선택지를 제공합니다.`,
    ],
    [
      `${target}가 “이제 할 수 있겠다”라고 느끼는 순간을 만들고 싶었습니다.`,
      `그래서 ${company}는 ${solution}으로 ${problem}을 줄이고, 실행을 앞당깁니다.`,
      `결과적으로 ${industry}에서 지속 가능한 성장을 돕습니다.`,
    ],
  ];

  const keyMessageBank = [
    `한 번의 진단이 아니라, 실행까지 이어지는 로드맵`,
    `복잡한 정보를 한눈에 정리하는 구조`,
    `데이터 기반으로 방향을 명확히`,
    `짧게 시작해 빠르게 개선`,
    `팀이 바로 움직일 수 있는 체크리스트`,
  ];

  const useCaseBank = [
    "랜딩/소개 페이지",
    "IR/제안서",
    "서비스 온보딩",
    "SNS/콘텐츠",
    "세일즈 피치",
  ];

  const doNotBank = [
    "과장/허세 표현(최고/유일/완벽) 남발",
    "전문용어 과다로 이해도 하락",
    "타깃과 무관한 감성 문장만 나열",
    "구체적 근거 없이 추상적인 약속",
  ];

  const makeCandidate = (idx) => {
    const angle = pick(storyAngles, idx);
    const headline = pick(headlineTemplates, idx);
    const tagline = pick(taglineTemplates, idx + 1);
    const about = pick(aboutTemplates, idx).map((s) => s.trim());
    const keyMessages = Array.from(
      new Set([...keywords, ...keyMessageBank].filter(Boolean)),
    ).slice(0, 5);
    const useCases = useCaseBank.slice(0, 4);

    return {
      id: `story_${idx}_${seed}`,
      name: `${String.fromCharCode(65 + idx)} · ${angle}`,
      oneLiner: headline,
      tagline,
      about,
      keyMessages,
      useCases,
      tone,
      doNot: doNotBank,
    };
  };

  return [0, 1, 2].map(makeCandidate);
}

export default function BrandStoryConsultingInterview({ onLogout }) {
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
    industryOther: "", // legacy
    stage: "",

    brandCore: "",
    originStory: "",
    problem: "",
    solution: "",

    targetCustomer: "",
    targetCustomerOther: "", // legacy
    tone: "",
    keywords: "",
    goal: "",
    proof: "",

    notes: "",
  });

  // ✅ 저장 UI
  const [saveMsg, setSaveMsg] = useState("");
  const [lastSaved, setLastSaved] = useState("-");

  // ✅ 결과(후보/선택)
  const [analyzing, setAnalyzing] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [regenSeed, setRegenSeed] = useState(0);
  const refResult = useRef(null);

  // ✅ 필수 항목
  const requiredKeys = useMemo(
    () => ["companyName", "industry", "stage", "brandCore", "goal", "tone"],
    [],
  );

  const requiredStatus = useMemo(() => {
    const status = {};
    requiredKeys.forEach((k) => {
      status[k] = Boolean(String(form?.[k] || "").trim());
    });
    return status;
  }, [requiredKeys, form]);

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

        // ✅ legacy migration (OTHER → other text)
        let nextIndustry = f.industry;
        if (f.industry === OTHER_VALUE && f.industryOther) nextIndustry = f.industryOther;

        let nextTarget = f.targetCustomer;
        if (f.targetCustomer === OTHER_VALUE && f.targetCustomerOther)
          nextTarget = f.targetCustomerOther;

        setForm((prev) => ({
          ...prev,
          ...f,
          industry: nextIndustry || "",
          targetCustomer: nextTarget || "",
        }));

        // industry init
        if (typeof nextIndustry === "string" && nextIndustry.trim()) {
          if (INDUSTRY_OPTIONS.includes(nextIndustry)) {
            setIndustryMode("select");
            setIndustrySelect(nextIndustry);
          } else {
            setIndustryMode("custom");
            setIndustrySelect("__custom__");
          }
        }

        // target init
        if (typeof nextTarget === "string" && nextTarget.trim()) {
          if (TARGET_OPTIONS.includes(nextTarget)) {
            setTargetMode("select");
            setTargetSelect(nextTarget);
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

  // ✅ 결과 로드
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

  // ✅ 자동 저장
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
    // 🔌 BACKEND 연동 포인트 (브랜드 스토리 컨설팅 - AI 분석 요청 버튼)
    // - 현재 로직: 프론트 더미 후보(3안) 생성 → 1개 선택 → 다음 단계로 이동
    // - 백엔드 연동 시(명세서 기준):
    //   A) 인터뷰 저장(공통): POST /brands/interview
    //   B) 스토리 생성:      POST /brands/story
    //      → 이후 결과 조회: GET  /brands/story
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
    // ✅ 다음 단계: 로고 컨설팅 인터뷰
    navigate("/logoconsulting");
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
      industryOther: "",
      stage: "",
      brandCore: "",
      originStory: "",
      problem: "",
      solution: "",
      targetCustomer: "",
      targetCustomerOther: "",
      tone: "",
      keywords: "",
      goal: "",
      proof: "",
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
              <h1 className="diagInterview__title">브랜드 스토리 컨설팅 인터뷰</h1>
              <p className="diagInterview__sub">
                ‘왜 시작했고, 어떤 문제를 어떻게 해결하는지’를 정리하면 스토리가 선명해져요.
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
          <ConsultingFlowPanel activeKey="story" />

          <div className="diagInterview__grid">
            {/* ✅ 왼쪽 */}
            <section className="diagInterview__left">
              {/* 1) BASIC */}
              <div className="card">
                <div className="card__head">
                  <h2>1. 기본 정보</h2>
                  <p>브랜드가 놓인 맥락(산업/단계/타깃)을 정리해요.</p>
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
                    <label>타깃 고객 (선택)</label>
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
                </div>
              </div>

              {/* 2) MATERIAL */}
              <div className="card">
                <div className="card__head">
                  <h2>2. 스토리 재료</h2>
                  <p>스토리의 뼈대가 될 문장들을 모아둡니다.</p>
                </div>

                <div className="field">
                  <label>
                    브랜드 핵심 가치/한 문장 정의 <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.brandCore}
                    onChange={(e) => setValue("brandCore", e.target.value)}
                    placeholder="예) 초기 스타트업이 ‘방향→실행’까지 빠르게 도달하도록 돕는다"
                    rows={4}
                  />
                </div>

                <div className="field">
                  <label>시작 계기/기원(Origin) (선택)</label>
                  <textarea
                    value={form.originStory}
                    onChange={(e) => setValue("originStory", e.target.value)}
                    placeholder="예) 창업/프로젝트를 하며 브랜딩이 막막했던 경험"
                    rows={4}
                  />
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label>고객이 겪는 문제(Problem) (선택)</label>
                    <textarea
                      value={form.problem}
                      onChange={(e) => setValue("problem", e.target.value)}
                      placeholder="예) 무엇부터 해야할지 모르고 실행이 멈춤"
                      rows={4}
                    />
                  </div>

                  <div className="field">
                    <label>해결 방식(Solution) (선택)</label>
                    <textarea
                      value={form.solution}
                      onChange={(e) => setValue("solution", e.target.value)}
                      placeholder="예) 진단→전략→체크리스트로 즉시 실행"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* 3) TONE/GOAL */}
              <div className="card">
                <div className="card__head">
                  <h2>3. 톤/목표</h2>
                  <p>스토리의 말투와 설득 근거를 정해요.</p>
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label>
                      스토리 톤/분위기 <span className="req">*</span>
                    </label>
                    <input
                      value={form.tone}
                      onChange={(e) => setValue("tone", e.target.value)}
                      placeholder="예) 신뢰감, 담백함, 미니멀, 따뜻함"
                    />
                  </div>

                  <div className="field">
                    <label>키워드(줄바꿈/쉼표) (선택)</label>
                    <input
                      value={form.keywords}
                      onChange={(e) => setValue("keywords", e.target.value)}
                      placeholder="예) 실행, 로드맵, 성장, 신뢰"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>
                    스토리 목표(읽은 사람이 무엇을 느끼길?) <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.goal}
                    onChange={(e) => setValue("goal", e.target.value)}
                    placeholder="예) ‘우리도 할 수 있겠다’는 확신과 신뢰"
                    rows={4}
                  />
                </div>

                <div className="field">
                  <label>근거/증거(Proof) (선택)</label>
                  <textarea
                    value={form.proof}
                    onChange={(e) => setValue("proof", e.target.value)}
                    placeholder="예) 검증된 프레임워크, 유사 사례, 데이터/지표 등"
                    rows={4}
                  />
                </div>

                <div className="field">
                  <label>추가 메모 (선택)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setValue("notes", e.target.value)}
                    placeholder="예) 너무 길지 않게, 투자자/고객 모두 읽기 쉽게"
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
                      <h2 style={{ margin: 0 }}>스토리 후보 생성 중</h2>
                      <span style={pillStyle}>⏳ 생성 중</span>
                    </div>
                    <p>입력 내용을 바탕으로 스토리 3안을 만들고 있어요.</p>
                  </div>

                  <div style={resultBannerStyle}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ fontSize: 18 }}>🧠</span>
                      <div style={{ fontWeight: 900 }}>잠시만 기다려주세요…</div>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                      완료되면 아래에 스토리 3안이 표시됩니다
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
                      <h2 style={{ margin: 0 }}>스토리 후보 3안</h2>
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
                        onClick={() =>
                          window.scrollTo({ top: 0, behavior: "smooth" })
                        }
                      >
                        위로
                      </button>
                    </div>
                  </div>

                  <div className="divider" />

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
                              <div style={{ fontWeight: 900, fontSize: 15 }}>
                                {c.name}
                              </div>
                              <div style={{ marginTop: 6, opacity: 0.9 }}>
                                {c.oneLiner}
                              </div>
                            </div>
                            <span style={{ ...pillStyle, height: "fit-content" }}>
                              {isSelected ? "선택됨" : "후보"}
                            </span>
                          </div>

                          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.9 }}>
                            <div>
                              <b>태그라인</b> · {c.tagline}
                            </div>
                            <div style={{ marginTop: 6 }}>
                              <b>톤</b> · {c.tone}
                            </div>
                          </div>

                          <div style={{ marginTop: 10 }}>
                            <div
                              className="k"
                              style={{ fontWeight: 800, marginBottom: 6 }}
                            >
                              핵심 메시지
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {c.keyMessages.map((m) => (
                                <span key={m} style={pillStyle}>
                                  {m}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>
                            <div className="k" style={{ fontWeight: 800, marginBottom: 6 }}>
                              본문(About)
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                              {c.about.map((line, idx) => (
                                <li key={`${c.id}_about_${idx}`}>{line}</li>
                              ))}
                            </ul>
                          </div>

                          <div style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>
                            <div className="k" style={{ fontWeight: 800, marginBottom: 6 }}>
                              활용처
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {c.useCases.map((u) => (
                                <span
                                  key={u}
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
                                  {u}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
                            <b>주의</b> · {toBulletList(c.doNot).join(" · ")}
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
