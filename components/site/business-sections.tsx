import Image from "next/image";
import { ArrowDown, ArrowRight, ChevronDown } from "lucide-react";

const problems = [
  {
    title: "「空いてない」と言われて、開けたら空だった。",
    body: "前のお客様が施錠したまま帰っている。中身が空でも「使用中」に見えたまま、扉が1つ潰れます。",
  },
  {
    title: "「開かない」と呼ばれて、予備キーを取りに戻った。",
    body: "暗証番号の設定でつまずくお客様もいらっしゃいます。無人の時間帯なら、呼ぶ相手もいません。",
  },
  {
    title: "「預けた物がなくなった」と言われても確かめる方法がない。",
    body: "更衣室にカメラは置けません。聞き取り以外の調査手段がありません。",
  },
] as const;

const comparison = [
  { item: "「開かない」などの問い合わせ", old: "予備キーを持ってスタッフが対応", wisbox: "画面の案内に沿って操作でき、問い合わせを減らせる" },
  { item: "使用中のまま残っている扉", old: "扉を1つずつ確認して回る", wisbox: "管理画面で「使用中」の扉を確認し、施設の規定に沿って確かめたうえで解錠できる" },
  { item: "更衣室の防犯", old: "カメラは置けず、手段がない", wisbox: "扉の操作記録と掲示で抑止" },
] as const;

const solutions = [
  {
    tags: ["稼働率改善", "閉め切り放置対策"],
    title: "「使用中」のまま残っている扉を、管理画面で確認。",
    body: "システム上「使用中」のまま残っている扉を、管理画面で確認できます。中身の有無は施設の規定に沿って確かめたうえで、管理側から解錠して稼働に戻せます。閉館時の見回りの負担も減らせます。",
  },
  {
    tags: ["呼び出し削減", "無人時間帯利用"],
    title: "「開かない」での呼び出しを減らす。",
    body: "お客様は画面の案内に沿って操作するため、操作方法の問い合わせや、予備キーを持っての対応・鍵の受け渡しを減らせます。認証方式は施設の運用に合わせてご相談ください。",
  },
  {
    tags: ["防犯対応", "信頼性向上"],
    title: "カメラを置けない更衣室に、置ける防犯設備。",
    body: "誰が・いつ・どの扉を操作したかが記録に残ります。「開閉を記録しています」と掲示すれば抑止につながり、紛失の申告があった際も記録をもとに状況を確認できます。",
  },
] as const;

const flow = [
  {
    when: "当日〜5営業日",
    title: "お問い合わせ・ご相談",
    body: "メールまたはお電話で。施設種別とお困りごとをお聞かせください。5営業日以内にご返信します。",
  },
  {
    when: "訪問から5営業日",
    title: "現地調査・ご提案",
    body: "設置場所の広さ・扉数・運用時間帯を確認し、区画構成・運用フロー・お見積りをご提案します。",
  },
  {
    when: "発注後、日程をご案内",
    title: "設置・初期設定",
    body: "搬入・設置・ネットワーク設定まで一貫対応。スタッフさま向けの操作説明も実施します。",
  },
  { when: "稼働後", title: "運用開始・サポート", body: "国内サポートチームが保守・お問い合わせに対応します。" },
] as const;

const useCases = [
  {
    image: "/use-temporary.webp",
    width: 700,
    height: 394,
    where: "商業施設・空港・イベント会場",
    title: "一時預かりロッカー",
    body: "操作の問い合わせや鍵の受け渡しを減らし、扉の状況を管理画面で確認できる。",
  },
  {
    image: "/use-staff.webp",
    width: 700,
    height: 394,
    where: "物流倉庫・工場・コールセンター",
    title: "スタッフ＆来客用ロッカー",
    body: "鍵の配布・回収の手間を減らし、誰がいつどの扉を操作したかを確認できる。",
  },
  {
    image: "/use-documents.webp",
    width: 700,
    height: 700,
    where: "金融・保険／士業／建設",
    title: "書類管理ロッカー",
    body: "書類を保管する扉を、誰がいつ操作したかを記録。書類の出し入れの管理に役立てられる。",
  },
  {
    image: "/use-seal.webp",
    width: 700,
    height: 700,
    where: "上場・IPO準備企業の本社",
    title: "印章管理ロッカー",
    body: "印章を保管する扉を、誰がいつ操作したかを記録。社内の管理ルールづくりに役立てられる。",
  },
] as const;

export const businessFaqs = [
  {
    q: "費用はどのくらいかかりますか？",
    a: "買い切りとレンタル（月額）の両方に対応しています。台数・区画構成で変わるため、現在の台数とロッカーエリアの広さをお知らせいただければ、概算からご案内します。価格は台数・区画構成に応じて個別にご案内します。",
  },
  {
    q: "設置に工事は必要ですか？営業は止まりますか？",
    a: "電源（AC100V）があれば設置できます。工事範囲と所要時間は現地調査でご案内し、営業への影響が最小になる日程を一緒に組みます。",
  },
  {
    q: "いま使っているロッカーの撤去・入れ替えはどうなりますか？",
    a: "入れ替えの段取りも含めて現地調査時にご相談いただけます。全台一斉ではなく、一部区画ずつの入れ替えも可能です。",
  },
  { q: "何台から導入できますか？", a: "一部区画からの部分導入もご相談いただけます。まずは現在の台数と広さをお知らせください。" },
  {
    q: "ネットワークが切れたらどうなりますか？",
    a: "LINE でのご注文、PayPay でのお支払い、管理画面からの遠隔操作には通信が必要です。通信が切れている間のロッカー本体での認証・開錠の動作は機器の構成によって異なるため、導入時にご説明します。",
  },
  {
    q: "海外からのお客様でも使えますか？",
    a: "当社直営ロッカーのご利用には、LINE アプリ、携帯電話番号の入力、PayPay でのお支払いが必要です。海外からお越しの方も、この 3 点をご利用いただける場合はお使いいただけます。",
  },
] as const;

const capabilities = [
  "有料・無料の切り替え（施設ごと）",
  "ロッカーのサイズごとの料金設定",
  "売上や取引の明細の確認",
] as const;

function Label({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <p className={`flex items-center gap-2 text-[12px] font-bold tracking-[0.16em] ${light ? "text-[var(--wb-orange)]" : "text-[var(--wb-orange-deep)]"}`}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--wb-orange)]" />
      {children}
    </p>
  );
}

/** Facility / operator content, shown on the same page as the customer guide. */
export function BusinessSections() {
  return (
    <>
      <section id="business" aria-labelledby="biz-title" className="scroll-mt-16 bg-[var(--wb-paper)]">
        <div className="mx-auto grid max-w-[1120px] items-center gap-8 px-5 pb-12 pt-10 md:px-8 md:pb-16 md:pt-14 lg:grid-cols-2 lg:gap-10 xl:grid-cols-[5fr_6fr] xl:gap-12">
          <div>
            <p className="text-[13px] font-bold text-[var(--wb-orange-deep)]">共用ロッカーのある施設へ</p>
            <p className="mt-1.5 text-[13px] text-[var(--wb-muted)]">商業施設・24時間ジム・フィットネスクラブ・温浴施設・ゴルフ場</p>
            <h1 id="biz-title" className="mt-4 text-[24px] font-bold leading-[1.4] text-[var(--wb-ink)] min-[360px]:text-[28px] sm:text-[36px] lg:text-[40px]">
              <span className="inline-block">ロッカーを増やさずに、</span>
              <br />
              <span className="inline-block">使える扉が増える。</span>
            </h1>
            <p className="mt-4 max-w-[32em] text-[15.5px] leading-[1.85] text-[var(--wb-body)]">
              「使用済みなのに、施錠されたまま」「暗証番号の設定方法がわからず、使えない」――そんな“使えない扉”を減らし、鍵の受け渡しや見回りの手間も軽くします。
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <button type="button" data-inquiry-open="business" className="wb-btn wb-btn-primary px-8">
                導入を相談する
                <ArrowRight aria-hidden className="h-4 w-4" />
              </button>
              <a href="#biz-solutions" className="wb-btn wb-btn-text">
                何が変わるかを見る
                <ArrowDown aria-hidden className="h-4 w-4" />
              </a>
            </div>
          </div>
          <figure>
            <Image
              src="/biz-hero.webp"
              alt="更衣室に設置された WISBOX スマートロッカーのイメージ"
              width={1600}
              height={900}
              priority
              sizes="(min-width: 1280px) 580px, (min-width: 1024px) 50vw, 100vw"
              className="aspect-[16/9] w-full rounded-[12px] object-cover lg:aspect-[3/2]"
            />
            <figcaption className="mt-2 text-[11px] text-[var(--wb-muted)]">※ AI 生成による設置イメージです。実在の導入事例ではありません。</figcaption>
          </figure>
        </div>
      </section>

      <section id="biz-solutions" aria-labelledby="solutions-title" className="scroll-mt-16 bg-white">
        <div className="mx-auto max-w-[1120px] px-5 py-14 md:px-8 md:py-20">
          <Label>PROBLEMS → SOLUTIONS</Label>
          <h2 id="solutions-title" className="mt-3 text-[26px] font-bold text-[var(--wb-ink)] md:text-[30px]">
            現場の「困った」を、WISBOX で解決。
          </h2>
          <p className="mt-3 text-[15px] font-bold text-[var(--wb-ink)]">ロッカーを増やす前に。「使いたくても使えない」扉を減らし、いまある台数を活かしませんか。</p>
          <p className="mt-1 text-[14px] text-[var(--wb-muted)]">設置場所は更衣室に限りません。貴重品ロッカー・下足箱・共用ロッカーにも置けます。</p>
          <ol className="mt-10 space-y-5">
            {problems.map((p, i) => {
              const s = solutions[i];
              return (
                <li key={p.title} className="grid items-stretch gap-3 md:grid-cols-[1fr_40px_1.25fr] md:gap-0">
                  <div className="rounded-[12px] bg-[var(--wb-paper)] p-6">
                    <p className="text-[12px] font-bold text-[var(--wb-muted)]">よくある困りごと {String(i + 1).padStart(2, "0")}</p>
                    <p className="mt-2 text-[16px] font-bold leading-[1.6] text-[var(--wb-ink)]">{p.title}</p>
                    <p className="mt-2 text-[13.5px] leading-[1.8] text-[var(--wb-muted)]">{p.body}</p>
                  </div>
                  <div className="flex items-center justify-center text-[var(--wb-orange)]">
                    <ArrowRight aria-hidden className="h-6 w-6 rotate-90 md:rotate-0" />
                  </div>
                  <div className="rounded-[12px] border border-[var(--wb-line)] p-6">
                    <p className="text-[12px] font-bold text-[var(--wb-orange-deep)]">{s.tags.join("・")}</p>
                    <p className="mt-2 text-[18px] font-bold leading-[1.6] text-[var(--wb-ink)]">{s.title}</p>
                    <p className="mt-2 text-[14px] leading-[1.85] text-[var(--wb-body)]">{s.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <details className="group mt-10 rounded-[12px] border border-[var(--wb-line)]">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-[16px] font-bold text-[var(--wb-ink)] [&::-webkit-details-marker]:hidden">
              暗証番号式ロッカーと、何が違うのか
              <ChevronDown aria-hidden className="h-5 w-5 shrink-0 text-[var(--wb-muted)] transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-[var(--wb-line)] px-6 pb-4">
              <div className="hidden grid-cols-[180px_1fr_1fr] gap-6 border-b border-[var(--wb-line)] py-3 text-[13px] font-bold md:grid">
                <span />
                <span className="text-[var(--wb-muted)]">暗証番号式・鍵式ロッカー</span>
                <span className="text-[var(--wb-orange-deep)]">WISBOX</span>
              </div>
              {comparison.map((row) => (
                <div key={row.item} className="grid gap-1 border-b border-[var(--wb-line)] py-3.5 text-[14px] last:border-b-0 md:grid-cols-[180px_1fr_1fr] md:gap-6">
                  <span className="font-bold text-[var(--wb-ink)]">{row.item}</span>
                  <span className="text-[var(--wb-muted)]">
                    <span className="md:hidden">従来：</span>
                    {row.old}
                  </span>
                  <span className="font-bold text-[var(--wb-orange-deep)]">
                    <span className="md:hidden">WISBOX：</span>
                    {row.wisbox}
                  </span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </section>

      <section aria-labelledby="ux-title" className="border-t border-[var(--wb-line)] bg-[var(--wb-paper)]">
        <div className="mx-auto grid max-w-[1120px] items-center gap-8 px-5 py-14 md:grid-cols-[1fr_auto] md:gap-12 md:px-8 md:py-20">
          <div>
            <Label>FOR YOUR CUSTOMERS</Label>
            <h2 id="ux-title" className="mt-3 text-[26px] font-bold leading-[1.5] text-[var(--wb-ink)] md:text-[30px]">
              お客様の操作も、かんたんに。
            </h2>
            <p className="mt-3 max-w-[40em] text-[15px] leading-[1.9] text-[var(--wb-body)]">
              お客様は LINE からロッカーを選び、画面の案内に沿って預け入れと受け取りを行います。専用アプリのダウンロードや、スタッフによる鍵の受け渡しは必要ありません。
            </p>
            <p className="mt-4 max-w-[44em] border-l-2 border-[var(--wb-orange)] pl-3 text-[13.5px] leading-[1.85] text-[var(--wb-muted)]">
              「お客様の使い方」でご案内している手順は、当社直営ロッカーでのものです。施設に導入する場合の本人確認の方法は、運用に合わせてご相談ください。
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:flex-col md:items-start">
            <a href="/#flow" className="wb-btn wb-btn-text">
              お客様の使い方を見る
              <ArrowRight aria-hidden className="h-4 w-4" />
            </a>
            <a href="/#price" className="wb-btn wb-btn-text">
              当社直営ロッカーの料金例
              <ArrowRight aria-hidden className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="charge-title" className="bg-[var(--wb-ink)] text-white">
        <div className="mx-auto max-w-[1120px] px-5 py-14 md:px-8 md:py-20">
          <Label light>MANAGEMENT</Label>
          <h2 id="charge-title" className="mt-3 text-[26px] font-bold leading-[1.5] md:text-[30px]">料金と運用の設定</h2>
          <ul className="mt-6 grid gap-x-10 gap-y-3 text-[15px] leading-[1.8] text-white/85 sm:grid-cols-3">
            {capabilities.map((c) => (
              <li key={c} className="flex gap-3">
                <span aria-hidden className="mt-[0.7em] h-1.5 w-1.5 shrink-0 bg-[var(--wb-orange)]" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-12 border-t border-white/15 pt-10 text-[22px] font-bold leading-[1.5] md:text-[24px]">有料でも、無料でも。施設に合わせて選べます。</h3>
          <p className="mt-3 max-w-[46em] text-[15px] leading-[1.9] text-white/75">
            利用料金をいただくかどうかは、施設ごとに設定できます。同じ機器・同じ使い方のまま、運用だけを切り替えられます。
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[12px] bg-white/[0.07] p-6">
              <p className="text-[18px] font-bold">無料で運用する</p>
              <p className="mt-1 text-[13px] text-white/60">会員向けサービス・従業員用・来客用に</p>
              <p className="mt-3 text-[14.5px] leading-[1.85] text-white/80">お客様は支払いの操作なしで、預けて受け取るだけ。扉の操作記録や利用状況の確認は、有料の場合と同じように使えます。</p>
            </div>
            <div className="rounded-[12px] bg-white/[0.07] p-6">
              <p className="text-[18px] font-bold">有料で運用する</p>
              <p className="mt-1 text-[13px] text-white/60">一時預かり・コインロッカーの置き換えに</p>
              <p className="mt-3 text-[14.5px] leading-[1.85] text-white/80">料金はロッカーのサイズごとに設定。24時間単位で、超過分はお受け取り時に精算されます。お支払いは PayPay で、現金の回収や両替は不要。売上や取引の明細は管理画面で確認できます。</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="other-title" className="border-t border-[var(--wb-line)] bg-[var(--wb-paper)]">
        <div className="mx-auto max-w-[1120px] px-5 py-14 md:px-8 md:py-20">
          <Label>OTHER</Label>
          <h2 id="other-title" className="mt-3 text-[26px] font-bold leading-[1.5] text-[var(--wb-ink)] md:text-[30px]">
            扉の操作記録は、ロッカー以外の保管にも。
            <br />
            さまざまな現場で、同じ仕組みを。
          </h2>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((u) => (
              <li key={u.title} className="overflow-hidden rounded-[12px] bg-white">
                <div className="aspect-[4/3] overflow-hidden bg-[var(--wb-paper)]">
                  <Image src={u.image} alt={u.title} width={u.width} height={u.height} sizes="(min-width: 1024px) 260px, (min-width: 640px) 50vw, 100vw" className="h-full w-full object-cover" />
                </div>
                <div className="p-5">
                  <p className="text-[12px] text-[var(--wb-muted)]">{u.where}</p>
                  <h3 className="mt-1 text-[17px] font-bold text-[var(--wb-ink)]">{u.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-[1.8] text-[var(--wb-body)]">{u.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] text-[var(--wb-muted)]">※ 本ページの掲載画像は AI 生成によるイメージで、実在の導入事例ではありません。</p>
        </div>
      </section>

      <section id="biz-flow" aria-labelledby="bizflow-title" className="scroll-mt-16 bg-white">
        <div className="mx-auto max-w-[1120px] px-5 py-14 md:px-8 md:py-20">
          <Label>PROCESS</Label>
          <h2 id="bizflow-title" className="mt-3 text-[26px] font-bold text-[var(--wb-ink)] md:text-[30px]">
            導入までの流れ
          </h2>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {flow.map((f, i) => (
              <li key={f.title} className="rounded-[12px] border border-[var(--wb-line)] p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--wb-blue-soft)] text-[15px] font-bold text-[var(--wb-blue-deep)]">{i + 1}</span>
                <p className="mt-4 text-[12px] text-[var(--wb-muted)]">{f.when}</p>
                <h3 className="mt-1 text-[17px] font-bold text-[var(--wb-ink)]">{f.title}</h3>
                <p className="mt-2 text-[13.5px] leading-[1.8] text-[var(--wb-body)]">{f.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-center text-[16px] font-bold text-[var(--wb-ink)]">まずは「うちの施設に置けるか」だけでも、お気軽にお問い合わせください。</p>
          <div className="mt-5 flex justify-center">
            <button type="button" data-inquiry-open="business" className="wb-btn wb-btn-primary">
              導入を相談する
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
