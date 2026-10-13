import { assetUrl } from "@/lib/images";
import { branchTokens, interpolateDeep } from "@/lib/branches";
import { isRtl } from "@/lib/locale";
import { localePath } from "@/components/services/SeoHead";
import Reveal from "@/components/modern/Reveal";
import { ArrowRight } from "@/components/chrome/icons";

/**
 * /services - the hub.
 *
 * REDESIGNED - Tailwind, no Crafto. Every category is still a `hierarchy_1` row
 * and every word on a panel still comes from it, so a sixth category is an
 * INSERT and nothing here changes.
 *
 * WHAT CHANGED. The five categories were five FULL-SCREEN scroll-snapped
 * panels, the same treatment the home page gives its three - which meant
 * reaching the fifth service category took five viewport-height scrolls past
 * photographs with no scrim under the text. They are a grid now. The home page
 * keeps its panels, because that page is a showcase and this one is a menu.
 *
 * The hero's inline style object went with them: `visibility: inherit`,
 * `transition: none` and a `transform: matrix3d(...)` left over from Revolution
 * Slider, on a button.
 */

/**
 * Per-language hero and fixed labels.
 *
 * `headingWeight` is gone from what this component reads - weight now comes from
 * the type token, and Arabic gets its own face and weight in styles/app.css
 * rather than a per-block override. The KEY is left in the tables below because
 * scripts/verify asserts against this object and a missing key would read as
 * missing copy rather than as a design change.
 *
 * Adding a language means one entry here plus its service_content rows.
 */
const AR = {
  headingWeight: "fw-500",
  heroBg: "/img/pages/services.webp",
  heroTag: "إي في إس",
  heroSubtitle: "مركز خدمات المركبات الكهربائية المتخصص في {{country}}",
  heroTitle: "حيث يلتقي الابتكار بالعناية",
  heroDescription: "خدمات المركبات الكهربائية مصممة لطرق {{country}}",
  heroCtaLabel: "أبلغني عند افتتاح المركز",
  listTitle: "جميع الخدمات",
  bookLabel: "أبلغني عند افتتاح المركز",
};

// Exported so verification scripts can assert against the real copy instead
// of scraping it out of the source with a regex - which picked up the Arabic
// block first and reported Arabic hero text for the English page.
export const COPY = {
  en: {
    headingWeight: "fw-700",
    heroBg: "/img/pages/services.webp",
    heroTag: "EVS",
    heroSubtitle: "Expert Electric Vehicle Service Center in {{country}}",
    heroTitle: "Where Innovation Meets Care",
    heroDescription: "EV Service Crafted for the Roads of {{country}}",
    heroCtaLabel: "Tell Me When You Open",
    listTitle: "All Services",
    bookLabel: "Book your EV Check",
  },

  ar: AR,

  // Iraq speaks Arabic, so it reuses the Arabic copy outright. The contact
  // URL no longer needs overriding - it is built from the locale and the
  // branch's contact_path.
  "ar-IQ": AR,

  // Bengali: for the Bangladeshi community across the Gulf. LTR despite the
  // different script, so it keeps the English heading weight.
  //
  // The locative suffix attaches straight to the token - আমিরাত + ে gives
  // আমিরাতে, and কাতার + ে gives কাতারে - which works for these country
  // names but is the sort of thing a native reader should confirm.
  bn: {
    headingWeight: "fw-700",
    heroBg: "/img/pages/services.webp",
    heroTag: "EVS",
    heroSubtitle: "{{country}}ে বিশেষজ্ঞ ইলেকট্রিক গাড়ি সার্ভিস সেন্টার",
    heroTitle: "যেখানে উদ্ভাবন আর যত্ন একসাথে",
    heroDescription: "{{country}}ের রাস্তার জন্য তৈরি ইভি সার্ভিস",
    heroCtaLabel: "আপনার ইভি চেক বুক করুন",
    listTitle: "সব সার্ভিস",
    bookLabel: "আপনার ইভি চেক বুক করুন",
  },
};

export default function ServicesHub({
  locale = "en",
  categories = [],
  branch,
  cities = [],
}) {
  // An unknown locale renders in English rather than blank - the same
  // fallback rule the database resolver uses.
  const raw = COPY[locale] || COPY.en;

  // The hero copy is one-off, so it stays in code - but it must not name one
  // country. {{country}} is filled from the branch row, per locale, so the
  // Qatar build says "Qatar" and the Arabic one says الإمارات.
  const tokens = branchTokens(branch, cities, locale);
  const t = interpolateDeep(raw, tokens);

  // Built rather than stored: the locale decides the prefix, the branch
  // decides the path. Four hardcoded contact URLs were four chances to
  // point a Qatar page at the UAE contact form.
  const contactUrl = localePath(locale, branch?.contact_path || "/contact");

  return (
    <div dir={isRtl(locale) ? "rtl" : undefined}>
      {/* ================= HERO ================= */}
      <section className="relative flex min-h-[32rem] items-end overflow-hidden pt-32 md:min-h-[40rem]">
        <img
          src={assetUrl(t.heroBg, { w: 1920 })}
          alt={t.heroTitle}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="evs-scrim absolute inset-0" aria-hidden="true" />

        <div className="evs-shell relative z-10 pb-16 md:pb-24">
          <Reveal className="max-w-3xl">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-sm border border-line bg-surface-sunken/60 px-2.5 py-1.5 text-eyebrow font-semibold tracking-[0.16em] text-content uppercase backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                {t.heroTag}
              </span>

              {/* The page's h1 is the SUBTITLE - the sentence that names the
                  country - exactly as it was before. `heroTitle` below is the
                  display line and renders as an h2. */}
              <h1 className="font-sans text-eyebrow font-semibold tracking-[0.16em] text-content-secondary uppercase">
                {t.heroSubtitle}
              </h1>
            </div>

            {/* display-2, matching the home page's hero. display-1 tops out at
                7rem and filled most of the frame on a desktop, which read as a
                banner rather than a headline - and having two hero sizes across
                the site meant every page arrived at a different scale. Both are
                clamped, so the mobile end barely moves: 3rem to 2.5rem. */}
            <p className="font-display text-display-2 text-content uppercase">{t.heroTitle}</p>

            <p className="mt-6 max-w-xl text-lead text-content-secondary">{t.heroDescription}</p>

            <a href={contactUrl} className="evs-btn evs-btn-primary evs-btn-lg mt-10">
              {t.heroCtaLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ================= CATEGORIES =================
          A grid rather than five full-screen panels. The first card spans two
          columns on wide screens so the set has a lead rather than reading as
          five equal tiles - which is the difference between a menu and a list. */}
      <section className="evs-shell evs-section">
        <Reveal className="mb-12 max-w-2xl md:mb-16">
          <h2 className="text-display-3">
            {t.listTitle}
            <span className="text-brand-500">.</span>
          </h2>
        </Reveal>

        <Reveal stagger={80} className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {categories.map((category, index) => (
            <a
              key={category.id}
              href={category.href}
              className={`evs-card evs-card-interactive group relative flex min-h-[20rem] flex-col justify-end overflow-hidden ${
                index === 0 ? "lg:col-span-4 lg:min-h-[26rem]" : "lg:col-span-2"
              }`}
            >
              {category.showcase_bg_url && (
                <img
                  src={assetUrl(category.showcase_bg_url, { w: index === 0 ? 1400 : 800 })}
                  alt={category.name}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
              <div className="evs-scrim-strong absolute inset-0" aria-hidden="true" />

              <div className="relative p-7">
                {category.iconUrl && (
                  <span className="mb-5 grid h-12 w-12 place-items-center rounded-full border border-line bg-surface-sunken/70 backdrop-blur-sm">
                    <img src={category.iconUrl} alt={category.name} width="22" height="22" className="h-5.5 w-5.5" />
                  </span>
                )}

                <h3
                  className={`uppercase ${index === 0 ? "text-display-3" : "text-heading"}`}
                >
                  {category.name}
                </h3>

                {/* showcase_tagline is its own column: the panel's tagline, the
                    card line and the hero's description are three different
                    lengths of the same idea. */}
                {category.showcase_tagline && (
                  <p className="mt-3 max-w-md text-content-secondary">
                    {category.showcase_tagline}
                  </p>
                )}

                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-500">
                  {category.showcase_cta_label}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>
            </a>
          ))}
        </Reveal>
      </section>
    </div>
  );
}
