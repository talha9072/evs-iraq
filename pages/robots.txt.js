import { getBranchContext } from "@/lib/branches";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * /robots.txt — served per branch, because the one line in it that matters is a
 * URL.
 *
 * WHAT IT REPLACES. `public/robots.txt`, a static file ending
 *
 *   Sitemap: https://evsuae.com/sitemap.xml
 *
 * On evsqtr.com and evsoman.com that is the first thing a crawler reads and it
 * points at ANOTHER COUNTRY'S sitemap - so the crawler is handed a list of URLs
 * on a domain it was not crawling, and the country it was actually visiting
 * never gets its own list submitted. The same class of mistake the sitemap
 * itself had, one file earlier in the chain.
 *
 * A ROUTE RATHER THAN A BUILD STEP because `NEXT_PUBLIC_BRANCH` decides the
 * answer and the branch row holds the domain - the same pair every other
 * per-country value on this site comes from. The static file is deleted; a file
 * in `public/` would shadow this route and silently win.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS DISALLOWED, AND WHY IT IS NOT "NOTHING" ANY MORE
 * ---------------------------------------------------------------------------
 * This used to say `Disallow:` with an empty value — everything allowed — and
 * the cost showed up in Search Console. Of the 69 URLs evsuae.com had under
 * "crawled, currently not indexed", six were warranty PDFs and one was
 * `/.netlify/images?url=...`, the image-transform endpoint being fetched as if
 * it were a page. Meanwhile the Arabic blog posts and Arabic service pages —
 * the ones that should be indexed — sat behind them in the queue.
 *
 * Crawl budget is finite and it is spent in the order Google finds things. None
 * of the four groups below is a search entry point:
 *
 *   /.netlify/          Netlify's own endpoints, including image transforms
 *   /api/               JSON, not pages
 *   /warranty-packages/ the PDF library
 *   *.pdf               the loose PDFs at the root
 *   /blogs.xml          a feed nothing reads any more
 *
 * `/blogs.xml` is worth a word. It is `getServerSideProps` asking for a
 * thousand blog rows, and it answers 200 with 96 entries and 32 KB on
 * evsuae.com — so every crawl of it is a database read and a page-sized
 * response for a feed that no component fetches. Every consumer in this
 * repository was moved to server rendering (see the notes in
 * components/blog/BlogSidebar.js and lib/blog-posts.js). It is only blocked
 * here rather than deleted because an external integration polling it cannot
 * be ruled out from inside the codebase.
 *
 * Blocking is about CRAWLING, not about secrecy — every one of these stays
 * reachable to anyone with the link, and the redirects that point at the PDFs
 * still work for a human. It only stops them competing with real pages.
 */
export async function getServerSideProps({ res }) {
  const { branch } = await getBranchContext(
    DEFAULT_LOCALE,
    process.env.NEXT_PUBLIC_BRANCH || null
  );
  const origin = String(branch?.site_url || "").replace(/\/$/, "");

  /*
   * TRIMMED TO WHAT THIS DEPLOYMENT ACTUALLY HAS.
   *
   * The inherited list disallowed `/warranty-packages/` and `/blogs.xml`. This
   * site has neither — there is no PDF library and no feed — and a rule for a
   * path that does not exist is a rule nobody can verify later.
   *
   * `/thank-you` is deliberately NOT disallowed. It carries `noindex`, and a
   * crawler has to be allowed to fetch a page in order to read that; blocking
   * it would leave Google knowing the URL exists and unable to see why it
   * should be left out, which is how a form confirmation ends up in the index.
   */
  const body = [
    "User-agent: *",
    "Disallow: /.netlify/",
    "Disallow: /api/",
    "Disallow: /*.pdf$",
    "",
    ...(origin ? [`Sitemap: ${origin}/sitemap.xml`] : []),
    "",
  ].join("\n");

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600");
  res.write(body);
  res.end();

  return { props: {} };
}

export default function Robots() {
  return null;
}
