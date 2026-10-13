import { DEFAULT_LOCALE, isRtl } from "@/lib/locale";
import { altFor } from "@/lib/alt";
import { ArrowRight, Check } from "@/components/chrome/icons";

/**
 * The "message sent" body, for every language.
 *
 * It replaces two copies of the same section - `pages/thank-you` and
 * `pages/ar/thank-you` - which differed in the ways the rest of this codebase's
 * English/Arabic pairs do: `fw-700` against `fw-500` on the big heading, the
 * arrow before the label against after it, and the Arabic one wrapped in
 * `<div dir="rtl">`.
 *
 * The one thing that was not styling: both linked `href="/"`, unprefixed. Sending
 * the form from `/ar/contact` landed you on the ENGLISH home page.
 */

export default function ThankYouMessage({ locale = DEFAULT_LOCALE, copy }) {
  const rtl = isRtl(locale);

  /* page_content for this locale, shaped by lib/receipt-pages.js. Unlike the
     404, this page has a route per locale, so one row is enough. */
  const t = copy;
  if (!t) {
    throw new Error("ThankYouMessage: no copy - pass it from the thank-you route");
  }

  const home = locale === DEFAULT_LOCALE ? "/" : `/${locale}`;

  return (
    <div
      dir={rtl ? "rtl" : undefined}
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* `/images/404-bg.jpg` DID NOT EXIST - `public/images/` holds no such
          file, and Ahrefs found it as a broken image on the two pages that use
          it. So both the 404 and the thank-you page have been painting a scrim
          over nothing ever since, which reads as a plain black page rather than
          the photograph behind glass it was meant to be. `/img/evs/` is where
          this site's own workshop photography lives, and the homepage hero
          already leads with this exact frame. */}
      <img src="/img/evs/evs-001.jpg" alt={altFor("workshopFloor", locale)} className="absolute inset-0 h-full w-full object-cover" />
      <div className="evs-scrim-strong absolute inset-0" aria-hidden="true" />

      <div className="evs-shell relative z-10 py-24 text-center">
        {/* The tick is the whole point of a receipt page - the legacy version
            led with a heading and left the reader to infer that it worked. */}
        <span className="mx-auto mb-8 grid h-16 w-16 place-items-center rounded-full bg-brand-500 text-content-inverse">
          <Check className="h-7 w-7" />
        </span>

        <h1 className="text-display-2 uppercase">
          {t.heading}
          <span className="text-brand-500">.</span>
        </h1>

        {t.subheading && (
          <p className="mt-4 text-subheading text-content">{t.subheading}</p>
        )}
        {t.body && (
          <p className="mx-auto mt-4 max-w-lg text-lead text-content-secondary">{t.body}</p>
        )}

        <a href={home} className="evs-btn evs-btn-primary evs-btn-lg mt-10">
          <ArrowRight className="h-4 w-4 rotate-180" />
          {t.back}
        </a>
      </div>
    </div>
  );
}
