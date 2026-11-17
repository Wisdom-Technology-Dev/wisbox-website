import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { termsHtml } from "@/lib/content/legal-html";
import { termsEstablishedOn } from "@/lib/site";

export const metadata: Metadata = { title: "ご利用規約" };

export default function TermsPage() {
  return (
    <LegalPage title="WISBOX ロッカー ご利用規約" establishedOn={termsEstablishedOn}>
      <article className="legal" dangerouslySetInnerHTML={{ __html: termsHtml }} />
    </LegalPage>
  );
}
