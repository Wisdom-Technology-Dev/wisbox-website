import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { LegalPage } from "@/components/site/legal-page";
import { company, contact, extraFees, formatYen, prices } from "@/lib/site";

export const metadata: Metadata = { title: "特定商取引法に基づく表記" };

const priceText = prices.map((p) => `${p.size} ${formatYen(p.yen)}`).join("／");

const rows: { label: string; value: ReactNode }[] = [
  { label: "販売事業者", value: company.name },
  { label: "代表者", value: company.representative },
  { label: "運営責任者", value: company.representative },
  { label: "所在地", value: `${company.postalCode}　${company.address}` },
  {
    label: "電話番号",
    value: (
      <>
        <a href={contact.phoneHref}>{contact.phone}</a>（{contact.hours}）
      </>
    ),
  },
  { label: "メールアドレス", value: <a href={`mailto:${contact.email}`}>{contact.email}</a> },
  { label: "サービス名", value: "WISBOX（スマートロッカーの時間貸しサービス）" },
  {
    label: "販売価格",
    value: `各ロッカーのサイズごとに、24時間あたり ${priceText}（税込）。ご注文画面およびロッカーに表示します。`,
  },
  {
    label: "販売価格以外にお客様にご負担いただく費用",
    value: (
      <ul>
        <li>ご利用期間を超えた収容品の保管手数料：{formatYen(extraFees.storage)}（税込）</li>
        <li>係員による現地解錠：{formatYen(extraFees.onsiteUnlock)}（税込）</li>
        <li>収容品の発送をご希望の場合の送料（着払い）</li>
        <li>インターネット接続に必要な通信料</li>
      </ul>
    ),
  },
  { label: "お支払い方法", value: "PayPay" },
  {
    label: "お支払い時期",
    value:
      "ご注文時に最初の24時間分の利用料金をお支払いいただきます。24時間を超えた場合は、お受け取りの際に超過分を精算します。",
  },
  { label: "サービスの提供時期", value: "お支払い完了後、直ちにロッカーをご利用いただけます。" },
  { label: "ご利用期間", value: "連続3日間（72時間）まで" },
  {
    label: "キャンセル・返金",
    value:
      "扉が開いた後のキャンセルおよび返金はお受けできません。ロッカーの故障その他当社の責めに帰すべき事由によりご利用いただけなかった場合は、お支払いいただいた料金を返金します。",
  },
  { label: "動作環境", value: "LINEアプリ（最新版を推奨）がインストールされたスマートフォン" },
];

export default function TokushoPage() {
  return (
    <LegalPage title="特定商取引法に基づく表記" showEstablished={false}>
      <dl className="tokusho">
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-10 text-[14px] leading-relaxed text-[var(--wb-muted)]">
        ご利用条件の詳細は<Link href="/terms" className="text-[var(--wb-ink)] underline underline-offset-4">ご利用規約</Link>
        をご確認ください。
      </p>
    </LegalPage>
  );
}
