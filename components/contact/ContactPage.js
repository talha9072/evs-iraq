import SeoHead from "@/components/services/SeoHead";
import ContactForm from "@/components/common/ContactForm";
import ContactCards from "@/components/contact/ContactCards";
import { contactJsonLd } from "@/lib/contact-seo";
import { DEFAULT_LOCALE, isRtl } from "@/lib/locale";
import { localised } from "@/lib/branches";
import Reveal from "@/components/modern/Reveal";
import OpeningHours from "@/components/modern/OpeningHours";
import { Clock, Mail, MessageCircle, Phone } from "@/components/chrome/icons";
import { assetUrl } from "@/lib/images";

/**
 * The contact page, head and body, for every language.
 *
 * It replaces `pages/contact/index.js` and `pages/ar/contact/index.js` - 302 lines
 * of the same markup twice. Comparing them first showed the usual result: identical
 * structure, and every difference one of the RTL pairs this codebase already handles
 * - `fw-700`/`fw-500`, and the send icon moving from `text-end` to `text-start`.
 *
 * EVERY WORD COMES FROM `page_content` (0072): the head, the h1, the WhatsApp button,
 * the "Send us a message" heading, and - through `labels` - the form's nine
 * placeholders and the cards' three prefixes. The phone button is not copy at all; it
 * is `branch.support_phone_display`, and the WhatsApp link is the branch's own
 * number, which used to be Dubai's on every country.
 */
export default function ContactPage({
  page,
  locations = [],
  /** The shared `section_content` row - see lib/sections.js. */
  sections,
  locale = DEFAULT_LOCALE,
}) {
  if (!page) return null;

  const rtl = isRtl(locale);
  const { branch, cities } = page;
  const labels = page.labels ?? {};

  /** The branch row already holds these as locale maps - see `localised`. */
  const hours = branch.opening_hours ?? {};

  /** Whether this country has any Express bays at all - Qatar has none. */
  const hasExpress = locations.some((row) => row.variant === "express");

  // wa.me wants the number without the leading +, and it is the branch's
  // WhatsApp line - the hardcoded one was Dubai's on every country.
  const waLink = branch.whatsapp_number
    ? `https://wa.me/${branch.whatsapp_number.replace(/[^\d]/g, "")}`
    : undefined;

  const body = (
    <div dir={rtl ? "rtl" : undefined}>
      {/* ================= HERO + FORM =================
          The form sits beside the heading rather than below it. This is the one
          page whose whole job is the form, so it is above the fold.

          WHAT WAS WRONG WITH IT. The left column was a headline and two buttons
          - about 160px of content - vertically CENTRED against a 367px form
          card, so the page opened with 103px of empty frame above the headline
          and another 103px below the buttons. Measured, not guessed. The
          headline started 100px BELOW the form's own heading, which is why the
          two halves never looked like one composition.

          THREE THINGS FIX IT, and none of them is decoration:

          IT STARTS AT THE TOP. `justify-center` is gone, so the h1 sits level
          with "Send us a message" and the two columns read as one row.

          THE COLUMN CARRIES THE REST OF THE CONTACT DETAILS. Mailbox and
          opening hours were on this page nowhere - a visitor who wanted to
          email rather than fill in a form had to go to the footer for the
          address, and the hours were not on the page at all. Both are rows on
          `branches`, both are already localised, and both are exactly what
          belongs beside a contact form. No new copy was invented for this: the
          address and the hours say what they are.

          THE FORM GETS SEVEN COLUMNS, not six. Its fields are a two-up grid in
          a 537px card, which made each field 221px - narrower than the
          placeholder inside it. At seven they are about 300px. */}
      <section className="evs-shell pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal from="start" className="lg:col-span-5">
            <h1 className="text-display-2 uppercase">
              {page.h1}
              <span className="text-brand-500">.</span>
            </h1>

            {/* THE DETAILS FIRST, THE BUTTONS AFTER THEM.

                The two buttons used to sit straight under the h1, with the
                mailbox and the hours below them - so the column read title,
                action, then more information, and a reader who had already
                acted was handed facts they no longer needed. Everything this
                page knows now comes first and the two things to DO close the
                column, which is also where the form's own Send button sits in
                the other half of the row.

                ONE SIZE FOR BOTH DETAILS. The address was `text-subheading`
                (22px) against the hours' 15px, for two lines of the same kind of
                thing - a contact detail with an icon beside it.

                THE ADDRESS MOVES TO THE HOURS' SIZE, not the other way round.
                The hours are `OpeningHours`, which the footer and the nine
                workshop pages also render, and its 15px is set inside that
                component - passing a size in from here would be two utilities
                of equal specificity fighting over the same property, and which
                won would be their order in the generated stylesheet rather
                than anything written here.

                `items-center`, NOT `items-start` WITH A NUDGE. Both rows were
                top-aligned with a `mt-0.5` on the badge, which cannot line the
                two up: the badge is 40px and a line of this text is 25px, so
                their centres are 7.5px apart before the 2px margin is added.
                Measured: the badge sat 9px below the middle of the address, and
                9px below the first line of the hours. Centring is exact at any
                size and needs no number to maintain. */}
            <div className="mt-10 flex flex-col gap-7 border-t border-line-subtle pt-9">
              {branch.support_email && (
                <div className="flex items-center gap-4">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-full border border-line-subtle text-brand-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <a
                    href={`mailto:${branch.support_email}`}
                    className="text-[0.9375rem] text-content transition-colors duration-200 hover:text-brand-500"
                  >
                    {branch.support_email}
                  </a>
                </div>
              )}

              {hours.day && (
                <div className="flex items-center gap-4">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-full border border-line-subtle text-brand-500">
                    <Clock className="h-4 w-4" />
                  </span>
                  <OpeningHours
                    day={localised(hours.day, locale)}
                    time={localised(hours.time, locale)}
                    closedDay={localised(hours.closed_day, locale)}
                    closedNote={localised(hours.closed_note, locale)}
                  />
                </div>
              )}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              {branch.support_phone && (
                <a href={`tel:${branch.support_phone}`} className="evs-btn evs-btn-primary evs-btn-lg">
                  <Phone className="h-4 w-4" />
                  {/* LTR — see the note in HomePage. Without it the number reads
                      backwards in Arabic. */}
                  <span className={rtl ? "evs-latin" : undefined} dir="ltr">
                    {branch.support_phone_display || branch.support_phone}
                  </span>
                </a>
              )}

              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="evs-btn evs-btn-secondary evs-btn-lg"
                >
                  <MessageCircle className="h-4 w-4" />
                  {page.whatsapp_label}
                </a>
              )}
            </div>
          </Reveal>

          <Reveal from="end" delay={100} className="lg:col-span-7">
            <div className="evs-card p-7 md:p-9">
              <h2 className="mb-7 text-heading uppercase">
                {labels.form?.heading?.before}{" "}
                <span className="text-brand-500">{labels.form?.heading?.highlight}</span>
              </h2>

              <ContactForm locale={locale} locations={locations} labels={labels.form} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= WORKSHOP CARDS =================
          TWO BLOCKS, EACH WITH A HEADING. The cards used to be one unlabelled
          grid of the standard workshops, and the Express bays were filtered out
          entirely - so on the UAE four of them were missing from the page whose
          whole job is telling someone where to go.

          THE HEADINGS ARE ROWS, not words written here. "Our Branches" is
          `section_content.branches.heading`, which the /branches page and the
          shared branches block have used since 0065; "Local Branches" is its
          pair, added by 0094.

          EACH BLOCK RENDERS ONLY IF IT HAS BOTH ITS HEADING AND SOMETHING TO
          PUT UNDER IT. Qatar has one workshop and it is standard, so its
          Express block does not exist at all - a titled empty grid is worse
          than no grid. The same guard covers the gap before 0094 runs. */}
      <section className="evs-shell evs-section-sm">
        {sections?.branches?.heading && (
          <Reveal className="mb-8">
            <h2 className="text-display-3">
              {sections.branches.heading}
              <span className="text-brand-500">.</span>
            </h2>
          </Reveal>
        )}

        <Reveal stagger={70} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <ContactCards
            locale={locale}
            branch={branch}
            locations={locations}
            labels={labels.cards}
          />
        </Reveal>
      </section>

      {hasExpress && sections?.branches?.local && (
        <section className="evs-shell evs-section-sm pt-0">
          <Reveal className="mb-8">
            <h2 className="text-display-3">
              {sections.branches.local}
              <span className="text-brand-500">.</span>
            </h2>
          </Reveal>

          <Reveal stagger={70} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ContactCards
              locale={locale}
              branch={branch}
              locations={locations}
              labels={labels.cards}
              variant="express"
            />
          </Reveal>
        </section>
      )}
    </div>
  );

  return (
    <>
      <SeoHead
        locale={locale}
        branch={branch}
        cities={cities}
        path="contact"
        title={page.meta_title}
        description={page.meta_description}
        keywords={page.meta_keywords}
        jsonLd={contactJsonLd({ locale, branch, cities })}
      />

      {body}
    </>
  );
}
