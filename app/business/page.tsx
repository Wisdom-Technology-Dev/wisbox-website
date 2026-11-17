import type { Metadata } from "next";
import { ChevronDown, Mail, Phone } from "lucide-react";
import { BusinessSections, businessFaqs } from "@/components/site/business-sections";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { RobotScript } from "@/components/site/robot-script";
import { WisboxRobot } from "@/components/site/wisbox-robot";
import { company, contact } from "@/lib/site";

export const metadata: Metadata = { title: "施設への導入" };

export default function BusinessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <BusinessSections />

        <section id="biz-faq" aria-labelledby="bizfaq-title" className="scroll-mt-16 border-t border-[var(--wb-line)] bg-[var(--wb-paper)]">
          <div className="mx-auto grid max-w-[1120px] gap-10 px-5 py-14 md:grid-cols-[280px_1fr] md:gap-16 md:px-8 md:py-20">
            <div>
              <p className="flex items-center gap-2 text-[12px] font-bold tracking-[0.16em] text-[var(--wb-orange-deep)]">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--wb-orange)]" />
                FAQ
              </p>
              <h2 id="bizfaq-title" className="mt-3 text-[26px] font-bold leading-[1.5] text-[var(--wb-ink)] md:text-[30px]">
                導入に関するよくある質問
              </h2>
            </div>
            <div className="border-t border-[var(--wb-ink)]">
              {businessFaqs.map((item, i) => (
                <details key={item.q} className="group border-b border-[var(--wb-line)]" open={i === 0}>
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] font-bold text-[var(--wb-ink)] [&::-webkit-details-marker]:hidden">
                    <span className="flex gap-3">
                      <span aria-hidden className="text-[var(--wb-orange-deep)]">Q</span>
                      {item.q}
                    </span>
                    <ChevronDown aria-hidden className="h-5 w-5 shrink-0 text-[var(--wb-muted)] transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="pb-5 pl-7 text-[14.5px] leading-[1.9] text-[var(--wb-body)]">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="biz-contact" aria-labelledby="bizcontact-title" className="scroll-mt-16 bg-white">
          <div className="mx-auto max-w-[1120px] px-5 py-14 text-center md:px-8 md:py-20">
            <p className="flex items-center justify-center gap-2 text-[12px] font-bold tracking-[0.16em] text-[var(--wb-orange-deep)]">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--wb-orange)]" />
              CONTACT
            </p>
            <h2 id="bizcontact-title" className="mt-3 text-[26px] font-bold text-[var(--wb-ink)] md:text-[30px]">
              導入のご相談・お見積もり
            </h2>
            <p className="mx-auto mt-3 max-w-[36em] text-[15px] leading-[1.9] text-[var(--wb-muted)]">
              まずは「うちの施設に置けるか」だけでも、お気軽にお問い合わせください。施設の種類・現在の台数・ロッカーエリアの広さをお知らせいただくとスムーズです。
            </p>
            <div data-robot-invite className="mt-6 flex items-center justify-center gap-2">
              <WisboxRobot role="facility" pose="point-r" className="w-[96px] md:w-[112px]" button="WISBOX のキャラクター（押すとロッカーを紹介します）" buttonClassName="shrink-0" />
              <button type="button" data-inquiry-open="business" className="wb-btn wb-btn-primary">
                <Mail aria-hidden className="h-4 w-4" />
                導入のご相談・お見積もり
              </button>
            </div>
            <div className="mt-8 flex flex-col items-center gap-1 text-[13.5px] leading-[1.8] text-[var(--wb-muted)]">
              <a href={contact.phoneHref} className="inline-flex min-h-11 items-center gap-2 text-[var(--wb-ink)] hover:text-[var(--wb-orange-deep)]">
                <Phone aria-hidden className="h-4 w-4 text-[var(--wb-orange-deep)]" />
                <span className="text-[17px] font-bold">TEL: {contact.phone}</span>
                <span className="text-[12.5px] text-[var(--wb-muted)]">{contact.hours}</span>
              </a>
              <p>
                {company.name}　{company.postalCode} {company.address}
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <RobotScript />
    </div>
  );
}
