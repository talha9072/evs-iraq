/**
 * Alt text for the site's own fixed photographs.
 *
 * WHY THIS FILE EXISTS. Almost every image on the site sits next to something
 * that already names it - a service, a brand, a workshop, a blog title - so its
 * alt is built from that row and needs nothing here. A handful do not: the
 * workshop photographs hardcoded into the warranty, SOS, 404, thank-you and
 * brands-hub pages. Those had `alt=""`, which tells a crawler the picture
 * carries no meaning - and an audit read half the site's images that way.
 *
 * Written per locale rather than in English only, because an Arabic page with
 * English alt text is the same bug in a quieter form. `bn` and `ar-IQ` fall
 * back: ar-IQ to Arabic through the two-letter split, Bengali to English, which
 * is honest rather than a machine translation nobody has read.
 */
import { DEFAULT_LOCALE } from "@/lib/locale";

const TEXT = {
  /* The frame the home page leads with - a technician at the bay. Reused by
     the 404 and the thank-you page, which paint it behind a scrim. */
  workshopFloor: {
    en: "An EVS technician working on an electric vehicle inside the workshop",
    ar: "فني إي في إس يعمل على سيارة كهربائية داخل الورشة",
  },
  /* Warranty page hero. */
  warrantyHero: {
    en: "An electric vehicle on the lift during a covered warranty repair at EVS",
    ar: "سيارة كهربائية على الرافعة أثناء إصلاح مشمول بالضمان لدى إي في إس",
  },
  /* The two overlapping photographs beside the warranty copy. */
  warrantyBay: {
    en: "An EVS service bay with an electric vehicle raised for inspection",
    ar: "خليج خدمة في إي في إس وسيارة كهربائية مرفوعة للفحص",
  },
  warrantyDiagnostics: {
    en: "An EVS technician running a diagnostic scan on an electric vehicle",
    ar: "فني إي في إس يجري فحصًا تشخيصيًا على سيارة كهربائية",
  },
  /* Car-brands hub, the photograph beside the introduction. */
  brandsIntro: {
    en: "EVS technicians working on the high-voltage system of an electric car",
    ar: "فنيّو إي في إس يعملون على نظام الجهد العالي في سيارة كهربائية",
  },
  /* SOS / roadside page hero. */
  sosHero: {
    en: "An EVS recovery vehicle attending a stranded electric car at the roadside",
    ar: "مركبة إنقاذ من إي في إس تخدم سيارة كهربائية متعطلة على الطريق",
  },
};

export function altFor(key, locale = DEFAULT_LOCALE) {
  const row = TEXT[key];
  if (!row) return "";
  return row[locale] ?? row[String(locale).split("-")[0]] ?? row.en;
}

/**
 * Alt text out of stored HTML - the franchise hero's heading is authored with a
 * <span> colouring one word, and an alt attribute may not contain markup.
 */
export function altFromHtml(value, fallback = "") {
  const text = String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    /* Stored headings colour their last word with a <span>, and on some rows
       that span holds the full stop - stripping the tags leaves "EVS
       Franchise ." So the space before a closing mark goes too. */
    .replace(/\s+([.!?،؛:])/g, "$1")
    .trim();
  return text || fallback;
}
