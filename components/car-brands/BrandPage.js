import { assetUrl } from "@/lib/images";
import { branchTokens } from "@/lib/branches";
import { isRtl, localePath, DEFAULT_LOCALE } from "@/lib/locale";
import PageHero from "@/components/modern/PageHero";
import Accordion from "@/components/modern/Accordion";
import CategoryGrid from "@/components/modern/CategoryGrid";
import StatsBand from "@/components/modern/StatsBand";
import BranchesSection from "@/components/modern/BranchesSection";
import ReviewsSection from "@/components/modern/ReviewsSection";
import LocalNotes from "@/components/launch/LocalNotes";
import PageExtras from "@/components/launch/PageExtras";
import Reveal from "@/components/modern/Reveal";
import { ArrowRight } from "@/components/chrome/icons";

/**
 * A brand page (/tesla) and a model page (/tesla/model-3) - one component for
 * both, and for every language.
 *
 * The pretty URLs are fallback rewrites in next.config.mjs; the route PATTERN
 * is still /ev-car-brands/[brand]/[model], which is what lib/design.js keys on.
 *
 * REDESIGNED - Tailwind, no Crafto. Same rows: the brand or model's own copy,
 * its `faqs`, its `models` where it has them, and the five service categories
 * from the services tree - so all three page types describe a category
 * identically.
 *
 * WHAT CHANGED. Five components collapse into this one: BrandHero, BrandAbout,
 * BrandModels, CarServices and CarFaq, plus the Arabic copies of the last two.
 * Each held one Crafto block and an LTR/RTL layout table to swap physical
 * spacing utilities; none survives the move to logical properties.
 *
 * Breadcrumbs are new. A model page is three levels deep and the legacy page
 * offered no way back to its brand.
 */

const FAQ_HEADING = {
  en: "Frequently Asked Questions",
  ar: "الأسئلة الشائعة",
  bn: "সাধারণ জিজ্ঞাসা",
};

/**
 * "Doosre brands" wale hisse ka unwaan.
 *
 * Yeh hissa andar ke link ke liye hai: pehle har brand safha sirf hub se
 * jurha tha, aur 242 safhon par teen se kam andar ke link the. Jis safhe
 * tak sirf ek raasta jata ho use Google kam ahem samajhta hai.
 */
const SIBLINGS_HEADING = {
  en: "Other EV brands we service",
  ar: "علامات كهربائية أخرى نخدمها",
  bn: "আমরা যেসব ইভি ব্র্যান্ড সার্ভিস করি",
};

/** The brands hub's own label, for the first breadcrumb. */
const HUB_LABEL = {
  en: "EV Car Brands",
  ar: "ماركات السيارات الكهربائية",
  bn: "ইভি গাড়ির ব্র্যান্ড",
};

/**
 * The hero's call to action. The brand and model heroes had none at all - the
 * deepest, most specific pages on the site said what EVS does for your car and
 * then offered no way to book it. Same words the service pages use, kept in
 * code for the same reason their table is: page chrome, not content.
 */
const HERO_CTA = {
  en: "Tell Me When You Open",
  ar: "أبلغني عند افتتاح المركز",
  bn: "আপনার ইভি চেক বুক করুন",
};

const pick = (map, locale) =>
  map[locale] ?? map[String(locale).split("-")[0]] ?? map.en;

export default function BrandPage({
  locale = DEFAULT_LOCALE,
  page,
  /** Present on a MODEL page only - the brand this model belongs to. */
  brand = null,
  hub = null,
  serviceCategories = [],
  models = [],
  siblings = [],
  showStats = false,
  branch,
  cities = [],
  locations = [],
  reviews = [],
  /** The resolved `section_content` row - see lib/sections.js. */
  sections,
}) {
  // Only the counter needs these: its first label names the country and its
  // second figure is this branch's workshop count.
  const tokens = branch ? branchTokens(branch, cities, locale) : {};

  const crumbs = [
    { label: pick(HUB_LABEL, locale), href: hub?.href ?? "/ev-car-brands" },
    brand ? { label: brand.name, href: brand.href } : null,
    { label: page.name },
  ].filter(Boolean);

  return (
    <div dir={isRtl(locale) ? "rtl" : undefined}>
      {/* THE SAME HERO AS EVERY OTHER INNER PAGE. It used to be `layout="split"`,
          the description in a column of its own beside the headline, because
          these descriptions are long - 315-397 characters on a brand and up to
          444 on a model, measured across the tree.

          That solved the measure and cost the page its shape: two blocks of copy
          meeting at the baseline, one of them a rule-bordered slab floating over
          the middle of a photograph. A brand page has no more to say than a
          service page does; it just says it at greater length, and length is not
          a reason to lay a page out differently from its neighbours.

          Stacked, all 26 pages of this tree read like the rest of the site. */}
      <PageHero
        crumbs={crumbs}
        size={brand ? "small" : "large"}
        eyebrow={page.hero_title_prefix}
        title={page.hero_highlight || page.name}
        highlight={page.hero_title_suffix ? ` ${page.hero_title_suffix}` : undefined}
        description={page.hero_description}
        bgUrl={page.hero_bg_url}
        cta={{ label: pick(HERO_CTA, locale), href: localePath(locale, "/contact") }}
      />

      {/* ================= MODELS =================
          Brand pages only. A model page has no children. */}
      {models.length > 0 && (
        <section className="evs-shell evs-section">
          <Reveal className="mb-10 max-w-2xl md:mb-14">
            <h2 className="text-display-3">
              {page.models_heading}
              <span className="text-brand-500">.</span>
            </h2>
          </Reveal>

          <Reveal stagger={70} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {models.map((model) => (
              <a
                key={model.id ?? model.href}
                href={model.href}
                className="evs-card evs-card-interactive group flex flex-col overflow-hidden"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-elevated">
                  {model.card_image_url && (
                    <img
                      src={assetUrl(model.card_image_url, { w: 800 })}
                      /* `alt=""` tha - jo crawler ko kehta hai "yeh sajawat
                         hai, chhod do". Yeh gaari ki asal tasveer hai aur
                         safhe ka mauzoo bhi wahi hai, is liye uska naam
                         yahan hona chahiye: image search se traffic isi se
                         aati hai, aur safhe ka mauzoo bhi isi se pukhta
                         hota hai. */
                      alt={model.name || ""}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                  <div className="evs-scrim-soft absolute inset-0" />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-subheading text-content transition-colors duration-200 group-hover:text-brand-500">
                    {model.name}
                  </h3>
                  {model.card_description && (
                    <p className="mt-2 line-clamp-3 text-sm text-content-muted">
                      {model.card_description}
                    </p>
                  )}
                  <span
                    aria-hidden="true"
                    className="mt-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-brand-500 transition-colors duration-200 group-hover:border-brand-500 group-hover:bg-brand-500 group-hover:text-content-inverse"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </a>
            ))}
          </Reveal>
        </section>
      )}

      {/* ================= ABOUT ================= */}
      {page.about_description && (
        <section className="evs-shell evs-section">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal from="start" className="lg:col-span-6">
              {page.about_image_url && (
                <img
                  src={assetUrl(page.about_image_url, { w: 1024 })}
                  alt={page.about_title || page.name || ""}
                  loading="lazy"
                  className="w-full rounded-xl border border-line-subtle object-cover"
                />
              )}
            </Reveal>

            <Reveal from="end" delay={100} className="lg:col-span-6 xl:col-span-5 xl:col-start-8">
              <h2 className="text-display-3">
                {page.about_title}
                <span className="text-brand-500">.</span>
              </h2>
              {/* Stored HTML, not plain text - the same field, and the same bug
                  it had on the service pages: `<strong>` and `<br>` are
                  authored into this copy in our own database, and printing it
                  as a string rendered a literal "<br />" mid-sentence. */}
              <div
                className="mt-6 text-lead text-content-secondary [&_strong]:font-semibold [&_strong]:text-content"
                dangerouslySetInnerHTML={{ __html: page.about_description }}
              />
            </Reveal>
          </div>
        </section>
      )}

      {/* ================= SERVICES =================
          The five categories, from the services tree - the same mapping the
          category and leaf pages use. */}
      <CategoryGrid
        locale={locale}
        categories={serviceCategories}
        heading={page.services_heading}
      />

      {/* ================= DOOSRE BRANDS =================
          Andar ke link ke liye, aur is liye bhi ke Qatar me ek ghar me
          teen alag brand ki gaari hoti hai - agla safha aksar wahi hota
          hai jo yahan se khula. Har brand alag paros dikhata hai, warna
          wahi aath brands har jagah se link paate aur baqi chhabbis
          akele reh jate. */}
      {siblings?.length > 0 && (
        <section className="evs-shell evs-section-sm">
          <Reveal className="mb-8 max-w-2xl">
            <h2 className="text-display-3">
              {pick(SIBLINGS_HEADING, locale)}
              <span className="text-brand-500">.</span>
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {siblings.map((b) => (
              <a
                key={b.slug}
                href={b.href}
                className="evs-card evs-card-interactive group flex items-center justify-center px-4 py-5 text-center"
              >
                <span className="font-display text-sm uppercase tracking-wide text-content transition-colors group-hover:text-brand-500">
                  {b.name}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ================= FAQ ================= */}
      {page.faqs?.length > 0 && (
        <section className="evs-shell evs-section-sm">
          {/* evs-measure, not evs-shell-tight: the narrow measure without the
              auto margin, so this block starts on the same line as every
              section above and below it. */}
          <div className="evs-measure">
            <Reveal className="mb-10 max-w-2xl">
              <h2 className="text-display-3">
                {pick(FAQ_HEADING, locale)}
                <span className="text-brand-500">.</span>
              </h2>
            </Reveal>
            <Accordion items={page.faqs} idPrefix={`brand-${page.slug}-faq`} />
          </div>
        </section>
      )}

      {/* `showStats` is the model pages only, as before - the brand pages never
          rendered a counter. */}
      {showStats && (
        <StatsBand
          locale={locale}
          tokens={tokens}
          branchCount={locations.length}
          sections={sections}
        />
      )}

      {/* The one block on this page that is about Iraq rather than about the
          brand - see components/launch/LocalNotes.js for why it is here. */}
      <LocalNotes locale={locale} kind="brand" slug={(brand?.slug) || page?.slug || ""} />

      <PageExtras locale={locale} kind="brand" />

      <BranchesSection
        locale={locale}
        branch={branch}
        locations={locations}
        sections={sections}
        limit={6}
      />

      <ReviewsSection locale={locale} branch={branch} reviews={reviews} sections={sections} />
    </div>
  );
}
