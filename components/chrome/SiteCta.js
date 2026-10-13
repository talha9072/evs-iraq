import { DEFAULT_LOCALE, isRtl } from "@/lib/locale";
import useNav from "@/components/nav/useNav";
import Reveal from "@/components/modern/Reveal";
import CtaWaveField from "@/components/chrome/CtaWaveField";

/**
 * The block every page ends on, above the footer.
 *
 * WHY IT SITS IN THE CHROME. Half the pages on this site ended on a shared block
 * - reviews, stats, branches - and then the footer, so the last thing a reader
 * saw was a list. Rendering it beside `SiteFooter` in `_app.js` means it is on
 * every page including the ones nobody thinks about, and it cannot drift.
 *
 * THE COMPOSITION IS EVSWORLDWIDE'S `homepage/CtaSection.js`, WHICH IS THE ONE
 * THING THAT WAS ASKED FOR: a centred column standing on a live energy field,
 * with the 80px grid at 2%, one soft green glow behind the middle, a vignette
 * pulling the corners down, and the section fading into its neighbours top and
 * bottom. The field itself is `CtaWaveField`, which is their `CtaBackground`
 * rebuilt without three.js - same wave, same camera, same fog.
 *
 * THE WORDS ARE OURS AND STAY OURS. The previous version of this file carried a
 * line-art car with five service markers, a scan sweep, cursor parallax and
 * magnetic buttons; all of that was styling and is gone. The eyebrow, the two
 * heading lines, the paragraph, the two buttons and the reassurance row are the
 * same strings they were, in the same languages.
 *
 * WHY THE COPY IS IN CODE. `section_content` has no CTA row, and the header and
 * footer already keep their own one-off UI strings here for the same reason:
 * they do not grow when a workshop or a brand is added. Bengali falls back to
 * English exactly as the footer's headings do.
 */

const LABELS = {
  en: {
    eyebrow: "EV Service Command Centre",
    headingA: "Your EV deserves",
    headingB: "specialist hands.",
    body: "Diagnostics, repairs and maintenance from technicians who work exclusively with electric vehicles.",
    book: "Get Opening Updates",
    call: "Call",
    reassure: ["EV Specialists", "Advanced Diagnostics", "Genuine Expertise"],
  },
  ar: {
    eyebrow: "مركز قيادة خدمة المركبات الكهربائية",
    headingA: "مركبتك الكهربائية تستحق",
    headingB: "أيدي المتخصصين.",
    body: "تشخيص وإصلاح وصيانة على يد فنيين لا يعملون إلا على المركبات الكهربائية.",
    book: "أبلغني عند الافتتاح",
    call: "اتصل",
    reassure: ["متخصصو المركبات الكهربائية", "تشخيص متقدم", "خبرة أصيلة"],
  },
};

function labelsFor(locale) {
  return LABELS[locale] ?? LABELS[String(locale).split("-")[0]] ?? LABELS.en;
}

/**
 * The 80px grid and the vignette, as inline styles rather than arbitrary
 * Tailwind values: stacked gradients plus a background-size in a class string
 * are a wall of escaped underscores nobody can read or check. Decoration with
 * no state and no variants, so a utility buys nothing.
 */
const GRID = {
  backgroundImage:
    "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
  backgroundSize: "80px 80px",
};

const VIGNETTE = {
  background:
    "radial-gradient(ellipse at center, transparent 40%, color-mix(in oklab, var(--color-surface) 70%, transparent) 100%)",
};

export default function SiteCta({ locale = DEFAULT_LOCALE }) {
  const p = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  const t = labelsFor(locale);
  const rtl = isRtl(locale);
  const { footer } = useNav(locale);

  return (
    <section className="relative isolate flex min-h-[35rem] items-center justify-center overflow-hidden bg-surface py-28 md:py-36">
      {/* ---- the energy field ---- */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* `block` because a canvas is inline by default, which leaves a
            baseline gap under it. */}
        <CtaWaveField className="block h-full w-full" />
      </div>

      {/* ---- grid ---- */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.02]" style={GRID} />

      {/* ---- glow, then vignette, to pull the eye to the middle ---- */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 h-[26.25rem] w-[42.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/[0.08] blur-[150px]" />
        <div className="absolute inset-0" style={VIGNETTE} />
      </div>

      {/* ---- the section fades into whatever is above and below it ---- */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-24 bg-gradient-to-b from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-surface to-transparent" />

      {/* ---- content ----
          `Reveal` with a stagger animates the DIRECT CHILDREN, so this list is
          the cascade: pill, heading, paragraph, buttons, reassurance. It fails
          safe - the hidden state is applied after mount, so if the JS never
          arrives the block is simply visible. */}
      <Reveal stagger={80} className="relative z-10 mx-auto max-w-3xl px-5 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-brand-500 uppercase backdrop-blur-sm">
          <svg width="13" height="15" viewBox="0 0 13 15" fill="none" className="block" aria-hidden="true">
            <path d="M7.4 1 1.5 8.4h4L5.1 14 11.5 6.4h-4L7.4 1Z" fill="currentColor" />
          </svg>
          {t.eyebrow}
        </span>

        {/* NO `font-display` HERE, deliberately. The base layer already gives
            every heading the display face AND swaps it for the body face under
            `[dir="rtl"]`, because korolev-condensed has no Arabic coverage.
            That rule is written with `:where()` at zero specificity so a utility
            always beats it - and `font-display` on this h2 did, which put the
            Arabic heading back in a Latin condensed face. */}
        <h2 className="m-0 text-[clamp(2.5rem,6vw,4rem)] leading-[1.06] uppercase">
          <span className="block text-content">{t.headingA}</span>
          {/* No text-shadow on this line. The green glow behind it read as a
              smudge sitting on top of the wave field, which already carries all
              the light this block needs. */}
          <span className="block text-brand-500">{t.headingB}</span>
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-pretty text-content-secondary">
          {t.body}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4 max-[420px]:flex-col max-[420px]:items-stretch">
          <a href={`${p}/contact`} className="evs-btn evs-btn-primary evs-btn-lg">
            <span>{t.book}</span>
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none" className="block rtl:-scale-x-100" aria-hidden="true">
              <path d="M0 6h14M10 1l5 5-5 5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </a>

          {/* The number is the branch's, out of the payload the footer already
              fetches - so this costs no extra request, and Qatar's CTA cannot
              print the UAE's line. No number, no button. */}
          {footer.phone && (
            <a href={`tel:${footer.phone}`} className="evs-btn evs-btn-secondary evs-btn-lg">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="block text-brand-500" aria-hidden="true">
                <path
                  d="M3.5 1.5h2.6l1.2 3.2-1.7 1.3a10.4 10.4 0 0 0 4.4 4.4l1.3-1.7 3.2 1.2v2.6c0 .7-.6 1.3-1.3 1.2C6.8 13.2 2.8 9.2 2.3 2.8c-.1-.7.5-1.3 1.2-1.3Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              </svg>
              <span>{t.call}</span>
              {/* Latin digits inside an Arabic sentence, the same treatment the
                  workshop pages and /sos give the number they print. */}
              <span className={rtl ? "evs-latin" : undefined} dir="ltr">
                {footer.phoneDisplay}
              </span>
            </a>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 text-[12.5px] font-medium tracking-[0.16em] text-content-muted uppercase">
          {t.reassure.map((line, i) => (
            <span key={line} className="contents">
              {i > 0 && <span className="text-line-strong">·</span>}
              <span>{line}</span>
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
