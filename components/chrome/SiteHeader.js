import { useEffect, useRef, useState } from "react";
import { liveLinks } from "@/lib/routes";
import { DEFAULT_LOCALE, LOCALES, isRtl } from "@/lib/locale";
import useNav from "@/components/nav/useNav";
import { hasSos } from "@/lib/features";
import { assetUrl } from "@/lib/images";
import { ArrowRight, Chevron, Close, Menu } from "@/components/chrome/icons";
import ExpressTag, { isExpress } from "@/components/modern/ExpressTag";

/**
 * The flag this deployment flies.
 *
 * IT WAS `/images/uae-flag.svg`, WRITTEN TWICE - once in the bar and once in
 * the drawer - so evsqtr.com and evsoman.com flew the UAE's flag in their own
 * header. The same class of bug as `lib/blogs.js` hard-coding evsuae.com, and
 * the same fix: the value follows the branch.
 *
 * KEYED ON AN ISO 3166-1 ALPHA-2 CODE, NOT ON A LIST IN CODE. The first version
 * mapped the five branch slugs to five files, which works until a sixth country
 * is onboarded and then quietly renders nothing until someone remembers this
 * file. `public/img/flags` holds EVERY country - all 251 codes, 117 KB for the
 * set - so a new country needs no change here at all.
 *
 * TWO SOURCES, IN THIS ORDER, AND THE ORDER IS THE FIX:
 *
 *   1. `NEXT_PUBLIC_COUNTRY_CODE`, inlined at build time. Server-rendered, so
 *      the flag is in the first paint and cannot be wrong.
 *   2. `branches.country_code`, which arrives with the nav fetch.
 *
 * The second alone was what shipped first, and it was subtly broken: /api/nav
 * is sent with `public, s-maxage=3600, stale-while-revalidate=86400`, which is
 * right for production - one deployment serves one country forever - but means
 * a browser that has the menu cached keeps the OLD country's flag after the
 * branch changes. Switching a dev server from uae to oman kept flying the UAE
 * flag for an hour. It is also a network round-trip for a 22px image that the
 * build already knows.
 *
 * So the env var leads and the DB value is the fallback: a deployment that sets
 * the variable gets it instantly and correctly, and one that forgets still ends
 * up right a moment later rather than showing nothing.
 *
 * PNG, NOT SVG, and that is a measurement rather than a preference. These were
 * downloaded as SVG first: most were under 1.2 KB, and OMAN WAS 175 KB - the
 * khanjar emblem is several hundred paths, none of which survives being drawn
 * 14 pixels tall. At 80px wide (2x the 22px this paints at) the average flag is
 * 476 bytes and the largest is under 4 KB. Vector is the wrong format for an
 * illustration displayed smaller than its own detail.
 *
 * IT WAS `alt=""`, ON THE GROUNDS THAT IT IS DECORATIVE - the "AR"/"EN" beside
 * it already names the link, so a screen reader loses nothing. That reasoning
 * holds for a screen reader and not for a crawler: the image is INSIDE the
 * switch link, and Ahrefs counted it as an unlabelled linked image on every one
 * of the site's 323 pages. It was the whole of the "Missing alt text" figure.
 *
 * So it takes the target language's endonym instead - see `name` in LANGUAGES.
 * That is a fact about the image (this is the flag for العربية) rather than a
 * repetition of the label next to it.
 *
 * `width`/`height` are set even though the src arrives with the nav fetch, so
 * the box is reserved and the row does not shift when it lands.
 */
/** Inlined by Next at build time, so this is a constant for the deployment. */
const ENV_COUNTRY = (process.env.NEXT_PUBLIC_COUNTRY_CODE || "").trim();

/**
 * The language switch, for whatever languages this deployment publishes.
 *
 * IT WAS TWO HARD-CODED STRINGS: `startsWith("ar") ? "en" : "ar"` for the
 * target and a `switchTo` label of "AR"/"EN" in the locale table. That works on
 * the three Gulf sites and nowhere else - Bangladesh publishes `en,bn`, so its
 * English page offered a link to Arabic, which it does not have, and labelled
 * it "AR". Iraq publishes `en,ar-IQ` and had the same problem.
 *
 * `LOCALES` is the deployment's own list (NEXT_PUBLIC_LOCALES), so the target is
 * simply the NEXT entry, cycling. With the usual two that is "the other one";
 * with three, repeated clicks walk the list rather than always jumping back to
 * the first. `_app.js` already routes any `data-locale` it recognises, so
 * nothing there changes.
 *
 * THE FLAG IS THE LANGUAGE'S, NOT THE COUNTRY'S. This is the switch to another
 * LANGUAGE, so a Qatar flag beside "EN" said nothing - it was the flag of the
 * site you are already on. `en` gets gb; `bn` gets bd; `ar-IQ` gets iq. Plain
 * `ar` has no flag of its own, and on these sites Arabic IS the local language,
 * so it takes the deployment's own country - which is the one case where the
 * country flag is the right answer.
 */
/*
 * `name` IS THE FLAG'S ALT TEXT, and it is why this column exists.
 *
 * The flag carried `alt=""` - defensible, since the "AR"/"EN" beside it
 * already names the link. Ahrefs disagreed on all 323 pages at once: the
 * image sits INSIDE the switch link, and a linked image with no alt
 * contributes nothing to what that link is about. It was the single image
 * behind the site's entire "Missing alt text" count - one per page, always
 * this one.
 *
 * The endonym rather than the English name - "العربية", not "Arabic" - which
 * is what a language switcher shows everywhere for a good reason: somebody
 * looking for their own language recognises it written in itself. It also
 * makes the alt say something the visible "AR" does not, instead of
 * repeating it.
 */
const LANGUAGES = {
  en: { label: "EN", name: "English", flag: "gb" },
  ar: { label: "AR", name: "العربية", flag: null },
  "ar-IQ": { label: "AR", name: "العربية (العراق)", flag: "iq" },
  bn: { label: "BN", name: "বাংলা", flag: "bd" },
};

function languageOf(locale) {
  return LANGUAGES[locale] ?? LANGUAGES[String(locale).split("-")[0]] ?? null;
}

/** The next language in this deployment's list, or null when there is only one. */
function nextLocale(locale) {
  if (LOCALES.length < 2) return null;
  const at = LOCALES.indexOf(locale);
  return LOCALES[(at + 1) % LOCALES.length] ?? null;
}

/**
 * ONE FLAG, AND NOT EVERY FLAG IS THE SAME SHAPE.
 *
 * This carried `width="22" height="14"` - a 1.571 box - which is the ratio of
 * no flag in the set. They are 80px wide and whatever tall the country's own
 * proportions are: the UAE and the UK are 2:1, Qatar is 2.581:1 (the widest
 * national flag there is), Oman 1.739:1, Bangladesh 1.667:1. Lighthouse
 * compares the rendered box against the file's own ratio and reported it, and
 * it was right to: Qatar's flag was being squeezed by 40% of its width.
 *
 * The footer's flag list does not have this problem because it sets
 * `object-cover`, which crops rather than squashes and which the audit skips.
 * Cropping is right for thirty tiny rectangles in a list and wrong for the one
 * flag in the header, where the country mark should be the country's shape.
 *
 * SO THE BOX MOVES TO A WRAPPER. The span reserves 24x14 whatever loads, which
 * is what the width/height attributes were there for - the row must not shift
 * when a 500-byte PNG lands - and the image inside is bounded by `max-*` rather
 * than sized, so it keeps its own ratio and simply fits. A 2.581:1 flag ends up
 * 24x9.3, a 1.667:1 flag 23.3x14. Both are the shape they should be.
 */
function Flag({ code, alt = "", className = "" }) {
  const iso = code;
  if (!iso) return null;
  return (
    <span
      className={`inline-flex h-3.5 w-6 flex-none items-center justify-center ${className}`}
    >
      <img
        src={`/img/flags/${String(iso).toLowerCase()}.png`}
        alt={alt}
        className="max-h-full max-w-full rounded-[1px] ring-1 ring-line-subtle"
      />
    </span>
  );
}

/**
 * The header for redesigned routes — one component for every language.
 *
 * WHY ONE FILE. `Header.js` and `HeaderAr.js` are 289 and 316 lines of the same
 * markup with the physical spacing utilities swapped by hand, and they had
 * already drifted. Everything here is logical (`ms-`/`me-`, `start`/`end`,
 * `ps-`/`pe-`), so direction is `dir` on the document and nothing else. Adding a
 * third language costs one entry in the label table below.
 *
 * WHAT IT REPLACES BEHAVIOURALLY. The legacy header's dropdowns are opened by
 * Crafto's `main.js` binding jQuery handlers, plus a `bindDropdowns()` call to
 * re-bind the items that arrive later from /api/nav. None of that exists here —
 * the menus are React state, so there is nothing to re-bind and no ordering
 * problem when the fetch resolves.
 *
 * The desktop submenu bug documented in evs.css:618 cannot recur either: the
 * panels are absolutely positioned and never reflow their parent, so no item
 * moves out from under the cursor.
 */

/** Nav labels per language. The only thing that varies between locales. */
const LABELS = {
  en: {
    home: "Home",
    services: "Services",
    warranty: "Warranty",
    sos: "Roadside Assistance",
    brands: "EV Car Brands",
    branches: "Branches",
    about: "About EVS",
    faqs: "FAQs",
    book: "Get Opening Updates",
    menu: "Menu",
    close: "Close menu",
    contact: "Contact",
  },
  ar: {
    home: "الرئيسية",
    services: "خدماتنا",
    warranty: "الضمان",
    sos: "المساعدة على الطريق",
    brands: "ماركات السيارات الكهربائية",
    branches: "الفروع",
    about: "عن إي في إس",
    faqs: "الأسئلة الشائعة",
    book: "أبلغني عند الافتتاح",
    menu: "القائمة",
    close: "إغلاق القائمة",
    contact: "تواصل معنا",
  },
};

/**
 * Exported because the workshop pages' BreadcrumbList needs the same word the
 * nav shows - "Branches" / "الفروع". A second table would have been a second
 * thing to translate and a second thing to forget.
 */
export function labelsFor(locale) {
  return LABELS[locale] ?? LABELS[String(locale).split("-")[0]] ?? LABELS.en;
}

export default function SiteHeader({ locale = DEFAULT_LOCALE, rtl = false }) {
  const p = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  const t = labelsFor(locale);
  const nav = useNav(locale);

  /** Which desktop dropdown is open, by key. Null closes everything. */
  const [openMenu, setOpenMenu] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  /** Past the fold — the bar gains a background so it stays readable. */
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);

  /* The bar is transparent over the hero and solid once the page moves. 8px is
     far enough to be deliberate and close enough that it never looks late. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* A dropdown closes on outside click and on Escape. Escape also closes the
     drawer, which is the behaviour a keyboard user expects from both. */
  useEffect(() => {
    const onDown = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setOpenMenu(null);
    };
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpenMenu(null);
      setDrawerOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  /* An open drawer locks the page behind it. Restoring the previous value rather
     than clearing it means this cannot fight anything else that sets overflow. */
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  /** The five nav entries that can carry a dropdown, built from the DB lists. */
  const menus = [
    { key: "services", label: t.services, href: `${p}/services`, items: nav.services },
    { key: "warranty", label: t.warranty, href: `${p}/extended-warranties` },
    ...(hasSos() ? [{ key: "sos", label: t.sos, href: `${p}/sos` }] : []),
    { key: "brands", label: t.brands, href: `${p}/ev-car-brands`, items: nav.brands },
    { key: "branches", label: t.branches, href: `${p}/branches`, items: nav.branches },
    { key: "about", label: t.about, href: `${p}/about` },
    { key: "faqs", label: t.faqs, href: `${p}/frequently-asked-questions` },
  ];

  const liveMenus = liveLinks(menus);

  const activeMenu = liveMenus.find((m) => m.key === openMenu && m.items?.length > 0) ?? null;

  /* The language switch, derived from this deployment's own locale list rather
     than from a hard-coded en/ar pair - see the note above LANGUAGES. The
     country code falls back to the nav payload where the env var is unset, and
     is used only for plain `ar`, whose flag is the country's. */
  const countryCode = ENV_COUNTRY || nav.footer?.countryCode || null;
  const target = nextLocale(locale);
  const targetLang = target ? languageOf(target) : null;
  const targetLabel = targetLang?.label ?? String(target ?? "").toUpperCase();
  const targetFlag = targetLang?.flag ?? countryCode;
  const targetName = targetLang?.name ?? targetLabel;

  return (
    /* THE DRAWER IS A SIBLING OF THE HEADER, NOT A CHILD, and that is a fix
       rather than tidying.

       `backdrop-filter` creates a CONTAINING BLOCK for fixed-position
       descendants - the same rule `transform` and `filter` follow. The header
       gains `backdrop-blur-xl` whenever `scrolled || drawerOpen || openMenu`,
       so OPENING THE DRAWER is what put the blur on, and the blur is what
       trapped the drawer inside the header's own 4.5rem box. Its `fixed
       inset-y-0 end-0` stopped meaning "the viewport" and started meaning "the
       header", so the panel was clipped to a strip under the logo and the page
       showed straight through where the rest of it should have been.

       Nothing about the drawer was wrong; it was measured against the wrong
       box. Moving it out of the header restores the viewport as its containing
       block, and the header keeps its blur. */
    <>
    <header
      ref={headerRef}
      onMouseLeave={() => setOpenMenu(null)}
      className={[
        "fixed inset-x-0 top-[var(--evs-notice-h,0px)] z-50 transition-colors duration-300 ease-out",
        scrolled || drawerOpen || openMenu
          ? "border-b border-line-subtle bg-surface/85 backdrop-blur-xl"
          : /* Transparent over the hero, but NOT bare. Every hero on the site is
               a photograph or a video, and several of them - the workshop pages
               especially - are bright along their top edge, where the nav sits.
               A short top-down wash costs nothing over a dark frame and is what
               keeps the links legible over a light one, so the bar never depends
               on which image a row happens to point at. */
            "border-b border-transparent bg-linear-to-b from-surface-sunken/70 to-transparent",
      ].join(" ")}
    >
      <div className="evs-shell flex h-18 items-center gap-4">
        {/* Logo */}
        <a href={p || "/"} className="flex-none" aria-label="EVS">
          <img src="/img/EVS-logo.svg" alt="EVS" width="96" height="36" className="h-8 w-auto" />
        </a>

        {/* ---------- DESKTOP NAV ---------- */}
        {/* HOME IS BACK, by request. It was removed on the argument that the logo
            beside it already goes home - true, and not the whole story: the logo
            is a mark, and a reader scanning a row of words does not always read
            it as one of them. Restored, and the bar still fits at `xl` with the
            language switch and the CTA. */}
        <nav className="ms-auto hidden items-center gap-1 xl:flex" aria-label="Primary">
          <a
            href={p || "/"}
            className="rounded-sm px-3 py-2 font-display text-[1.0625rem] tracking-[0.01em] whitespace-nowrap text-content uppercase transition-colors duration-200 hover:text-brand-500"
          >
            {t.home}
          </a>

          {liveMenus.map((menu) =>
            menu.items ? (
              <div
                key={menu.key}
                onMouseEnter={() => setOpenMenu(menu.key)}
              >
                <a
                  href={menu.href}
                  aria-expanded={openMenu === menu.key}
                  aria-haspopup="true"
                  onClick={() => setOpenMenu(null)}
                  className="flex items-center gap-1.5 rounded-sm px-3 py-2 font-display text-[1.0625rem] tracking-[0.01em] whitespace-nowrap text-content uppercase transition-colors duration-200 hover:text-brand-500"
                >
                  {menu.label}
                  <Chevron
                    className={`h-3 w-3 transition-transform duration-200 ${
                      openMenu === menu.key ? "rotate-180" : ""
                    }`}
                  />
                </a>

              </div>
            ) : (
              <a
                key={menu.key}
                href={menu.href}
                className="rounded-sm px-3 py-2 font-display text-[1.0625rem] tracking-[0.01em] whitespace-nowrap text-content uppercase transition-colors duration-200 hover:text-brand-500"
              >
                {menu.label}
              </a>
            )
          )}
        </nav>

        {/* ---------- ACTIONS ---------- */}
        <div className="ms-auto flex items-center gap-2 xl:ms-0">
          {/* The language switch. `data-locale` is the convention _app.js listens
              for — it needs no change there to add a third language. Absent
              entirely on a deployment that publishes only one. */}
          {target && (
            <a
              href=""
              data-locale={target}
              className="hidden items-center gap-2 rounded-sm px-3 py-2 text-[0.8125rem] font-semibold tracking-[0.06em] text-content-muted uppercase transition-colors duration-200 hover:text-content sm:flex"
            >
              {targetLabel}
              <Flag code={targetFlag} alt={targetName} />
            </a>
          )}

          <a href={`${p}/contact`} className="evs-btn evs-btn-primary evs-btn-sm hidden whitespace-nowrap sm:inline-flex">
            {t.book}
          </a>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={t.menu}
            aria-expanded={drawerOpen}
            className="grid h-10 w-10 place-items-center rounded-sm text-content transition-colors duration-200 hover:bg-surface-elevated xl:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ---------- MEGA MENU ----------
          A sibling of the bar, not a child of a nav item: a full-width sheet
          cannot be positioned from inside a `relative` <li>. The header itself
          owns the hover-out, so travelling from the label down into the panel
          never crosses a gap that closes it. */}
      {activeMenu && (
        <MegaMenu
          menu={activeMenu}
          locale={locale}
          onNavigate={() => setOpenMenu(null)}
        />
      )}
    </header>

    <MobileDrawer
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      menus={liveMenus}
      home={p || "/"}
      contactHref={`${p}/contact`}
      t={t}
      rtl={rtl}
      locale={locale}
      footer={nav.footer}
      target={target}
      targetLabel={targetLabel}
      targetFlag={targetFlag}
      targetName={targetName}
    />
    </>
  );
}

/* ---------------------------------------------------------------------------
   MEGA MENU
   One sheet, three shapes, chosen by what the rows actually carry:

     brands    each item has `models`, so it prints as a column per brand with
               its models beneath — the whole tree at once, which is what the
               old nested fly-out was trying and failing to be.
     services  a flat list of five categories, so it prints as a card grid.
     branches  a flat list of workshops, same grid.

   The bug in evs.css:618 — where opening one brand's submenu reflowed the panel
   and moved the next brand out from under the cursor — cannot exist here: there
   is no second level to open.
   ------------------------------------------------------------------------ */
function MegaMenu({ menu, locale, onNavigate }) {
  const items = menu.items ?? [];
  const nested = items.some((item) => (item.models ?? []).length > 0);

  return (
    /* CAPPED AND SCROLLABLE, because the panel grew past the screen. The
       header is `fixed` and this sheet hangs off it, so once the brands
       filled more than one row the bottom of the list sat below the viewport
       with no way to reach it - the page behind scrolls, the panel does not.
       Measured at 21 brands: three rows, and the third was unreachable.

       `100vh - 4.5rem` is the screen minus the bar above it (`h-18`), so the
       sheet stops exactly where the window does and takes a scrollbar only
       when it actually needs one. `overscroll-contain` keeps the wheel inside
       it rather than scrolling the article underneath once it bottoms out. */
    <div className="hidden max-h-[calc(100vh-4.5rem)] overflow-y-auto overscroll-contain border-t border-line-subtle bg-surface/95 backdrop-blur-xl xl:block">
      <div className="evs-shell py-9">
        <div className="mb-7 flex items-baseline justify-between gap-6 border-b border-line-subtle pb-5">
          <span className="font-display text-heading text-content uppercase">{menu.label}</span>
          <a
            href={menu.href}
            onClick={onNavigate}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-500 transition-colors duration-200 hover:text-brand-300"
          >
            {menu.label}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {nested ? (
          <BrandRail items={items} onNavigate={onNavigate} />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {items.map((item) => (
              <a
                key={item.href ?? item.label}
                href={item.href}
                onClick={onNavigate}
                className="group flex items-center justify-between gap-3 rounded-md border border-line-subtle px-4 py-3.5 transition-colors duration-200 hover:border-brand-500 hover:bg-surface-elevated"
              >
                <span className="flex min-w-0 items-center gap-3">
                  {/* Masked, not <img>: the source SVGs have the old brand
                      green baked in. See .evs-icon-mask. */}
                  {item.icon && (
                    <span
                      aria-hidden="true"
                      className="evs-icon-mask h-6 w-6 flex-none text-brand-500"
                      style={{
                        WebkitMaskImage: `url(${item.icon})`,
                        maskImage: `url(${item.icon})`,
                      }}
                    />
                  )}
                  {/* THE SHEET USED TO SAY NOTHING. "EVS DUBAI - AL BARSHA" sat
                      beside "EVS DUBAI" in the same grid, in the same type, and
                      nothing distinguished a fast-service bay from a full
                      workshop - which is the one thing worth knowing before
                      driving to either. `express` is already on the row from
                      lib/nav.js; it was carried for a Litho class that no longer
                      styles anything.

                      UNDER THE NAME, NOT BESIDE IT. Beside it, the tag competed
                      with the label for a fixed-width cell and pushed the longer
                      names into three lines - "EVS ABU DHABI - AL MUSHRIF" broke
                      across three while its neighbour sat on one, so the row of
                      cards had three different heights. Stacked, every name gets
                      the full width it had before the tag existed. */}
                  <span className="flex min-w-0 flex-col items-start gap-1.5">
                    <span className="font-display text-lg leading-tight text-content uppercase transition-colors duration-200 group-hover:text-brand-500">
                      {item.label}
                    </span>
                    {isExpress(item) && <ExpressTag locale={locale} />}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 flex-none text-content-muted transition-all duration-200 group-hover:translate-x-1 group-hover:text-brand-500" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   THE BRAND RAIL
   A list of every marque on the left, the hovered marque's models on the right.

   WHAT IT REPLACES. Every brand printed its own column with its full model list
   beneath, all of them at once. That worked at six brands and broke at
   twenty-one, for a reason worth writing down: the columns have wildly
   different heights - BYD has eleven models, HUAWEI has none - and CSS grid
   rows are as tall as their tallest cell. One BYD column therefore set the
   height of the whole row it sat in, leaving six other brands floating above a
   block of empty space, and the sheet ran past the bottom of the screen.

   Splitting it fixes both at once. The rail is twenty-one short rows in two
   columns - every marque visible without scrolling, which is the thing the old
   layout was actually good at and worth keeping - and the models live in one
   pane whose height no longer depends on which brand you are looking at.

   HOVER, NOT CLICK. Moving the pointer down the rail flips the pane, so the
   whole catalogue can be read by sweeping the list rather than by twenty-one
   round trips. The rows are still LINKS, so a click goes to the brand page:
   hovering reveals, clicking navigates, and neither steals the other's job.

   `onFocus` mirrors `onMouseEnter` so a keyboard tabs through exactly what a
   mouse sweeps, and the pane follows the focus ring.

   NO NEW STRINGS. Everything in here is a brand name, a model name or an icon,
   so the panel needs no translation of its own - which is why the pane's link
   is the brand's own name rather than a "View all models" that would have to
   exist in LABELS in two languages and be missing in a third.
   ------------------------------------------------------------------------ */
/**
 * "BYD ATTO 3" under a heading that already says BYD is the brand twice.
 *
 * Every model row is stored with its marque in front of it - "Xiaomi SU7",
 * "Mercedes-Benz EQE", "بي واي دي سيل 06" - which is right on the model's own
 * page, where the name stands alone, and wrong in a pane titled with the
 * marque. Dropping the prefix leaves the part that distinguishes one row from
 * the next, which is all a menu is for.
 *
 * Only an exact prefix followed by a space is removed, so "Model 3" under
 * TESLA is untouched and a marque that happens to be a substring of its own
 * model cannot eat half the name. Falls back to the stored label, so the worst
 * case is what was on screen before.
 *
 * AND NOT WHEN WHAT IS LEFT IS ONLY DIGITS. Several of these marques name
 * their cars with a number and nothing else - ICAR 3, ROX 01, AVATR 6, MHERO
 * 817, LYNK & CO 900 - and "3" on its own is not a model name, it is a
 * numeral in a list. The test is for any letter in any script, so "ID.3",
 * "SU7" and "M9" still shorten while the bare numbers keep their marque.
 */
const shortName = (brand, model) => {
  const b = String(brand ?? "").trim();
  const m = String(model ?? "").trim();
  if (!b || !m) return m;
  if (!m.toLowerCase().startsWith(`${b.toLowerCase()} `)) return m;

  const rest = m.slice(b.length + 1).trim();
  return /\p{L}/u.test(rest) ? rest : m;
};

/* The first brand, so the pane is never empty on open. Deliberately NOT the
   brand of the page you are on: the panel opens under the cursor and the
   cursor is on its way into the rail, so what matters is that SOMETHING is
   showing, not which. */

function BrandRail({ items, onNavigate }) {
  const keyOf = (item) => item.href ?? item.label;

  const [activeKey, setActiveKey] = useState(() => (items[0] ? keyOf(items[0]) : null));
  const active = items.find((item) => keyOf(item) === activeKey) ?? items[0] ?? null;
  const models = active?.models ?? [];

  return (
    <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]">
      {/* ---------- THE RAIL ----------
          Two columns, because twenty-one rows in one column is taller than the
          models pane beside it and would leave the sheet unbalanced. At eleven
          rows a column it stays under the fold on a laptop.

          CSS COLUMNS, NOT `grid-cols-2`, and the difference is the whole point
          of the list. lib/nav.js sorts these A-Z because a menu is searched
          rather than browsed - but a two-column GRID fills across before it
          fills down, so the alphabet came out AITO | AVATR / BYD | DENZA and
          reading the left column alone skipped every other marque. `columns-2`
          fills top to bottom: A-to-M down the first column, M-to-Z down the
          second, which is how an index is read. */}
      <ul className="columns-2 gap-x-3">
        {items.map((item) => {
          const isActive = keyOf(item) === activeKey;
          const count = (item.models ?? []).length;

          return (
            <li key={keyOf(item)} className="break-inside-avoid">
              <a
                href={item.href}
                onMouseEnter={() => setActiveKey(keyOf(item))}
                onFocus={() => setActiveKey(keyOf(item))}
                onClick={onNavigate}
                aria-current={isActive ? "true" : undefined}
                className={[
                  /* The accent is on a border that is always THERE and only
                     changes colour, so the label never shifts sideways as the
                     highlight moves down the list. */
                  "group flex items-center gap-3 border-s-2 py-2 pe-4 ps-4 font-display text-[0.9375rem] uppercase transition-colors duration-150",
                  isActive
                    ? "border-brand-500 bg-surface-elevated text-brand-500"
                    : "border-transparent text-content hover:text-brand-500",
                ].join(" ")}
              >
                {item.logo && (
                  <img
                    src={item.logo}
                    alt={item.label}
                    className="h-5 w-auto max-w-10 object-contain"
                    loading="lazy"
                  />
                )}
                <span className="truncate">{item.label}</span>

                {/* The model count, which is the one piece of information the
                    old layout gave away for free and this one otherwise hides:
                    without it there is nothing to say that BYD holds eleven
                    pages and HUAWEI holds none until you hover each. */}
                {count > 0 && (
                  <span
                    className={[
                      "ms-auto text-[0.6875rem] tabular-nums transition-colors duration-150",
                      isActive ? "text-brand-500" : "text-content-muted",
                    ].join(" ")}
                  >
                    {count}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ul>

      {/* ---------- THE PANE ----------
          `min-h` rather than a fixed height: it stops the sheet resizing as you
          sweep from a brand with one model to a brand with eleven - which would
          move the rail out from under the cursor, the exact bug the old nested
          fly-out had - while still growing if a brand ever outgrows it. */}
      {active && (
        <div className="min-h-[19rem] rounded-lg border border-line-subtle bg-surface-raised/50 p-6">
          <a
            href={active.href}
            onClick={onNavigate}
            className="group inline-flex items-center gap-2.5 border-b border-line-subtle pb-4 font-display text-xl text-content uppercase transition-colors duration-200 hover:text-brand-500"
          >
            {active.logo && (
              <img
                src={active.logo}
                alt={active.label}
                className="h-7 w-auto max-w-20 object-contain"
                loading="lazy"
              />
            )}
            {active.label}
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 text-content-muted transition-all duration-200 group-hover:translate-x-1 group-hover:text-brand-500 rtl:-scale-x-100"
            />
          </a>

          {/* THE PHOTOGRAPH EARNS ITS PLACE HERE, which is not true of most
              images in menus. Half of these marques - MHERO, YANGWANG, VOYAH,
              iCAR - are unknown to a Gulf EV owner by name, and the whole
              question they are asking is "is that the thing I drive?". A car is
              recognised on sight in a way a name is not. It also fills the pane
              for AITO, which has one model and would otherwise be a heading
              over an acre of nothing.

              `assetUrl` so the CDN serves it at the ~240px it is shown at
              rather than the 1920px file on disk (lib/images.js). */}
          <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_15rem]">
            {models.length > 0 ? (
              /* Column-major, via CSS columns rather than grid: a grid fills
                 left to right, so eleven models read 1-2-3 / 4-5-6 across the
                 pane and the eye has to zig-zag. `columns` fills top to bottom,
                 which is how a list of names is read. `break-inside-avoid`
                 keeps a row whole when it lands on a column boundary. */
              <ul className="columns-2 gap-x-6">
                {models.map((model) => (
                  <li key={model.href ?? model.label} className="break-inside-avoid">
                    {/* `uppercase` is doing a second job here: the stored names
                        are inconsistent - "BYD Seal" next to "BYD SEAL 06 EV" -
                        because they were typed by different hands over two
                        years. Casing them in CSS makes the list read as one
                        thing without editing 64 rows, and matches the rail
                        above it. */}
                    <a
                      href={model.href}
                      onClick={onNavigate}
                      className="-mx-2 block rounded-sm px-2 py-1.5 text-sm tracking-[0.02em] text-content-secondary uppercase transition-colors duration-150 hover:bg-surface-elevated hover:text-brand-500"
                    >
                      {shortName(active.label, model.label)}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              /* HUAWEI and HUMMER have no model pages: their warranty covers
                 the marque rather than a list of cars (0058). An empty column
                 would read as a loading state, so the photo simply takes the
                 whole pane instead. */
              <div aria-hidden="true" />
            )}

            {active.image && (
              <img
                src={assetUrl(active.image, { w: 480 })}
                alt={active.label}
                loading="lazy"
                className="hidden aspect-[16/10] w-full rounded-md border border-line-subtle object-cover md:block"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   MOBILE DRAWER
   Full-height sheet from the inline-end edge, so it opens from the right in
   English and the left in Arabic without a second component.
   ------------------------------------------------------------------------ */
function MobileDrawer({ open, onClose, menus, home, contactHref, t, locale, footer, target, targetLabel, targetFlag, targetName }) {
  // The drawer only receives `locale`, not the `rtl` flag the outer header has.
  // Derived rather than threaded through: a prop that is not passed reads as
  // `undefined`, which is falsy, which is a phone number silently printing
  // backwards in Arabic and nothing saying so.
  const rtl = isRtl(locale);
  const [expanded, setExpanded] = useState(null);
  /** Which brand inside the open menu has its models showing. One at a time. */
  const [expandedItem, setExpandedItem] = useState(null);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-surface-sunken/80 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`fixed inset-y-0 end-0 z-50 flex w-[min(24rem,88vw)] flex-col border-s border-line-subtle bg-surface-raised transition-transform duration-300 ease-out xl:hidden ${
          open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="flex h-18 flex-none items-center justify-between border-b border-line-subtle px-5">
          <a href={home} onClick={onClose}>
            <img src="/img/EVS-logo.svg" alt="EVS" width="96" height="36" className="h-7 w-auto" />
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="grid h-10 w-10 place-items-center rounded-sm text-content transition-colors hover:bg-surface-elevated"
          >
            <Close className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile">
          <a
            href={home}
            onClick={onClose}
            className="block rounded-md px-3 py-3 font-display text-xl uppercase text-content transition-colors hover:bg-surface-elevated"
          >
            {t.home}
          </a>

          {menus.map((menu) => {
            const items = menu.items ?? [];
            const isOpen = expanded === menu.key;

            /* A parent with children is a link AND a disclosure: tapping the
               label goes to the hub page, tapping the chevron opens the list.
               The legacy drawer made the whole row a toggle, so the hub pages
               were unreachable from a phone. */
            return (
              <div key={menu.key} className="flex flex-col">
                <div className="flex items-stretch">
                  <a
                    href={menu.href}
                    onClick={onClose}
                    className="flex-1 rounded-md px-3 py-3 font-display text-xl uppercase text-content transition-colors hover:bg-surface-elevated"
                  >
                    {menu.label}
                  </a>
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : menu.key)}
                      aria-expanded={isOpen}
                      aria-label={menu.label}
                      className="grid w-11 place-items-center rounded-md text-content-muted transition-colors hover:bg-surface-elevated hover:text-content"
                    >
                      <Chevron className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>

                {isOpen && items.length > 0 && (
                  <ul className="mb-2 ms-3 border-s border-line-subtle ps-3">
                    {items.map((item) => {
                      const models = item.models ?? [];
                      const itemOpen = expandedItem === (item.href ?? item.label);

                      return (
                        <li key={item.href ?? item.label}>
                          {/* A SECOND DISCLOSURE, for the same reason the first
                              one exists. The drawer listed brands and stopped
                              there, so a phone could reach /byd but not
                              /byd/byd-seal - sixty-four pages with no route into
                              them from the menu, on the half of the traffic that
                              is mobile. The desktop panel shows models on hover;
                              a phone has no hover, so it gets a chevron.

                              Same split as the row above: the name is a link to
                              the brand, the chevron opens its models. */}
                          <div className="flex items-stretch">
                            <a
                              href={item.href}
                              onClick={onClose}
                              className="flex flex-1 items-center gap-2 rounded-sm px-3 py-2.5 text-sm text-content-secondary transition-colors hover:text-brand-500"
                            >
                              <span className="min-w-0 truncate">{item.label}</span>
                              {/* The same mark as the desktop sheet - half the
                                  traffic is on a phone, and this list was the
                                  half that had no way to tell the two apart. */}
                              {isExpress(item) && <ExpressTag locale={locale} />}
                            </a>
                            {models.length > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedItem(itemOpen ? null : item.href ?? item.label)
                                }
                                aria-expanded={itemOpen}
                                aria-label={item.label}
                                className="grid w-10 place-items-center rounded-sm text-content-muted transition-colors hover:bg-surface-elevated hover:text-content"
                              >
                                <Chevron
                                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                    itemOpen ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                            )}
                          </div>

                          {itemOpen && models.length > 0 && (
                            <ul className="mb-1 ms-3 border-s border-line-subtle ps-3">
                              {models.map((model) => (
                                <li key={model.href ?? model.label}>
                                  <a
                                    href={model.href}
                                    onClick={onClose}
                                    className="block rounded-sm px-3 py-2 text-[0.8125rem] text-content-muted uppercase transition-colors hover:text-brand-500"
                                  >
                                    {shortName(item.label, model.label)}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex-none space-y-3 border-t border-line-subtle p-5">
          <a href={contactHref} onClick={onClose} className="evs-btn evs-btn-primary w-full">
            {t.book}
          </a>

          <div className="flex items-center justify-between">
            {footer?.phoneDisplay && (
              <a href={`tel:${footer.phone}`} className="text-sm text-content-secondary transition-colors hover:text-brand-500">
                {/* LTR — see the note in HomePage. Without it the number reads
                    backwards in Arabic. */}
                <span className={rtl ? "evs-latin" : undefined} dir="ltr">
                  {footer.phoneDisplay}
                </span>
              </a>
            )}
            {/* The same target and flag the bar shows, passed in rather than
                worked out twice - the drawer is a separate component and two
                copies of this derivation is how the two switchers would end up
                disagreeing. */}
            {target && (
              <a
                href=""
                data-locale={target}
                className="flex items-center gap-2 text-[0.8125rem] font-semibold tracking-[0.06em] text-content-muted uppercase transition-colors hover:text-content"
              >
                {targetLabel}
                <Flag code={targetFlag} alt={targetName} />
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
