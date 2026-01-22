// src/pages/DigitalImageConsultingInterview.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

const STORAGE_KEY = "promoDigitalInterviewDraft_v1";

export default function DigitalImageConsultingInterview({ onLogout }) {
  const navigate = useNavigate();

  // ✅ 약관/방침 모달
  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  // ✅ 폼 상태
  const [form, setForm] = useState({
    brandName: "",
    productName: "",
    oneLineGoal: "",

    usagePurpose: "", // 1. 사용 목적 (필수)
    usageWhere: "", // 어디에 주로 (필수)
    targetAudience: "", // 2. 타깃 (필수)
    targetDetail: "", // 타깃 상세(선택)

    brandAssets: "", // 3. 브랜드 자산 (필수)
    brandAssetsFiles: "", // 로고/컬러/폰트 파일 여부(선택)

    avoidElements: "", // 4. 방해 요소 (필수)

    // 디지털 특화(선택)
    channel: "", // SNS/웹 배너/이메일 등
    sizeFormat: "", // 1080x1080, 16:9 등
    callToAction: "", // CTA 문구
    referenceLinks: "", // 참고 링크
    extraNotes: "", // 기타
  });

  // ✅ 저장 상태 UI
  const [saveMsg, setSaveMsg] = useState("");
  const [lastSaved, setLastSaved] = useState("-");

  // 섹션 스크롤용 ref
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
    [],
  );

  // ✅ 필수 항목(사진 질문 중심)
  const requiredKeys = useMemo(
    () => [
      "usagePurpose",
      "usageWhere",
      "targetAudience",
      "brandAssets",
      "avoidElements",
    ],
    [],
  );

  const requiredStatus = useMemo(() => {
    const status = {};
    requiredKeys.forEach((k) => {
      status[k] = Boolean(form[k]?.trim());
    });
    return status;
  }, [form, requiredKeys]);

  const completedRequired = useMemo(() => {
    return requiredKeys.filter((k) => requiredStatus[k]).length;
  }, [requiredKeys, requiredStatus]);

  const progress = useMemo(() => {
    if (requiredKeys.length === 0) return 0;
    return Math.round((completedRequired / requiredKeys.length) * 100);
  }, [completedRequired, requiredKeys.length]);

  const canAnalyze = completedRequired === requiredKeys.length;

  // ✅ 현재 단계(첫 미완료 기준)
  const currentSectionLabel = useMemo(() => {
    if (!form.usagePurpose.trim() || !form.usageWhere.trim())
      return "사용 목적";
    if (!form.targetAudience.trim()) return "타깃";
    if (!form.brandAssets.trim()) return "브랜드 자산";
    if (!form.avoidElements.trim()) return "방해 요소";
    return "완료";
  }, [form]);

  // ✅ draft 로드
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
    // 🔌 BACKEND 연동 포인트 (홍보물-디지털/SNS - AI 분석 요청)
    // - 현재: form을 localStorage에 저장 → /promotion/result?service=digital 로 이동
    // - 백엔드 명세서 후보 매핑:
    //   - SNS 홍보물 제작: POST /brands/sns
    //   - 생성 결과 조회:  GET  /brands/sns
    // - 실제로 'digital'이 /sns 인지, /posters 인지 팀과 최종 매핑 필요
    if (!canAnalyze) {
      alert("필수 항목을 모두 입력하면 요청이 가능합니다.");
      return;
    }

    // ✅ 결과 페이지가 읽는 key로 정규화
    const resultForm = {
      purpose: form.usagePurpose, // 결과 1) 사용 목적
      target: form.targetAudience, // 결과 2) 타깃
      brandAsset: form.brandAssets, // 결과 3) 브랜드 자산
      avoid: form.avoidElements, // 결과 4) 피하고 싶은 요소

      // (선택) 원본도 같이 저장해두면 나중에 확장 쉬움
      raw: form,
    };

    const payload = { form: resultForm, updatedAt: Date.now() };
    localStorage.setItem("promoInterview_digital_v1", JSON.stringify(payload));

    navigate("/promotion/result?service=digital");
  };

  return (
    <div className="promoDigital">
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

      <SiteHeader onLogout={onLogout} />

      <main className="promoDigital__main">
        <div className="promoDigital__container">
          {/* 상단 타이틀 */}
          <div className="promoDigital__titleRow">
            <div>
              <h1 className="promoDigital__title">
                디지털 이미지 컨설팅 인터뷰
              </h1>
              <p className="promoDigital__sub">
                웹페이지 양끝 광고 이미지, SNS 콘텐츠, 온라인 배너 등 “디지털
                채널용 홍보 이미지” 제작을 위한 질문입니다.
              </p>
            </div>

            <div className="promoDigital__topActions">
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

          <div className="promoDigital__grid">
            {/* ✅ 왼쪽: 폼 */}
            <section className="promoDigital__left">
              {/* BASIC */}
              <div className="card" ref={refBasic}>
                <div className="card__head">
                  <h2>0. 기본 정보 (선택)</h2>
                  <p>기본 정보는 있으면 더 정확히 맞춰드릴 수 있어요.</p>
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
                    placeholder="예) 투자/지원사업용 문서 초안에 들어갈 핵심 홍보 이미지가 필요"
                  />
                </div>
              </div>

              {/* Q1 */}
              <div className="card" ref={refQ1}>
                <div className="card__head">
                  <h2>1. 사용 목적</h2>
                  <p>어디에 쓰는지에 따라 구성/비율/카피가 달라져요.</p>
                </div>

                <div className="field">
                  <label>
                    사용 목적 <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.usagePurpose}
                    onChange={(e) => setValue("usagePurpose", e.target.value)}
                    placeholder="예) 투자 유치/지원사업용 문서 표지, 제품 소개용 SNS 카드뉴스 등"
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
                    placeholder="예) IR 피치덱 표지 / 웹 첫 화면 배너 / 인스타 피드 / 링크드인 썸네일"
                  />
                </div>

                <div className="field">
                  <label>디지털 채널/포맷 (선택)</label>
                  <input
                    value={form.channel}
                    onChange={(e) => setValue("channel", e.target.value)}
                    placeholder="예) 인스타(1080x1080), 웹 배너(1920x600), 유튜브 썸네일(1280x720)"
                  />
                </div>
              </div>

              {/* Q2 */}
              <div className="card" ref={refQ2}>
                <div className="card__head">
                  <h2>2. 타깃</h2>
                  <p>누가 보는지에 따라 말투/강조 포인트가 바뀝니다.</p>
                </div>

                <div className="field">
                  <label>
                    주요 타깃 <span className="req">*</span>
                  </label>
                  <input
                    value={form.targetAudience}
                    onChange={(e) => setValue("targetAudience", e.target.value)}
                    placeholder="예) 엔젤 투자자, VC, 스타트업 참여자, 기업 파트너, 일반 사용자"
                  />
                </div>

                <div className="field">
                  <label>타깃 상세/상황 (선택)</label>
                  <textarea
                    value={form.targetDetail}
                    onChange={(e) => setValue("targetDetail", e.target.value)}
                    placeholder="예) 첫인상 3초 안에 이해해야 함 / 실무자가 바로 공유할 수 있어야 함 등"
                    rows={3}
                  />
                </div>
              </div>

              {/* Q3 */}
              <div className="card" ref={refQ3}>
                <div className="card__head">
                  <h2>3. 브랜드 자산</h2>
                  <p>사용 가능한 로고/컬러/폰트가 있는지 알려주세요.</p>
                </div>

                <div className="field">
                  <label>
                    사용 가능한 브랜드 자산 <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.brandAssets}
                    onChange={(e) => setValue("brandAssets", e.target.value)}
                    placeholder="예) 로고 있음(심볼/워드마크), 메인 컬러 #001F66, 서브 #1766E5, 폰트는 Noto Sans KR"
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
                    placeholder="예) 로고 PNG/SVG 있음, 브랜드 가이드 PDF 있음"
                  />
                </div>
              </div>

              {/* Q4 */}
              <div className="card" ref={refQ4}>
                <div className="card__head">
                  <h2>4. 방해 요소</h2>
                  <p>원하지 않는 분위기/색/이미지 등을 미리 제외해요.</p>
                </div>

                <div className="field">
                  <label>
                    제외하고 싶은 요소 <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.avoidElements}
                    onChange={(e) => setValue("avoidElements", e.target.value)}
                    placeholder="예) 너무 유치한 일러스트, 과한 3D, 특정 색상(형광), 지나친 텍스트 밀도"
                    rows={4}
                  />
                </div>
              </div>

              {/* EXTRA */}
              <div className="card" ref={refExtra}>
                <div className="card__head">
                  <h2>5. 추가 정보 (선택)</h2>
                  <p>있으면 더 정확히 맞춰드릴 수 있어요.</p>
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label>권장 사이즈/비율 (선택)</label>
                    <input
                      value={form.sizeFormat}
                      onChange={(e) => setValue("sizeFormat", e.target.value)}
                      placeholder="예) 1080x1080, 16:9, 4:5"
                    />
                  </div>

                  <div className="field">
                    <label>CTA 문구 (선택)</label>
                    <input
                      value={form.callToAction}
                      onChange={(e) => setValue("callToAction", e.target.value)}
                      placeholder="예) 지금 무료 진단하기 / 상담 신청"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>참고 링크/레퍼런스 (선택)</label>
                  <textarea
                    value={form.referenceLinks}
                    onChange={(e) => setValue("referenceLinks", e.target.value)}
                    placeholder="예) 참고 이미지 링크, 경쟁사 링크, 좋아하는 스타일 링크 등"
                    rows={4}
                  />
                </div>

                <div className="field">
                  <label>기타 요청사항 (선택)</label>
                  <textarea
                    value={form.extraNotes}
                    onChange={(e) => setValue("extraNotes", e.target.value)}
                    placeholder="예) 폰트는 딱딱하지 않게 / 핵심 키워드 3개 강조 / 신뢰감 톤"
                    rows={4}
                  />
                </div>
              </div>

              {/* 하단 버튼 */}
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

            {/* ✅ 오른쪽: 진행률/가이드 Sticky */}
            <aside className="promoDigital__right">
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
