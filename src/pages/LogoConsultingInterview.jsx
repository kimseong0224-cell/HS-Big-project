// src/pages/LogoConsultingInterview.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

import ConsultingFlowPanel from "../components/ConsultingFlowPanel.jsx";
import ConsultingFlowMini from "../components/ConsultingFlowMini.jsx";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

const STORAGE_KEY = "logoConsultingInterviewDraft_v1";
const RESULT_KEY = "logoConsultingInterviewResult_v1";
const LEGACY_KEY = "brandInterview_logo_v1";

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

function pickWords(text, max = 8) {
  const raw = String(text || "")
    .split(/[,\n\t]/g)
    .map((s) => s.trim())
    .filter(Boolean);
  const uniq = Array.from(new Set(raw));
  return uniq.slice(0, max);
}

function generateLogoCandidates(form, seed = 0) {
  const company = safeText(form?.companyName, "브랜드");
  const industry = safeText(form?.industry, "분야");
  const target = safeText(form?.targetCustomer, "고객");
  const oneLine = safeText(form?.oneLine, "한 줄 소개");
  const core = safeText(form?.coreValue, "핵심 가치");
  const personality = safeText(form?.brandPersonality, "신뢰/미니멀");
  const typePref = safeText(form?.logoType, "심볼+워드마크");
  const colorPref = safeText(form?.colorPref, "블루/퍼플 계열");
  const usage = safeText(form?.usagePlaces, "웹/앱/문서");
  const avoid = safeText(form?.mustAvoid, "");

  const keywords = pickWords(form?.keywords, 10);
  const pick = (arr, idx) => arr[(idx + seed) % arr.length];

  const typeBank = [
    "워드마크(텍스트 중심)",
    "심볼(아이콘 중심)",
    "콤비네이션(심볼+워드마크)",
    "엠블럼(배지형)",
    "모노그램(이니셜)",
  ];

  const paletteBank = [
    "인디고/퍼플(테크·신뢰)",
    "블루/그레이(전문·미니멀)",
    "블랙/오프화이트(프리미엄)",
    "민트/블루(클린·헬스케어)",
    "오렌지/네이비(에너지·대비)",
  ];

  const typographyBank = [
    "산세리프(모던/가독)",
    "세리프(신뢰/클래식)",
    "라운드 산세리프(친근/부드러움)",
    "컨덴스드(날렵/테크)",
  ];

  const symbolIdeaBank = [
    "로드맵/가이드(방향성)",
    "레이더/나침반(탐색)",
    "체크/리스트(실행)",
    "블록/모듈(구성/시스템)",
    "스파크/번개(속도)",
  ];

  const usageBank = [
    "앱 아이콘/파비콘",
    "랜딩/헤더",
    "IR·제안서 표지",
    "SNS 프로필",
    "스티커/굿즈",
  ];

  const doNotBank = [
    "세부 요소 과다(축소 시 뭉개짐)",
    "색상 대비 부족(접근성 저하)",
    "유사 업계 로고와 과도한 유사",
    "가독성 낮은 폰트/간격",
  ];

  const makeCandidate = (idx) => {
    const logoType = typePref || pick(typeBank, idx);
    const palette = colorPref || pick(paletteBank, idx);
    const typography = pick(typographyBank, idx + 1);
    const symbolIdea = pick(symbolIdeaBank, idx + 2);

    return {
      id: `logo_${idx}_${seed}`,
      name: `${String.fromCharCode(65 + idx)} · ${logoType}`,
      oneLiner: `${company}의 ‘${core}’을(를) ${symbolIdea} 메타포로 담은 로고 방향`,
      keywords: Array.from(new Set([industry, target, ...keywords].filter(Boolean))).slice(0, 10),
      concept: `한 줄(${oneLine})의 메시지를 시각적으로 요약하고, ${personality} 인상을 강화합니다.`,
      palette,
      typography,
      symbolIdea,
      usage: Array.from(new Set([usage, ...usageBank])).slice(0, 5),
      rationale:
        `타깃(${target})이 첫인상에서 ‘${personality}’을 느끼도록 구성합니다. ${industry} 맥락에서도 확장/재사용이 쉬운 형태를 우선합니다.`,
      doNot: doNotBank,
      avoid,
    };
  };

  return [0, 1, 2].map(makeCandidate);
}

export default function LogoConsultingInterview({ onLogout }) {
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
    targetCustomer: "",

    oneLine: "",
    coreValue: "",
    keywords: "",
    brandPersonality: "",

    logoType: "",
    colorPref: "",

    usagePlaces: "",
    mustAvoid: "",
    references: "",
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
    () => ["companyName", "industry", "stage", "targetCustomer", "coreValue", "keywords"],
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
    // 🔌 BACKEND 연동 포인트 (로고 컨설팅 - AI 분석 요청 버튼)
    // - 현재 로직: 프론트 더미 후보(3안) 생성 → 1개 선택 → 최종 결과 보기로 이동
    // - 백엔드 연동 시(명세서 기준):
    //   A) 인터뷰 저장(공통): POST /brands/interview
    //   B) 로고 방향 생성:   POST /brands/logo
    //      → 이후 결과 조회: GET  /brands/logo
    if (!canAnalyze) {
      alert("필수 항목을 모두 입력하면 요청이 가능합니다.");
      return;
    }

    setAnalyzing(true);
    try {
      const nextSeed = mode === "regen" ? regenSeed + 1 : regenSeed;
      if (mode === "regen") setRegenSeed(nextSeed);

      await new Promise((r) => setTimeout(r, 450));
      const nextCandidates = generateLogoCandidates(form, nextSeed);

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
    // ✅ 최종 결과 페이지
    navigate("/mypage/brand-results");
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
      targetCustomer: "",
      oneLine: "",
      coreValue: "",
      keywords: "",
      brandPersonality: "",
      logoType: "",
      colorPref: "",
      usagePlaces: "",
      mustAvoid: "",
      references: "",
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
              <h1 className="diagInterview__title">로고 컨설팅 인터뷰</h1>
              <p className="diagInterview__sub">
                키워드/핵심 가치가 명확할수록 로고 방향이 또렷해져요.
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
          <ConsultingFlowPanel activeKey="logo" />

          <div className="diagInterview__grid">
            {/* ✅ 왼쪽 */}
            <section className="diagInterview__left">
              {/* 1) BASIC */}
              <div className="card">
                <div className="card__head">
                  <h2>1. 기본 정보</h2>
                  <p>브랜드 맥락을 먼저 정리해요.</p>
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
                </div>

                <div className="field">
                  <label>한 줄 소개 (선택)</label>
                  <input
                    value={form.oneLine}
                    onChange={(e) => setValue("oneLine", e.target.value)}
                    placeholder="예) 초기 스타트업을 위한 AI 브랜딩 컨설팅 플랫폼"
                  />
                </div>
              </div>

              {/* 2) DIRECTION */}
              <div className="card">
                <div className="card__head">
                  <h2>2. 로고 방향</h2>
                  <p>로고가 전달해야 할 메시지/키워드를 정해요.</p>
                </div>

                <div className="field">
                  <label>
                    핵심 가치/메시지 <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.coreValue}
                    onChange={(e) => setValue("coreValue", e.target.value)}
                    placeholder="예) 방향을 잃은 팀이 실행 가능한 로드맵을 갖게 한다"
                    rows={4}
                  />
                </div>

                <div className="field">
                  <label>
                    키워드(3~10개) <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.keywords}
                    onChange={(e) => setValue("keywords", e.target.value)}
                    placeholder="예) 실행, 로드맵, 성장, 신뢰, 미니멀, 테크"
                    rows={4}
                  />
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label>브랜드 성격/인상 (선택)</label>
                    <input
                      value={form.brandPersonality}
                      onChange={(e) =>
                        setValue("brandPersonality", e.target.value)
                      }
                      placeholder="예) 신뢰감, 전문적, 따뜻함, 프리미엄"
                    />
                  </div>

                  <div className="field">
                    <label>로고 타입 선호 (선택)</label>
                    <input
                      value={form.logoType}
                      onChange={(e) => setValue("logoType", e.target.value)}
                      placeholder="예) 워드마크 / 심볼 / 콤비네이션"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>색감/컬러 선호 (선택)</label>
                  <input
                    value={form.colorPref}
                    onChange={(e) => setValue("colorPref", e.target.value)}
                    placeholder="예) 인디고/퍼플, 블루/그레이, 흑백"
                  />
                </div>
              </div>

              {/* 3) APPLY/CONSTRAINT */}
              <div className="card">
                <div className="card__head">
                  <h2>3. 적용/제약</h2>
                  <p>사용 환경과 피해야 할 요소를 정리해요.</p>
                </div>

                <div className="field">
                  <label>주요 사용처 (선택)</label>
                  <input
                    value={form.usagePlaces}
                    onChange={(e) => setValue("usagePlaces", e.target.value)}
                    placeholder="예) 앱 아이콘, 랜딩, IR 표지, SNS"
                  />
                </div>

                <div className="field">
                  <label>피해야 할 요소/금지 (선택)</label>
                  <input
                    value={form.mustAvoid}
                    onChange={(e) => setValue("mustAvoid", e.target.value)}
                    placeholder="예) 복잡한 디테일, 특정 색상, 유사 업계 느낌"
                  />
                </div>

                <div className="field">
                  <label>레퍼런스/참고 링크 (선택)</label>
                  <textarea
                    value={form.references}
                    onChange={(e) => setValue("references", e.target.value)}
                    placeholder="예) 좋아하는 로고 링크, 참고 브랜드 등"
                    rows={4}
                  />
                </div>

                <div className="field">
                  <label>추가 메모 (선택)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setValue("notes", e.target.value)}
                    placeholder="예) 심플하지만 강한 인상, 모바일 아이콘에서 잘 보이게"
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
                      <h2 style={{ margin: 0 }}>로고 방향 생성 중</h2>
                      <span style={pillStyle}>⏳ 생성 중</span>
                    </div>
                    <p>입력 내용을 바탕으로 로고 방향 3안을 만들고 있어요.</p>
                  </div>

                  <div style={resultBannerStyle}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ fontSize: 18 }}>🧠</span>
                      <div style={{ fontWeight: 900 }}>잠시만 기다려주세요…</div>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                      완료되면 아래에 로고 방향 3안이 표시됩니다
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
                      <h2 style={{ margin: 0 }}>로고 방향 후보 3안</h2>
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

                          <div style={{ marginTop: 10 }}>
                            <div
                              className="k"
                              style={{ fontWeight: 800, marginBottom: 6 }}
                            >
                              키워드
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {c.keywords.map((kw) => (
                                <span key={kw} style={pillStyle}>
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>
                            <div>
                              <b>컨셉</b> · {c.concept}
                            </div>
                            <div style={{ marginTop: 8 }}>
                              <b>컬러</b> · {c.palette}
                            </div>
                            <div style={{ marginTop: 6 }}>
                              <b>타이포</b> · {c.typography}
                            </div>
                            <div style={{ marginTop: 6 }}>
                              <b>심볼 아이디어</b> · {c.symbolIdea}
                            </div>

                            <div style={{ marginTop: 10 }}>
                              <b>사용처</b>
                              <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {c.usage.map((u) => (
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

                            <div style={{ marginTop: 10, opacity: 0.85 }}>
                              <b>근거</b> · {c.rationale}
                            </div>

                            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                              <b>주의</b> · {c.doNot.join(" · ")}
                            </div>

                            {c.avoid ? (
                              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                                <b>피하고 싶은 요소</b> · {c.avoid}
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
                        최종 결과 보기
                      </button>
                    </div>
                  ) : (
                    <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
                      * 후보 1개를 선택하면 최종 결과로 이동할 수 있어요.
                    </div>
                  )}
                </div>
              ) : null}
            </section>

            {/* ✅ 오른쪽 */}
            <aside className="diagInterview__right">
              <div className="sideCard">
                <ConsultingFlowMini activeKey="logo" />

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
