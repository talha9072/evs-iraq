import { branchTokens } from "@/lib/branches";
import { isRtl } from "@/lib/locale";
import { localePath } from "@/components/services/SeoHead";
import PageHero from "@/components/modern/PageHero";
import { withCountry } from "@/lib/heading";
import Accordion from "@/components/modern/Accordion";
import ServiceStrip from "@/components/modern/ServiceStrip";
import WhyChoose from "@/components/services/WhyChoose";
import CategoryGrid from "@/components/modern/CategoryGrid";
import BranchesSection from "@/components/modern/BranchesSection";
import ReviewsSection from "@/components/modern/ReviewsSection";
import LocalNotes from "@/components/launch/LocalNotes";
import PageExtras from "@/components/launch/PageExtras";
import Reveal from "@/components/modern/Reveal";
import { ArrowRight } from "@/components/chrome/icons";

/**
 * /services/{category} - one of the five service categories.
 *
 * REDESIGNED - Tailwind, no Crafto. Same rows: the category's own copy, its
 * `children` for the service list, its `faqs`, and every other category for the
 * block at the foot.
 *
 * WHAT CHANGED. The service list was a stack of full-width rows, each a
 * `feature-box` with the title and blurb side by side; ten of them made the page
 * a very long single column. It is a two-column grid of linked cards, which is
 * what a list of ten peers wants to be.
 *
 * Breadcrumbs are new - see components/modern/PageHero. A category page is two
 * levels deep and the legacy page offered no way back to /services.
 */

const LABELS = {
  en: { tag: "EVS", cta: "Tell Me When You Open", contact: "/contact", faq: "Frequently Asked Questions", evServices: "Electric Vehicle Services" },
  ar: { tag: "إي في إس", cta: "أبلغني عند افتتاح المركز", contact: "/ar/contact", faq: "الأسئلة الشائعة", evServices: "خدمات المركبات الكهربائية" },
  "ar-IQ": { tag: "إي في إس", cta: "أبلغني عند افتتاح المركز", contact: "/ar-IQ/contact", faq: "الأسئلة الشائعة", evServices: "خدمات المركبات الكهربائية" },
  bn: { tag: "EVS", cta: "আপনার ইভি চেক বুক করুন", contact: "/bn/contact", faq: "সাধারণ জিজ্ঞাসা", evServices: "ইলেকট্রিক গাড়ির সার্ভিস" },
};

export default function CategoryPage({
  locale = "en",
  category,
  categories = [],
  branch,
  cities = [],
  locations = [],
  reviews = [],
  /** The resolved `section_content` row - see lib/sections.js. */
  sections,
}) {
  const t = LABELS[locale] || LABELS.en;

  // Rebuilt here rather than threaded through getStaticProps: the copy in the
  // database arrives already interpolated, and WhyChoose is the one block whose
  // text lives in code and still names the city.
  const tokens = branch ? branchTokens(branch, cities, locale) : {};

  /* list_title before name: a service carries two labels. The hub's grid uses
     the short one ("PDU Repair"); this list uses the long one ("Power
     Distribution Unit (PDU) Repairs"). Falling back to name covers the services
     where the two are the same, which is most of them. */
  const services = (category.children || []).map((child) => ({
    title: child.list_title || child.name,
    description: child.list_blurb,
    href: child.href,
  }));

  const crumbs = [
    { label: t.evServices, href: localePath(locale, "/services") },
    { label: category.name },
  ];

  return (
    <div dir={isRtl(locale) ? "rtl" : undefined}>
      <PageHero
        crumbs={crumbs}
        eyebrow={category.hero_subtitle}
        title={withCountry(category.name, tokens, locale)}
        description={category.hero_description}
        bgUrl={category.showcase_bg_url}
        cta={{ label: t.cta, href: localePath(locale, "/contact") }}
      />

      <ServiceStrip locale={locale} />

      {/* ================= THE SERVICES IN THIS CATEGORY ================= */}
      {services.length > 0 && (
        <section className="evs-shell evs-section">
          <Reveal className="mb-12 max-w-2xl md:mb-14">
            <h2 className="text-display-3">
              {category.list_title || category.name}
              <span className="text-brand-500">.</span>
            </h2>
          </Reveal>

          <Reveal stagger={60} className="grid gap-5 md:grid-cols-2">
            {services.map((service) => (
              <a
                key={service.href}
                href={service.href}
                className="evs-card evs-card-interactive group flex flex-col p-7"
              >
                <h3 className="text-subheading text-content transition-colors duration-200 group-hover:text-brand-500">
                  {service.title}
                </h3>

                {service.description && (
                  <p className="mt-3 flex-1 text-[0.9375rem] text-content-muted">
                    {service.description}
                  </p>
                )}

                <span
                  aria-hidden="true"
                  className="mt-6 inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-brand-500 transition-colors duration-200 group-hover:border-brand-500 group-hover:bg-brand-500 group-hover:text-content-inverse"
                >
                  <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            ))}
          </Reveal>
        </section>
      )}

      {/* ================= FAQ ================= */}
      {category.faqs?.length > 0 && (
        <section className="evs-shell evs-section-sm">
          {/* evs-measure, not evs-shell-tight: the narrow measure without the
              auto margin, so this block starts on the same line as every
              section above and below it. */}
          <div className="evs-measure">
            <Reveal className="mb-10 max-w-2xl">
              <h2 className="text-display-3">
                {t.faq}
                <span className="text-brand-500">.</span>
              </h2>
            </Reveal>
            <Accordion items={category.faqs} idPrefix={`cat-${category.slug}-faq`} />
          </div>
        </section>
      )}

      <WhyChoose locale={locale} tokens={tokens} />

      {/* Every category, this one included - the same as the legacy block. */}
      <CategoryGrid locale={locale} categories={categories} heading={t.evServices} />

      <LocalNotes locale={locale} kind="service" slug={category?.path || ""} />

      <PageExtras locale={locale} kind="service" />

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
