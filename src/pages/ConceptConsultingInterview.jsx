// src/pages/ConceptConsultingInterview.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

import ConsultingFlowPanel from "../components/ConsultingFlowPanel.jsx";
import ConsultingFlowMini from "../components/ConsultingFlowMini.jsx";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

/**
 * ✅ 변경사항(요청 반영)
 * - 후보 3안 중 1개 선택(selectedId 존재) 시
 *   "다음 단계로" 버튼이 결과 카드 아래에 나타나며, 클릭하면 다음 인터뷰로 이동
 */

const STORAGE_KEY = "conceptInterviewDraft_homepage_v6";
const RESULT_KEY = "conceptInterviewResult_homepage_v6";
// ✅ 통합 결과 페이지(BrandAllResults) 호환용 legacy 키
const LEGACY_KEY = "brandInterview_homepage_v1";

// ✅ 여기만 너희 라우팅에 맞게 수정하면 됨
// 컨셉(현재 페이지) 다음 단계: 브랜드 스토리
const NEXT_PATH = "/brand/story";

const INITIAL_FORM = {
  brandName: "",
  category: "",
  stage: "",
  oneLine: "",

  targetCustomer: "",
  painsTop3: "",

  valueProposition: "",
  brandPromise: "",

  desiredKeywords: "",
  avoidKeywords: "",

  referenceLink: "",
  notes: "",
};

const CATEGORY_OPTIONS = [
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
  if (s === "revenue") return "운영/매출";
  if (s === "rebrand") return "리브랜딩";
  return s || "-";
}

function safeText(v) {
  const t = String(v ?? "").trim();
  return t ? t : "-";
}

function pickKeywords(text) {
  return Array.from(
    new Set(
      String(text || "")
        .split(/[,/|\n]/g)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ).slice(0, 8);
}

// ✅ 더미 후보 생성(추후 API 연동 시 handleGenerateCandidates만 바꾸면 됨)
function generateConceptCandidates(form, seed = 0) {
  const desired = pickKeywords(form.desiredKeywords);
  const avoid = pickKeywords(form.avoidKeywords);

  const brand = safeText(form.brandName);
  const cat = safeText(form.category);

  const k1 = desired[0] || "미니멀";
  const k2 = desired[1] || "신뢰";
  const k3 = desired[2] || "혁신";

  const twist = seed % 2 === 0 ? "정제된" : "대담한";

  return [
    {
      id: `c1_${Date.now()}_${seed}`,
      name: `컨셉 A · ${k1} ${k2}`,
      oneLiner: `${brand}를 “${k1}한 ${k2}”로 각인시키는 ${twist} 컨셉`,
      keywords: [k1, k2, "명확", "핵심", "정돈", desired[3]]
        .filter(Boolean)
        .slice(0, 6),
      tone: "짧고 명료한 문장 · 과장 없이 근거 중심",
      visual: "여백 많은 레이아웃 · 단색+포인트 · 선명한 타이포",
      slogans: [`${brand}, 핵심만 남기다`, `${brand}로 ${k2}를 설계하다`],
      doNot: avoid.slice(0, 3),
    },
    {
      id: `c2_${Date.now()}_${seed}`,
      name: `컨셉 B · 친근한 파트너`,
      oneLiner: `고객의 고민을 “함께 풀어주는” 동행자 이미지의 컨셉`,
      keywords: ["친근", "공감", "현실적", "따뜻", k2, desired[0]]
        .filter(Boolean)
        .slice(0, 6),
      tone: "대화하듯 설명 · 예시 중심 · 쉬운 단어",
      visual: "부드러운 라운드 · 사람 중심 이미지 · 따뜻한 톤",
      slogans: [`혼자 고민하지 마세요, ${brand}`, `${brand}와 함께 한 걸음씩`],
      doNot: avoid.slice(0, 3),
    },
    {
      id: `c3_${Date.now()}_${seed}`,
      name: `컨셉 C · ${k3} 리더`,
      oneLiner: `${cat} 시장에서 “새 기준”을 제시하는 리더 컨셉`,
      keywords: [k3, "대담", "속도", "기준", "임팩트", desired[1]]
        .filter(Boolean)
        .slice(0, 6),
      tone: "선언형 문장 · 수치/근거 강조 · 자신감 있는 어조",
      visual: "대비 강한 컬러 · 굵은 타이포 · 강한 히어로 메시지",
      slogans: [`${brand}, 새로운 기준`, `지금, ${brand}로 바꾸다`],
      doNot: avoid.slice(0, 3),
    },
  ];
}

export default function ConceptConsultingInterview({ onLogout }) {
  const navigate = useNavigate();

  // 약관 모달
  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  // 폼
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM }));

  // select + custom
  const [categoryMode, setCategoryMode] = useState("select");
  const [categorySelect, setCategorySelect] = useState("");

  const [targetMode, setTargetMode] = useState("select");
  const [targetSelect, setTargetSelect] = useState("");

  // 자동저장 상태
  const [saveMsg, setSaveMsg] = useState("");
  const [lastSaved, setLastSaved] = useState("-");

  // 결과
  const [analyzing, setAnalyzing] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [regenSeed, setRegenSeed] = useState(0);

  const refResult = useRef(null);

  // 진행률 계산용 필수 키
  const requiredKeys = useMemo(
    () => [
      "brandName",
      "category",
      "stage",
      "oneLine",
      "targetCustomer",
      "painsTop3",
      "valueProposition",
      "brandPromise",
      "desiredKeywords",
      "avoidKeywords",
    ],
    [],
  );

  const completedRequired = useMemo(() => {
    return requiredKeys.filter((k) => Boolean(String(form?.[k] || "").trim()))
      .length;
  }, [form, requiredKeys]);

  const progress = useMemo(() => {
    if (!requiredKeys.length) return 0;
    return Math.round((completedRequired / requiredKeys.length) * 100);
  }, [completedRequired, requiredKeys.length]);

  const canAnalyze = completedRequired === requiredKeys.length;
  const hasResult = candidates.length > 0;

  // ✅ 후보 1개 선택하면 다음 단계로 버튼 노출
  const canGoNext = Boolean(hasResult && selectedId);

  // draft 로드
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);

      if (parsed?.form) {
        const f = parsed.form;
        setForm((prev) => ({ ...prev, ...f }));

        if (typeof f.category === "string" && f.category.trim()) {
          if (CATEGORY_OPTIONS.includes(f.category)) {
            setCategoryMode("select");
            setCategorySelect(f.category);
          } else {
            setCategoryMode("custom");
            setCategorySelect("__custom__");
          }
        }

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

  // 결과 로드
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

  // 자동 저장
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

  const setValue = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const scrollToResult = () => {
    if (!refResult?.current) return;
    refResult.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const persistResult = (nextCandidates, nextSelectedId, nextSeed) => {
    try {
      localStorage.setItem(
        RESULT_KEY,
        JSON.stringify({
          candidates: nextCandidates,
          selectedId: nextSelectedId,
          regenSeed: nextSeed,
          updatedAt: Date.now(),
        }),
      );
      // ✅ legacy 저장: 통합 결과 페이지에서 완료 여부를 판단할 때 form이 필요합니다.
      try {
        localStorage.setItem(
          LEGACY_KEY,
          JSON.stringify({
            form,
            candidates: nextCandidates,
            selectedId: nextSelectedId,
            regenSeed: nextSeed,
            updatedAt: Date.now(),
          }),
        );
      } catch {
        // ignore
      }
} catch {
      // ignore
    }
  };

  const handleGenerateCandidates = async (mode = "generate") => {
    if (!canAnalyze) {
      alert("필수 항목을 모두 입력하면 요청이 가능합니다.");
      return;
    }

    setAnalyzing(true);
    try {
      const nextSeed = mode === "regen" ? regenSeed + 1 : regenSeed;
      if (mode === "regen") setRegenSeed(nextSeed);

      const nextCandidates = generateConceptCandidates(form, nextSeed);

      // 재요청이면 선택 초기화(새 후보군)
      const nextSelectedId = mode === "regen" ? null : selectedId;

      setCandidates(nextCandidates);
      setSelectedId(nextSelectedId);

      persistResult(nextCandidates, nextSelectedId, nextSeed);

      setTimeout(() => scrollToResult(), 0);
    } catch {
      alert("컨셉 생성 중 오류가 발생했습니다.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectCandidate = (id) => {
    setSelectedId(id);
    persistResult(candidates, id, regenSeed);
  };

  // ✅ 다음 단계로 이동
  const handleGoNext = () => {
    if (!canGoNext) return;

    // 선택한 후보 객체도 저장해두고 싶으면(추천) 아래처럼 추가 저장 가능
    // 하지만 일단은 기존 RESULT_KEY 안에 selectedId만 저장하니까 그대로 이동만 해도 됨.
    // 추후 최종 리포트에 합칠거면 선택 후보 전체를 저장하는 구조로 바꾸는 게 좋음.
    navigate(NEXT_PATH);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetAll = () => {
    const ok = window.confirm(
      "입력 내용을 모두 초기화할까요?\n(자동저장/컨셉 결과/선택도 함께 삭제됩니다.)",
    );
    if (!ok) return;

    setForm({ ...INITIAL_FORM });

    setCategoryMode("select");
    setCategorySelect("");

    setTargetMode("select");
    setTargetSelect("");

    setAnalyzing(false);
    setCandidates([]);
    setSelectedId(null);
    setRegenSeed(0);

    setLastSaved("-");
    setSaveMsg("전체 초기화 완료");

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(RESULT_KEY);
    } catch {
      // ignore
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategorySelect = (v) => {
    if (!v) {
      setCategorySelect("");
      setCategoryMode("select");
      setValue("category", "");
      return;
    }
    if (v === "__custom__") {
      setCategorySelect("__custom__");
      setCategoryMode("custom");
      setValue("category", "");
      return;
    }
    setCategorySelect(v);
    setCategoryMode("select");
    setValue("category", v);
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

  // 결과 강조 스타일
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
              <h1 className="diagInterview__title">컨셉 컨설팅 인터뷰</h1>
              <p className="diagInterview__sub">
                (실험) 브랜드 컨셉 3안을 생성하기 위한 간단 인터뷰입니다.
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
          <ConsultingFlowPanel activeKey="concept" />

          <div className="diagInterview__grid">
            {/* 왼쪽 */}
            <section className="diagInterview__left">
              {/* 1) 기본 */}
              <div className="card">
                <div className="card__head">
                  <h2>1. 기본</h2>
                  <p>핵심 정보만 입력해주세요.</p>
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label>
                      브랜드/프로젝트명 <span className="req">*</span>
                    </label>
                    <input
                      value={form.brandName}
                      onChange={(e) => setValue("brandName", e.target.value)}
                      placeholder="예) 스튜디오 라이트"
                    />
                  </div>

                  <div className="field">
                    <label>
                      현재 단계 <span className="req">*</span>
                    </label>
                    <select
                      value={form.stage}
                      onChange={(e) => setValue("stage", e.target.value)}
                    >
                      <option value="">선택</option>
                      <option value="idea">아이디어</option>
                      <option value="mvp">MVP/테스트</option>
                      <option value="revenue">운영/매출</option>
                      <option value="rebrand">리브랜딩</option>
                    </select>
                  </div>
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label>
                      업종/카테고리 <span className="req">*</span>
                    </label>
                    <div
                      className="formGrid"
                      style={{ gridTemplateColumns: "1fr 1fr" }}
                    >
                      <select
                        value={categorySelect}
                        onChange={(e) => handleCategorySelect(e.target.value)}
                      >
                        <option value="">선택</option>
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                        <option value="__custom__">직접 입력</option>
                      </select>

                      <input
                        value={categoryMode === "custom" ? form.category : ""}
                        onChange={(e) => setValue("category", e.target.value)}
                        placeholder="직접 입력"
                        disabled={categoryMode !== "custom"}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>참고 링크 (선택)</label>
                    <input
                      value={form.referenceLink}
                      onChange={(e) =>
                        setValue("referenceLink", e.target.value)
                      }
                      placeholder="예) 노션/인스타/소개서 링크"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>
                    한 줄 소개 <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.oneLine}
                    onChange={(e) => setValue("oneLine", e.target.value)}
                    placeholder="예) 초기 창업자를 위한 AI 브랜딩 컨설팅"
                    rows={3}
                  />
                </div>
              </div>

              {/* 2) 고객/문제 */}
              <div className="card">
                <div className="card__head">
                  <h2>2. 고객/문제</h2>
                  <p>
                    컨셉은 “누구의 어떤 문제”를 어떻게 보이게 할지에서 시작해요.
                  </p>
                </div>

                <div className="field">
                  <label>
                    핵심 타깃 <span className="req">*</span>
                  </label>
                  <div
                    className="formGrid"
                    style={{ gridTemplateColumns: "1fr 1fr" }}
                  >
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
                      <option value="__custom__">직접 입력</option>
                    </select>

                    <input
                      value={targetMode === "custom" ? form.targetCustomer : ""}
                      onChange={(e) =>
                        setValue("targetCustomer", e.target.value)
                      }
                      placeholder="직접 입력"
                      disabled={targetMode !== "custom"}
                    />
                  </div>
                </div>

                <div className="field">
                  <label>
                    문제 TOP3 <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.painsTop3}
                    onChange={(e) => setValue("painsTop3", e.target.value)}
                    placeholder={
                      "예)\n1) 방향이 불명확\n2) 메시지 정리가 안 됨\n3) 신뢰가 부족"
                    }
                    rows={4}
                  />
                </div>
              </div>

              {/* 3) 방향 */}
              <div className="card">
                <div className="card__head">
                  <h2>3. 컨셉 방향</h2>
                  <p>이 답변들이 컨셉 3안을 만드는 재료가 됩니다.</p>
                </div>

                <div className="field">
                  <label>
                    핵심 가치(왜 우리인가?) <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.valueProposition}
                    onChange={(e) =>
                      setValue("valueProposition", e.target.value)
                    }
                    placeholder="예) 진단→전략→실행 체크리스트까지 한 번에"
                    rows={3}
                  />
                </div>

                <div className="field">
                  <label>
                    Brand Promise(약속 한 문장) <span className="req">*</span>
                  </label>
                  <input
                    value={form.brandPromise}
                    onChange={(e) => setValue("brandPromise", e.target.value)}
                    placeholder="예) 불확실한 창업 초기에 ‘브랜드 기준’을 만든다"
                  />
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label>
                      원하는 키워드 <span className="req">*</span>
                    </label>
                    <input
                      value={form.desiredKeywords}
                      onChange={(e) =>
                        setValue("desiredKeywords", e.target.value)
                      }
                      placeholder="예) 미니멀 / 신뢰 / 혁신"
                    />
                  </div>

                  <div className="field">
                    <label>
                      피하고 싶은 키워드 <span className="req">*</span>
                    </label>
                    <input
                      value={form.avoidKeywords}
                      onChange={(e) =>
                        setValue("avoidKeywords", e.target.value)
                      }
                      placeholder="예) 촌스러움 / 과한 감성"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>추가 메모(선택)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setValue("notes", e.target.value)}
                    placeholder="예) 너무 캐주얼한 느낌은 피하고, 신뢰를 최우선으로"
                    rows={3}
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
                      <h2 style={{ margin: 0 }}>컨셉 후보 생성 중</h2>
                      <span style={pillStyle}>⏳ 생성 중</span>
                    </div>
                    <p>입력 내용을 바탕으로 컨셉 3안을 만들고 있어요.</p>
                  </div>

                  <div style={resultBannerStyle}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ fontSize: 18 }}>🧠</span>
                      <div style={{ fontWeight: 900 }}>
                        잠시만 기다려주세요…
                      </div>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                      완료되면 아래에 컨셉 3안이 표시됩니다
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
                      <h2 style={{ margin: 0 }}>컨셉 후보 3안</h2>
                      <span style={pillStyle}>✅ 결과</span>
                    </div>
                    <p>
                      마음에 드는 컨셉 1개를 선택해 주세요. (선택 표시만 됩니다)
                    </p>

                    <div style={resultBannerStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 18 }}>✨</span>
                        <div style={{ fontWeight: 900 }}>
                          결과가 생성되었습니다
                        </div>
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
                              <div style={{ fontWeight: 900, fontSize: 15 }}>
                                {c.name}
                              </div>
                              <div style={{ marginTop: 6, opacity: 0.9 }}>
                                {c.oneLiner}
                              </div>
                            </div>
                            <span
                              style={{ ...pillStyle, height: "fit-content" }}
                            >
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
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                flexWrap: "wrap",
                              }}
                            >
                              {c.keywords.map((kw) => (
                                <span key={kw} style={pillStyle}>
                                  #{kw}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div
                            style={{
                              marginTop: 10,
                              fontSize: 13,
                              opacity: 0.9,
                            }}
                          >
                            <div>
                              <b>톤</b> · {c.tone}
                            </div>
                            <div style={{ marginTop: 4 }}>
                              <b>비주얼</b> · {c.visual}
                            </div>
                            <div style={{ marginTop: 4 }}>
                              <b>슬로건</b> · {c.slogans.join(" / ")}
                            </div>
                            {c.doNot?.length ? (
                              <div style={{ marginTop: 6, opacity: 0.85 }}>
                                <b>피해야 할 키워드</b> · {c.doNot.join(", ")}
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
                              {isSelected ? "선택 완료" : "이 컨셉 선택"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ✅ 선택 완료 시에만 다음 단계 버튼 노출 */}
                  {canGoNext ? (
                    <div
                      style={{
                        marginTop: 14,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        type="button"
                        className="btn primary"
                        onClick={handleGoNext}
                      >
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

            {/* 오른쪽 */}
            <aside className="diagInterview__right">
              <div className="sideCard">
                {/* ✅ 전체 단계(네이밍→컨셉→스토리→로고) 미니 표시 */}
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
                  className={`btn primary ${
                    canAnalyze && !analyzing ? "" : "disabled"
                  }`}
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
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter onOpenPolicy={setOpenType} />
    </div>
  );
}
