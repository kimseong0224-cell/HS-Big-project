// src/pages/OfflinImageConsultingInterview.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

const STORAGE_KEY = "promoOfflineInterviewDraft_v1";

export default function OfflineConsultingInterview({ onLogout }) {
  const navigate = useNavigate();

  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  const [form, setForm] = useState({
    brandName: "",
    productName: "",
    oneLineGoal: "",

    usagePurpose: "", // 1
    usageWhere: "", // 1 (오프라인 매체/장소)
    targetAudience: "", // 2
    targetDetail: "", // 선택

    brandAssets: "", // 3
    brandAssetsFiles: "", // 선택

    avoidElements: "", // 4

    // 오프라인 특화(선택)
    placementType: "", // 버스/택시/지하철/빌보드 등
    sizeFormat: "", // 가로/세로/규격
    viewingDistance: "", // 거리/시간
    printNotes: "", // 인쇄/가독성/제약
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
    localStorage.setItem("promoInterview_offline_v1", JSON.stringify(payload));

    navigate("/promotion/result?service=offline");
  };

  return (
    <div className="promoOffline">
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

      <main className="promoOffline__main">
        <div className="promoOffline__container">
          <div className="promoOffline__titleRow">
            <div>
              <h1 className="promoOffline__title">오프라인 컨설팅 인터뷰</h1>
              <p className="promoOffline__sub">
                버스/택시 광고, 지하철/기차 내부, 길거리 광고판(빌보드) 등
                “오프라인 홍보 이미지” 제작을 위한 질문입니다.
              </p>
            </div>

            <div className="promoOffline__topActions">
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

          <div className="promoOffline__grid">
            <section className="promoOffline__left">
              <div className="card" ref={refBasic}>
                <div className="card__head">
                  <h2>0. 기본 정보 (선택)</h2>
                  <p>기본 정보는 있으면 더 정확히 맞춰드릴 수 있어요.</p>
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label>브랜드명/상호 (선택)</label>
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
                    placeholder="예) 오프라인 유입/인지도 상승을 위한 핵심 홍보 이미지가 필요"
                  />
                </div>
              </div>

              <div className="card" ref={refQ1}>
                <div className="card__head">
                  <h2>1. 사용 목적</h2>
                  <p>오프라인은 “가독성/거리/시간”이 핵심이에요.</p>
                </div>

                <div className="field">
                  <label>
                    사용 목적 <span className="req">*</span>
                  </label>
                  <textarea
                    value={form.usagePurpose}
                    onChange={(e) => setValue("usagePurpose", e.target.value)}
                    placeholder="예) 신규 매장 오픈 홍보 / 행사 안내 / 브랜드 인지도 캠페인"
                    rows={4}
                  />
                </div>

                <div className="field">
                  <label>
                    광고가 붙는 위치/매체 <span className="req">*</span>
                  </label>
                  <input
                    value={form.usageWhere}
                    onChange={(e) => setValue("usageWhere", e.target.value)}
                    placeholder="예) 버스 외부 / 택시 내부 / 지하철 스크린도어 / 길거리 전광판"
                  />
                </div>

                <div className="field">
                  <label>매체 유형(선택)</label>
                  <input
                    value={form.placementType}
                    onChange={(e) => setValue("placementType", e.target.value)}
                    placeholder="예) A0 포스터 / 스크린도어 / 랩핑 / 빌보드"
                  />
                </div>
              </div>

              <div className="card" ref={refQ2}>
                <div className="card__head">
                  <h2>2. 타깃</h2>
                  <p>
                    오프라인은 “누가, 언제, 어떤 상황에서 보는지”가 중요해요.
                  </p>
                </div>

                <div className="field">
                  <label>
                    주요 타깃 <span className="req">*</span>
                  </label>
                  <input
                    value={form.targetAudience}
                    onChange={(e) => setValue("targetAudience", e.target.value)}
                    placeholder="예) 출퇴근 직장인 / 20~30대 / 지역 주민 / 관광객"
                  />
                </div>

                <div className="field">
                  <label>타깃 상세/상황 (선택)</label>
                  <textarea
                    value={form.targetDetail}
                    onChange={(e) => setValue("targetDetail", e.target.value)}
                    placeholder="예) 3~5초 내 이해 / 멀리서도 인지 / 이동 중 시야 확보"
                    rows={3}
                  />
                </div>
              </div>

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
                    placeholder="예) 로고 있음, 메인 컬러 #001F66, 폰트 Noto Sans KR, 슬로건"
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
                    placeholder="예) 로고 SVG 있음 / 브랜드 가이드 PDF 있음"
                  />
                </div>
              </div>

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
                    placeholder="예) 과한 텍스트 / 작은 글씨 / 저채도 회색만 사용 / 유치한 캐릭터"
                    rows={4}
                  />
                </div>
              </div>

              <div className="card" ref={refExtra}>
                <div className="card__head">
                  <h2>5. 추가 정보 (선택)</h2>
                  <p>
                    오프라인은 규격/가독성/인쇄 제약이 있으면 꼭 적어주세요.
                  </p>
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label>규격/비율 (선택)</label>
                    <input
                      value={form.sizeFormat}
                      onChange={(e) => setValue("sizeFormat", e.target.value)}
                      placeholder="예) A1 세로 / 2000x1000mm"
                    />
                  </div>

                  <div className="field">
                    <label>시청 거리/시간 (선택)</label>
                    <input
                      value={form.viewingDistance}
                      onChange={(e) =>
                        setValue("viewingDistance", e.target.value)
                      }
                      placeholder="예) 5~10m / 3초 내 인지"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>인쇄/가독성 제약 (선택)</label>
                  <textarea
                    value={form.printNotes}
                    onChange={(e) => setValue("printNotes", e.target.value)}
                    placeholder="예) 흑백 인쇄 가능성 / 야간 가독성 / QR 필수 여부"
                    rows={3}
                  />
                </div>

                <div className="field">
                  <label>참고 링크/레퍼런스 (선택)</label>
                  <textarea
                    value={form.referenceLinks}
                    onChange={(e) => setValue("referenceLinks", e.target.value)}
                    placeholder="예) 좋아하는 오프라인 광고 스타일 링크/사진"
                    rows={4}
                  />
                </div>

                <div className="field">
                  <label>기타 요청사항 (선택)</label>
                  <textarea
                    value={form.extraNotes}
                    onChange={(e) => setValue("extraNotes", e.target.value)}
                    placeholder="예) 상단 로고 크게 / QR 코드 하단 배치 / 연락처 강조"
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

            <aside className="promoOffline__right">
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
                    광고 위치/매체
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
