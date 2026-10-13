import { useState } from "react";
import { DEFAULT_LOCALE, isRtl } from "@/lib/locale";
import { localised } from "@/lib/branches";
import { assetUrl } from "@/lib/images";
import Reveal from "@/components/modern/Reveal";
import ServiceStrip from "@/components/modern/ServiceStrip";
import StatsBand from "@/components/modern/StatsBand";
import ReviewsSection from "@/components/modern/ReviewsSection";
import BranchesSection from "@/components/modern/BranchesSection";
import GoogleRating from "@/components/modern/GoogleRating";
import ExpressTag from "@/components/modern/ExpressTag";
import { ArrowUpRight, Clock, Mail, MapPin, Phone, Whatsapp } from "@/components/chrome/icons";
import { shifts } from "@/components/modern/OpeningHours";

/**
 * A workshop page - /evs-dubai and its eight siblings.
 *
 * REDESIGNED - Tailwind, no Crafto. Every word is the row it was before:
 * `hero_eyebrow`, `hero_title`, `hero_highlight`, `hero_description`, the two
 * button labels, `address_html` and the three card labels all come from
 * `location_pages`, and the workshop itself from `locations`.
 *
 * WHAT CHANGED:
 *
 * THE PAGE IS ONE BLOCK SHORTER. It used to open with a headline beside a
 * portrait photo - or, on the four Express bays that have no photo, beside a
 * card repeating the phone number - and then a second section carried the
 * address, the phone, the mailbox, the hours and the map. The map is the thing
 * most readers of a workshop page are after and it was below the fold; the
 * phone number was printed twice on the way down to it. Hero, map, photograph
 * and the four facts are now one composition. See the note on it below.
 *
 * THE LEGACY MAP was half the hero, an <iframe> pushed off the grid with
 * `outside-box-right-20` (margin-right: -20vw) - a PHYSICAL offset, so the
 * Arabic component had to swap it by hand. It is a panel in the grid now, which
 * needs no swapping in either direction.
 *
 * `address_html` IS STILL HTML, and still rendered as such. The Arabic addresses
 * wrap their Latin digits to force a Latin face and LTR inside RTL text -
 * `الشارع <span class="urbanist" dir="ltr">6</span> - مصفح` - and there are six
 * such spans across four pages. Rendered as text they would show the tags. The
 * `urbanist` class those spans carry is a Crafto class that no longer resolves,
 * so `.evs-latin` below reproduces exactly what it did.
 *
 * `displayPhone` is unchanged and still reads a stored column rather than
 * formatting - see the note on it at the foot of this file.
 */

export default function LocationPage({ page, locale = DEFAULT_LOCALE }) {
  const { location, branch, variant } = page;
  const rtl = isRtl(locale);

  /** The map ignores the wheel and the drag until a reader clicks it once - see
   *  the hero note. State rather than a CSS-only trick because it has to LATCH:
   *  `:focus-within` or `:hover` would hand the scroll back the moment the
   *  pointer left, mid-drag. */
  const [mapLive, setMapLive] = useState(false);
  const hasMap = Boolean(location.map_embed_url);

  const phone = location.phone || branch.support_phone;
  const email = location.email || branch.support_email;
  const mapsUrl =
    location.google_maps_url ||
    (location.latitude != null && location.longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
      : null);

  /* wa.me wants the number with no `+` and no spaces. Same column the floating
     button in _app.js reads, so a country cannot open a chat with another
     country's line - which is what the hardcoded Dubai mobile used to do. */
  const waLink = branch.whatsapp_number
    ? `https://wa.me/${branch.whatsapp_number.replace(/\D/g, "")}`
    : null;
  const waLabel = page.sections?.branches?.whatsapp ?? null;

  /*
   * THE WORKSHOP'S OWN HOURS WHERE IT HAS THEM, the country's otherwise.
   *
   * Every row used to read `branch.opening_hours`, which is one set of hours
   * for a whole country — right until the Express bays turned out to keep
   * different ones from the main workshops (10:00–22:00 with a Friday prayer
   * break, against 09:00–13:00 and 14:00–18:00 with Friday closed). The
   * structured data in pages/locations/[slug] already preferred the location's
   * own `spec`; the panel a reader actually looks at did not, so the page
   * could state one thing and its schema another.
   *
   * `{}` is what every location carried before any were filled in, so an empty
   * object has to mean "no override" rather than "no hours".
   */
  const hours = Object.keys(location.opening_hours ?? {}).length
    ? location.opening_hours
    : branch.opening_hours ?? {};


  /**
   * The four cells under the hero. Each is `{ icon, label, html, note, href,
   * cta }`; a cell with no `href` renders as text, which is what the hours are.
   */
  const facts = [
    {
      icon: MapPin,
      /* THE ADDRESS CARD HAS A HEADING NOW, like the other three. It was the
         only one that just started, because `location_pages` has a phone label
         and an email label and never had an address one. The word is one row
         per language in `section_content.branches` rather than nine per-page
         columns - it is the same word on every workshop page of every country.
         See 0092. Absent until that runs, and the heading simply does not
         print. */
      label: page.sections?.branches?.location ?? null,
      html: page.address_html,
      /* THE ADDRESS IS ONE LINE, and `address_html` is it.

         `locations.street` was tried as a second, fuller line beneath it and is
         not one. Checked across the rows rather than assumed: on evs-alain the
         two are the same string; on evs-sharjah they differ only in whether the
         separator is a dash or a comma; on evs-dubai-al-barsha `street` is
         SHORTER ("Al Barsha" against "Al Barsha South First, Dubai, UAE"); and
         on the Arabic rows it is `address_html` again without the Latin-digit
         spans. Four of five sampled would have printed the same address twice.

         EVS Dubai is the one row whose `address_html` really is short - "DIP
         (Dubai Investment Park)" - and that is a value in a column, not a
         rendering problem. 0092 fills it. */
      href: mapsUrl,
      cta: page.cta_directions,
      external: true,
    },
    {
      icon: Phone,
      /* "Call us", not `page.phone_card_label`. That column holds the branch's
         own name - "EVS Dubai Branch" - which reads as a heading for the whole
         card rather than a label for the number under it, and it is a different
         string on each of the nine pages for a cell that always means the same
         thing. `cta_call` is already the word for this, in every language. */
      label: page.cta_call,
      html: displayPhone(location, branch.support_phone_display),
      href: `tel:${phone}`,
      cta: page.cta_call,
      /* Latin digits sitting in an Arabic page. The legacy file added
         `urbanist` to this one link so they rendered in a Latin face; the
         address does the same thing with per-digit spans inside address_html,
         and the email is already Latin and gets nothing. */
      latin: rtl,
    },
    {
      icon: Mail,
      label: page.email_card_label,
      html: email,
      href: `mailto:${email}`,
      cta: page.cta_email,
    },
    /* OPENING HOURS, which the legacy workshop page never showed at all - a
       visitor had to scroll to the footer for them. Same branch row the footer
       reads. `day` and `time` are the two halves; `label` is those two already
       joined into a sentence, and using it as a heading above them is what made
       the old panel print the same thing three times. `closed` is stored whole
       ("Friday Closed"), with the two halves kept apart as a fallback. */
    hours.day && {
      icon: Clock,
      label: localised(hours.day, locale),
      /* ONE LINE PER SHIFT, not the stored string. These are two shifts with
         a break between them, and comma-joined they read as one unbroken
         stretch - the reader has to spot the comma to learn the workshop is
         shut between one and two. `shifts()` splits on the list separator and
         nothing else; see the note in OpeningHours for why not `spec`. */
      lines: shifts(localised(hours.time, locale)),
      note:
        localised(hours.closed, locale) ??
        [localised(hours.closed_day, locale), localised(hours.closed_note, locale)]
          .filter(Boolean)
          .join(" "),
    },
  ].filter(Boolean);

  return (
    <div dir={rtl ? "rtl" : undefined}>
      {/* ================= HERO =================
          THE WORKSHOP, ITS MAP AND ITS PHOTOGRAPH IN ONE FRAME.

          WHAT THIS REPLACES IS TWO BLOCKS, not one. The hero was a headline
          beside either a portrait photo or - on the four Express bays, which
          have none - a small card repeating the phone number; and a second
          section further down held the address, the phone, the mailbox, the
          hours and the map. So the map, which is the one thing a reader on a
          workshop page is usually after, sat below the fold, and the phone
          number was printed twice on the way to it.

          ONE HERO NOW:

            left     the name, its line, the Google rating, and the two things a
                     reader came to do - directions and a call
            right    the MAP, at the size it deserves, with the workshop's own
                     photograph lifted off its corner where the row has one
            beneath  address, branch line, mailbox and opening hours - four
                     cells of a single panel

          THE SAME EMBED, MOVED - not a second one. Every row has a
          `map_embed_url`, Express included, so the column that used to be a
          filler card carries what every other page carries and all nine heroes
          are finally the same shape.

          THE PHOTOGRAPH STAYS SMALL, and the reason changed with 0101 without
          changing the answer. It used to be resolution: these were 600-900px
          portraits - dubai.png was 600x832 - so a full-bleed hero would have
          upscaled one about three times. The new ones are 2400x1600, so that
          constraint is gone; what remains is that it reads as an object on the
          map rather than as wallpaper behind the type, and the map is the thing
          a visitor came to this page for.

          THE CARD IS LANDSCAPE NOW, and that is the one thing 0101 forced. The
          old files were portraits and this was `aspect-[3/4]`; the new ones are
          3:2 photographs of wide buildings, and cropping a facade into a
          portrait keyhole showed a slice of wall with the signage cut off both
          sides. 4:3 keeps the building whole at the same visual weight.

          THE MAP DOES NOT EAT THE PAGE SCROLL. A Google embed captures the
          wheel and the one-finger drag, which was survivable while it sat at the
          foot of the page and is not now that it is the first thing under a
          thumb. It is inert until clicked - one click, then it behaves normally. */}
      <section className="evs-shell pt-32 pb-4 md:pt-40 md:pb-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <Reveal className={hasMap ? "lg:col-span-6" : "lg:col-span-8"}>
            {/* THE EYEBROW ALREADY SAID IT - it just did not look like it.
                `hero_eyebrow` on the four Express pages reads "EVS Express",
                and "إي في إس إكسبريس" in Arabic, while every other workshop's
                reads "Electric Vehicle Service Center". So this page was never
                silent about being an Express bay; it whispered it in the same
                muted 11px as every other page's strapline.

                A second badge beside it would have been the words twice over,
                so the eyebrow BECOMES the badge here rather than gaining one -
                same prominence as the cards and the menus, and still in the
                visitor's own language, which a hardcoded badge could not be. */}
            {variant === "express" ? (
              <ExpressTag size="md" label={page.hero_eyebrow} className="mb-6" />
            ) : (
              <span className="evs-eyebrow mb-6">{page.hero_eyebrow}</span>
            )}

            <h1 className="text-display-2 uppercase">
              {page.hero_title}
              {/* Appended, not separated: the stored value carries its own
                  leading space on the Express pages (" Al Barsha"), which is the
                  only thing between the two words. */}
              <span className="text-brand-500">{page.hero_highlight}</span>
            </h1>

            {page.hero_description && (
              <p className="mt-5 max-w-xl text-lead text-content-secondary">
                {page.hero_description}
              </p>
            )}

            {/* 0089's rating, on the page it is most about. It renders nothing
                when this workshop has none, so the block below simply moves up. */}
            <GoogleRating
              className="mt-6"
              rating={location.google_rating}
              count={location.google_review_count}
              url={location.google_reviews_url}
              label={page.sections?.branches?.reviews}
              locale={locale}
            />

            {/* WHATSAPP TAKES THE FIRST BUTTON, not directions.

                Directions were offered twice on this page: here, and again on
                the address card below, which has carried its own "Get
                Directions" since that card gained a heading. Two buttons at the
                top of a workshop page are worth two different things, and the
                channel this business is messaged on was not one of them.

                THE NUMBER IS THE BRANCH'S, from `branches.whatsapp_number` -
                the same column the floating button in _app.js reads. `wa.me`
                wants digits with no `+`.

                STILL CONDITIONAL, and that matters. It is not a fallback - there
                is nothing to fall back to now that 0093 has run - it is the same
                rule the call button follows: a branch with no WhatsApp line, or
                a locale with no word for the button, gets no button rather than
                one that opens an empty chat. The Arabic evs-sharjah page already
                relies on this for its call button, which is stored as '' rather
                than NULL because NULL would inherit the master's label. */}
            <div className="mt-9 flex flex-wrap items-center gap-3">
              {waLabel && waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="evs-btn evs-btn-primary evs-btn-lg"
                >
                  <Whatsapp className="h-4 w-4" />
                  {waLabel}
                </a>
              )}

              {page.hero_call_label && phone && (
                <a href={`tel:${phone}`} className="evs-btn evs-btn-secondary evs-btn-lg">
                  <Phone className="h-4 w-4" />
                  {page.hero_call_label}
                </a>
              )}
            </div>
          </Reveal>

          {hasMap && (
            <Reveal from="end" delay={120} className="lg:col-span-6">
              <div className="relative">
                <div className="overflow-hidden rounded-2xl border border-line-subtle">
                  <iframe
                    src={location.map_embed_url}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${page.hero_title} — map`}
                    /* Inert until the cover below it is clicked.
                       `pointer-events` rather than unmounting the frame, so
                       activating it costs nothing and does not reload the map. */
                    className={`aspect-[4/3] w-full lg:aspect-[5/4] ${
                      mapLive ? "" : "pointer-events-none"
                    }`}
                  />
                </div>

                {!mapLive && (
                  <button
                    type="button"
                    onClick={() => setMapLive(true)}
                    aria-label={page.cta_directions ?? page.hero_directions_label ?? "Map"}
                    className="absolute inset-0 rounded-2xl"
                  />
                )}

                {/* THE WORKSHOP ITSELF, lifted off the map's lower corner. The
                    ring is the page colour rather than a border - it is what
                    separates the photo from the map beneath it, not a line drawn
                    round it. Smaller on a phone - a quarter of a 348px map -
                    so it clears the pin, which the embed centres. */}
                {location.hero_image_url && (
                  <img
                    src={assetUrl(location.hero_image_url, { w: 560 })}
                    alt={page.hero_title}
                    className="absolute -bottom-6 start-4 aspect-[4/3] w-32 rounded-xl object-cover shadow-lg ring-4 ring-surface sm:-bottom-8 sm:start-6 sm:w-40 lg:-bottom-10 lg:w-56"
                  />
                )}
              </div>
            </Reveal>
          )}
        </div>

        {/* ================= THE FOUR FACTS =================
            ONE PANEL, FOUR CELLS, and the separators are a 1px `gap` showing the
            panel's own background rather than borders on the cells. Tailwind's
            `divide-x` is PHYSICAL: on an Arabic page it draws a rule down the
            outer edge of the last cell and none between the first two, and it
            breaks again the moment the grid wraps to two columns. A gap is right
            in both directions and at every count.

            THE HOURS CELL IS WHY THIS WAS WORTH REWRITING rather than moving.
            The old block used `opening_hours.label` as its heading and
            `opening_hours.day` as its value, so the panel read

              Sat - Thurs 09:00 AM – 01:00 PM, 02:00 PM – 06:00 PM
              Sat - Thurs
              09:00 AM – 01:00 PM, 02:00 PM – 06:00 PM

            - the whole sentence, then both halves of it again. `label` IS the
            two joined; the cell wants them apart. */}
        <Reveal delay={160} className="mt-16 lg:mt-20">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-line-subtle bg-line-subtle sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((f, i) => {
              const Glyph = f.icon;
              return (
                /* SMALLER THROUGHOUT. The values were `text-subheading` -
                   22px at a 1280 viewport - which is a HEADING size on a line
                   of contact detail, and it showed the moment EVS Dubai's
                   address grew to its full form and wrapped to three lines of
                   it. These four cells are reference: read once, when you
                   need them. `text-base` is a step and a half down and still
                   the largest thing in the cell. The badge and the padding
                   come down with it so the proportions hold. */
                <div key={i} className="bg-surface-raised p-5 lg:p-6">
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-line-subtle text-brand-500">
                    <Glyph className="h-3.5 w-3.5" />
                  </span>

                  {f.label && (
                    <p className="mt-4 text-eyebrow font-semibold tracking-[0.14em] text-content-muted uppercase">
                      {f.label}
                    </p>
                  )}

                  {/* THE VALUE SITS 10px UNDER ITS HEADING, not 4. At `mt-1` the
                      eyebrow and the value read as one block of text rather than
                      as a label and the thing it labels - and the eyebrow is
                      12px, so there is very little of it to separate them.

                      `address_html` IS HTML and is still rendered as such: the
                      Arabic addresses wrap their Latin digits in spans to force
                      a Latin face and LTR inside RTL text, and as plain text
                      those tags would show. */}
                  {f.href ? (
                    <a
                      href={f.href}
                      target={f.external ? "_blank" : undefined}
                      rel={f.external ? "noopener noreferrer" : undefined}
                      className={`mt-2.5 block text-base text-content transition-colors duration-200 hover:text-brand-500 ${
                        f.latin ? "evs-latin" : ""
                      }`}
                      dangerouslySetInnerHTML={{ __html: f.html }}
                    />
                  ) : f.lines ? (
                    <p className="mt-2.5 text-content">
                      {f.lines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </p>
                  ) : (
                    <p className="mt-2.5 text-content">{f.html}</p>
                  )}

                  {f.note && <p className="mt-2 text-sm text-content-muted">{f.note}</p>}

                  {f.cta && (
                    <a
                      href={f.href}
                      target={f.external ? "_blank" : undefined}
                      rel={f.external ? "noopener noreferrer" : undefined}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-500 underline underline-offset-4 transition-colors duration-200 hover:text-brand-300"
                    >
                      {f.cta}
                      <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </Reveal>
      </section>

      <ServiceStrip variant={variant} locale={locale} />

      {/* The three shared blocks, in the order the legacy page ended with.

          StatsBand NOW GETS ITS TOKENS AND ITS COUNT. It was the only one of
          the six call sites that passed neither - the home page, /about, the
          brands hub, a brand page and the warranty page all do - so the
          "Branches" figure was filtered out and the four-column band rendered
          three figures and an empty cell. That hole is what the omission
          actually looked like on the page.

          Both values were already on `page`, built by lib/locations.js and
          used by the blocks below; they simply were not handed over. The
          earlier note here reasoned that supplying them would change what the
          live pages say - it does, and what they say now is what every sibling
          page already said. */}
      <ReviewsSection
        locale={locale}
        branch={branch}
        reviews={page.reviews ?? []}
        sections={page.sections}
      />

      <StatsBand
        locale={locale}
        tokens={page.tokens}
        branchCount={(page.locations ?? []).length}
        sections={page.sections}
      />

      <BranchesSection
        locale={locale}
        branch={branch}
        locations={page.locations ?? []}
        sections={page.sections}
      />
    </div>
  );
}


/**
 * The number as the page prints it.
 *
 * STORED, NOT DERIVED. A formatter was written first and it disagreed with five
 * of the nine pages: they print "+971 056 601 7771", keeping the local trunk 0
 * that is redundant after a country code, while the other four print
 * "+971 56 986 3920". No rule produces both, so any rule silently restyles some
 * live pages.
 *
 * `branches.support_phone_display` exists for exactly this reason - 0042 had to
 * accept a visible format change on a live page for want of it - so this is the
 * same column one level down. `phone` stays E.164 because that is what tel: and
 * schema.org want.
 */
const displayPhone = (location, fallback) =>
  location.phone_display || location.phone || fallback;
