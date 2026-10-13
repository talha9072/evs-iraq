import { assetUrl } from "@/lib/images";
import { SOCIAL_ICONS } from "@/components/chrome/icons";

/**
 * The sidebar of a blog detail page: recent posts, then the branch's socials.
 *
 * REDESIGNED - Tailwind, no Crafto. The icons come from the shared lucide set
 * in components/chrome/icons rather than Font Awesome class names: a redesigned
 * page loads no icon font at all, so `fa-brands fa-linkedin-in` rendered as
 * nothing. Same map the footer uses.
 *
 * TWO THINGS CHANGED EARLIER, and both were the same bug in different clothes.
 *
 * IT NO LONGER FETCHES. It used to `fetch("/blogs.xml")` on mount, parse the
 * whole feed with DOMParser and slice six entries out of it - on every article
 * page, behind a spinner, for six links. That feed is regenerated per request and
 * was measured at 1.0-1.7s. Six rows arrive as props now, already filtered to
 * this branch by lib/blog-posts.js.
 *
 * THE SOCIAL LINKS WERE DUBAI'S. LinkedIn and Instagram were written into this
 * file pointing at /company/eva-electric-vehicle-services and /evs_uae, so every
 * article on evsqtr.com and evsoman.com sent readers to the UAE's accounts. They
 * come from the branch row now - the same list lib/footer.js assembles - and the
 * block does not render at all for a country that has none, rather than falling
 * back to somebody else's.
 */

/** Only used until section_content.blog carries these two - see 0083. */
const FALLBACK = { recentPosts: "Recent posts", stayConnected: "Stay connected" };

/** The visible word. A network added to the branch row and listed here needs no
 *  other change; its glyph comes from SOCIAL_ICONS. */
const LABELS = {
  linkedin: "Linkedin",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X",
  x: "X",
  youtube: "YouTube",
  tiktok: "TikTok",
};

function Heading({ children }) {
  return (
    <h2 className="mb-6 border-b border-line-subtle pb-4 text-subheading text-content">
      {children}
    </h2>
  );
}

export default function BlogSidebar({ posts = [], social = [], sections }) {
  // lib/footer.js returns every network in a fixed order, with href null where
  // this branch has no account. A null href would render a dead link.
  const links = (social ?? []).filter((item) => item?.href);
  const copy = { ...FALLBACK, ...(sections?.blog ?? {}) };

  if (posts.length === 0 && links.length === 0) return null;

  return (
    /* `lg:sticky` so the sidebar stays with the reader down a long article -
       `self-start` is what stops it stretching to the article's full height,
       which would make `top` unreachable and the stickiness a no-op. */
    <aside className="lg:sticky lg:top-28 lg:self-start">
      {posts.length > 0 && (
        <section>
          <Heading>{copy.recentPosts}</Heading>

          <ul className="flex flex-col gap-5">
            {posts.map((post) => (
              <li key={post.slug}>
                <a href={post.href} className="group flex items-center gap-4">
                  <img
                    loading="lazy"
                    /* 160w, not the full cover - it is painted at 72px wide. */
                    src={assetUrl(post.image, { w: 160 })}
                    alt={post.title || ""}
                    width="72"
                    height="72"
                    className="h-18 w-18 flex-none rounded-md border border-line-subtle object-cover"
                  />
                  <span className="min-w-0">
                    <span className="line-clamp-2 font-semibold text-content transition-colors duration-200 group-hover:text-brand-500">
                      {post.title}
                    </span>
                    <span className="mt-1 block text-sm text-content-muted">{post.date}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {links.length > 0 && (
        <section className={posts.length > 0 ? "mt-12" : ""}>
          <Heading>{copy.stayConnected}</Heading>

          <ul className="grid grid-cols-2 gap-2">
            {links.map((item) => {
              const key = String(item.key || "").toLowerCase();
              const Glyph = SOCIAL_ICONS[key];
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-sm border border-line-subtle px-3 py-2.5 text-sm font-semibold text-content-secondary transition-colors duration-200 hover:border-brand-500 hover:text-brand-500"
                  >
                    {Glyph && <Glyph className="h-4 w-4 flex-none" />}
                    {LABELS[key] ?? key}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </aside>
  );
}
