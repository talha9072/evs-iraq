import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * The "EVS Express" mark, wherever an Express bay is listed.
 *
 * WHY IT IS A COMPONENT AND NOT A CLASSNAME. Express bays appear in five
 * places - the workshop cards, the header's Branches sheet, the hamburger, the
 * contact page's cards and the workshop's own page - and until now only one of
 * them said so. A visitor reading the header's branch list saw "EVS DUBAI - AL
 * BARSHA" next to "EVS DUBAI" in the same type with nothing between them, which
 * hides the single most useful thing to know before driving to one.
 *
 * WHAT DECIDES IT IS `variant`, NEVER THE ABSENCE OF A PHOTOGRAPH. The card
 * used to show this badge whenever a row had no `hero_image_url`, which was
 * right by accident - the four rows with no photo were the four Express bays.
 * 0101-0103 then photographed every workshop, and the badge quietly vanished
 * from the entire site: eleven rows with photos, no rule left to fire. Nothing
 * announced it, because a missing badge looks exactly like a card that never
 * had one. `variant` has been on the row the whole time.
 *
 * THE WORDING IS THE DATABASE'S, NOT MINE. `page_content.hero_eyebrow` on the
 * four Express pages already reads "EVS Express" in English and
 * "إي في إس إكسبريس" in Arabic, so those are the two strings here - copied,
 * not invented. Bengali has no Express page and therefore no authored wording,
 * so it falls back to English rather than to a guess; the moment a Bengali row
 * exists, this table is where it goes.
 */

const COPY = {
  en: "EVS Express",
  ar: "إي في إس إكسبريس",
};

const SIZES = {
  /* Menus and list rows, beside a label already set at 15-18px. */
  sm: "px-1.5 py-0.5 text-[0.625rem] tracking-[0.12em]",
  /* Cards and page heads, where it is the loudest thing in the block. */
  md: "px-2.5 py-1.5 text-eyebrow tracking-[0.14em]",
};

export default function ExpressTag({
  size = "sm",
  locale = DEFAULT_LOCALE,
  /** An authored string that should win - the workshop page passes its own. */
  label = null,
  className = "",
}) {
  const text =
    label || COPY[locale] || COPY[String(locale).split("-")[0]] || COPY.en;

  return (
    <span
      className={[
        "inline-flex w-fit shrink-0 items-center rounded-sm bg-brand-500 font-semibold whitespace-nowrap text-content-inverse uppercase",
        SIZES[size] ?? SIZES.sm,
        className,
      ].join(" ")}
    >
      {text}
    </span>
  );
}

/** True for a row or card that is an Express bay, whatever shape it arrives in. */
export const isExpress = (row) =>
  row?.variant === "express" || row?.express === true;
