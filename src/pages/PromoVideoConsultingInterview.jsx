// src/pages/PromoVideoConsultingInterview.jsc
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

const STORAGE_KEY = "promoVideoInterviewDraft_v1";

export default function PromoVideoConsultingInterview({ onLogout }) {
  const navigate = useNavigate();

  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  const [form, setForm] = useState({
    brandName: "",
    productName: "",
    oneLineGoal: "",

    usagePurpose: "", // 1
    usageWhere: "", // 1 (유튜브, 인스타 릴스, 랜딩, 행사 등)
    targetAudience: "", // 2
    targetDetail: "", // 선택

    brandAssets: "", // 3
    brandAssetsFiles: "", // 선택

    avoidElements: "", // 4

    // 영상 특화(선택)
    duration: "", // 15s/30s/60s
    format: "", // 9:16/16:9
    keyMessage: "", // 핵심 메시지
    toneMood: "", // 분위기
    referenceLinks: "",
    extraNotes: "",
  });

  const [saveMsg, setSaveMsg] = useState("");
  const [lastSaved, setLastSaved] = useState("-");

  const refBasic = useRef(null);
  const refQ1 = useRef(null);
  const refQ2 = useRef(null);
  const refQ3 = useRef(null);
  const refQ4 = useRef(null);
  const refExtra = useRef(null);

  const sections = useMemo(
    () => [
      { id: "basic", label: "기본 정보", ref: refBasic },
      { id: "q1", label: "사용 목적", ref: refQ1 },
      { id: "q2", label: "타깃", ref: refQ2 },
      { id: "q3", label: "브랜드 자산", ref: refQ3 },
      { id: "q4", label: "방해 요소", ref: refQ4 },
      { id: "extra", label: "추가 정보", ref: refExtra },
    ],
    []
  );

  const requiredKeys = useMemo(
    () => [
      "usagePurpose",
      "usageWhere",
      "targetAudience",
      "brandAssets",
      "avoidElements",
    ],
    []
  );

  const requiredStatus = useMemo(() => {
    const status = {};
    requiredKeys.forEach((k) => {
      status[k] = Boolean(form[k]?.trim());
    });
    return status;
  }, [form, requiredKeys]);

  const completedRequired = useMemo(
    () => requiredKeys.filter((k) => requiredStatus[k]).length,
    [requiredKeys, requiredStatus]
  );

  const progress = useMemo(() => {
    if (requiredKeys.length === 0) return 0;
    return Math.round((completedRequired / requiredKeys.length) * 100);
  }, [completedRequired, requiredKeys.length]);

  const canAnalyze = completedRequired === requiredKeys.length;

  const currentSectionLabel = useMemo(() => {
    if (!form.usagePurpose.trim() || !form.usageWhere.trim())
      return "사용 목적";
    if (!form.targetAudience.trim()) return "타깃";
    if (!form.brandAssets.trim()) return "브랜드 자산";
    if (!form.avoidElements.trim()) return "방해 요소";
    return "완료";
  }, [form]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.form) setForm((prev) => ({ ...prev, ...parsed.form }));
      if (parsed?.updatedAt) {
        const d = new Date(parsed.updatedAt);
        if (!Number.isNaN(d.getTime())) setLastSaved(d.toLocaleString());
      }
    } catch {
      // ignore
    }
  }, []);

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

  const setValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTempSave = () => {
    try {
      const payload = { form, updatedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setLastSaved(new Date(payload.updatedAt).toLocaleString());
      setSaveMsg("임시 저장 완료");
    } catch {
      setSaveMsg("저장 실패");
    }
  };

  const scrollToSection = (ref) => {
    if (!ref?.current) return;
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNext = () => {
    const label = currentSectionLabel;
    const map = {
      "사용 목적": refQ2,
      타깃: refQ3,
      "브랜드 자산": refQ4,
      "방해 요소": refExtra,
      완료: null,
    };
    const nextRef = map[label] || refQ1;
    if (!nextRef) return;
    scrollToSection(nextRef);
  };

  const handleAnalyze = () => {
    if (!canAnalyze) {
      alert("필수 항목을 모두 입력하면 요청이 가능합니다.");
      return;
    }

    const resultForm = {
      purpose: form.usagePurpose,
      target: form.targetAudience,
      brandAsset: form.brandAssets,
      avoid: form.avoidElements,
      raw: form,
    };

    const payload = { form: resultForm, updatedAt: Date.now() };
    localStorage.setItem("promoInterview_video_v1", JSON.stringify(payload));

    navigate("/promotion/result?service=video");
  };

  return (
    <div className="promoVideo">
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

      <main className="promoVideo__main">
        <div className="promoVideo__container">
          <div className="promoVideo__titleRow">
            <div>
              <h1 className="promoVideo__title">홍보 영상 컨설팅 인터뷰</h1>
              <p className="promoVideo__sub">
                유튜브/릴스/쇼츠/랜딩 상단 영상 등 “홍보 영상 제작”을 위한
                질문입니다.
              </p>
            </div>

            <div className="promoVideo__topActions">
              <button
                type="button"
                className="btn ghost"
                onClick={() => navigate("/promotion")}
              >
                홍보물 컨설팅으로
              </button>
              <button type="button" className="btn" onClick={handleTempSave}>
                임시저장
              </button>
            </div>
          </div>

          <div className="promoVideo__grid">
            <section className="promoVideo__left">
              <div className="card" ref={refBasic}>
                <div className="card__head">
                  <h2>0. 기본 정보 (선택)</h2>
                  <p>영상은 메시지 흐름/길이에 따라 완전히 달라져요.</p>
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label>브랜드명/채널명 (선택)</label>
                    <input
                      value={form.brandName}
                      onChange={(e) => setValue("brandName", e.target.value)}
                      placeholder="예) BRANDPILOT"
                    />
                  </div>

                  <div className="field">
                    <label>제품/서비스명 (선택)</label>
                    <input
                      value={form.productName}
                      onChange={(e) => setValue("productName", e.target.value)}
                      placeholder="예) AI 브랜딩 컨설팅"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>한 줄 목표/설명 (선택)</label>
                  <input
                    value={form.oneLineGoal}
                    onChange={(e) => setValue("oneLineGoal", e.target.value)}
                    placeholder="예) 15초 안에 가치 제안을 전달하고 클릭을 유도"
                  />
                </div>
              </div>

              <div className="card" ref={refQ1}>
                <div className="card__head">
                  <h2>1. 사용 목적</h2>
                  <p>영상은 “어디에 올리는지 + 목표”가 먼저예요.</p>
                </div>

                <div className="field">
                  <label>
                    사용 목적 <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.usagePurpose}
                    onChange={(e) => setValue("usagePurpose", e.target.value)}
                    placeholder="예) 제품 인지도 상승 / 이벤트 참여 유도 / 앱 설치 유도"
                    rows={4}
                  />
                </div>

                <div className="field">
                  <label>
                    주 사용 위치/채널 <span className="req">*</span>
                  </label>
                  <input
                    value={form.usageWhere}
                    onChange={(e) => setValue("usageWhere", e.target.value)}
                    placeholder="예) 유튜브 쇼츠 / 인스타 릴스 / 웹 랜딩 상단 / 행사 상영"
                  />
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label>길이(선택)</label>
                    <input
                      value={form.duration}
                      onChange={(e) => setValue("duration", e.target.value)}
                      placeholder="예) 15초 / 30초 / 60초"
                    />
                  </div>
                  <div className="field">
                    <label>포맷(선택)</label>
                    <input
                      value={form.format}
                      onChange={(e) => setValue("format", e.target.value)}
                      placeholder="예) 9:16 / 16:9 / 1:1"
                    />
                  </div>
                </div>
              </div>

              <div className="card" ref={refQ2}>
                <div className="card__head">
                  <h2>2. 타깃</h2>
                  <p>누가 보는지에 따라 “첫 3초 훅”이 바뀝니다.</p>
                </div>

                <div className="field">
                  <label>
                    주요 타깃 <span className="req">*</span>
                  </label>
                  <input
                    value={form.targetAudience}
                    onChange={(e) => setValue("targetAudience", e.target.value)}
                    placeholder="예) 20~30대 직장인 / 투자자 / 스타트업 실무자"
                  />
                </div>

                <div className="field">
                  <label>타깃 상세/상황 (선택)</label>
                  <textarea
                    value={form.targetDetail}
                    onChange={(e) => setValue("targetDetail", e.target.value)}
                    placeholder="예) 출퇴근 중 무음 시청 / 자막 필수 / 빠른 템포 선호"
                    rows={3}
                  />
                </div>
              </div>

              <div className="card" ref={refQ3}>
                <div className="card__head">
                  <h2>3. 브랜드 자산</h2>
                  <p>로고/컬러/폰트/톤앤매너가 있으면 알려주세요.</p>
                </div>

                <div className="field">
                  <label>
                    사용 가능한 브랜드 자산 <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.brandAssets}
                    onChange={(e) => setValue("brandAssets", e.target.value)}
                    placeholder="예) 로고/컬러/폰트/슬로건/제품 이미지/촬영본 등"
                    rows={4}
                  />
                </div>

                <div className="field">
                  <label>파일/가이드 존재 여부 (선택)</label>
                  <input
                    value={form.brandAssetsFiles}
                    onChange={(e) =>
                      setValue("brandAssetsFiles", e.target.value)
                    }
                    placeholder="예) 로고 SVG / 브랜드 가이드 / 제품 사진 원본 있음"
                  />
                </div>
              </div>

              <div className="card" ref={refQ4}>
                <div className="card__head">
                  <h2>4. 방해 요소</h2>
                  <p>원하지 않는 느낌/연출/음악/색 등을 미리 제외해요.</p>
                </div>

                <div className="field">
                  <label>
                    제외하고 싶은 요소 <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.avoidElements}
                    onChange={(e) => setValue("avoidElements", e.target.value)}
                    placeholder="예) 과한 효과/깜빡임, 유치한 톤, 특정 장르 음악, 너무 느린 전개"
                    rows={4}
                  />
                </div>
              </div>

              <div className="card" ref={refExtra}>
                <div className="card__head">
                  <h2>5. 추가 정보 (선택)</h2>
                  <p>
                    영상은 메시지/분위기/레퍼런스가 있으면 퀄리티가 확 올라가요.
                  </p>
                </div>

                <div className="field">
                  <label>핵심 메시지(선택)</label>
                  <input
                    value={form.keyMessage}
                    onChange={(e) => setValue("keyMessage", e.target.value)}
                    placeholder="예) 3분 만에 기업 진단 완료 / 실행 체크리스트 자동 생성"
                  />
                </div>

                <div className="field">
                  <label>톤/무드(선택)</label>
                  <input
                    value={form.toneMood}
                    onChange={(e) => setValue("toneMood", e.target.value)}
                    placeholder="예) 신뢰감/미니멀/세련/빠른 템포"
                  />
                </div>

                <div className="field">
                  <label>참고 링크/레퍼런스 (선택)</label>
                  <textarea
                    value={form.referenceLinks}
                    onChange={(e) => setValue("referenceLinks", e.target.value)}
                    placeholder="예) 좋아하는 영상 링크/광고 레퍼런스"
                    rows={4}
                  />
                </div>

                <div className="field">
                  <label>기타 요청사항 (선택)</label>
                  <textarea
                    value={form.extraNotes}
                    onChange={(e) => setValue("extraNotes", e.target.value)}
                    placeholder="예) 무음 시청 고려(자막 필수) / 후반 CTA 강조 / 로고 엔딩"
                    rows={4}
                  />
                </div>
              </div>

              <div className="bottomBar">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={handleNext}
                >
                  다음 섹션
                </button>
                <button type="button" className="btn" onClick={handleTempSave}>
                  임시저장
                </button>
                <button
                  type="button"
                  className={`btn primary ${canAnalyze ? "" : "disabled"}`}
                  onClick={handleAnalyze}
                  disabled={!canAnalyze}
                >
                  컨설팅 요청
                </button>
              </div>
            </section>

            <aside className="promoVideo__right">
              <div className="sideCard">
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

                {saveMsg ? <p className="saveMsg">{saveMsg}</p> : null}

                <div className="divider" />

                <h4 className="sideSubTitle">필수 입력 체크</h4>
                <ul className="checkList">
                  <li className={requiredStatus.usagePurpose ? "ok" : ""}>
                    사용 목적
                  </li>
                  <li className={requiredStatus.usageWhere ? "ok" : ""}>
                    주 사용 위치/채널
                  </li>
                  <li className={requiredStatus.targetAudience ? "ok" : ""}>
                    타깃
                  </li>
                  <li className={requiredStatus.brandAssets ? "ok" : ""}>
                    브랜드 자산
                  </li>
                  <li className={requiredStatus.avoidElements ? "ok" : ""}>
                    방해 요소
                  </li>
                </ul>

                <div className="divider" />

                <h4 className="sideSubTitle">빠른 이동</h4>
                <div className="jumpGrid">
                  {sections.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="jumpBtn"
                      onClick={() => scrollToSection(s.ref)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className={`btn primary sideAnalyze ${canAnalyze ? "" : "disabled"}`}
                  onClick={handleAnalyze}
                  disabled={!canAnalyze}
                >
                  컨설팅 요청
                </button>

                {!canAnalyze ? (
                  <p className="hint">
                    * 필수 항목을 모두 입력하면 요청 버튼이 활성화됩니다.
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
