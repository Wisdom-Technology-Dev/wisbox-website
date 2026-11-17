import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ChevronDown, DoorOpen, History, JapaneseYen, KeyRound, LayoutGrid, Mail, MapPin, MessageCircle, PackageOpen, Phone, QrCode, Smartphone, type LucideIcon } from "lucide-react";
import { FlowTabs } from "@/components/site/flow-tabs";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { RobotScript } from "@/components/site/robot-script";
import { WisboxRobot } from "@/components/site/wisbox-robot";
import { company, contact, extraFees, formatYen, prices } from "@/lib/site";

const depositSteps = [
  { icon: QrCode, title: "QR コードを読み取る", body: "ロッカーの QR コードを LINE で読み取ります。" },
  { icon: LayoutGrid, title: "ロッカーを選ぶ", body: "空いているサイズと番号を選びます。" },
  { icon: KeyRound, title: "電話番号と暗証番号", body: "携帯電話番号と、受け取りに使う 4 桁の暗証番号を入力します。" },
  { icon: JapaneseYen, title: "PayPay で支払う", body: "内容を確認して支払うと扉が開きます。入れて閉めれば完了。" },
] as const;

const pickupSteps = [
  { icon: Smartphone, title: "「利用中のロッカー」", body: "LINE で WISBOX を開き、ホーム画面の「利用中のロッカー」から選びます。" },
  { icon: DoorOpen, title: "「預入終了」を押す", body: "24 時間を超えた場合は、ここで超過分を精算します。" },
  { icon: PackageOpen, title: "取り出して閉める", body: "お荷物を取り出して扉を閉めれば完了です。" },
] as const;

const prohibited = [
  "現金・有価証券・貴金属などの高価品",
  "危険物・引火性や爆発性のあるもの",
  "生鮮食品など、腐敗や液漏れのおそれがあるもの",
  "動物・植物などの生き物",
  "法令で所持や保管が禁止されているもの",
  "ロッカーの寸法・耐荷重を超えるもの",
] as const;

const faqs = [
  {
    q: "24 時間を超えたらどうなりますか？",
    a: "超えた 24 時間ごとに 1 日分の料金がかかります。お受け取りの際に LINE の画面で精算してください。",
  },
  {
    q: "途中で荷物を出し入れできますか？",
    a: "できます。ホーム画面の「利用中のロッカー」で「一時開扉」を押すと、何度でも扉を開けられます。扉を開けてもご利用は続き、料金は「預入終了」を押すまで通常どおり計算します。",
  },
  {
    q: "3 日を過ぎても取りに行けなかったら？",
    a: `当社がお荷物を取り出し、30 日間保管します。お引き取りの際は、超過期間の料金と保管手数料 ${formatYen(extraFees.storage)}（税込）をお支払いいただきます。`,
  },
  {
    q: "暗証番号を忘れた・扉が開かないときは？",
    a: `営業時間内にお問い合わせ窓口へご連絡ください。ご本人であることを確認のうえ、遠隔で解錠します（無料）。係員が現地で解錠する場合は ${formatYen(extraFees.onsiteUnlock)}（税込）を申し受けます。`,
  },
  {
    q: "注文をキャンセルできますか？",
    a: "扉が開いた後のキャンセル・返金はお受けできません。ロッカーの故障など当社の事情でご利用いただけなかった場合は、お支払いいただいた料金を返金します。",
  },
  {
    q: "支払い方法は何がありますか？",
    a: "PayPay のみです。現金・クレジットカードはご利用いただけません。",
  },
  {
    q: "利用期限が近づくとお知らせは届きますか？",
    a: "お知らせ（LINE のメッセージ・SMS など）はお送りしていません。ご利用状況は、LINE で開く WISBOX のホーム画面の「利用中のロッカー」からいつでもご確認いただけます。",
  },
  {
    q: "領収書はもらえますか？",
    a: "ご希望の方は、ご利用日・ロッカー番号を添えてお問い合わせ窓口までご連絡ください。",
  },
] as const;

const priceDetails = [
  {
    title: "保証金について",
    body: "現在、保証金はお預かりしていません。ご注文画面には「保証金 0円」と表示されます。",
  },
  {
    title: "キャンセル・返金",
    body: "扉が開いた後のキャンセル・返金はお受けできません。ロッカーの故障など当社の事情でご利用いただけなかった場合は、お支払いいただいた料金を返金します。",
  },
  {
    title: "設置施設によって料金が異なる場合",
    body: "設置施設によっては、料金が異なる場合や無料でご利用いただける場合があります。実際の料金はご注文画面とロッカーに表示します。",
  },
  {
    title: "その他の費用",
    body: (
      <>
        保管手数料・現地解錠・送料など、その他の費用は
        <Link href="/tokusho" className="mx-1 underline underline-offset-4 hover:text-[var(--wb-orange-deep)]">
          特定商取引法に基づく表記
        </Link>
        をご覧ください。
      </>
    ),
  },
];

const faqGroups = [{ title: "ご利用について", items: faqs }] as const;

function StepList({ steps }: { steps: readonly { icon: LucideIcon; title: string; body: string }[] }) {
  return (
    <ol className={`grid gap-4 sm:grid-cols-2 ${steps.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
      {steps.map(({ icon: Icon, title, body }, index) => (
        <li key={title} className="rounded-[12px] bg-[var(--wb-paper)] p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--wb-mark)] text-[var(--wb-orange-deep)]">
              <Icon aria-hidden className="h-5 w-5" />
            </span>
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[var(--wb-blue-soft)] px-2 text-[13px] font-bold text-[var(--wb-blue-deep)]">
              <span className="sr-only">STEP </span>
              {index + 1}
            </span>
          </div>
          <h4 className="mt-4 text-[17px] font-bold text-[var(--wb-ink)]">{title}</h4>
          <p className="mt-1.5 text-[14px] leading-[1.8] text-[var(--wb-body)]">{body}</p>
        </li>
      ))}
    </ol>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-2 text-[12px] font-bold tracking-[0.16em] text-[var(--wb-orange-deep)]">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--wb-orange)]" />
      {children}
    </p>
  );
}

export default function Home() {
  const lowest = Math.min(...prices.map((p) => p.yen));

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <section aria-labelledby="hero-title" className="bg-[var(--wb-paper)]">
          <div className="mx-auto max-w-[1120px] px-5 pb-12 pt-10 md:px-8 md:pb-16 md:pt-14">
            <div className="text-center">
              <h1 id="hero-title" className="text-[30px] font-bold leading-[1.4] text-[var(--wb-ink)] min-[360px]:text-[32px] sm:text-[36px] lg:text-[40px]">
                <span className="inline-block">荷物を預けて、</span>
                <span className="inline-block">手ぶらで行こう。</span>
              </h1>
              <p className="mx-auto mt-3 max-w-[40em] text-[15.5px] leading-[1.85] text-[var(--wb-body)]">
                WISBOX は、LINE で預けて LINE で受け取る、<span className="whitespace-nowrap">鍵のいらない</span><span className="whitespace-nowrap">スマートロッカーです。</span>
              </p>
              <dl className="mt-5 flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1 text-[14px] text-[var(--wb-muted)] sm:gap-x-5">
                <div className="flex items-baseline gap-1.5">
                  <dt>ご注文</dt>
                  <dd className="font-bold text-[var(--wb-ink)]">LINE</dd>
                </div>
                <span aria-hidden className="hidden h-3 w-px bg-[var(--wb-line)] sm:block" />
                <div className="flex items-baseline gap-1.5">
                  <dt>お支払い</dt>
                  <dd className="font-bold text-[var(--wb-ink)]">PayPay</dd>
                </div>
                <span aria-hidden className="hidden h-3 w-px bg-[var(--wb-line)] sm:block" />
                <div className="flex items-baseline gap-1.5">
                  <dt>24時間</dt>
                  <dd className="font-bold text-[var(--wb-ink)]">
                    {formatYen(lowest)}〜<span className="ml-0.5 text-[11.5px] font-medium text-[var(--wb-muted)]">税込</span>
                  </dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <a href="#flow" className="wb-btn wb-btn-primary px-8">
                  使い方を見る
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </a>
                <a href="#price" className="wb-btn wb-btn-text">
                  料金を見る
                  <ArrowDown aria-hidden className="h-4 w-4" />
                </a>
              </div>
            </div>
            <figure className="relative -mx-5 mt-16 md:mx-0 lg:mt-8">
              <button
                type="button"
                data-robot-button
                aria-label="WISBOX のキャラクター（押すとあいさつします）"
                className="wbr-button absolute bottom-full right-4 z-10 translate-y-[22%] md:right-6"
              >
                <WisboxRobot role="hero" className="w-[112px] sm:w-[132px] lg:w-[190px]" />
              </button>
              <Image
                src="/user-hero.webp"
                alt="駅のコンコースに設置されたスマートロッカーのイメージ"
                width={1536}
                height={1024}
                priority
                sizes="(min-width: 1120px) 1056px, 100vw"
                className="aspect-[3/2] w-full object-cover md:aspect-[16/8] md:rounded-[12px] md:object-[50%_60%] lg:aspect-[32/15] lg:object-[50%_65%]"
              />
              <figcaption className="mt-2 px-5 text-[11px] text-[var(--wb-muted)] md:px-0">
                ※ AI 生成によるイメージです。実在の設置場所・利用シーンではありません。
              </figcaption>
            </figure>
          </div>
        </section>

        <section id="flow" aria-labelledby="flow-title" className="scroll-mt-16 bg-white">
          <div className="mx-auto max-w-[1120px] px-5 py-14 md:px-8 md:py-20">
            <SectionLabel>HOW TO USE</SectionLabel>
            <h2 id="flow-title" className="mt-3 text-[26px] font-bold text-[var(--wb-ink)] md:text-[30px]">
              ご利用の流れ
            </h2>
            <div className="mt-5 flex items-center gap-3">
              <WisboxRobot role="flow" pose="guide" className="w-[100px] md:w-[132px]" button="WISBOX のキャラクター（押すと今の手順をもう一度見せます）" buttonClassName="shrink-0" />
              <div className="rounded-[12px] bg-[var(--wb-blue-soft)] px-4 py-2.5" aria-live="polite">
                <p className="text-[14.5px] font-bold text-[var(--wb-ink)]">
                  <span data-flow-say="deposit">預け方をご案内します。</span>
                  <span data-flow-say="pickup" hidden>
                    受け取り方をご案内します。
                  </span>
                </p>
                <p className="mt-0.5 text-[13.5px] leading-relaxed text-[var(--wb-body)]">スマートフォンと LINE があれば、ロッカーの前ですべて完了します。</p>
              </div>
            </div>
            <FlowTabs
              deposit={<StepList steps={depositSteps} />}
              pickup={
                <>
                  <StepList steps={pickupSteps} />
                  <p className="mt-5 text-[13px] leading-[1.85] text-[var(--wb-muted)]">
                    ※ 携帯電話番号と暗証番号は、受け取りの際の本人確認に使います。他の方に知られないようご注意ください。
                  </p>
                </>
              }
            />
          </div>
        </section>

        <section id="price" aria-labelledby="price-title" className="scroll-mt-16 bg-[var(--wb-paper)]">
          <div className="mx-auto max-w-[1120px] px-5 py-14 md:px-8 md:py-20">
            <SectionLabel>PRICE</SectionLabel>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
              <h2 id="price-title" className="text-[26px] font-bold text-[var(--wb-ink)] md:text-[30px]">
                料金
              </h2>
              <p className="text-[14px] font-bold text-[var(--wb-orange-deep)]">税込・24時間ごと</p>
            </div>
            <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {prices.map((p) => (
                <li key={p.size} className="rounded-[12px] bg-white px-5 py-6 md:px-6 md:py-7">
                  <p className="text-[15px] font-bold text-[var(--wb-muted)]">{p.size}</p>
                  <p className="mt-3 text-[34px] font-bold leading-none text-[var(--wb-ink)] md:text-[44px]">
                    {p.yen.toLocaleString("ja-JP")}
                    <span className="ml-1 text-[16px] font-medium">円</span>
                  </p>
                  <div aria-hidden className="mt-4 h-[3px] w-8 bg-[var(--wb-orange)]" />
                </li>
              ))}
            </ul>
            <dl className="mt-8 grid border-y border-[var(--wb-line)] md:grid-cols-3">
              <div className="py-4 md:pr-6">
                <dt className="text-[12px] font-bold tracking-[0.08em] text-[var(--wb-orange-deep)]">ご利用期間</dt>
                <dd className="mt-1 text-[17px] font-bold text-[var(--wb-ink)]">最大 72 時間（3 日間）</dd>
              </div>
              <div className="border-t border-[var(--wb-line)] py-4 md:border-l md:border-t-0 md:px-6">
                <dt className="text-[12px] font-bold tracking-[0.08em] text-[var(--wb-orange-deep)]">お支払い</dt>
                <dd className="mt-1 text-[17px] font-bold text-[var(--wb-ink)]">PayPay のみ</dd>
              </div>
              <div className="border-t border-[var(--wb-line)] py-4 md:border-l md:border-t-0 md:pl-6">
                <dt className="text-[12px] font-bold tracking-[0.08em] text-[var(--wb-orange-deep)]">24 時間を超えたら</dt>
                <dd className="mt-1 text-[17px] font-bold text-[var(--wb-ink)]">受け取り時に 24 時間ごと精算</dd>
              </div>
            </dl>
            <div className="mt-8 max-w-[860px]">
              <p className="text-[14px] font-bold text-[var(--wb-ink)]">料金の詳しいご案内</p>
              <div className="mt-2 border-t border-[var(--wb-line)]">
                {priceDetails.map((d) => (
                  <details key={d.title} className="group border-b border-[var(--wb-line)]">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-[15.5px] font-bold text-[var(--wb-ink)] [&::-webkit-details-marker]:hidden">
                      {d.title}
                      <ChevronDown aria-hidden className="h-5 w-5 shrink-0 text-[var(--wb-muted)] transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="pb-5 text-[14.5px] leading-[1.9] text-[var(--wb-body)]">{d.body}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="notes-title" className="bg-white">
          <div className="mx-auto grid max-w-[1120px] gap-10 px-5 py-14 md:grid-cols-[280px_1fr] md:gap-16 md:px-8 md:py-20">
            <div>
              <SectionLabel>NOTES</SectionLabel>
              <h2 id="notes-title" className="mt-3 text-[26px] font-bold text-[var(--wb-ink)] md:text-[30px]">
                ご利用上の注意
              </h2>
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[var(--wb-ink)]">預けられないもの</h3>
              <ul className="mt-4 grid border-t border-[var(--wb-line)] sm:grid-cols-2 sm:gap-x-10">
                {prohibited.map((item) => (
                  <li key={item} className="flex gap-3 border-b border-[var(--wb-line)] py-3 text-[14.5px] leading-[1.75] text-[var(--wb-body)]">
                    <span aria-hidden className="mt-[0.65em] h-1.5 w-1.5 shrink-0 bg-[var(--wb-ink)]" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[13px] leading-[1.85] text-[var(--wb-muted)]">
                詳しくは
                <Link href="/terms" className="mx-1 text-[var(--wb-ink)] underline underline-offset-4">
                  ご利用規約
                </Link>
                第3条をご確認ください。高価品の紛失・破損は、原則として補償の対象外です。
              </p>
              <h3 className="mt-10 text-[17px] font-bold text-[var(--wb-ink)]">ご利用期間を過ぎたお荷物</h3>
              <p className="mt-3 text-[14.5px] leading-[1.9] text-[var(--wb-body)]">
                3 日間（72 時間）を過ぎたお荷物は、当社が取り出して 30 日間保管し、ご注文時の携帯電話番号へお電話でご連絡します。お引き取りの際は、超過期間の料金と保管手数料{" "}
                {formatYen(extraFees.storage)}（税込）をお支払いいただきます。
              </p>
            </div>
          </div>
        </section>

        <section id="faq" aria-labelledby="faq-title" className="scroll-mt-16 border-t border-[var(--wb-line)] bg-[var(--wb-paper)]">
          <div className="mx-auto grid max-w-[1120px] gap-10 px-5 py-14 md:grid-cols-[280px_1fr] md:gap-16 md:px-8 md:py-20">
            <div className="flex items-end justify-between gap-4 md:block">
              <div>
                <SectionLabel>FAQ</SectionLabel>
                <h2 id="faq-title" className="mt-3 text-[26px] font-bold text-[var(--wb-ink)] md:text-[30px]">
                  よくある質問
                </h2>
              </div>
              <WisboxRobot role="faq" className="w-[96px] md:w-[150px]" button="WISBOX のキャラクター（押すと考えるしぐさをします）" buttonClassName="shrink-0 md:mt-8" />
            </div>
            <div className="space-y-12" data-robot-zone="faq">
              {faqGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="mb-3 text-[16px] font-bold text-[var(--wb-muted)]">{group.title}</h3>
                  <div className="border-t border-[var(--wb-ink)]">
              {group.items.slice(0, 4).map((item) => (
                <details key={item.q} className="group border-b border-[var(--wb-line)]">
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
                  {group.items.length > 4 ? (
                    <details className="group/more" data-faq-more>
                      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 py-3 text-[14px] font-bold text-[var(--wb-orange-deep)] [&::-webkit-details-marker]:hidden">
                        <span className="group-open/more:hidden">その他の質問を見る（{group.items.length - 4}件）</span>
                        <span className="hidden group-open/more:inline">閉じる</span>
                        <ChevronDown aria-hidden className="h-4 w-4 transition-transform group-open/more:rotate-180" />
                      </summary>
              {group.items.slice(4).map((item) => (
                <details key={item.q} className="group border-b border-[var(--wb-line)]">
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
                    </details>
                  ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" aria-labelledby="contact-title" className="scroll-mt-16 bg-white">
          <div className="mx-auto max-w-[1120px] px-5 py-14 md:px-8 md:py-20">
            <SectionLabel>CONTACT</SectionLabel>
            <h2 id="contact-title" className="mt-3 text-[26px] font-bold text-[var(--wb-ink)] md:text-[30px]">
              お問い合わせ
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--wb-muted)]">お困りのときは、お気軽に<span className="whitespace-nowrap">ご連絡ください。</span></p>

            <div className="mt-8 rounded-[12px] border border-[var(--wb-line)] bg-white px-4 py-5 sm:p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-2 md:gap-0">
                <div className="md:pr-8">
                  <p className="text-[15px] font-bold text-[var(--wb-ink)]">{contact.desk}</p>
                  <ul className="mt-3 space-y-1 text-[15px]">
                    <li>
                      <a href={contact.phoneHref} className="flex min-h-11 items-center gap-3 text-[var(--wb-ink)] hover:text-[var(--wb-orange-deep)]">
                        <Phone aria-hidden className="h-5 w-5 shrink-0 text-[var(--wb-orange-deep)]" />
                        <span>
                          <span className="text-[20px] font-bold tracking-[0.02em]">{contact.phone}</span>
                          <span className="block text-[13px] text-[var(--wb-muted)] min-[400px]:ml-2 min-[400px]:inline">{contact.hours}</span>
                        </span>
                      </a>
                    </li>
                    <li>
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex min-h-11 items-center gap-3 break-all text-[14px] text-[var(--wb-ink)] underline-offset-4 sm:text-[15px] hover:text-[var(--wb-orange-deep)] hover:underline"
                      >
                        <Mail aria-hidden className="h-5 w-5 shrink-0 text-[var(--wb-orange-deep)]" />
                        {contact.email}
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col justify-center gap-3 border-t border-[var(--wb-line)] pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                  <div data-robot-invite className="flex items-center gap-2">
                    <button type="button" data-inquiry-open="personal" className="wb-btn wb-btn-primary whitespace-nowrap px-4 sm:px-6">
                      <Mail aria-hidden className="hidden h-4 w-4 min-[360px]:block" />
                      お問い合わせフォーム
                    </button>
                    <WisboxRobot role="invite" pose="point-l" className="w-[56px] min-[360px]:w-[68px] min-[400px]:w-[96px] md:w-[108px]" button="WISBOX のキャラクター（押すとお問い合わせフォームを開きます）" buttonClassName="shrink-0" />
                  </div>
                  <p className="text-[14px] leading-relaxed text-[var(--wb-body)]">ご利用について、お気軽にご相談ください。</p>
                  <Link href="/business#biz-contact" className="inline-flex min-h-11 items-center gap-1.5 self-start text-[14.5px] font-bold text-[var(--wb-ink)] underline underline-offset-4 hover:text-[var(--wb-orange-deep)]">
                    施設への導入のご相談はこちら
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="mt-6 flex items-start gap-3 rounded-[10px] bg-[var(--wb-mark)] px-4 py-3.5 md:mt-8 md:items-center md:px-5">
                <MapPin aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[var(--wb-orange-deep)] md:mt-0" />
                <p className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] leading-relaxed text-[var(--wb-body)]">
                  <span className="font-bold text-[var(--wb-ink)]">設置場所について</span>
                  <span>現在、サービス開始に向けて試験運用の準備を進めています。設置場所・ご利用開始日は、決まり次第こちらでお知らせします。</span>
                </p>
              </div>
            </div>

            <p className="mt-5 text-[13.5px] leading-[1.85] text-[var(--wb-muted)]">
              ※ 営業時間外にロッカーの不具合が生じた場合は、翌営業日以降の対応となります。この間の利用料金は、当社で状況を確認のうえ、お客様の責めに帰すべき事由による場合を除き、いただきません（お支払い済みの場合は PayPay に返金します）。
            </p>
          </div>
        </section>

      </main>
      <SiteFooter />
      <RobotScript />
    </div>
  );
}
