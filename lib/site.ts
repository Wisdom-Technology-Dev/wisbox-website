/** Single source for the facts repeated across the WISBOX public pages. */
export const company = {
  name: "株式会社Wisdom Technology",
  representative: "代表取締役社長　伊東　紫衣",
  postalCode: "〒101-0054",
  address: "東京都千代田区神田錦町3丁目23番　神田錦町安田ビル14階",
  corporateUrl: "https://wisdom-technology.co.jp/",
} as const;

export const contact = {
  desk: "WISBOX お問い合わせ窓口",
  email: "wisbox@wisdom-technology.co.jp",
  phone: "03-5829-5767",
  phoneHref: "tel:0358295767",
  hours: "平日 10:00〜19:00",
} as const;

export const prices = [
  { size: "小", yen: 400 },
  { size: "中", yen: 500 },
  { size: "大", yen: 700 },
  { size: "特大", yen: 900 },
] as const;

export const extraFees = {
  storage: 1000,
  onsiteUnlock: 1000,
} as const;

/** Fill in on the day the documents are published, e.g. "2026年12月1日". */
export const termsEstablishedOn: string | null = "2026年12月20日";
export const privacyEstablishedOn: string | null = "2026年12月20日";

export function formatYen(value: number) {
  return `${value.toLocaleString("ja-JP")}円`;
}
