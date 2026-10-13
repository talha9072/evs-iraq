import SeoHead from "@/components/services/SeoHead";
import { DEFAULT_LOCALE, isRtl } from "@/lib/locale";

/**
 * The privacy policy, head and body, for every language.
 *
 * It replaces `pages/privacy-policy/index.js` and `pages/ar/privacy-policy/index.js`
 * - 303 lines of the same markup twice, with eight numbered sections of legal prose
 * written into the JSX in both. That is why there has never been a Bengali one:
 * adding a language meant copying the file again.
 *
 * EVERY WORD COMES FROM THE DATABASE. `page_content` holds the head, the h1 and the
 * lead; `privacy_sections` holds the nine blocks below it, in `sort_order`. Nothing
 * on this page is written here any more - including the phone and email lines, which
 * are `{{phone}}` and `{{email}}` inside section 7's HTML.
 *
 * Comparing the two pages first showed they were the same page twice: identical
 * class lists on every element, and the only differences the RTL pairs this codebase
 * already handles.
 */
export default function PrivacyPage({ page, sections = [], locale = DEFAULT_LOCALE }) {
  if (!page) return null;

  const rtl = isRtl(locale);
  const { branch, cities } = page;

  const body = (
    <div dir={rtl ? "rtl" : undefined}>
      {/* A reading page, so no hero image - one would push the first clause
          below the fold for nothing. `pt-32` clears the fixed header. */}
      <section className="evs-shell evs-shell-tight pt-32 pb-8 md:pt-40">
        <h1 className="text-display-2 uppercase">
          {page.h1}
          <span className="text-brand-500">.</span>
        </h1>
        {page.lead && (
          <p className="mt-5 max-w-2xl text-lead text-content-secondary">{page.lead}</p>
        )}
      </section>

      <section className="evs-shell evs-shell-tight pb-20 md:pb-28">
        <div className="flex flex-col gap-10 border-t border-line-subtle pt-10">
          {sections.map((section) => (
            <div key={section.slug}>
              {/* Null on the intro and the last-updated line, which have no
                  heading. The NUMBER is part of the stored text - Arabic writes
                  them ١. ٢. ٣. - so nothing here generates one. */}
              {section.heading && (
                <h2 className="mb-4 text-heading uppercase">{section.heading}</h2>
              )}
              {/* HTML because the blocks carry lists, <strong> and the two
                  contact links. Authored copy from our own database, not user
                  input. */}
              <div
                className="evs-prose"
                dangerouslySetInnerHTML={{ __html: section.body ?? "" }}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <>
      <SeoHead
        locale={locale}
        branch={branch}
        cities={cities}
        path="privacy-policy"
        title={page.meta_title}
        description={page.meta_description}
        keywords={page.meta_keywords}
      />

      {/* No `arabic-page` wrapper any more - that was a Crafto hook, and the
          body sets its own `dir`. One branch for every language. */}
      {body}
    </>
  );
}
