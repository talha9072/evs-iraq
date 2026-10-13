import { localised } from "@/lib/branches";

/**
 * One `locations` row, shaped for components/modern/BranchCard.
 *
 * WHY IT IS ITS OWN MODULE. This mapping existed twice. `lib/pages.js` built it
 * for /branches, and components/modern/BranchesSection built a DIFFERENT one
 * inline for the home page and every services, brand and workshop page under
 * it - with its own card markup to match. So the two drifted: /branches learned
 * that four UAE workshops are Express bays with no photograph and gave them a
 * typographic panel, while the home page kept rendering an empty grey box where
 * the photo would have been. That is the pair of black cards on the home page.
 *
 * One shape, one card, one place to add a field - which is what made 0089's
 * rating a two-line change rather than a four-file one.
 *
 * Its own file rather than lib/branches.js or lib/pages.js because both of
 * those import it and each other's neighbours; a leaf module cannot cycle.
 */
export function toBranchCard(l, locale, { titleFrom = "name" } = {}) {
  /* THE TWO PAGES TITLE THESE DIFFERENTLY, and both are right. /branches groups
     by city and sets `card_title` under the heading - "Industrial City", the
     locality, because "EVS Dubai" three times under "Dubai" says nothing. On
     the home page the cards stand alone with no grouping, so the row's full
     `name` is what reads as a heading. Preserved as a parameter rather than
     unified, because unifying it would silently retitle one page or the other. */
  const first = titleFrom === "card_title" ? l.card_title : l.name;
  const second = titleFrom === "card_title" ? l.name : l.card_title;

  return {
    slug: l.slug,
    title:
      localised(first, locale) ??
      localised(second, locale) ??
      localised(l.area, locale) ??
      l.slug,
    area: localised(l.area, locale),
    street: localised(l.street, locale),
    address: address(l, locale),
    phone: l.phone,

    // The stored link first: a maps.app.goo.gl short link opens the BUSINESS
    // listing - name, hours, reviews - while a coordinate query only drops a
    // pin. Coordinates are the fallback so a row added without a link still
    // gets a working directions button.
    mapUrl: l.google_maps_url || coordsLink(l),
    embedUrl: l.map_embed_url,

    // NULL where this workshop has no page of its own - Oman's and Qatar's do
    // not exist in any language. The card renders the title as text rather than
    // as a link to a 404 (0053).
    pagePath: l.page_path || null,

    heroImageUrl: l.hero_image_url || null,
    variant: l.variant || "standard",

    // 0089, per workshop. All three may be null, and the card renders no badge
    // at all when the rating is - see components/modern/GoogleRating.
    rating: l.google_rating ?? null,
    reviewCount: l.google_review_count ?? null,
    reviewsUrl: l.google_reviews_url ?? null,
  };
}

/**
 * The one address line a card prints, from the row's two overlapping fields.
 *
 * `area` is the short locality ("Musaffah") and `street` the full line ("6th
 * Street - Musaffah - M14 - Abu Dhabi"). In every row today the street already
 * contains the area, so printing both reads as a stutter - but a row could be
 * given a street that says something new, and then both belong.
 *
 * THE OVERLAP TEST RUNS ON ENGLISH, ALWAYS, and that is the point of this
 * function existing rather than a `street.includes(area)` at the card. Several
 * rows have `street` as `{"en": "Al Barsha"}` with no Arabic at all, while
 * `area` carries `{"ar": "البرشاء", "en": "Al Barsha"}`. Comparing the RESOLVED
 * strings on /ar therefore compared Arabic against English, found no overlap,
 * and printed "البرشاء · Al Barsha" - two scripts, one place, on the card.
 * English is the one language every row has, so the decision is made there and
 * only the OUTPUT is localised.
 *
 * When they do overlap, the survivor is whichever of the two actually exists in
 * this language: the street where it has been translated, the area where the
 * street is English-only. That is what keeps an Arabic card Arabic.
 */
function address(l, locale) {
  const en = (m) => String(m?.en ?? "").trim().toLowerCase();
  const base = String(locale).split("-")[0];
  const has = (m) => Boolean(m && (m[locale] || m[base]));

  const areaText = localised(l.area, locale);
  const streetText = localised(l.street, locale);
  if (!areaText) return streetText || null;
  if (!streetText) return areaText;

  const overlap = en(l.area) && en(l.street) && en(l.street).includes(en(l.area));
  if (!overlap) return `${areaText} · ${streetText}`;

  return has(l.street) || !has(l.area) ? streetText : areaText;
}

/**
 * Google's documented Maps URL API, from the coordinates already on the row.
 *
 * Used only when google_maps_url is NULL. `?api=1&query=lat,lng` is the form
 * that needs no parsing - unlike an address in a URL PATH, where `+` stays a
 * literal plus rather than becoming a space, which is why Qatar's copied-from-
 * live link never resolved (0052).
 */
export function coordsLink(l) {
  if (l.latitude == null || l.longitude == null) return null;
  return `https://www.google.com/maps/search/?api=1&query=${l.latitude},${l.longitude}`;
}
