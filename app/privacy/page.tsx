import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { privacyHtml } from "@/lib/content/legal-html";
import { privacyEstablishedOn } from "@/lib/site";

export const metadata: Metadata = { title: "プライバシーポリシー" };

export default function PrivacyPage() {
  return (
    <LegalPage title="WISBOX ロッカーサービス プライバシーポリシー" establishedOn={privacyEstablishedOn}>
      <article className="legal" dangerouslySetInnerHTML={{ __html: privacyHtml }} />
    </LegalPage>
  );
}
