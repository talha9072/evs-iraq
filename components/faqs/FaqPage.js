import Reveal from "@/components/modern/Reveal";
import Accordion from "@/components/modern/Accordion";
import { Mail } from "@/components/chrome/icons";
import { isRtl, DEFAULT_LOCALE } from "@/lib/locale";

/**
 * /frequently-asked-questions — the accordion, from rows.
 *
 * REDESIGNED — Tailwind, no Crafto.
 *
 * WHAT CHANGED:
 *
 * THE ACCORDION IS THE SHARED ONE. `components/modern/Accordion` already says in
 * its own header that it is used by this page and by the FAQ block on every
 * service and category page - and until now that was only two thirds true. This
 * page kept a second copy, close enough to look like the same component and
 * different in four ways a reader would notice one at a time: a bare `+` where
 * every other page has a circled one that fills green when it opens, a bolder
 * question, a different answer measure, and no `inert` on a closed panel - so
 * here, and only here, a closed answer was still in the tab order and still read
 * out by a screen reader.
 *
 * The shared component wins on all four, so the copy is gone rather than nudged
 * into line - two accordions that must be kept identical by hand are the thing
 * that produced this drift in the first place.
 *
 * BOTH REPLACE Bootstrap's `data-bs-toggle="collapse"` against hardcoded ids
 * `accordion-style-02-01 … -10`, with the open state expressed in the served
 * markup (`active-accordion`, `aria-expanded`, a chevron-up icon and `show` on
 * the first item) because the script would not set it. That is ten ids, two icon
 * classes and four class permutations to reproduce a boolean.
 *
 * THE BORDER TABLE IS GONE. `bodyClass(i, rtl)` reproduced a drift between the
 * two legacy files: items 1–2 had a green bottom border, item 3 a grey one, and
 * items 4–10 had a border in Arabic but not in English. It was preserved
 * deliberately at the time — picking either would have changed one of the two
 * live pages, and which was correct was the client's call. A redesign is that
 * call: every row is separated the same way in both languages.
 *
 * MORE THAN ONE CAN BE OPEN. The old one was a single-open accordion, so
 * comparing two answers meant losing the first. Answers are short; there is no
 * reason to close one to read another.
 *
 * FAQPage STRUCTURED DATA. The rows are questions and answers and always were,
 * but the legacy page emitted no schema for them. It does now, which is the one
 * page type where that markup earns real search presence.
 */

/** "Your Question not listed here? Contact Us" — page chrome, so it lives here. */
const CTA = {
  en: { prompt: "Your question not listed here?", link: "Contact us" },
  ar: { prompt: "سؤالك غير مدرج هنا؟", link: "تواصل معنا" },
  bn: { prompt: "আপনার প্রশ্ন এখানে নেই?", link: "যোগাযোগ করুন" },
};

/* `plain()` lived here and stripped an answer's tags for JSON-LD. Its only
   caller was the duplicate FAQPage block below, which is gone - and its premise
   was wrong anyway: schema.org's `acceptedAnswer` accepts the same limited HTML
   the answer is written in, which is why lib/faqs.js passes `answer_html`
   straight through. */

export default function FaqPage({ page, faqs = [], locale = DEFAULT_LOCALE }) {
  const rtl = isRtl(locale);
  const cta = CTA[locale] ?? CTA[String(locale).split("-")[0]] ?? CTA.en;

  // Built from DEFAULT_LOCALE, not a literal "en": which locale goes unprefixed
  // comes from NEXT_PUBLIC_LOCALES.
  const contactHref = `${locale === DEFAULT_LOCALE ? "" : `/${locale}`}/contact`;

  /* THE FAQPage BLOCK THAT USED TO BE HERE IS GONE - it was the SECOND one.
   *
   * `pages/frequently-asked-questions/index.js` already emits one, built by
   * `faqPageJsonLd` in lib/faqs.js, so the page shipped TWO FAQPage entities
   * describing the same ten questions. Google's rich-results test rejects that
   * outright, and Ahrefs counted it once per language - which is exactly the
   * site's two "Google rich results validation error" findings.
   *
   * The one in lib/faqs.js is the one that survives, and not by coin toss: it
   * carries an `@id`, and it passes `answer_html` through as HTML. This copy
   * stripped the tags, so its answer to "Where is EVS located?" lost the links
   * to the workshops that the visible answer shows - publishing a different
   * answer than the page displays, which is the thing the note in lib/faqs.js
   * says must not happen.
   */

  return (
    <div dir={rtl ? "rtl" : undefined}>
      {/* `pt-32` clears the fixed header. There is no photograph on this page —
          it is a reading page, and a hero image would push the first question
          below the fold for no gain. */}
      <section className="evs-shell evs-shell-tight pt-32 pb-6 md:pt-40">
        <Reveal className="max-w-3xl">
          <span className="evs-eyebrow mb-6">FAQ</span>
          <h1 className="text-display-2 uppercase">
            {page.h1}
            <span className="text-brand-500">.</span>
          </h1>
        </Reveal>
      </section>

      <section className="evs-shell evs-shell-tight pb-16 md:pb-24">
        {/* `defaultOpen` is 0, the component's own default: the first answer
            opens on load exactly as it did before. `idPrefix` namespaces the
            generated ids - it matters on the pages that render two accordions,
            and costs nothing here. */}
        <Accordion items={faqs} idPrefix="faq" />

        <Reveal delay={120} className="mt-14">
          <div className="evs-card flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-full border border-line-subtle text-brand-500">
                <Mail className="h-5 w-5" />
              </span>
              <p className="text-subheading text-content">{cta.prompt}</p>
            </div>

            <a href={contactHref} className="evs-btn evs-btn-primary flex-none">
              {cta.link}
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
