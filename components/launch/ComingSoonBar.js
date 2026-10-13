import { localePath, isRtl } from "@/lib/locale";
import { COMING_SOON } from "@/lib/static-data";

/**
 * The line that keeps the rest of the site honest.
 *
 * Every service page here is written in the present tense — "EVS repairs EV
 * charging ports in Baghdad" — because the copy is shared with four countries
 * where that sentence is simply true. In Iraq it is not true yet, and a
 * site that reads as open when it is not will take a booking it cannot honour
 * and burn the first customer it ever gets.
 *
 * So rather than rewrite 300 pages into the future tense, one persistent bar
 * states the position on every one of them. It is not dismissible: the moment
 * it can be closed, somebody reads the page without it.
 *
 * It disappears on its own when `coming_soon` is turned off in data/site.json,
 * which is the single switch that makes this a live site.
 */

const COPY = {
  en: {
    label: "Opening soon",
    text: "EVS Iraq is not open yet. These are the services the Baghdad centre will offer.",
    cta: "Get told when we open",
  },
  ar: {
    label: "قريباً",
    text: "لم يفتتح مركز إي في إس العراق بعد. هذه هي الخدمات التي سيقدمها مركز بغداد.",
    cta: "أبلغني عند الافتتاح",
  },
};

export default function ComingSoonBar({ locale = "en" }) {
  if (!COMING_SOON) return null;

  const t = COPY[String(locale).split("-")[0]] ?? COPY.en;
  const rtl = isRtl(locale);

  return (
    <>
      {/* The fixed header reads this to sit below the bar rather than over it. */}
      <style>{":root{--evs-notice-h:2.75rem}@media (max-width:640px){:root{--evs-notice-h:3.75rem}}"}</style>
    <div
      dir={rtl ? "rtl" : "ltr"}
      role="status"
      className="fixed inset-x-0 top-0 z-[70] border-b border-brand-500/30 bg-surface-sunken px-4 py-2.5 text-center"
    >
      <p className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-content">
        <span className="inline-flex items-center gap-2 font-semibold tracking-[0.14em] text-brand-500 uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
          {t.label}
        </span>
        <span className="text-content-secondary">{t.text}</span>
        <a href={localePath(locale, "contact")} className="font-semibold text-brand-500 underline underline-offset-4">
          {t.cta}
        </a>
      </p>
    </div>
    </>
  );
}
