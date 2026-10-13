import { DEFAULT_LOCALE, isRtl } from "@/lib/locale";
import { liveLinks } from "@/lib/routes";
import useNav from "@/components/nav/useNav";
import { hasSos } from "@/lib/features";
import { Clock, Globe, Mail, Phone, SOCIAL_ICONS } from "@/components/chrome/icons";
import OpeningHours from "@/components/modern/OpeningHours";

/**
 * The footer for redesigned routes — one component for every language.
 *
 * Replaces `Footer.js` and `FooterAr.js`. The legacy pair carried five
 * `col-lg-3` columns in a twelve-column grid, so Opening Hours wrapped to its
 * own line on every desktop; `target="_blank"` on links to our own pages; and a
 * `justify-xs-center` that fought the `align-items-center` beside it. All three
 * were reproduced faithfully during the DB migration because the brief then was
 * "change nothing visible". This is the redesign, so they are fixed.
 *
 * Per-country content still comes from `nav.footer` (lib/footer.js) — the
 * phone, email, social accounts, workshop list, sister sites and opening hours
 * are all rows. Only the section headings and the copyright line are in code,
 * because they do not grow when a workshop is added.
 */

const LABELS = {
  en: {
    quickLinks: "Quick links",
    locations: "Locations",
    network: "EVS network",
    hours: "Opening hours",
    contact: "Contact",
    social: "Follow",
    about: "About us",
    services: "Services",
    warranty: "Warranty",
    sos: "Roadside Assistance",
    blog: "Blog",
    franchise: "Franchise enquiries",
    privacy: "Privacy policy",
    rights: "All rights reserved.",
    craftedBy: "Website by",
  },
  ar: {
    quickLinks: "روابط سريعة",
    locations: "المواقع",
    network: "شبكة إي في إس",
    hours: "ساعات العمل",
    contact: "تواصل معنا",
    social: "تابعنا",
    about: "من نحن",
    services: "خدماتنا",
    warranty: "الضمان",
    sos: "المساعدة على الطريق",
    blog: "المدونة",
    franchise: "طلبات الامتياز",
    privacy: "سياسة الخصوصية",
    rights: "جميع الحقوق محفوظة.",
    craftedBy: "تصميم الموقع",
  },
};

function labelsFor(locale) {
  return LABELS[locale] ?? LABELS[String(locale).split("-")[0]] ?? LABELS.en;
}

/** A column heading. One place to change how all four look. */
function ColumnHeading({ children }) {
  return (
    <h2 className="mb-5 font-sans text-eyebrow font-semibold tracking-[0.18em] text-content-muted uppercase">
      {children}
    </h2>
  );
}

function FooterLink({ href, children, external = false }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-block py-1 text-[0.9375rem] text-content-secondary transition-colors duration-200 hover:text-brand-500"
    >
      {children}
    </a>
  );
}

export default function SiteFooter({ locale = DEFAULT_LOCALE }) {
  // Latin digits inside an Arabic paragraph need isolating — see the note in
  // HomePage. Without it `600 500 387` prints as `387 500 600`.
  const rtl = isRtl(locale);
  const p = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  const t = labelsFor(locale);
  const { footer } = useNav(locale);

  const quickLinks = liveLinks([
    { href: `${p}/about`, label: t.about },
    { href: `${p}/services`, label: t.services },
    { href: `${p}/our-network`, label: locale.startsWith("ar") ? "شبكة إي في إس" : "The EVS network" },
    { href: `${p}/extended-warranties`, label: t.warranty },
    ...(hasSos() ? [{ href: `${p}/sos`, label: t.sos }] : []),
    { href: `${p}/blog`, label: t.blog },
    { href: `${p}/franchise`, label: t.franchise },
  ]);

  return (
    <footer className="border-t border-line-subtle bg-surface-sunken">
      <div className="evs-shell evs-section-sm">
        {/* FOUR COLUMNS, AND THE LAST THREE ARE THE SAME WIDTH. It was a
            twelve-column grid carved 4 / 2 / 3 / 3, so Quick links was two
            thirds the width of Locations beside it and the three lists it holds
            never lined up - three headings at three different left edges, with
            the ragged gutters that come with them.

            `1.35fr` then three equal tracks says the thing the spans were trying
            to approximate: the brand column carries a logo, a phone number and
            an email address so it needs more room, and the three lists are
            peers. Named tracks rather than spans also means a fourth list would
            be one more `1fr` rather than a re-count of twelfths. */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-3 lg:grid-cols-[1.35fr_repeat(3,minmax(0,1fr))]">
          {/* ---- Brand + contact ---- */}
          <div className="order-1 col-span-2 md:col-span-3 lg:order-none lg:col-span-1">
            <a href={p || "/"} className="inline-block">
              <img src="/img/EVS-logo.svg" alt="EVS" width="150" height="56" className="h-11 w-auto" />
            </a>

            <div className="mt-7 flex flex-col gap-3">
              {footer.phoneDisplay && (
                <a
                  href={footer.phone ? `tel:${footer.phone}` : undefined}
                  className="group flex items-center gap-3 text-content transition-colors duration-200 hover:text-brand-500"
                >
                  <Phone className="h-4 w-4 flex-none text-brand-500" />
                  {/* tel: gets E.164, the label gets the local form. `evs-latin`
                      in Arabic only — it swaps in the Latin face along with the
                      isolation, which is right for digits in an Arabic block and
                      wrong for the display face in English. */}
                  <span
                    className={`text-xl ${rtl ? "evs-latin" : "font-display"}`}
                    dir="ltr"
                  >
                    {footer.phoneDisplay}
                  </span>
                </a>
              )}
              {footer.email && (
                <a
                  href={`mailto:${footer.email}`}
                  className="flex items-center gap-3 text-[0.9375rem] text-content-secondary transition-colors duration-200 hover:text-brand-500"
                >
                  <Mail className="h-4 w-4 flex-none text-brand-500" />
                  {footer.email}
                </a>
              )}
            </div>

            {footer.social.length > 0 && (
              <div className="mt-8">
                <ColumnHeading>{t.social}</ColumnHeading>
                <div className="flex items-center gap-2">
                  {footer.social.map((account) => {
                    const Glyph = SOCIAL_ICONS[account.key];
                    if (!Glyph) return null;
                    return (
                      <a
                        key={account.key}
                        href={account.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${footer.branchName ?? "EVS"} on ${account.key}`}
                        className="grid h-10 w-10 place-items-center rounded-sm border border-line-subtle text-content-secondary transition-colors duration-200 hover:border-brand-500 hover:text-brand-500"
                      >
                        <Glyph className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ---- Quick links ---- */}
          <nav aria-label={t.quickLinks} className="order-3 lg:order-none">
            <ColumnHeading>{t.quickLinks}</ColumnHeading>
            <ul className="flex flex-col">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* ---- Locations ----
              Internal links, so no target="_blank". The legacy footer opened
              every workshop page in a new tab. */}
          {/* THERE ARE NO WORKSHOPS TO LIST YET, and an empty column reads as a
              broken footer rather than a pre-launch one. Until the Baghdad
              centre opens, the column says where it is going and points at the
              one page that can actually take an enquiry. The list returns on
              its own the day getLocations() has rows. */}
          <nav aria-label={t.locations} className="order-4 lg:order-none">
            <ColumnHeading>{t.locations}</ColumnHeading>
            {footer.locations.length > 0 ? (
              <ul className="flex flex-col">
                {footer.locations.map((location) => (
                  <li key={location.href}>
                    <FooterLink href={location.href}>{location.label}</FooterLink>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col gap-2 text-sm text-content-muted">
                <span>{locale.startsWith("ar") ? "العراق — قريباً" : "Iraq — opening soon"}</span>
                <FooterLink href={`${p}/contact`}>
                  {locale.startsWith("ar") ? "أبلغني عند الافتتاح" : "Get told when we open"}
                </FooterLink>
              </div>
            )}
          </nav>

          {/* ---- Opening hours ----
              THE FOURTH COLUMN IS THE HOURS, and only the hours. EVS Network
              used to sit on top of them, which put the one practical thing in
              this footer - when can I turn up - underneath a list of other
              countries' websites, at the bottom of the lowest column.

              AND ON A PHONE IT IS THE SECOND THING, FULL WIDTH. Below `lg` the
              hours were the LAST cell of a two-column grid, about 90px wide, so
              "09:00 AM – 01:00 PM / 02:00 PM – 06:00 PM" broke across eight
              lines and the day label wrapped with it. The one fact somebody
              checks a footer for was the least readable thing in it, and it was
              underneath both lists.

              `order-2` puts it straight after the logo and above Quick links,
              Locations and the EVS Network block; `col-span-2 md:col-span-3`
              gives it the whole row, which is all the two shifts needed to sit
              on one line each. Every one of these is undone at `lg`, where the
              four columns are the right shape and the hours belong last. */}
          <div className="order-2 col-span-2 md:col-span-3 lg:order-none lg:col-span-1">
            <ColumnHeading>{t.hours}</ColumnHeading>
            <div className="flex items-start gap-3">
              <Clock className="mt-1 h-4 w-4 flex-none text-brand-500" />
              {!footer.hours.day ? (
                <span className="text-sm text-content-muted">
                  {locale.startsWith("ar") ? "تُعلن عند الافتتاح" : "Announced at opening"}
                </span>
              ) : (
              <OpeningHours
                day={footer.hours.day}
                time={footer.hours.time}
                closedDay={footer.hours.closedDay}
                closedNote={footer.hours.closedNote}
              />
              )}
            </div>
          </div>
        </div>

        {/* ---- EVS Network ----
            IT HAS TO SURVIVE THIRTY OF THEM. Four is today; the group expects
            far more countries, and that is what decides the shape. Anything that
            gives each entry a box - a column, a card, a ruled cell - is fine at
            four and is eight rows of panelling at thirty, the heaviest thing on
            the page for the least important.

            SO THEY WRAP LIKE WORDS. One flowing row of flagged names that
            reflows to whatever the count is: four sit on a line, thirty on three
            or four, and nothing about the block changes in between. No border,
            no cell, no arrow - at thirty entries each of those is multiplied by
            thirty.

            THE FLAGS ARE THE WHOLE IDEA. The ISO PNGs are already in
            /img/flags - 201 to 566 bytes each, downloaded for the header's
            country mark - and past about ten entries a flag is what makes the
            row scannable at all, because nobody reads thirty labels beginning
            "EVS".

            THEY ARE THEIR OWN COLOURS, ALWAYS. They were grey at rest and
            went colour under the pointer, on the argument that thirty grey
            flags stay one quiet row. That is the wrong trade: a flag greyed
            out is a flag you cannot identify, which is the one job it has
            here - and it made the row look disabled. Hover changes the TEXT
            and nothing else, so the marks are a constant and only the thing
            being pointed at moves.

            Worldwide is the group site rather than a country, so it has no
            flag; its globe is brand green and stays there - the same fixed
            green the phone and mail marks above it carry.

            NOT A FIFTH COLUMN. Beside the workshop list these read as more pages
            of this website, which is the one thing they are not: every entry
            leaves for another country. */}
        {footer.network.length > 0 && (
          <nav aria-label={t.network} className="mt-14 border-t border-line-subtle pt-10">
            <ColumnHeading>{t.network}</ColumnHeading>

            <ul className="flex flex-wrap items-center gap-x-7 gap-y-3">
              {footer.network.map((site) => (
                <li key={site.href}>
                  {/* Sister sites really are other origins, so these stay external. */}
                  <a
                    href={site.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 text-[0.9375rem] text-content-secondary transition-colors duration-200 hover:text-brand-500"
                  >
                    {site.code ? (
                      <img
                        src={`/img/flags/${site.code.toLowerCase()}.png`}
                        alt={site.label}
                        width="18"
                        height="12"
                        loading="lazy"
                        className="h-3 w-[1.125rem] flex-none rounded-[1px] object-cover ring-1 ring-white/15"
                      />
                    ) : (
                      <Globe className="h-3.5 w-3.5 flex-none text-brand-500" />
                    )}
                    {site.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* ---- Bottom bar ---- */}
      <div className="border-t border-line-subtle">
        <div className="evs-shell flex flex-col items-center justify-between gap-4 py-6 text-[0.8125rem] text-content-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} EVS — Electric Vehicle Services. {t.rights}
          </p>
          <div className="flex items-center gap-5">
            <a href={`${p}/privacy-policy`} className="transition-colors duration-200 hover:text-content">
              {t.privacy}
            </a>
            <span>
              {t.craftedBy}{" "}
              <a
                href="https://oasis-digital.ae"
                target="_blank"
                rel="noopener noreferrer"
                className="text-content-secondary transition-colors duration-200 hover:text-brand-500"
              >
                Oasis Digital
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
