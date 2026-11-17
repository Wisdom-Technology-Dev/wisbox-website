import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export function LegalPage({
  title,
  establishedOn,
  showEstablished = true,
  children,
}: {
  title: string;
  establishedOn?: string | null;
  showEstablished?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-[var(--wb-line)] bg-[var(--wb-paper)]">
          <div className="mx-auto max-w-[820px] px-5 pb-10 pt-12 md:px-8 md:pt-16">
            <p className="text-[13px] font-medium tracking-[0.08em] text-[var(--wb-orange-deep)]">WISBOX</p>
            <h1 className="mt-3 text-[26px] font-bold leading-snug text-[var(--wb-ink)] md:text-[34px]">{title}</h1>
            {showEstablished ? (
              <p className="mt-4 text-[14px] text-[var(--wb-muted)]">
                制定日：{establishedOn ?? <mark>【公開日を記入】</mark>}
              </p>
            ) : null}
          </div>
        </div>
        <div className="mx-auto max-w-[820px] px-5 py-10 md:px-8 md:py-14">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
