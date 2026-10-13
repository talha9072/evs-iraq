import { assetUrl } from "@/lib/images";
import { branchTokens } from "@/lib/branches";
import { isRtl, DEFAULT_LOCALE } from "@/lib/locale";
import { altFor } from "@/lib/alt";
import Reveal from "@/components/modern/Reveal";
import CoveredVehicles from "@/components/warranty/CoveredVehicles";
import StatsBand from "@/components/modern/StatsBand";
import ReviewsSection from "@/components/modern/ReviewsSection";
import { copyFor } from "@/components/warranty/copy";
import { ArrowRight, Battery, Charge, Check, Diagnostics, Software, Wrench } from "@/components/chrome/icons";

/**
 * /extended-warranties.
 *
 * A STRAIGHT CONVERSION. The brief for this page was "don't adjust the design,
 * just convert to Tailwind", so the structure is the one it had: full-screen
 * hero, the covered-vehicles grid, the five covered components numbered 01-05,
 * the why block with its two overlapping photographs, the four-step process
 * with its connector rule, then the shared stats and reviews. Every string is
 * the same `copy.js` entry it was.
 *
 * Two things did not survive, and neither is a design change:
 *
 * `#ev-letter-bar` and `#ev-brands-container` were two EMPTY divs waiting on a
 * script that never resolves - the page rendered "Loading EV brands…"
 * indefinitely on live. `CoveredVehicles` is what actually does that job, and it
 * is already above them. Dropped rather than carried across.
 *
 * The components heading was carried in a `data-fancy-text` ATTRIBUTE rather
 * than between the tags, because Crafto's fancy-text animated it in from there.
 * That is also why it stayed English on the Bengali page: the extractor that
 * built copy.js reads text nodes and there was no text node to read. It is real
 * text now, which fixes the Bengali case for free.
 */

/** The five covered components, in source order, with the icon each carried. */
const COMPONENTS = [
  { icon: Battery, key: "battery" },
  { icon: Software, key: "software" },
  { icon: Charge, key: "charging" },
  { icon: Diagnostics, key: "motor" },
  { icon: Wrench, key: "maintenance" },
];

export default function WarrantyPage({
  page,
  locale = DEFAULT_LOCALE,
  warranties = [],
  reviews = [],
  locations = [],
  cities = [],
  sections,
}) {
  const t = copyFor(locale);
  const rtl = isRtl(locale);

  return (
    <div dir={rtl ? "rtl" : undefined}>
      {/* ================= HERO ================= */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden">
        <img
          src={assetUrl("/img/pages/extended-warranties.webp", { w: 1920 })}
          alt={altFor("warrantyHero", locale)}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="evs-scrim absolute inset-0" aria-hidden="true" />
        <div className="absolute inset-0 bg-surface-sunken/25" aria-hidden="true" />

        <div className="evs-shell relative z-10 pt-24">
          <Reveal className="max-w-3xl">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-sm border border-line bg-surface-sunken/60 px-2.5 py-1.5 text-eyebrow font-semibold tracking-[0.16em] text-content uppercase backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                EVS
              </span>
              {/* The page's h1 is the SEO sentence, as it was. */}
              <h1 className="font-sans text-eyebrow font-semibold tracking-[0.16em] text-content-secondary uppercase">
                {page.h1}
              </h1>
            </div>

            {/* display-2, matching the home page and the services hub - see the
                note in components/services/ServicesHub.js. */}
            <p className="font-display text-display-2 text-content uppercase">{t.heroTitle}</p>
            <p className="mt-6 max-w-xl text-lead text-content-secondary">{t.heroDesc}</p>

            <a href="#compare-plans" className="evs-btn evs-btn-primary evs-btn-lg mt-10">
              {t.heroCta}
              <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* The coverage grid, from the warranties table. */}
      <div id="compare-plans" className="scroll-mt-24">
        <CoveredVehicles rows={warranties} locale={locale} />
      </div>

      {/* ================= COVERED COMPONENTS ================= */}
      <section className="evs-shell evs-section">
        <Reveal className="mb-12 max-w-4xl md:mb-16">
          <h2 className="text-heading">{t.packagesHeading}</h2>
        </Reveal>

        <Reveal stagger={60} className="border-t border-line-subtle">
          {COMPONENTS.map((item, index) => {
            const Glyph = item.icon;
            return (
              <div
                key={item.key}
                className="grid items-center gap-y-4 border-b border-line-subtle py-9 md:grid-cols-12 md:gap-x-8"
              >
                <span className="font-display text-lg text-content-muted tabular-nums md:col-span-1">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="flex items-center gap-5 md:col-span-5">
                  <Glyph className="h-7 w-7 flex-none text-brand-500" />
                  <span className="font-display text-[1.75rem] leading-none text-content uppercase">
                    {t[item.key]}
                  </span>
                </div>

                <p className="text-content-muted md:col-span-6">{t[`${item.key}Desc`]}</p>
              </div>
            );
          })}
        </Reveal>
      </section>

      {/* ================= WHY ================= */}
      <section className="evs-shell evs-section-sm">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal from="start" className="lg:col-span-5">
            <span className="mb-6 inline-block rounded-full bg-surface-raised px-5 py-2 text-eyebrow font-semibold tracking-[0.14em] text-brand-500 uppercase">
              {t.whyEyebrow}
            </span>

            <h2 className="text-display-3">
              {t.whyHeading}
              <span className="text-brand-500">.</span>
            </h2>

            <p className="mt-5 text-lead text-content-secondary">{t.whyDesc}</p>

            <ul className="mt-7 flex flex-col gap-3">
              {[t.why1, t.why2, t.why3, t.why4].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="mt-1 grid h-5 w-5 flex-none place-items-center rounded-full bg-brand-500/15 text-brand-500">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-content">{line}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* The two overlapping photographs, kept. */}
          <Reveal from="end" delay={120} className="relative lg:col-span-6 lg:col-start-7">
            <img
              src={assetUrl("/img/evs/IMG_2073.jpg", { w: 1024 })}
              alt={altFor("warrantyBay", locale)}
              loading="lazy"
              className="ms-auto w-[85%] rounded-lg border border-line-subtle object-cover"
            />
            <img
              src={assetUrl("/img/evs/IMG_2079.jpg", { w: 700 })}
              alt={altFor("warrantyDiagnostics", locale)}
              loading="lazy"
              className="absolute start-0 -bottom-10 w-[55%] rounded-lg border border-line-subtle object-cover shadow-lg"
            />
          </Reveal>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="evs-shell evs-section pt-28 md:pt-36">
        <Reveal className="mb-14 text-center">
          <h2 className="text-display-3">
            {t.howHeading}
            <span className="text-brand-500">.</span>
          </h2>
        </Reveal>

        <Reveal stagger={80} className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="relative text-center">
              <h3 className="font-display text-display-3 text-brand-500 tabular-nums">
                {String(n).padStart(2, "0")}
              </h3>

              {/* The rule runs behind the dot on EVERY step, the fourth
                  included. It used to stop at three, on the reasoning that a row
                  should not end in a dangling line - but this rule is a track the
                  dots sit on, not an arrow pointing from one step to the next.
                  Taking it off the last column just left that dot floating while
                  its three neighbours had ground under them. */}
              <div className="relative my-6 flex items-center justify-center">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-1/2 h-px bg-line"
                />
                <span className="relative grid h-8 w-8 place-items-center rounded-full border border-line-subtle bg-surface-raised">
                  <span className="h-2 w-2 rounded-full bg-brand-500" />
                </span>
              </div>

              <span className="block font-semibold text-content">{t[`step${n}`]}</span>
              <p className="mx-auto mt-2 max-w-xs text-sm text-content-muted">
                {t[`step${n}Desc`]}
              </p>
            </div>
          ))}
        </Reveal>
      </section>

      <StatsBand
        locale={locale}
        tokens={branchTokens(page.branch, cities, locale)}
        branchCount={locations.length}
        sections={sections}
      />

      <ReviewsSection locale={locale} branch={page.branch} reviews={reviews} sections={sections} />
    </div>
  );
}
