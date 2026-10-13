import SeoHead from "@/components/services/SeoHead";
import FranchiseForm from "@/components/common/FranchiseForm";
import { DEFAULT_LOCALE, isRtl } from "@/lib/locale";
import { altFromHtml } from "@/lib/alt";
import { assetUrl } from "@/lib/images";
import Reveal from "@/components/modern/Reveal";

/**
 * The franchise page, head and body, for every language.
 *
 * It replaces `pages/franchise/index.js`, `pages/ar/franchise/index.js` and the
 * second form component - 279 lines of page plus 122 of duplicated form.
 *
 * THE ARABIC PAGE IS A CUT-DOWN COPY OF THE ENGLISH ONE, and this reproduces that
 * rather than tidying it. Checked on evsuae.com, three ways:
 *
 *   - no "Interested in joining us?" heading over the form, and no lead under it
 *   - no "We respect your privacy" line
 *   - no black rounded panel around the form: section > container > form, where
 *     English has section > container > row > col-lg-10 > div.bg-black
 *
 * The first two are copy and live in the rows as empty strings, so filling them in
 * is now one edit. The third is layout and lives in LAYOUT below. Whether the Arabic
 * page SHOULD have them is the client's call, not a migration's.
 */
const WIDTHS = [320, 640, 1024, 1440, 1920];
const srcSet = (path) => WIDTHS.map((w) => `${assetUrl(path, { w })} ${w}w`).join(", ");

/**
 * The RTL pairs. The first three are not cosmetic - getting them wrong breaks the
 * page, which is how they were found: the Arabic hero pushed its photograph out of
 * the wrong side of the container and squeezed the heading into a two-character
 * column.
 *
 *   heroText   which edge the hero copy aligns to
 *   heroBox    which side the photo box hangs outside the container - `outside-box-
 *              right-20` in English is `outside-box-left-20` in Arabic, and the small
 *              -screen pair flips with it
 *   offsetOn   which COLUMN carries `offset-xl-1` in the second section: the text in
 *              English, the image in Arabic. The same trick AboutPage plays with
 *              `founderCol`/`journeyCol`.
 */
/** The blocks are ordered by the resolver; look them up by slug, not by index. */
const bySlug = (sections) => Object.fromEntries(sections.map((s) => [s.slug, s]));

export default function FranchisePage({ page, sections = [], locale = DEFAULT_LOCALE }) {
  if (!page) return null;

  const rtl = isRtl(locale);
  const { branch, cities } = page;
  const block = bySlug(sections);
  const hero = block.hero ?? {};
  const join = block.join ?? {};
  const form = block.form ?? {};

  /* Every one of these blocks is stored HTML - the headings carry a <span> that
     colours one word, and the bodies carry lists and links. Authored copy from
     our own database, not user input. */
  const html = (value) => ({ __html: value ?? "" });

  const body = (
    <div dir={rtl ? "rtl" : undefined}>
      {/* ================= HERO ================= */}
      <section className="relative flex min-h-[28rem] items-end overflow-hidden pt-32 md:min-h-[34rem]">
        {hero.image_url && (
          <img
            src={assetUrl(hero.image_url, { w: 1920 })}
            alt={altFromHtml(hero.heading)}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="evs-scrim absolute inset-0" aria-hidden="true" />

        <div className="evs-shell relative z-10 pb-14 md:pb-20">
          <Reveal className="max-w-3xl">
            <span className="evs-eyebrow mb-6">{page.h1}</span>
            <h1
              className="text-display-2 uppercase [&_span]:text-brand-500"
              dangerouslySetInnerHTML={html(hero.heading)}
            />
          </Reveal>
        </div>
      </section>

      {/* ================= WHY JOIN ================= */}
      <section className="evs-shell evs-section">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal from="start" className="lg:col-span-6">
            {join.image_url && (
              <img
                src={assetUrl(join.image_url, { w: 1024 })}
                srcSet={srcSet(join.image_url)}
                sizes="(max-width: 1024px) 100vw, 50vw"
                alt={join.image_alt ?? ""}
                loading="lazy"
                className="w-full rounded-xl border border-line-subtle object-cover"
              />
            )}
          </Reveal>

          <Reveal from="end" delay={100} className="lg:col-span-6 xl:col-span-5 xl:col-start-8">
            <h2
              className="text-display-3 [&_span]:text-brand-500"
              dangerouslySetInnerHTML={html(join.heading)}
            />
            <div
              className="evs-prose mt-6 text-lead"
              dangerouslySetInnerHTML={html(join.body)}
            />
          </Reveal>
        </div>
      </section>

      {/* ================= FORM =================
          One panel in every language. The LTR/RTL table used to decide whether
          the form was boxed at all - English got a `bg-black` card and Arabic
          did not, which was drift rather than a decision. */}
      <section className="evs-shell evs-section-sm">
        {/* evs-measure, not evs-shell-tight: the narrow measure without the auto
            margin, so the panel starts on the same line as the sections above
            it rather than indenting itself on a wide screen. */}
        <Reveal className="evs-measure">
          <div className="evs-card p-7 md:p-10">
            {(form.heading || form.body) && (
              <div className="mb-8">
                <h2
                  className="text-heading uppercase [&_span]:text-brand-500"
                  dangerouslySetInnerHTML={html(form.heading)}
                />
                <div
                  className="evs-prose mt-3"
                  dangerouslySetInnerHTML={html(form.body)}
                />
              </div>
            )}

            <FranchiseForm locale={locale} labels={page.labels?.form} />
          </div>
        </Reveal>
      </section>
    </div>
  );

  return (
    <>
      <SeoHead
        locale={locale}
        branch={branch}
        cities={cities}
        path="franchise"
        title={page.meta_title}
        description={page.meta_description}
        keywords={page.meta_keywords}
      />

      {body}
    </>
  );
}
