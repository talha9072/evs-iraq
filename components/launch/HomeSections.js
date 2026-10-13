import Head from "next/head";
import home from "@/data/launch-home.json";
import brandsData from "@/data/resolved/car_brands.json";
import { isRtl, localePath } from "@/lib/locale";
import { assetUrl } from "@/lib/images";
import Accordion from "@/components/modern/Accordion";
import Reveal from "@/components/modern/Reveal";
import { ArrowRight } from "lucide-react";

/**
 * The five sections that exist only on this site.
 *
 * The inherited home page is a hero, a marquee, photo panels and a services
 * grid — about a thousand words, no link to a single brand page, no local
 * material and no FAQ. For a domain whose whole job is to be crawled that is a
 * thin front door, and it looked identical to evsuae.com's.
 *
 * Each section is built from what Bahrain actually searches for:
 *
 *   intro     `car service bahrain`, `ev bahrain` — the local argument
 *   brands    `byd bahrain` is 1K-10K a month, more than every other EV marque
 *             on the island combined, and the home page linked to none of the
 *             35 brand pages. The biggest internal-linking miss on the site.
 *   charging  `ev charging stations bahrain`, `bahrain ev charger`
 *   areas     local coverage for a country one workshop covers
 *   faqs      six answers with FAQPage schema
 *
 * THE FAQ USES THE SHARED ACCORDION, not a `<details>` list. Every other FAQ on
 * this site — the FAQ page, and the block on all 143 service and brand pages —
 * is `components/modern/Accordion`, and a sixth variant on the home page is how
 * a design system starts to rot.
 */

/**
 * The brand's own hero image, read from the baked rows.
 *
 * There are no logo files in this repo — `car_brands.logo_url` is null on every
 * row — so a logo grid would have been six broken images. The photograph each
 * brand page already uses is both present and better at this size.
 */
function brandImage(slug, locale) {
  const rows = brandsData[String(locale).split("-")[0]] ?? brandsData.en;
  return rows.find((row) => row.slug === slug)?.content?.hero_bg_url ?? null;
}

const BRAND_LABEL = {
  byd: "BYD",
  tesla: "Tesla",
  bmw: "BMW",
  hyundai: "Hyundai",
  kia: "Kia",
  "mercedes-benz": "Mercedes-Benz",
};

/** The eyebrow + display heading pair every section opens with. */
function SectionHead({ eyebrow, heading, children, className = "" }) {
  return (
    <Reveal className={`max-w-3xl ${className}`}>
      <span className="evs-eyebrow mb-5 inline-block">{eyebrow}</span>
      <h2 className="text-display-3">
        {heading}
        <span className="text-brand-500">.</span>
      </h2>
      {children}
    </Reveal>
  );
}

export default function HomeSections({ locale = "en" }) {
  const base = String(locale).split("-")[0];
  const t = home[base] ?? home.en;
  const rtl = isRtl(locale);
  const href = (path) => localePath(locale, path);

  /* The Accordion takes { question, answer }, which is the shape the service
     FAQs already arrive in — so the same component renders both. */
  const faqItems = t.faqs.items.map((item) => ({ question: item.q, answer: item.a }));

  return (
    <div dir={rtl ? "rtl" : undefined}>
      {/* The six answers as FAQPage, so Google can lift one into a result.
          Emitted here rather than through SeoHead because this component owns
          the questions — the two cannot drift apart if they live together. */}
      <Head>
        <script
          type="application/ld+json"
          key="ld-home-faq"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqJsonLd(locale)) }}
        />
      </Head>

      {/* ---------------------------------------------------------- intro */}
      <section className="evs-shell evs-section border-t border-line-subtle">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHead eyebrow={t.intro.eyebrow} heading={t.intro.heading} />
          <Reveal delay={120}>
            {t.intro.body.map((para) => (
              <p key={para.slice(0, 40)} className="mb-5 leading-relaxed text-content-secondary last:mb-0">
                {para}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------- brands */}
      <section className="evs-shell evs-section-sm">
        <SectionHead eyebrow={t.brands.eyebrow} heading={t.brands.heading}>
          <p className="mt-5 leading-relaxed text-content-secondary">{t.brands.body}</p>
        </SectionHead>

        <Reveal stagger={70} className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {t.brands.featured.map((slug) => {
            const image = brandImage(slug, locale);
            return (
              <a
                key={slug}
                /* THE SHORT FORM, which is the canonical one. Brand pages live
                   at /byd and canonicalise there; /ev-car-brands/byd is only
                   the internal rewrite target and is deliberately kept out of
                   the sitemap. The home page is the strongest internal-link
                   source on the site and it was pointing all six cards at the
                   duplicate. */
                href={href(slug)}
                className="evs-card evs-card-interactive group flex flex-col overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-elevated">
                  {image && (
                    <img
                      src={assetUrl(image, { w: 400 })}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                </div>
                <span className="px-4 py-3 text-sm font-semibold text-content transition-colors group-hover:text-brand-500">
                  {BRAND_LABEL[slug] ?? slug}
                </span>
              </a>
            );
          })}
        </Reveal>

        <a href={href("ev-car-brands")} className="evs-btn evs-btn-secondary mt-10">
          {t.brands.cta}
          <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
        </a>
      </section>

      {/* ------------------------------------------------------- charging */}
      <section className="evs-shell evs-section-sm">
        <div className="evs-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr]">
            <div className="p-8 md:p-12">
              <SectionHead eyebrow={t.charging.eyebrow} heading={t.charging.heading} />
              {t.charging.body.map((para) => (
                <p key={para.slice(0, 40)} className="mt-5 leading-relaxed text-content-secondary">
                  {para}
                </p>
              ))}
            </div>

            <div className="border-t border-line-subtle bg-surface-sunken p-8 md:p-12 lg:border-s lg:border-t-0">
              <ul className="flex flex-col gap-6">
                {t.charging.points.map((point, index) => (
                  <li key={point.slice(0, 30)} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full border border-brand-500/40 bg-brand-500/10 text-eyebrow font-semibold text-brand-500">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-content-secondary">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- areas */}
      <section className="evs-shell evs-section-sm">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionHead eyebrow={t.areas.eyebrow} heading={t.areas.heading}>
            <p className="mt-5 leading-relaxed text-content-secondary">{t.areas.body}</p>
          </SectionHead>

          <Reveal stagger={50} className="flex flex-wrap gap-3">
            {t.areas.list.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-2 rounded-sm border border-line bg-surface-elevated px-4 py-2.5 text-sm text-content-secondary"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
                {area}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------------- faqs */}
      <section className="evs-shell evs-section-sm">
        <div className="evs-measure">
          <SectionHead eyebrow={t.faqs.eyebrow} heading={t.faqs.heading} className="mb-10" />
          <Accordion items={faqItems} idPrefix="home-bh-faq" />
          <a href={href("frequently-asked-questions")} className="evs-btn evs-btn-secondary mt-10">
            {base === "ar" ? "كل الأسئلة" : "All questions"}
            <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </a>
        </div>
      </section>
    </div>
  );
}

/** The home FAQs as schema, so the answers can be lifted into a result. */
export function homeFaqJsonLd(locale = "en") {
  const base = String(locale).split("-")[0];
  const t = home[base] ?? home.en;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faqs.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
