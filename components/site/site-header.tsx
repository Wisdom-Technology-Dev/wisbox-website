"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const audiences = [
  { href: "/", label: "ご利用の方" },
  { href: "/business", label: "導入をご検討の方" },
] as const;

const businessLinks = [
  { href: "#biz-solutions", label: "解決できること" },
  { href: "#biz-flow", label: "導入の流れ" },
  { href: "#biz-faq", label: "よくある質問" },
] as const;

const homeLinks = [
  { href: "#flow", label: "使い方" },
  { href: "#price", label: "料金" },
  { href: "#faq", label: "よくある質問" },
] as const;

export function SiteHeader() {
  const pathname = usePathname().replace(/(.)\/$/, "$1"); // the static export serves /business/
  const onBusiness = pathname === "/business";
  const onHome = pathname === "/";

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--wb-line)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-3 px-4 md:px-8">
        <Link href="/" className="flex min-h-11 shrink-0 items-center gap-2.5" aria-label="WISBOX トップ">
          <Image src="/wisbox-mark.webp" alt="" width={34} height={35} priority className="mix-blend-multiply" />
          <span className="hidden text-[15px] font-bold tracking-[0.04em] text-[var(--wb-ink)] min-[400px]:inline">WISBOX</span>
        </Link>

        <nav aria-label="読者別の入口" className="flex rounded-[12px] bg-[var(--wb-paper)] p-1">
          {audiences.map((a) => {
            const active = a.href === "/business" ? onBusiness : !onBusiness;
            return (
              <Link
                key={a.href}
                href={a.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-10 items-center rounded-[10px] px-3 text-[13px] font-bold transition-colors sm:px-4 sm:text-[14px] ${
                  active ? "bg-[var(--wb-ink)] text-white" : "text-[var(--wb-muted)] hover:text-[var(--wb-ink)]"
                }`}
              >
                {a.label}
              </Link>
            );
          })}
        </nav>

        <nav aria-label="ページ内" className="hidden lg:block">
          <ul className="flex items-center gap-1 text-[14px] font-medium">
            {(onHome ? homeLinks : onBusiness ? businessLinks : []).map((l) => (
              <li key={l.href}>
                <a href={l.href} className="flex min-h-11 items-center px-3 text-[var(--wb-ink)] hover:text-[var(--wb-orange-deep)]">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              {onHome || onBusiness ? (
                /* opens the form in place (no hash, no scroll); user page -> personal, facility page -> business */
                <button
                  type="button"
                  data-inquiry-open={onBusiness ? "business" : "personal"}
                  className="ml-1 flex min-h-11 items-center rounded-[10px] bg-[var(--wb-ink)] px-4 font-bold text-white hover:bg-black"
                >
                  お問い合わせ
                </button>
              ) : (
                <a href="/#contact" className="ml-1 flex min-h-11 items-center rounded-[10px] bg-[var(--wb-ink)] px-4 font-bold text-white hover:bg-black">
                  お問い合わせ
                </a>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
