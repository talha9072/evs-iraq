import { DEFAULT_LOCALE, isRtl } from "@/lib/locale";
import { altFor } from "@/lib/alt";
import { ArrowRight } from "@/components/chrome/icons";

/**
 * The 404 body, for every language and every country.
 *
 * It replaces `pages/404/index.js` and `pages/ar/404/index.js`, which held two
 * copies of the same section that had drifted: `fw-700` against `fw-500` on the
 * big numeral, `left-icon` with the arrow BEFORE the label against `right-icon`
 * with it after, and the Arabic one wrapped in `<div dir="rtl">`. All of that is
 * reproduced rather than normalised.
 *
 * The one thing that was not a style difference: both linked
 * `https://evsuae.com/`. On the Qatar and Oman sites the only way off the 404
 * page was a trip to the UAE.
 */

export default function NotFound({ locale = DEFAULT_LOCALE, copy = {} }) {
  const rtl = isRtl(locale);
  const t = copy[locale] ?? copy[String(locale).split("-")[0]] ?? copy.en ?? {};
  const home = locale === DEFAULT_LOCALE ? "/" : `/${locale}`;

  /* The LTR/RTL table this file used to carry existed for one reason: the arrow
     went BEFORE the label in English and AFTER it in Arabic, and `fa-arrow-left`
     is physical so it could not flip itself. ArrowRight mirrors on `dir` and the
     flex row reverses with it, so there is nothing left to swap. */
  return (
    <div dir={rtl ? "rtl" : undefined} className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* see the note in ThankYouMessage - same missing file, same fix */}
      <img
        src="/img/evs/evs-001.jpg"
        alt={altFor("workshopFloor", locale)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="evs-scrim-strong absolute inset-0" aria-hidden="true" />

      <div className="evs-shell relative z-10 py-24 text-center">
        <p className="font-display text-[clamp(6rem,22vw,16rem)] leading-none text-brand-500">404</p>

        {t.heading && <h1 className="mt-4 text-display-3">{t.heading}</h1>}
        {t.body && (
          <p className="mx-auto mt-5 max-w-lg text-lead text-content-secondary">{t.body}</p>
        )}

        <a href={home} className="evs-btn evs-btn-primary evs-btn-lg mt-10">
          <ArrowRight className="h-4 w-4 rotate-180" />
          {t.back}
        </a>
      </div>
    </div>
  );
}
