// src/pages/InvestmentBoard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

import PolicyModal from "../components/PolicyModal.jsx";
import { PrivacyContent, TermsContent } from "../components/PolicyContents.jsx";
import { apiRequest } from "../api/client.js";

export default function InvestmentBoard({ onLogout }) {
  const navigate = useNavigate();

  // 정책 모달
  const [openType, setOpenType] = useState(null);
  const closeModal = () => setOpenType(null);

  // 검색/필터
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("all");
  const [size, setSize] = useState("all");
  const [sort, setSort] = useState("popular"); // popular | newest

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("/brands/posts");
        const list = Array.isArray(data) ? data : [];
        const mapped = list.map((item) => ({
          id: item.postId,
          name: item.companyName || "회사명",
          oneLiner: item.shortDescription || "",
          logoImageUrl: item.logoImageUrl || "",
          tags: Array.isArray(item.hashtags)
            ? item.hashtags.map((tag) => tag.trim()).filter(Boolean)
            : [],
          authorId:
            item.userId ??
            item.authorId ??
            item.memberId ??
            item.loginId ??
            item.createdBy ??
            null,
          locations: item.region ? [item.region] : [],
          companySizes: item.companySize ? [item.companySize] : [],
          popularity: 0,
          updatedAt: item.updatedAt
            ? item.updatedAt.slice(0, 10)
            : "2026-01-01",
          kind: "preview",
        }));
        if (mounted) setItems(mapped);
      } catch (err) {
        console.error(err);
        if (mounted) setError("게시글 목록을 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPosts();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    let out = items.filter((it) => {
      const hit =
        !keyword ||
        it.name.toLowerCase().includes(keyword) ||
        it.oneLiner.toLowerCase().includes(keyword) ||
        it.tags.join(" ").toLowerCase().includes(keyword);

      const regionOk =
        region === "all"
          ? true
          : Array.isArray(it.locations)
            ? it.locations.includes(region)
            : it.location === region;
      const sizeOk =
        size === "all"
          ? true
          : Array.isArray(it.companySizes)
            ? it.companySizes.includes(size)
            : it.companySize === size;
      return hit && regionOk && sizeOk;
    });

    if (sort === "newest") {
      out = out.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    } else {
      out = out.sort((a, b) => b.popularity - a.popularity);
    }

    return out;
  }, [items, q, region, size, sort]);

  const locationOptions = [
    "all",
    "수도권",
    "강원도",
    "충남/충북",
    "경남/경북",
    "전남/전북",
    "제주",
  ];

  const companySizeOptions = [
    "all",
    "예비 창업 / 개인",
    "스타트업",
    "중소기업",
    "중견기업",
    "대기업",
  ];

  return (
    <div className="invest-page">
      {/* 정책 모달 */}
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

      <main className="invest-main">
        <section className="invest-hero">
          <div className="invest-hero-inner">
            <div>
              <h1 className="invest-title">투자 라운지</h1>
              <p className="invest-sub">
                투자자와 기업을 연결하는 기업 홍보 공간입니다.
              </p>
            </div>

            <div className="invest-hero-actions">
              <button
                type="button"
                className="btn ghost"
                onClick={() => navigate("/main")}
              >
                메인으로
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => navigate("/investment/new")}
              >
                게시글 등록
              </button>
            </div>
          </div>

          <div className="invest-toolbar">
            <div className="invest-search">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="회사명/키워드/태그로 검색"
                aria-label="투자유치 게시글 검색"
              />
            </div>

            <div className="invest-controls">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                aria-label="지역 필터"
              >
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === "all" ? "전체 지역" : loc}
                  </option>
                ))}
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="정렬"
              >
                <option value="popular">인기순</option>
                <option value="newest">최신순</option>
              </select>
            </div>
          </div>

          <div className="invest-chips">
            {companySizeOptions.map((value) => (
              <button
                key={value}
                type="button"
                className={`chip ${size === value ? "is-active" : ""}`}
                onClick={() => setSize(value)}
              >
                {value === "all" ? "전체" : value}
              </button>
            ))}
          </div>
        </section>

        <section className="invest-grid" aria-label="투자유치 게시글 목록">
          {loading ? (
            <div className="invest-detail-empty">불러오는 중...</div>
          ) : null}
          {error ? <div className="invest-detail-empty">{error}</div> : null}
          {!loading && !error && filtered.length === 0 ? (
            <div className="invest-detail-empty">등록된 게시글이 없습니다.</div>
          ) : null}
          {filtered.map((it) => {
            if (it.kind === "preview") {
              const logoText = it.name.slice(0, 2).toUpperCase();
              const locationText = [
                Array.isArray(it.locations)
                  ? it.locations.join(", ")
                  : it.location,
                Array.isArray(it.companySizes)
                  ? it.companySizes.join(", ")
                  : it.companySize,
              ]
                .filter(Boolean)
                .join(", ");
              const detailPath = `/investment/${it.id}`;

              return (
                <article
                  key={it.id}
                  className="invest-preview invest-preview--board"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(detailPath)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      navigate(detailPath);
                  }}
                >
                  <div className="invest-preview-top">
                    <div className="invest-preview-text">
                      <h3>{it.name}</h3>
                      <p className="invest-preview-oneliner">
                        {it.oneLiner || "한 줄 소개가 표시됩니다."}
                      </p>
                    </div>
                    <div className="invest-preview-logo" aria-hidden="true">
                      {it.logoImageUrl ? (
                        <img src={it.logoImageUrl} alt="로고 미리보기" />
                      ) : (
                        logoText
                      )}
                    </div>
                  </div>
                  <div className="invest-preview-tags">
                    {it.tags.length === 0 ? (
                      <span className="empty">태그를 입력해 주세요.</span>
                    ) : (
                      it.tags.map((tag) => <span key={tag}>#{tag}</span>)
                    )}
                  </div>
                  <div className="invest-preview-bottom">
                    <div className="invest-preview-meta">
                      <div className="invest-preview-status">
                        {locationText}
                      </div>
                      <div className="invest-preview-updated">
                        업데이트: {it.updatedAt}
                      </div>
                    </div>
                    <span className="invest-preview-link" aria-hidden="true">
                      ↗
                    </span>
                  </div>
                </article>
              );
            }

            return (
              <article
                key={it.id}
                className="invest-card"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/investment/${it.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    navigate(`/investment/${it.id}`);
                }}
              >
                <div className="invest-card-head">
                  <div className="invest-logo" aria-hidden="true">
                    {it.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="invest-head-text">
                    <h3>{it.name}</h3>
                    <p>{it.oneLiner}</p>
                  </div>
                </div>

                <div className="invest-meta">
                  <span className="pill">{it.stage}</span>
                  <span className="pill ghost">{it.location}</span>
                  <span
                    className={`pill ${it.status === "투자 완료" ? "success" : "warning"}`}
                  >
                    {it.status}
                  </span>
                </div>

                <div className="invest-tags">
                  {it.tags.map((t) => (
                    <span key={t}>#{t}</span>
                  ))}
                </div>

                <div className="invest-footer">
                  <strong>{it.amount}</strong>
                  <span className="arrow">↗</span>
                </div>

                <div className="invest-updated">업데이트: {it.updatedAt}</div>
              </article>
            );
          })}
        </section>
      </main>

      <SiteFooter onOpenPolicy={setOpenType} />
    </div>
  );
}
