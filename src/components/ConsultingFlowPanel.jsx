// src/components/ConsultingFlowPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * ✅ 브랜드 컨설팅 4단계 진행 표시(네이밍 → 컨셉 → 스토리 → 로고)
 * - 현재 단계(activeKey) 강조
 * - localStorage 결과(선택 완료) 기반으로 완료 표시
 * - 단계 클릭 시 해당 인터뷰로 이동
 */

const STEPS = [
  {
    key: "naming",
    label: "네이밍",
    desc: "이름 후보",
    path: "/nameconsulting",
    legacyKey: "brandInterview_naming_v1",
  },
  {
    key: "concept",
    label: "컨셉",
    desc: "브랜드 방향",
    path: "/conceptconsulting",
    legacyKey: "brandInterview_homepage_v1",
  },
  {
    key: "story",
    label: "스토리",
    desc: "브랜드 서사",
    path: "/brand/story",
    legacyKey: "brandInterview_story_v1",
  },
  {
    key: "logo",
    label: "로고",
    desc: "시각 아이덴티티",
    path: "/logoconsulting",
    legacyKey: "brandInterview_logo_v1",
  },
];

const TIPS = {
  naming: {
    title: "네이밍은 ‘선명한 한 줄’이 중요해요",
    text: "필수 항목 입력 → 후보 3안 생성 → 1개 선택하면 다음 단계로 넘어갑니다.",
  },
  concept: {
    title: "컨셉은 모든 결과물의 기준점이에요",
    text: "후보 3안 중 1개를 선택하면 스토리/로고 결과의 톤이 통일됩니다.",
  },
  story: {
    title: "스토리는 ‘왜 시작했는가’를 정리해요",
    text: "오리진/문제/해결 흐름이 깔끔하면 설득력 있는 소개 문장이 나옵니다.",
  },
  logo: {
    title: "로고는 ‘첫인상’을 결정합니다",
    text: "타깃·성격·키워드를 구체적으로 적을수록 시안 방향이 또렷해져요.",
  },
};

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isStepDone(legacyKey) {
  const parsed = safeParse(localStorage.getItem(legacyKey));
  if (!parsed) return false;
  // pages마다 필드가 다를 수 있으니 넉넉히 판단
  if (parsed.selected) return true;
  if (parsed.selectedId) return true;
  return false;
}

export default function ConsultingFlowPanel({ activeKey = "naming" }) {
  const navigate = useNavigate();

  const activeIndex = useMemo(() => {
    const idx = STEPS.findIndex((s) => s.key === activeKey);
    return idx >= 0 ? idx : 0;
  }, [activeKey]);

  const [doneMap, setDoneMap] = useState(() => {
    const initial = {};
    STEPS.forEach((s) => {
      initial[s.key] = false;
    });
    return initial;
  });

  // ✅ localStorage 상태에 따라 완료 표시(선택 완료 여부)
  useEffect(() => {
    try {
      const next = {};
      STEPS.forEach((s) => {
        next[s.key] = isStepDone(s.legacyKey);
      });
      setDoneMap(next);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  const tip = TIPS[activeKey] || TIPS.naming;

  const handleStepClick = (step) => {
    // 현재 단계는 클릭해도 변화 없음
    if (!step?.path) return;
    if (step.key === activeKey) return;
    navigate(step.path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="flowPanel" aria-label="브랜드 컨설팅 진행 단계">
      <div className="flowPanel__top">
        <div className="flowPanel__left">
          <span className="flowPill">
            전체 진행 {activeIndex + 1}/{STEPS.length}
          </span>
          <span className="flowPanel__mini">
            선택 완료 후 다음 단계로 이동합니다.
          </span>
        </div>
        <button
          type="button"
          className="flowLink"
          onClick={() => navigate("/brandconsulting")}
          title="브랜드 컨설팅 홈으로 이동"
        >
          컨설팅 홈
        </button>
      </div>

      <ol className="flowSteps">
        {STEPS.map((s, i) => {
          const isActive = i === activeIndex;
          const isDone = doneMap[s.key] || i < activeIndex; // 현재 단계 앞은 ‘진행’ 느낌으로 완료 처리
          const stateClass = isActive ? "active" : isDone ? "done" : "todo";

          return (
            <li key={s.key} className={`flowStep ${stateClass}`}>
              <button
                type="button"
                className="flowStep__btn"
                onClick={() => handleStepClick(s)}
                aria-current={isActive ? "step" : undefined}
              >
                <span className="flowStep__circle" aria-hidden>
                  {isDone && !isActive ? "✓" : i + 1}
                </span>
                <span className="flowStep__text">
                  <span className="flowStep__label">{s.label}</span>
                  <span className="flowStep__desc">{s.desc}</span>
                </span>
              </button>
              {i < STEPS.length - 1 ? (
                <span className="flowStep__line" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="flowTip">
        <span className="flowTip__badge">TIP</span>
        <div className="flowTip__body">
          <p className="flowTip__title">{tip.title}</p>
          <p className="flowTip__text">{tip.text}</p>
        </div>
      </div>
    </section>
  );
}
