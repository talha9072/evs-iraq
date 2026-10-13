import Head from "next/head";
import { localePath } from "@/lib/locale";
import { branchTokens } from "@/lib/branches";
import { hreflangAlternates } from "@/lib/hreflang";
import SiteTags from "@/components/common/SiteTags";

/**
 * The branch-aware <head> shared by every services page.
 *
 * Only the title, description and keywords differ between pages. Everything
 * that identifies the SITE - canonical host, hreflang set, publisher, og and
 * twitter URLs - comes from the branch row, so the same page serves
 * evsuae.com and evsoman.com without a hardcoded domain anywhere.
 *
 * The hub page used to hardcode evsuae.com in seven places, which meant a
 * Qatar deployment would have told Google it was the UAE site.
 *
 * Stored copy may carry {{country}} / {{city}} tokens; they are filled here
 * so a title reads "…in Qatar" on the Qatar build.
 */

const OG_IMAGE_PATH = "/img/graph-img.webp";

// A path rule, so it lives in lib/locale.js now; re-exported because a dozen
// callers import it from here.
export { localePath } from "@/lib/locale";

export default function SeoHead({
  locale,
  branch,
  cities = [],
  // path without a locale prefix or leading slash: 'services',
  // 'services/programming'
  path,
  title,
  description,
  keywords,
  // extra JSON-LD a specific page wants on top of the shared tags
  jsonLd,
  /**
   * next/head key for that script. Only the home page passes one, so its graph
   * REPLACES the site-wide Organization block `_app.js` emits under
   * `ld-organization` instead of the page carrying two Organization entities.
   */
  jsonLdKey,
  /** The not-found page. Everything else here still applies - the canonical host,
   *  the publisher, the og tags a shared link shows - only indexing does not. */
  noindex = false,
  /**
   * The picture a shared link shows. Defaults to the site-wide graph image.
   *
   * IT EXISTS FOR THE WORKSHOP PAGES. Those eleven are the links people actually
   * send each other - "here's the branch" - and a generic graph card is a poor
   * answer to that when every workshop row already carries its own photograph in
   * `hero_image_url`.
   *
   * Takes a STORED asset value, the same as every other image on this site: a
   * repo-relative path is wrapped in the image CDN, an absolute URL is passed
   * through untouched because it already points at a host that can serve it.
   * See lib/images.js for why those are the only two shapes.
   */
  image = OG_IMAGE_PATH,
}) {
  const tokens = branchTokens(branch, cities, locale);
  const fill = (s) =>
    typeof s === "string"
      ? s.replace(/\{\{(\w+)\}\}/g, (m, k) => (tokens[k] != null ? tokens[k] : m))
      : s;

  const canonical = `${branch.site_url}${localePath(locale, path)}`;
  const seoTitle = fill(title);
  const seoDescription = fill(description);
  /* Absolute, because og:image is read by crawlers that have no page to resolve
     a relative path against. An absolute stored value is already servable and is
     left alone; a repo path goes through the image CDN, the same rule
     `assetUrl` follows for every other image. */
  /* NOT THROUGH /.netlify/images. robots.txt on this site disallows
     /.netlify/ — Netlify's own endpoints are not search entry points and were
     eating crawl budget — and og:image went through exactly that path. So the
     one social image shared by all 306 pages sat behind a Disallow and
     Googlebot-Image could never fetch it; the file under /img/ serves fine on
     its own. A repo path is now emitted directly; an absolute stored value is
     still passed through untouched. */
  const ogImage = /^https?:\/\//i.test(image) ? image : `${branch.site_url}${image}`;

  return (
    <>
      {/* og:locale, og:site_name and the geo pair. _app.js emits UAE-hardcoded
          copies of these on every route because it cannot fetch; these carry
          the same next/head keys and the page's Head is processed second, so
          these win. Verified by rendering a probe value. */}
      <SiteTags locale={locale} branch={branch} cities={cities} />

      <Head>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      {keywords && <meta name="keywords" content={fill(keywords)} />}

      <link rel="canonical" href={canonical} />
      <meta
        name="robots"
        content={
          noindex
            ? "noindex, nofollow"
            : "index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large"
        }
      />
      <meta name="author" content="Admin" />
      <meta name="publisher" content={branch.name} />
      <meta httpEquiv="Content-Language" content={locale} />

      {/*
        hreflang ACROSS THE THREE COUNTRY SITES, not just across this one's
        languages - see lib/hreflang.js for the measurement and the two rules
        that make it safe.

        It used to be `en`, `ar` and `x-default`, all three pointing back at
        this same domain. Every one of the three sites said exactly that, so
        138 near-identical English pages carried no signal at all about which
        country each was for.

        `en-AE` / `en-OM` / `en-QA` says it. The country code is on the branch
        row and the sibling sites arrive with it, so nothing is configured here.

        A page only this country publishes - a workshop, a blog post, /sos -
        falls back to the old same-host pair, because announcing an alternate
        that 404s is worse than announcing none. So does a `noindex` page: a
        cluster is a claim about which version to INDEX, and this one is asking
        not to be.
      */}
      {hreflangAlternates({ path, branch, clustered: !noindex }).map((alt) => (
        <link key={alt.hrefLang} rel="alternate" hrefLang={alt.hrefLang} href={alt.href} />
      ))}

      {/* KEYS ZAROORI HAIN, twitter ke bar-aks.
       *
       * next/head sirf `name`, `httpEquiv`, `charSet` aur `itemProp` wale meta
       * ko khud dedupe karta hai - `property` uski list me hai hi nahi. Har og
       * tag `property` par hai, is liye bina key ke ye safhe ke apne tag ko
       * hataate nahi, uske SAATH chhap jaate hain.
       *
       * Blog post par yeh nazar aa raha tha: og:type do baar - "website" phir
       * "article" - aur og:image bhi do baar, jab tak BlogPostPage apni tasveer
       * deta tha. Twitter wale theek the kyunki woh `name` par hain.
       *
       * Keys wahi hain jo BlogPostPage istemal karta hai. Uska Head baad me
       * chalta hai, is liye safhe ki qeemat jeetti hai - wahi tareeqa jo upar
       * SiteTags ke saath pehle se chal raha hai.
       */}
      <meta property="og:title" content={seoTitle} key="og-title" />
      <meta property="og:description" content={seoDescription} key="og-description" />
      <meta property="og:url" content={canonical} key="og-url" />
      <meta property="og:type" content="website" key="og-type" />
      <meta property="og:image" content={ogImage} key="og-image" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && (
        <script
          type="application/ld+json"
          key={jsonLdKey}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      </Head>
    </>
  );
}
