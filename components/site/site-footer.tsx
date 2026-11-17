"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { company } from "@/lib/site";

const legalLinks = [
  { href: "/", label: "ご利用の方" },
  { href: "/business", label: "導入をご検討の方" },
  { href: "/tokusho", label: "特定商取引法に基づく表記" },
  { href: "/terms", label: "ご利用規約" },
  { href: "/privacy", label: "プライバシーポリシー" },
] as const;

export function SiteFooter() {
  const pathname = usePathname();
  return (
    <footer className="bg-[var(--wb-ink)] text-white">
      <div className="mx-auto grid max-w-[1120px] gap-8 px-5 py-12 md:grid-cols-[1fr_auto] md:px-8">
        <div>
          <p className="text-[15px] font-bold tracking-[0.04em]">WISBOX</p>
          <p className="mt-2 text-[13px] leading-relaxed text-white/70">
            運営：
            <a href={company.corporateUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">
              {company.name}
            </a>
          </p>
        </div>
        <nav aria-label="サイト内リンク">
          <ul className="flex flex-col gap-1 text-[14px] md:items-end">
            {legalLinks.map((link) => (
              <li key={link.href}>
                {pathname === link.href ? (
                  <span aria-current="page" className="flex min-h-11 items-center gap-2 font-bold text-[var(--wb-orange)]">
                    <span aria-hidden className="h-1.5 w-1.5 bg-[var(--wb-orange)]" />
                    {link.label}
                  </span>
                ) : (
                  <Link href={link.href} className="flex min-h-11 items-center text-white/85 hover:text-white">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-3 md:px-8">
          <p className="py-2 text-[12px] text-white/55">© 2026 {company.name}</p>
          <button type="button" data-welcome-replay hidden className="inline-flex min-h-11 items-center text-[12px] text-white/55 underline underline-offset-4 hover:text-white">
            ウェルカム画面をもう一度見る
          </button>
        </div>
      </div>
    </footer>
  );
}
