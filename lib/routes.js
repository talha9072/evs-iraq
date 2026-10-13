/**
 * Which routes this deployment actually serves.
 *
 * The chrome components were written for a live country site and hardcode links
 * to /contact, /branches, /extended-warranties, /blog and /franchise. None of
 * those exist here yet: there is no workshop to list, no number to call, no
 * warranty product to sell and no posts.
 *
 * Leaving the links in place would put five 404s in the header and footer of
 * every page on the site — on a domain whose entire purpose right now is to be
 * crawled and indexed. A sitemap that points at missing pages is bad; a header
 * that does it on all 298 pages is worse.
 *
 * So the links are filtered rather than deleted from the components. When a
 * section is ready, add its key here and it reappears everywhere at once, with
 * no component edits to review.
 */

export const AVAILABLE = new Set([
  "home",
  "services",
  "brands",
  "about",
  "faqs",
  "privacy",
  "contact",
  "network",
  /* /franchise is a built route here and is listed in the sitemap. Without
     this key liveLinks() stripped its only internal link - the footer one -
     leaving an orphan page that Google was told to crawl and nothing pointed
     at. */
  "franchise",
]);

/** True when a top-level section is live on this deployment. */
export function hasRoute(key) {
  return AVAILABLE.has(key);
}

/**
 * Drop nav entries whose section is not live.
 *
 * Matches on the entry's `key` where it has one, and otherwise on the path, so
 * it works for both the structured header menu and the flat footer lists.
 */
const PATH_KEYS = [
  ["extended-warranties", "warranty"],
  /* `sos` had no entry, so keyForHref("/sos") returned null and liveLinks()
     KEPT the link. There is no /sos route on this deployment; the only thing
     suppressing it was hasSos() reading NEXT_PUBLIC_BRANCH, so an unset or
     overridden variable would have put a 404 in all 306 footers. */
  ["sos", "sos"],
  ["branches", "branches"],
  ["contact", "contact"],
  ["blog", "blog"],
  ["franchise", "franchise"],
];

export function keyForHref(href = "") {
  const match = PATH_KEYS.find(([segment]) => href.includes(`/${segment}`));
  return match ? match[1] : null;
}

export function liveLinks(links = []) {
  return links.filter((link) => {
    if (!link) return false;
    const key = link.key || keyForHref(link.href || "");
    return key ? AVAILABLE.has(key) : true;
  });
}
