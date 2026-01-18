// src/pages/MyPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";

export default function MyPage({ onLogout }) {
  const navigate = useNavigate();

  // ✅ 푸터 약관/방침 모달 (너가 쓰는 방식으로 통일)
  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  // ✅ 브랜드 선택(임시)
  const [brandName, setBrandName] = useState("");
  const hasBrand = brandName.trim().length > 0;

  // ✅ (선택) 예시 상태값: 나중에 API 붙이면 여기만 교체하면 됨
  const diagnosisStatus = useMemo(() => (hasBrand ? "완료" : null), [hasBrand]);

  const handleGo = (path) => navigate(path);

  return (
    <div className="mypage-page">
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

      {/* ✅ 공통 헤더로 교체 */}
      <SiteHeader onLogout={onLogout} />

      <main className="mypage-content">
        <h2 className="mypage-title">마이 페이지</h2>

        <section className="mypage-card profile-card">
          <div className="profile-left">
            <div className="profile-avatar" aria-hidden="true" />
            <div>
              <strong>이름</strong>
              <p>이메일</p>
            </div>
          </div>

          <button
            type="button"
            className="mypage-button"
            onClick={() => alert("개인 정보 설정 (준비중)")}
          >
            개인 정보 설정
          </button>
        </section>

        <section className="mypage-card">
          <h3>브랜드 선택</h3>
          <div className="select-row">
            {hasBrand ? (
              <input
                type="text"
                value={brandName}
                onChange={(event) => setBrandName(event.target.value)}
                placeholder="브랜드명"
                aria-label="브랜드명"
              />
            ) : (
              <select
                aria-label="브랜드 선택"
                defaultValue=""
                onChange={(event) => setBrandName(event.target.value)}
              >
                <option value="" disabled>
                  브랜드 선택
                </option>
                <option value="브랜드 A">브랜드 A</option>
                <option value="브랜드 B">브랜드 B</option>
                <option value="브랜드 C">브랜드 C</option>
              </select>
            )}
          </div>
        </section>

        <section className="mypage-card">
          <h3>기업 진단 결과</h3>
          <div className="result-row">
            {diagnosisStatus ? (
              <span className="status-pill success">완료</span>
            ) : (
              <span className="result-empty" aria-hidden="true" />
            )}

            <button
              type="button"
              className="mypage-button"
              onClick={() => handleGo("/diagnosis")}
            >
              리포트 보기
            </button>
          </div>
        </section>

        <section className="mypage-card">
          <h3>브랜드 컨설팅 결과</h3>
          <div className="result-row">
            {hasBrand ? (
              <div className="status-stack">
                {/* ✅ 컨셉 제거 방향이면 문구만 바꾸면 됨 */}
                <span className="status-pill success">네이밍 컨설팅 완료</span>
                <span className="status-pill warning">로고 컨설팅 진행 중</span>
              </div>
            ) : (
              <span className="result-empty" aria-hidden="true" />
            )}

            <button
              type="button"
              className="mypage-button"
              onClick={() => handleGo("/brandconsulting")}
            >
              브랜드 컨설팅 결과 보기
            </button>
          </div>
        </section>

        <section className="mypage-card">
          <h3>홍보물 컨설팅 결과</h3>
          <div className="result-row">
            {hasBrand ? (
              <span className="status-pill warning">SNS 컨설팅 진행 중</span>
            ) : (
              <span className="result-empty" aria-hidden="true" />
            )}

            <button
              type="button"
              className="mypage-button"
              onClick={() => handleGo("/promotion")}
            >
              홍보물 컨설팅 결과 보기
            </button>
          </div>
        </section>

        <section className="mypage-card">
          <h3>계정 관리</h3>
          <button
            type="button"
            className="mypage-button ghost"
            onClick={() => alert("회원 탈퇴 (준비중)")}
          >
            회원 탈퇴
          </button>
        </section>

        {/* ✅ 페이지 내부에서 이동도 원하면 쓰기 */}
        <div className="mypage-navRow">
          <button
            type="button"
            className="mypage-linkBtn"
            onClick={() => handleGo("/main")}
          >
            홈으로
          </button>
          <button
            type="button"
            className="mypage-linkBtn"
            onClick={() => handleGo("/diagnosis")}
          >
            진단으로
          </button>
          <button
            type="button"
            className="mypage-linkBtn"
            onClick={() => handleGo("/brandconsulting")}
          >
            브랜드로
          </button>
          <button
            type="button"
            className="mypage-linkBtn"
            onClick={() => handleGo("/promotion")}
          >
            홍보물로
          </button>
        </div>
      </main>

      {/* ✅ 공통 푸터로 교체 */}
      <SiteFooter onOpenPolicy={setOpenType} />
    </div>
  );
}
