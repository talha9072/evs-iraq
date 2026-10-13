import { DEFAULT_LOCALE, isRtl } from "@/lib/locale";
import { assetUrl } from "@/lib/images";
import Reveal from "@/components/modern/Reveal";
import BranchCard from "@/components/modern/BranchCard";
import { MessageCircle, Phone } from "@/components/chrome/icons";

/**
 * /branches - the workshop directory.
 *
 * REDESIGNED - Tailwind, no Crafto. Every row it reads is the row it read
 * before: `branches` for the page copy, `locations` grouped by `group_label`
 * for the cards. `lib/pages.js` now also carries each card's photo and its
 * `variant`, which were already on the row and simply were not passed through.
 *
 * WHAT CHANGED:
 *
 * THE MAP IFRAME IS GONE from the card. Eleven Google Maps embeds on one page
 * was the single heaviest thing on this site, and because every embed renders
 * the same grey tiles, no card was distinguishable from any other - which is
 * what made the page read as a list of identical grey rectangles. See
 * components/modern/BranchCard for what replaced it.
 *
 * THE JUMP LIST IS REAL NAVIGATION. It was mobile-only, and its anchors were
 * derived from the group label the same way the section ids were - so it worked,
 * but only after 0053 fixed ids that pointed at nothing. It is a sticky row of
 * chips at every width now, because a directory of four groups is exactly the
 * case where a reader wants to skip.
 *
 * `anchorFor` is unchanged, including its index fallback: Arabic and Bengali
 * labels leave nothing behind after the ascii transform, and the anchor only has
 * to be unique and stable, not readable.
 */

/** "EVS Dubai" -> "evs-dubai", "عجمان والعين" -> a stable ascii-safe id. */
function anchorFor(label, i) {
  const ascii = String(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return ascii || `section-${i + 1}`;
}

export default function BranchesPage({ page, locale = DEFAULT_LOCALE, sections }) {
  const { branch, groups = [], h1, whatsapp_label: whatsappLabel } = page;
  const rtl = isRtl(locale);

  /* `page_path` alone decides whether a card title is a link - a workshop
     outside the UAE has no page of its own in any language, and 0053 removed
     the older locale gate that was suppressing a working link on every
     non-en/ar build. */
  const linkFor = (card) =>
    card.pagePath
      ? locale === DEFAULT_LOCALE
        ? `/${card.pagePath}`
        : `/${locale}/${card.pagePath}`
      : undefined;

  const phoneDisplay = branch.support_phone_display || branch.support_phone;
  const labels = sections?.branches;

  return (
    <div dir={rtl ? "rtl" : undefined}>
      {/* ================= HERO ================= */}
      <section className="relative flex min-h-[26rem] items-end overflow-hidden pt-32 md:min-h-[32rem]">
        {page.hero_bg_url && (
          <img
            /* The path keeps its LEADING SLASH. Without one a CSS url() or a
               relative src resolves against the DOCUMENT, so /bn/branches asked
               for /bn/img/... and got nothing - the legacy page only ever lived
               at one depth, so it never noticed. */
            src={assetUrl(page.hero_bg_url, { w: 1920 })}
            alt={h1}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="evs-scrim absolute inset-0" aria-hidden="true" />

        <div className="evs-shell relative z-10 pb-14 md:pb-20">
          <Reveal className="max-w-3xl">
            <h1 className="text-display-2 uppercase">
              {h1}
              <span className="text-brand-500">.</span>
            </h1>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href={`tel:${branch.support_phone}`} className="evs-btn evs-btn-primary evs-btn-lg">
                <Phone className="h-4 w-4" />
                {/* LTR, or the bidi algorithm lays the digit groups out
                    right-to-left and `600 500 387` reads as `387 500 600`. See
                    the note in HomePage. */}
                <span className={rtl ? "evs-latin" : undefined} dir="ltr">
                  {phoneDisplay}
                </span>
              </a>

              {branch.whatsapp_number && (
                <a
                  href={`https://wa.me/${branch.whatsapp_number.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="evs-btn evs-btn-secondary evs-btn-lg"
                >
                  <MessageCircle className="h-4 w-4" />
                  {whatsappLabel}
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= JUMP LIST =================
          Sticky under the header, at every width. `top-18` is the header's
          height; the two together are what keeps a chip reachable while the
          reader is deep in the list. */}
      {groups.length > 1 && (
        <nav
          aria-label={h1}
          className="sticky top-18 z-30 border-y border-line-subtle bg-surface/85 backdrop-blur-xl"
        >
          <div className="evs-rail flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {groups.map((g, i) => (
              <a
                key={g.label}
                href={`#${anchorFor(g.label, i)}`}
                className="flex-none rounded-full border border-line-subtle px-4 py-2 text-sm font-semibold whitespace-nowrap text-content-secondary transition-colors duration-200 hover:border-brand-500 hover:text-brand-500"
              >
                {g.label}
              </a>
            ))}
          </div>
        </nav>
      )}

      {/* ================= GROUPS ================= */}
      <div className="evs-shell evs-section flex flex-col gap-16 md:gap-24">
        {groups.map((g, i) => (
          <section
            key={g.label}
            id={anchorFor(g.label, i)}
            /* Clears the sticky header AND the chip bar above, so an anchor
               jump does not land with the heading hidden behind them. */
            className="scroll-mt-36"
          >
            <Reveal className="mb-8 flex items-end justify-between gap-6 border-b border-line-subtle pb-5">
              <h2 className="text-heading uppercase">
                {g.label}
                <span className="text-brand-500">.</span>
              </h2>
              <span className="pb-1 text-sm tabular-nums text-content-muted">
                {String(g.cards.length).padStart(2, "0")}
              </span>
            </Reveal>

            <Reveal stagger={70} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {g.cards.map((card) => (
                <BranchCard
                  key={card.slug}
                  card={card}
                  href={linkFor(card)}
                  labels={labels}
                  fallbackPhone={branch.support_phone}
                  locale={locale}
                />
              ))}
            </Reveal>
          </section>
        ))}
      </div>
    </div>
  );
}
