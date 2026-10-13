import { DEFAULT_LOCALE } from "@/lib/locale";
import { Calendar } from "@/components/chrome/icons";

/**
 * One post's body - date, title, cover, and the article itself.
 *
 * REDESIGNED - Tailwind, no Crafto. This file used to carry a
 * `<style jsx global>` block styling `.blog-content` with hard-coded hex
 * values, pixel sizes and `--alt-font`: a SECOND type scale, living on one
 * page, that no design token could reach. Change the heading colour in
 * app.css and this page kept its own.
 *
 * The body is `.evs-prose` now, which the franchise and privacy pages already
 * use. It grew headings, tables and blockquotes to take this on - the blog is
 * the only thing here with eight to twenty headings in one document - so the
 * long-form rules live in one place for every page that has prose.
 *
 * THE DATE IS FORMATTED PER LOCALE, not with a hard-coded "en-GB". That
 * argument printed "1 August 2026" on the Arabic article too.
 */
export default function BlogArticle({
  title,
  date,
  coverImage,
  contentHtml,
  locale = DEFAULT_LOCALE,
}) {
  return (
    <article>
      {date && (
        <div className="flex items-center gap-2 text-sm text-content-muted">
          <Calendar className="h-4 w-4 text-brand-500" aria-hidden="true" />
          <time dateTime={isoDate(date)}>{displayDate(date, locale)}</time>
        </div>
      )}

      <h1 className="mt-4 text-display-3 text-balance">{title}</h1>

      {coverImage && (
        <img
          src={coverImage}
          /* alt="" tha. Yeh maqale ki apni tasveer hai aur safhe ki sab se
             barri - crawler ke liye khaali alt ka matlab "sajawat" hai. */
          alt={title || ""}
          width="1024"
          height="576"
          /* `fetchPriority`, not `loading="lazy"`: on an article page this is
             the largest contentful paint, and deferring it delays the one
             element the score is measured on. */
          fetchPriority="high"
          className="mt-8 aspect-[16/9] w-full rounded-xl border border-line-subtle object-cover"
        />
      )}

      {/*
       * The HTML is normalised before it gets here - lib/normalise-html.js runs
       * it through the same parser a browser uses, so the string and the DOM
       * agree and hydration has nothing to complain about. There is deliberately
       * no suppressHydrationWarning: the cause is fixed, so the alarm stays on.
       */}
      <div
        className="evs-prose mt-10 text-lead"
        dangerouslySetInnerHTML={{ __html: contentHtml || "" }}
      />
    </article>
  );
}

/** ISO for the machine-readable attribute; "" when the row is unparseable. */
function isoDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

/** "1 August 2026" in English, "١ أغسطس ٢٠٢٦" in Arabic - the row's own language. */
function displayDate(value, locale) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
