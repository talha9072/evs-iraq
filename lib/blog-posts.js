import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * The blog, which this site does not have yet.
 *
 * evsiraq.com is pre-launch and carries no posts. Rather than delete the home
 * page's journal section — and diverge from EVS-Production's HomePage.js, which
 * is otherwise byte-identical here — this returns an empty page and the section
 * renders nothing: `components/modern/BlogFeed.js` already bails on an empty
 * list, so the markup simply stops at the services grid.
 *
 * Keeping the shape rather than the data is deliberate. When Iraq opens and
 * this deployment points at the platform database, the real `lib/blog-posts.js`
 * drops in and the section appears with no other change.
 */

const empty = (page) => ({
  posts: [],
  page: Math.max(1, Number(page) || 1),
  total: 0,
  totalPages: 0,
});

/** The listing page shows twelve, as the live sites do. */
export const LIST_PER_PAGE = 12;

export async function getBlogPage(locale = DEFAULT_LOCALE, page = 1) {
  return empty(page);
}

export function getBlogList(locale = DEFAULT_LOCALE, page = 1) {
  return getBlogPage(locale, page);
}

export async function getBlogSlugs() {
  return [];
}

export async function getRecentPosts() {
  return [];
}

export async function getBlogPost() {
  return null;
}

/** Where a post would live, for anything that builds links defensively. */
export function blogHref(slug, locale = DEFAULT_LOCALE) {
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  return `${prefix}/blog/${slug}`;
}
