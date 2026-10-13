import { assetUrl } from "@/lib/images";
import { ArrowRight, MapPin, Phone } from "@/components/chrome/icons";
import GoogleRating from "@/components/modern/GoogleRating";
import ExpressTag, { isExpress } from "@/components/modern/ExpressTag";

/**
 * One workshop, as a card. Used by /branches and by the home page.
 *
 * TWO LAYOUTS, NOT ONE WITH A HOLE IN IT. A workshop with a photograph leads
 * with the photograph; one without gets a typographic panel rather than a grey
 * placeholder, so both read as finished cards.
 *
 * THAT USED TO LINE UP WITH `variant` AND NO LONGER DOES. When this was written
 * the four rows with no photo were exactly the four Express bays, so "no photo"
 * and "Express" were the same set and the badge was hung on the wrong one of
 * them. 0101-0103 photographed every workshop; all eleven rows carry a
 * `hero_image_url` today, the no-photo layout stopped firing, and the EVS
 * Express badge disappeared from the entire site without a word. The badge now
 * follows `variant`, which is what it was always about.
 *
 * WHAT IT REPLACES. The legacy card led with a 300px Google Maps <iframe> - one
 * third-party frame per card, eleven per page, every one rendering the same grey
 * tiles, so no card was distinguishable from any other. The map is now the
 * "Directions" action, which is what a visitor wanted from it anyway.
 *
 * The whole card is not a single <a>. The legacy markup nested three links
 * inside a clickable heading, which is invalid HTML and collapsed the card to
 * one tab stop with three destinations. Here the photo and the title share one
 * link to the workshop page, and phone and directions are their own.
 */
export default function BranchCard({
  /** { slug, title, area, phone, mapUrl, pagePath, heroImageUrl, variant } */
  card,
  /** Where the workshop's own page lives, or undefined when it has none. */
  href,
  /** section_content.branches - { call, directions, visit, reviews } */
  labels,
  /** Falls back to the branch's support line where the row has no number. */
  fallbackPhone,
  /** For the rating's number formatting - 4.8 in English, ٤٫٨ in Arabic. */
  locale = "en",
}) {
  const tel = card.phone || fallbackPhone;
  const photo = card.heroImageUrl;

  /* `variant`, NOT `!photo`. The badge below used to live only in the
     no-photograph layout, which was right by accident - the four rows with no
     photo happen to be the four Express bays. Photograph an Express bay and it
     silently stopped announcing itself; leave a full workshop's photo empty and
     it started claiming to be one. The column has said so all along. */
  const express = isExpress(card);

  const norm = (s) => String(s ?? "").toLowerCase();

  /* THE FULL ADDRESS, not just the locality. This printed `area` alone -
     "Investment Park First" - while the row also carried `street`, "Dubai
     Investment Park First - Dubai - United Arab Emirates". The workshop's real
     address was on the row and simply never reached the card.

     Assembled in lib/branch-card.js rather than here, because deciding whether
     the two overlap has to be done on the English values - see the note there,
     and the Arabic card that read "البرشاء · Al Barsha" before it did. */
  const address = card.address;

  /* EQUALITY, not containment - and this is the whole reason the Express cards
     had no address line while the photo cards did.

     Two earlier versions were too eager. `photo && ...` dropped it from every
     Express card on principle. Containment against the title then dropped it
     from them anyway, because "EVS Dubai - Al Barsha" CONTAINS "Al Barsha" -
     and by the same rule "EVS Sharjah" would have swallowed a Sharjah address.
     A name that mentions a place is not the same as having printed the address.

     So the line is suppressed only when it would be the title repeated word for
     word, which is the one case that actually reads as a stutter: /branches
     sets `card_title` to the whole postal address on some rows. Every card that
     has an address now shows it, whichever layout it uses. */
  const showAddress = Boolean(address) && norm(card.title) !== norm(address);

  const Title = href ? "a" : "span";

  return (
    /* `h-full` so a card in the home page's rail fills its fixed-width slot -
       a grid row already stretches its items, so this changes nothing there. */
    <article className="evs-card evs-card-interactive group flex h-full flex-col overflow-hidden">
      {photo ? (
        <a
          href={href}
          tabIndex={href ? -1 : undefined}
          aria-hidden={href ? "true" : undefined}
          className="relative block aspect-[4/3] overflow-hidden bg-surface-elevated"
        >
          <img
            /* Through the image CDN with an explicit width - the source files
               are around 1.4 MB for a box that paints under 500px wide. */
            src={assetUrl(photo, { w: 800 })}
            alt={card.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="evs-scrim-soft absolute inset-0" />

          {/* On the photograph too, not only on the panel below. An Express bay
              that has been photographed is still an Express bay, and this is
              the layout it would land in - so the one place the badge was
              guaranteed NOT to appear was the case the old rule could not
              express. Sits over the scrim, which is already dark enough at the
              top edge for the green to read against any image. */}
          {express && <ExpressTag size="md" locale={locale} className="absolute start-4 top-4" />}
        </a>
      ) : (
        /* No photograph. It fills the SAME 4/3 box a photo would, because a grid
           row stretches every card to the tallest one - a short card here just
           left a dead gap under the badge rather than reading as deliberate.
           So the space becomes a typographic panel: the badge, and the place
           name set large in the display face. */
        <div className="relative flex aspect-[4/3] flex-col justify-between overflow-hidden bg-surface-elevated p-6">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -end-6 -bottom-8 font-display text-[9rem] leading-none text-brand-500/8 select-none"
          >
            EV
          </span>

          {/* One component now, shared with the header, the hamburger, the
              contact cards and the workshop page - so "EVS Express" is written
              once and cannot drift into five spellings. A row with no photo
              that is NOT Express keeps the panel and simply has no badge. */}
          {/* The empty span is not decoration: this panel is
              `flex-col justify-between`, so dropping the first child entirely
              would let the place name float to the TOP instead of sitting at
              the bottom. Every photo-less row today is Express, so that case
              does not arise yet - which is exactly why it is worth pinning
              before it does. */}
          {express ? <ExpressTag size="md" locale={locale} className="relative" /> : <span aria-hidden="true" />}

          {card.area && (
            <span className="relative font-display text-display-3 text-content uppercase">
              {card.area}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        {/* Name and rating share ONE row, pushed to opposite ends. Stacked, the
            rating sat under a short name and left the whole right half of the
            card empty; side by side they fill the line and the rating lands
            where the eye already is when it is comparing two workshops - which
            is the only question a directory of eleven has to answer.

            `flex-wrap` so a long name on a narrow card drops the rating to its
            own line instead of crushing it, and `items-start` so the rating
            keeps its baseline against a name that has wrapped to two lines. */}
        {/* `mb-7` is a MINIMUM gap, not the gap. The actions below carry
            `mt-auto`, which hands them every spare pixel in a stretched card -
            but on the tallest card in a row there are none, and the address
            ended up sitting on the divider. A fixed bottom margin here floors
            it; the auto margin still distributes whatever is left over. */}
        <div className="mb-7">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <h3 className="text-subheading text-content">
            <Title
              href={href}
              className={href ? "transition-colors duration-200 group-hover:text-brand-500" : undefined}
            >
              {card.title}
            </Title>
          </h3>

          {/* Renders nothing at all when the row has no rating (0089 ships the
              columns empty), so an unrated card is a shorter card rather than a
              card with a gap in it. */}
          <GoogleRating
            className="mt-0.5 shrink-0"
            rating={card.rating}
            count={card.reviewCount}
            url={card.reviewsUrl}
            label={labels?.reviews}
            locale={locale}
          />
        </div>

          {showAddress && <p className="mt-2 text-sm text-content-muted">{address}</p>}
        </div>

        {/* `mt-auto`, so cards of unequal height in one row still line their
            actions up along the bottom - without it a card with no rating
            floated its actions halfway up.

            THREE PEERS, not two and a button. Visit was a full-width secondary
            button under this row, which made it the loudest thing on the card
            and gave every card a second horizontal rule. It is the same kind of
            thing as the other two - one tap, one destination - so it is set the
            same way and sits third. */}
        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line-subtle pt-5">
          {tel && (
            <a
              href={`tel:${tel}`}
              className="inline-flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-semibold text-content transition-colors duration-200 hover:bg-surface-elevated hover:text-brand-500"
            >
              <Phone className="h-4 w-4" />
              {labels?.call}
            </a>
          )}
          {card.mapUrl && (
            <a
              href={card.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-semibold text-content-secondary transition-colors duration-200 hover:bg-surface-elevated hover:text-brand-500"
            >
              <MapPin className="h-4 w-4" />
              {labels?.directions}
            </a>
          )}
          {/* Absent where `page_path` is NULL - a workshop with no page of its
              own would otherwise offer a link to a 404. */}
          {href && labels?.visit && (
            <a
              href={href}
              className="inline-flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-semibold text-content-secondary transition-colors duration-200 hover:bg-surface-elevated hover:text-brand-500"
            >
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              {labels.visit}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
