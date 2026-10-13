import { branchTokens } from "@/lib/branches";
import { isRtl } from "@/lib/locale";
import { localePath } from "@/components/services/SeoHead";
import PageHero from "@/components/modern/PageHero";
import { withCountry } from "@/lib/heading";
import Accordion from "@/components/modern/Accordion";
import WhyChoose from "@/components/services/WhyChoose";
import CategoryGrid from "@/components/modern/CategoryGrid";
import BranchesSection from "@/components/modern/BranchesSection";
import ReviewsSection from "@/components/modern/ReviewsSection";
import LocalNotes from "@/components/launch/LocalNotes";
import PageExtras from "@/components/launch/PageExtras";
import Reveal from "@/components/modern/Reveal";

/**
 * /services/{category}/{service} - a single service. Twenty-six of these.
 *
 * REDESIGNED - Tailwind, no Crafto. Same rows and the same blocks in the same
 * order: hero, about, benefits, FAQ, then the shared sections.
 *
 * WHAT CHANGED. `ServiceAbout` and `ServiceBenefitsList` are inlined here. They
 * were separate files because each wrapped a different Crafto block - an
 * `icon-with-text-style-01` list and a `feature-box` grid - and neither is more
 * than a heading and a list once that markup is gone. Two files that exist only
 * to hold a class name are harder to follow than one page that reads top to
 * bottom.
 *
 * The benefits list is a single ruled column beside a PINNED prose column - see
 * the note on that section. It was a two-column grid of ticks, which kept the
 * page short but read as a pricing table.
 *
 * Breadcrumbs are new, and they matter most here - this is the deepest page on
 * the site and the legacy version gave a reader no way back to the category.
 */

const LABELS = {
  en: { tag: "EVS", cta: "Tell Me When You Open", contact: "/contact", faq: "Frequently Asked Questions", evServices: "Electric Vehicle Services" },
  ar: { tag: "إي في إس", cta: "أبلغني عند افتتاح المركز", contact: "/ar/contact", faq: "الأسئلة الشائعة", evServices: "خدمات المركبات الكهربائية" },
  "ar-IQ": { tag: "إي في إس", cta: "أبلغني عند افتتاح المركز", contact: "/ar-IQ/contact", faq: "الأسئلة الشائعة", evServices: "خدمات المركبات الكهربائية" },
  bn: { tag: "EVS", cta: "আপনার ইভি চেক বুক করুন", contact: "/bn/contact", faq: "সাধারণ জিজ্ঞাসা", evServices: "ইলেকট্রিক গাড়ির সার্ভিস" },
};

export default function ServicePage({
  locale = "en",
  service,
  category,
  /** Isi category ki doosri services - andar ke link ke liye. */
  siblings = [],
  categories = [],
  branch,
  cities = [],
  locations = [],
  reviews = [],
  /** The resolved `section_content` row - see lib/sections.js. */
  sections,
}) {
  const t = LABELS[locale] || LABELS.en;
  const tokens = branch ? branchTokens(branch, cities, locale) : {};

  const crumbs = [
    { label: t.evServices, href: localePath(locale, "/services") },
    { label: category?.name, href: category?.href },
    { label: service.name },
  ].filter((crumb) => crumb.label);

  return (
    <div dir={isRtl(locale) ? "rtl" : undefined}>
      <PageHero
        crumbs={crumbs}
        size="small"
        eyebrow={category?.leaf_badge || category?.name}
        title={withCountry(service.hero_title || service.name, tokens, locale)}
        description={service.hero_description}
        bgUrl={service.showcase_bg_url || category?.showcase_bg_url}
        cta={{ label: t.cta, href: localePath(locale, "/contact") }}
      />

      {/* ================= ABOUT + BENEFITS =================
          THE PROSE COLUMN STICKS. It is one short paragraph against six
          benefits, so whichever way they were arranged one side ran out first:
          stacked, the prose left two thirds of the row empty; side by side and
          both scrolling, the heading had left the screen long before the reader
          reached the sixth item, so "Benefits of Custom Region Coding" was a
          list of six things with nothing left on screen saying what of.

          Pinned, the question stays beside its answer the whole way down. It
          costs two utilities and no JavaScript, and `lg:` keeps it off phones,
          where there is no second column to stay beside.

          THE BENEFITS ARE NUMBERED AND RULED, not a grid of green ticks. A
          tick says "included"; these are not a feature comparison, they are
          what the work does - and six ticks in two columns is the look of a
          pricing table on a page that is not selling tiers. Numbers give the
          list an order and a length a reader can see at a glance, and the
          hairline between each is what makes it read as editorial rather than
          as boxes. */}
      <section className="evs-shell evs-section">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {service.about_description && (
            <Reveal from="start" className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
              <h2 className="text-display-3">
                {service.about_title}
                <span className="text-brand-500">.</span>
              </h2>
              {/* STORED HTML, not plain text. 26 of the 32 services carry
                  <strong> in this field and seven carry <br> - authored copy
                  from our own database - and printing it as a string rendered
                  a literal "<br />" mid-sentence on every one of them. Same
                  trust boundary FranchisePage states for its own blocks. */}
              <div
                className="mt-6 text-lead text-content-secondary [&_strong]:font-semibold [&_strong]:text-content"
                dangerouslySetInnerHTML={{ __html: service.about_description }}
              />
            </Reveal>
          )}

          {service.benefits?.length > 0 && (
            <Reveal
              from="end"
              delay={100}
              className={service.about_description ? "lg:col-span-7" : "lg:col-span-12"}
            >
              {service.benefits_title && (
                <h2 className="mb-10 text-heading uppercase">{service.benefits_title}</h2>
              )}

              <ol className="border-t border-line-subtle">
                {service.benefits.map((benefit, i) => (
                  <li
                    key={i}
                    className="group grid grid-cols-[2.5rem_1fr] gap-x-5 border-b border-line-subtle py-7 md:grid-cols-[3.5rem_1fr]"
                  >
                    {/* `aria-hidden` - the ordinal is already carried by the
                        <ol>, and a screen reader announcing "01" before every
                        item on top of its own numbering is noise. */}
                    <span
                      aria-hidden="true"
                      className="font-display text-heading leading-none text-brand-500/35 tabular-nums transition-colors duration-300 group-hover:text-brand-500"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-subheading text-content">{benefit.title}</h3>
                      {benefit.description && (
                        <p className="mt-2 text-[0.9375rem] leading-relaxed text-content-muted">
                          {benefit.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          )}
        </div>
      </section>

      {/* ================= ISI CATEGORY KI DOOSRI SERVICES =================
          Ek leaf service tak sirf uski category se raasta tha, aur 68 aise
          safhe teen se kam andar ke link par baithe the. Yeh hissa unhe
          aapas me jorhta hai - aur padhne wale ke liye bhi theek hai, kyunki
          agla sawal aksar isi category ka hota hai. */}
      {siblings?.length > 0 && (
        <section className="evs-shell evs-section-sm">
          <h2 className="mb-6 text-display-3">
            {category?.list_title || category?.name || t.evServices}
            <span className="text-brand-500">.</span>
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {siblings.map((s) => (
              <a
                key={s.slug}
                href={s.href}
                className="evs-card evs-card-interactive group px-5 py-4 text-sm text-content transition-colors hover:text-brand-500"
              >
                {s.name}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ================= FAQ ================= */}
      {service.faqs?.length > 0 && (
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
            <Accordion items={service.faqs} idPrefix={`svc-${service.slug}-faq`} />
          </div>
        </section>
      )}

      <WhyChoose locale={locale} tokens={tokens} />

      <CategoryGrid locale={locale} categories={categories} heading={t.evServices} />

      <LocalNotes locale={locale} kind="service" slug={service?.path || ""} />

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
