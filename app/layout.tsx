import type { Metadata } from "next";
import { Zen_Kaku_Gothic_New } from "next/font/google";
import type { ReactNode } from "react";
import { WelcomeGate } from "@/components/site/welcome-gate";
import { WELCOME_BOOT } from "@/lib/welcome-boot";
import "./globals.css";

const bodyFont = Zen_Kaku_Gothic_New({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-wb",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wisbox.jp"),
  title: { default: "WISBOX ご利用案内｜スマホで使えるロッカー", template: "%s｜WISBOX" },
  description: "WISBOX は、LINE からかんたんに使えるスマートロッカーです。PayPay でお支払いいただけます。料金・ご利用の流れ・お問い合わせ先のご案内。",
};

/* GitHub Pages serves static files only, so the inquiry form posts straight to the WISBOX LP App's
 * inquiry endpoint (it stores the inquiry and emails the company inbox; it allows https://wisbox.jp).
 * Override with NEXT_PUBLIC_INQUIRY_ENDPOINT (+ NEXT_PUBLIC_INQUIRY_FORMAT=relay for a /api/inquiry relay). */
const INQUIRY_ENDPOINT = process.env.NEXT_PUBLIC_INQUIRY_ENDPOINT || "https://wisbox-smartlocker-lp.kylon.app/api/inquiries";
const INQUIRY_FORMAT = process.env.NEXT_PUBLIC_INQUIRY_FORMAT || "lp";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className={bodyFont.variable} suppressHydrationWarning>
      <head>
        {/* Decides before first paint whether to show the welcome; does nothing if scripts are off. */}
        <script dangerouslySetInnerHTML={{ __html: WELCOME_BOOT }} />
        <script dangerouslySetInnerHTML={{ __html: `window.WISBOX_INQUIRY_ENDPOINT=${JSON.stringify(INQUIRY_ENDPOINT)};window.WISBOX_INQUIRY_FORMAT=${JSON.stringify(INQUIRY_FORMAT)};` }} />
      </head>
      <body>
        <WelcomeGate />
        {children}
      </body>
    </html>
  );
}
