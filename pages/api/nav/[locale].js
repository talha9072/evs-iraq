/**
 * GET /api/nav/ar  ->  the header's three dropdowns and the footer's per-country
 * content, in that language.
 *
 * THE LOCALE IS IN THE PATH, AND THAT IS THE WHOLE POINT OF THIS FILE.
 *
 * It used to be `/api/nav?locale=ar`, and on the live sites that produced a
 * menu in the wrong language. Measured on evsoman.com:
 *
 *     GET /api/nav?locale=en   ->  {"locale":"en", …}   ETag "17bx61s3km85yq"
 *     GET /api/nav?locale=ar   ->  {"locale":"en", …}   ETag "17bx61s3km85yq"
 *
 * Asking for Arabic returned the English body, and the handler's own echo of
 * the locale it ran with said `en` - so either a shared cache answered without
 * looking at the query string, or the query never reached the handler. Both
 * have the same shape and the same cure: a path segment is part of the URL, so
 * it cannot be dropped on the way in and it cannot be collapsed into one cache
 * entry on the way out. `/api/nav/en` and `/api/nav/ar` are two resources.
 *
 * WHAT IT LOOKED LIKE. Only the values that come from this endpoint were in the
 * wrong language - the service cards, the workshop names, the opening hours and
 * the EVS network list - while every label written in the components stayed
 * correct. Half an English page in Arabic, and it flipped depending on which
 * language warmed the cache first, which is why it was so hard to pin down.
 *
 * WHICH BRANCH. Not a parameter. `NEXT_PUBLIC_BRANCH` decides, exactly as it
 * does for every page - so this endpoint on evsqtr.com can only ever answer
 * with Qatar's menu, whatever a caller asks for.
 */
import { getNav } from "@/lib/nav";
import { getFooter } from "@/lib/footer";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/locale";

export default async function handler(req, res) {
  /* An unknown locale falls back rather than 404s: the caller is our own
     header, and a menu in the wrong language beats no menu at all. It is
     validated against LOCALES, so this deployment can only ever build a
     response for a language it actually publishes - `/api/nav/fr` on a site
     that serves en and ar answers in en, not with French-shaped nothing. */
  const asked = String(req.query.locale || DEFAULT_LOCALE);
  const locale = LOCALES.includes(asked) ? asked : DEFAULT_LOCALE;

  try {
    // The header's menus and the footer's per-country content together: same
    // page, same render, no reason to make the browser ask twice.
    const [nav, footer] = await Promise.all([getNav(locale), getFooter(locale)]);

    /*
     * `max-age=0` FOR THE BROWSER, `s-maxage` FOR THE CDN.
     *
     * This was once `public, s-maxage=3600, stale-while-revalidate=86400` with
     * no browser directive at all. `s-maxage` is ignored by a private cache, so
     * Chrome fell back to HEURISTIC freshness and cached the menu on its own
     * terms, and `stale-while-revalidate` then let it SERVE that stale copy
     * while refreshing behind the reader - a menu change appeared not on the
     * next load but the one after, which to anyone testing it simply did not
     * happen.
     *
     * `max-age=0` makes it stale in the browser immediately, so every use is a
     * conditional GET - a 304 and no body when nothing changed. `s-maxage=3600`
     * was chosen to match the pages, which are now `revalidate: 2592000` — so the menu
     * menu is never staler than the pages around it.
     *
     * This is now SAFE to share, which it was not before: the cache is keyed on
     * a URL that contains the language, so one locale's answer can no longer be
     * handed to another.
     */
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600");

    /* Belt and braces. The path already separates the languages, so this
       changes nothing today - but if a future rewrite ever puts the locale back
       into a header or a cookie, a shared cache is told to key on it rather
       than silently merging them again. */
    res.setHeader("Vary", "Accept-Encoding, Accept-Language");

    res.status(200).json({ locale, ...nav, footer });
  } catch (error) {
    // getNav and getFooter throw when a list came back empty - see the notes
    // there. Answering 500 rather than an empty menu keeps that loud.
    console.error("[api/nav]", error?.message ?? error);
    res.setHeader("Cache-Control", "no-store");
    res.status(500).json({ error: "nav unavailable" });
  }
}
