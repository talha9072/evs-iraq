import Head from "next/head";
import SeoHead from "@/components/services/SeoHead";
import BlogArticle from "@/components/blog/BlogArticle";
import BlogSidebar from "@/components/blog/BlogSidebar";
import { assetUrl } from "@/lib/images";
import { isRtl, DEFAULT_LOCALE } from "@/lib/locale";

/**
 * /blog/<slug> and /<locale>/blog/<slug> - one post, for every language.
 *
 * WHAT THIS REPLACES. Two routes that did completely different things. The
 * English one looked the post up in the old blogs project and, failing that,
 * streamed a 53 KB standalone .html file straight off disk. The Arabic one had
 * no lookup at all - it was ONLY the file, a whole document with its own <head>,
 * its own header and its own footer, served AROUND the application instead of by
 * it. So 146 of the 155 posts were not React pages, could not use the site's
 * chrome, and could not be edited by anyone without a deploy.
 *
 * They are rows now. The body still arrives as HTML and is still injected with
 * dangerouslySetInnerHTML - that has not changed, and it is the same trust
 * boundary as before: the content comes from our own database, written by us,
 * behind a service-role key.
 *
 * THE CANONICAL IS THE POINT. components/blog/BlogHead.js hard-coded
 * `https://evsuae.com/blog/${slug}` into the canonical, the og:url and both
 * hreflang tags. Every Arabic post and every post on evsqtr.com and evsoman.com
 * therefore told Google its real home was a UAE URL. SeoHead builds all of them
 * from `branch.site_url`, so each country points at itself.
 */

/**
 * The URL-shaped fields of a stored `json_ld`, made absolute.
 *
 * schema.org wants a real URL for `image`, and 194 of the 204 blog rows store a
 * site-relative path - `/img/blog/tesla-vs-byd-maintenance.webp`. Ahrefs
 * reported it as a schema.org validation error on every post it crawled, and it
 * is the same class of mistake the canonical had before this file was written:
 * a path is only a URL if you already know which site you are on, and the row
 * does not.
 *
 * DONE AT RENDER, NOT IN THE DATA, for the reason `publisher` above is: one
 * row is read by three countries, so there is no single correct absolute URL to
 * store. `branch.site_url` is the only thing that knows, and it makes every
 * existing post and every post the webhook writes next correct at once.
 *
 * An already-absolute value is left exactly as it is - the R2-hosted covers on
 * the newer posts are already `https://pub-...r2.dev/...` and must not be
 * prefixed with anything.
 */
function absoluteUrls(jsonLd, branch) {
  const site = String(branch?.site_url || "").replace(/\/$/, "");
  if (!site) return {};

  const absolute = (value) => {
    if (Array.isArray(value)) return value.map(absolute);
    if (typeof value !== "string") return value;
    return value.startsWith("/") ? `${site}${value}` : value;
  };

  const out = {};
  for (const key of ["image", "url", "mainEntityOfPage", "thumbnailUrl"]) {
    if (jsonLd[key] !== undefined) out[key] = absolute(jsonLd[key]);
  }
  return out;
}

export default function BlogPostPage({ locale, branch, cities, post, recent, sections, social }) {
  if (!branch || !post) return null;

  const rtl = isRtl(locale);

  /*
   * The stored json_ld says `"publisher": { "name": "EVS UAE" }` on all 155 rows
   * - it was extracted from UAE pages, and 0080 kept that shape rather than
   * inventing a second one. Overridden here from the branch row, which is the
   * only thing that knows whose site this is. Same fix as the canonical.
   */
  const publisher = { "@type": "Organization", name: branch.name };
  const jsonLd = post.json_ld
    ? { ...post.json_ld, author: publisher, publisher, ...absoluteUrls(post.json_ld, branch) }
    : undefined;

  /* REDESIGNED - Tailwind, no Crafto, so the page carries the same header and
     footer as every other route. `right-side-bar` and `ipad-top-space-margin`
     were Crafto layout classes; this is a twelve-column grid with the article
     at eight and the sidebar at four.

     `pt-32` clears the fixed header, the same figure every redesigned page
     uses - the legacy class was doing that job by a different name. */
  const body = (
    <section className="evs-shell pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-8">
          <BlogArticle
            locale={locale}
            title={post.title}
            date={post.published_at}
            coverImage={assetUrl(post.cover_image_url, { w: 1024 })}
            contentHtml={post.content}
          />
        </div>
        <div className="lg:col-span-4">
          <BlogSidebar posts={recent} social={social} sections={sections} />
        </div>
      </div>
    </section>
  );

  return (
    <>
      <SeoHead
        locale={locale}
        branch={branch}
        cities={cities}
        path={`blog/${post.slug}`}
        title={post.og_title || post.title}
        description={post.meta_description}
        keywords={post.seo_keywords}
        /* BlogPosting ke saath BreadcrumbList bhi.
         *
         * Blog ke safhon par breadcrumb markup tha hi nahi - 50 safhe iske
         * bagair the. Google isi se SERP me "evsqtr.com > Blog > unwaan"
         * dikhata hai; uske bagair woh nangaa URL chhaapta hai, jo kam
         * click paata hai. Raasta SeoHead ke branch.site_url se banta hai,
         * hardcode nahi - wahi galti jo canonical ke saath ho chuki hai. */
        jsonLd={[
          jsonLd,
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: branch.name, item: `${branch.site_url}${locale === DEFAULT_LOCALE ? "" : `/${locale}`}` },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${branch.site_url}${locale === DEFAULT_LOCALE ? "" : `/${locale}`}/blog` },
              { "@type": "ListItem", position: 3, name: post.title, item: `${branch.site_url}${locale === DEFAULT_LOCALE ? "" : `/${locale}`}/blog/${post.slug}` },
            ],
          },
        ].filter(Boolean)}
      />

      {/* The per-post tags SeoHead does not own. Keyed so a page's value wins
          over the site-wide fallback in _app.js, which is how every other route
          here overrides it. */}
      <Head>
        {post.robots && <meta name="robots" content={post.robots} key="robots" />}
        {post.author && <meta name="author" content={post.author} key="author" />}
        <meta property="og:type" content={post.og_type || "article"} key="og-type" />
        {/* og:image AUR twitter:image YAHAN SE JAAN-BOOJH KAR HATAYE GAYE HAIN.
         *
         * Poori site ek hi share tasveer istemal karti hai - SeoHead ka
         * OG_IMAGE_PATH (/img/graph-img.webp). Koi safha `image` prop nahi
         * bhejta, aur blog post bhi apni alag tasveer nahi dega.
         *
         * Pehle yahan `post.og_image` chhapta tha aur SeoHead apni tasveer
         * bhi, yani DO og:image tags. next/head sirf `name` wale meta ko
         * dedupe karta hai, `property` wale ko nahi - is liye dono zinda
         * rehte the aur Facebook/WhatsApp pehla utha lete the.
         *
         * `og_image` aur `twitter_image` columns db me maujood hain aur bhare
         * hue hain; bas render nahi hote. Kabhi post ki apni tasveer chahiye
         * ho to yahin wapas aana hai.
         */}
        {post.twitter_card && (
          <meta name="twitter:card" content={post.twitter_card} key="tw-card" />
        )}
        {post.twitter_title && (
          <meta name="twitter:title" content={post.twitter_title} key="tw-title" />
        )}
        {post.twitter_description && (
          <meta name="twitter:description" content={post.twitter_description} key="tw-desc" />
        )}
        {post.published_at && (
          <meta property="article:published_time" content={post.published_at} key="pub-time" />
        )}
        {post.updated_at && (
          <meta property="article:modified_time" content={post.updated_at} key="mod-time" />
        )}
      </Head>

      {/* `dir` only - no `arabic-page` wrapper. That was a Crafto hook and it
          resolves to nothing on a redesigned page; direction is what actually
          matters and every logical property here follows it. */}
      <div dir={rtl ? "rtl" : undefined}>{body}</div>
    </>
  );
}
