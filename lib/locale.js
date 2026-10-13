/**
 * Locale helpers shared by the language switcher and the layout.
 *
 * Slugs live in `services.path`, not in `service_content`, so a page has
 * the same URL in every language and switching is purely a matter of the
 * prefix: /services <-> /ar/services <-> /bn/services. That is what lets
 * the switcher keep the visitor on the page they were reading instead of
 * dropping them on the homepage.
 */

/**
 * Languages THIS deployment publishes, from NEXT_PUBLIC_LOCALES.
 *
 *   uae · oman · qatar   en,ar
 *   iraq                 en,ar-IQ      Iraqi Arabic, not Gulf Arabic
 *   bangladesh           en,bn
 *
 * It used to be a hardcoded list of all four, so every site built routes and
 * published hreflang for languages its country has no reason to serve - the
 * UAE generated /bn/services, and told Google about it.
 *
 * WHY AN ENV VAR AND NOT THE DATABASE. Every use of this list is synchronous
 * and half of them run where a query cannot: getStaticPaths, the hreflang
 * block, the switcher in _app.js, isRtl() inside client components. The
 * authoritative record is still `branches.locales`; getBranchContext compares
 * the two and throws if they disagree, so the copy cannot drift unnoticed.
 *
 * ar-IQ is a regional variant of 'ar', not a language of its own: it stores
 * only the words Iraq says differently and inherits the rest.
 *
 * Order matters now - the first entry is the unprefixed one.
 */
const FALLBACK_LOCALES = ["en", "ar"];

function readLocales() {
  const raw = process.env.NEXT_PUBLIC_LOCALES;
  if (!raw) return FALLBACK_LOCALES;

  const list = raw
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean);

  // A malformed value would silently disable every non-English page, so it
  // falls back rather than shipping a half-configured site. The build-time
  // check in getBranchContext is what turns a wrong-but-valid list into an
  // error.
  if (!list.length || !list.includes("en")) return FALLBACK_LOCALES;

  return list;
}

export const LOCALES = readLocales();

/**
 * The locale with no URL prefix - the first entry.
 *
 * English everywhere today, which is why /services is English and /ar/services
 * is Arabic. Iraq and Bangladesh leading with their own language would put
 * `en` second here, and that still needs the prefix work described in
 * PLATFORM.md §10 before it can be switched on.
 */
export const DEFAULT_LOCALE = LOCALES[0];

/**
 * Right-to-left scripts. This is a closed set in practice - the world is
 * not adding RTL writing systems - so a constant beats a lookup table.
 * Note Bengali is NOT here: different script, still left-to-right.
 */
const RTL = new Set(["ar", "he", "fa", "ur", "ku", "ps", "sd", "yi"]);

export function isRtl(locale) {
  return RTL.has(String(locale || "").split("-")[0]);
}

/**
 * Which locale a path is currently in.
 *
 * The prefix is matched against LOCALES rather than against a generic
 * "two or three letters" pattern, because plenty of real routes look like
 * locale codes - /sos would otherwise be read as the locale "sos" and get
 * eaten by the switcher.
 */
export function localeFromPath(pathname) {
  const match = String(pathname || "/").match(/^\/([a-z]{2,3}(?:-[A-Z]{2})?)(?=\/|$)/);

  return match && LOCALES.includes(match[1]) ? match[1] : DEFAULT_LOCALE;
}

/** The same page's path with its locale prefix removed. */
export function pathWithoutLocale(pathname) {
  const current = localeFromPath(pathname);
  if (current === DEFAULT_LOCALE) return normalise(pathname);

  return normalise(String(pathname).slice(current.length + 1));
}

function normalise(pathname) {
  const clean = String(pathname || "/").replace(/\/{2,}/g, "/");
  if (!clean || clean === "/") return "/";

  // trailing slash off, so /ar/services/ and /ar/services switch alike
  return clean.replace(/\/$/, "") || "/";
}

/**
 * Where the language switcher should send someone: the page they are on,
 * in `target`.
 *
 *   /services      -> ar -> /ar/services
 *   /ar/services   -> en -> /services
 *   /bn/services   -> ar -> /ar/services
 *   /              -> ar -> /ar
 */
export function switchLocaleHref(pathname, target) {
  const base = pathWithoutLocale(pathname);

  if (target === DEFAULT_LOCALE) return base;

  return base === "/" ? `/${target}` : `/${target}${base}`;
}

/**
 * A stored path -> the URL for it in one locale.
 *
 *   ('en', 'services')  -> /services
 *   ('ar', 'services')  -> /ar/services
 *   ('en', '')          -> /
 *   ('ar', '')          -> /ar
 *
 * An empty path is the home page, and it yields '/' and '/ar' rather than '//'
 * and '/ar/' - the hardcoded home page's canonical and hreflang were written
 * without the trailing slash, and a redirect on every hreflang target is not
 * worth introducing.
 *
 * WHY IT MOVED HERE. It lived in components/services/SeoHead.js, which is JSX,
 * so `lib/home-seo.js` importing it made that module unparseable by plain Node -
 * and the verification scripts run on plain Node. A path rule belongs beside the
 * other path rules anyway. SeoHead still re-exports it, so its dozen callers are
 * untouched.
 */
export function localePath(locale, path) {
  const clean = String(path).replace(/^\/+/, "");
  const base = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  return clean ? `${base}/${clean}` : base || "/";
}
