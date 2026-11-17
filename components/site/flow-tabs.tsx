"use client";

import { useState, type ReactNode } from "react";

const tabs = [
  { id: "deposit", label: "預ける", count: "4 ステップ" },
  { id: "pickup", label: "受け取る", count: "3 ステップ" },
] as const;

export function FlowTabs({ deposit, pickup }: { deposit: ReactNode; pickup: ReactNode }) {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("deposit");
  const panels = { deposit, pickup };

  return (
    <div className="mt-8">
      <div role="tablist" aria-label="ご利用の流れ" className="inline-flex rounded-[12px] border border-[var(--wb-line)] bg-white p-1">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-controls={`panel-${t.id}`}
            aria-selected={active === t.id}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                const next = tabs[(i + 1) % tabs.length];
                setActive(next.id);
                document.getElementById(`tab-${next.id}`)?.focus();
              }
            }}
            className={`flex min-h-11 items-center gap-2 rounded-[10px] px-6 text-[15px] font-bold transition-colors ${
              active === t.id ? "bg-[var(--wb-ink)] text-white" : "text-[var(--wb-muted)] hover:text-[var(--wb-ink)]"
            }`}
          >
            {t.label}
            <span className={`text-[12px] font-medium ${active === t.id ? "text-white/70" : "text-[var(--wb-muted)]"}`}>{t.count}</span>
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={active !== t.id} className="mt-6">
          {panels[t.id]}
        </div>
      ))}
    </div>
  );
}
