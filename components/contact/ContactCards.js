import { DEFAULT_LOCALE, localePath } from "@/lib/locale";
import { assetUrl } from "@/lib/images";
import { Mail, MapPin, Phone } from "@/components/chrome/icons";
import ExpressTag, { isExpress } from "@/components/modern/ExpressTag";

/**
 * The workshop cards on the Contact page, from `locations`.
 *
 * Every field on a card is already a column: `map_embed_url`, `name`,
 * `page_path`, `phone` / `phone_display`, `google_maps_url`. `email` is NULL on
 * all eleven rows, so the card falls back to the branch mailbox - which is what
 * both pages printed anyway.
 *
 * FOUR THINGS THE HAND-WRITTEN CARDS GOT WRONG, all found by comparing them with
 * the workshop's own page:
 *
 *   EVS Al Ain      printed the 600 hotline, not its own +971 50 777 0360 -
 *                   on the English AND the Arabic page
 *   EVS Sharjah     `tel:0569863920` in English, the local form, which does not
 *                   dial from abroad; the Arabic page had it right
 *   EVS Dubai       "+971 56 60 17771" here, "+971 056 601 7771" on its own page
 *   EVS Ajman       the same disagreement
 *
 * The cards and the workshop pages now read the same number because they read the
 * same column.
 *
 * BOTH GROUPS APPEAR NOW. Only the standard workshops used to - five on the
 * UAE - and the Express ones never had cards here, the same as the footer. The
 * page they were missing from is the one whose whole job is telling someone
 * where to go, so they have their own block under their own heading; `variant`
 * picks which group a call renders.
 */

const pick = (map, locale) =>
  map?.[locale] ?? map?.[String(locale).split("-")[0]] ?? map?.en ?? null;

export default function ContactCards({
  locale = DEFAULT_LOCALE,
  branch,
  locations = [],
  /** `page_content.labels.cards` for this locale - see 0072. */
  labels,
  /**
   * Which `locations.variant` to draw. The page renders this component twice -
   * once for the standard workshops and once for the Express bays - and the two
   * groups differ in nothing but this, so they share the card rather than each
   * getting a copy of it to drift from.
   */
  variant = "standard",
}) {

  /*
   * "T:", "E:" and "Get Directions" were a COPY table here. Note that the Arabic
   * `directions` is NOT the same string as `section_content.branches.directions` -
   * "احصل على الاتجاهات" here, "الحصول على الاتجاهات" there - so 0072 kept them
   * apart rather than merging two live wordings into one.
   */
  const t = labels;
  if (!t) {
    throw new Error(
      "ContactCards: no labels - pass page_content.labels.cards from the contact route"
    );
  }

  /* `!== 'express'` rather than `=== 'standard'` on the standard side, because
     that is what the filter has always meant here: anything that is not an
     Express bay is a workshop, and a third variant should appear with the
     workshops rather than vanish. */
  const cards = locations
    .filter((row) =>
      variant === "express" ? row.variant === "express" : row.variant !== "express"
    )
    .slice()
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));

  return cards.map((row) => {
    const email = row.email || branch?.support_email || null;
    const phone = row.phone || branch?.support_phone || null;
    const phoneText = row.phone_display || row.phone || null;
    const name = pick(row.name, locale) ?? row.slug;

    return (
      <article key={row.slug} className="evs-card evs-card-interactive group flex flex-col overflow-hidden">
        {/* The photo, not the map embed. Four Google Maps iframes on one page
            was four third-party frames to render four grey tiles; the map is
            the Directions action instead. */}
        <a
          href={localePath(locale, row.page_path)}
          className="relative block aspect-[4/3] overflow-hidden bg-surface-elevated"
        >
          {row.hero_image_url && (
            <img
              src={assetUrl(row.hero_image_url, { w: 700 })}
              alt={name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          )}
          <div className="evs-scrim-soft absolute inset-0" />

          {/* The page already splits these into two sections with their own
              headings, so the card knew it was Express and the CARD did not
              say so. That holds only while the card is read in place: a
              screenshot, a scroll past the heading, or the standard section
              on a narrow screen all lose it. The same mark as everywhere
              else, in the same corner as the workshop cards. */}
          {isExpress(row) && <ExpressTag size="md" locale={locale} className="absolute start-4 top-4" />}
        </a>

        <div className="flex flex-1 flex-col p-6">
          {/* The card title linked `/evs-abu-dhabi` unprefixed on the English
              page and `/ar/evs-abu-dhabi` on the Arabic one. One rule now. */}
          <h3 className="text-subheading text-content">
            <a
              href={localePath(locale, row.page_path)}
              className="transition-colors duration-200 group-hover:text-brand-500"
            >
              {name}
            </a>
          </h3>

          <div className="mt-4 flex flex-col gap-2 text-sm">
            {phoneText && (
              <a
                href={phone ? `tel:${phone}` : undefined}
                className="flex items-center gap-2.5 text-content-secondary transition-colors duration-200 hover:text-brand-500"
              >
                <Phone className="h-4 w-4 flex-none text-brand-500" />
                {/* Latin digits inside Arabic text - see the note on .evs-latin. */}
                <span className="evs-latin">{phoneText}</span>
              </a>
            )}

            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2.5 break-all text-content-secondary transition-colors duration-200 hover:text-brand-500"
              >
                <Mail className="h-4 w-4 flex-none text-brand-500" />
                {email}
              </a>
            )}
          </div>

          {row.google_maps_url && (
            <a
              href={row.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 border-t border-line-subtle pt-5 text-sm font-semibold text-content transition-colors duration-200 hover:text-brand-500"
            >
              <MapPin className="h-4 w-4" />
              {t.directions}
            </a>
          )}
        </div>
      </article>
    );
  });
}
