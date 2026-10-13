import notes from "@/data/launch-notes.json";
import { isRtl } from "@/lib/locale";

/**
 * The part of every page that is about Iraq and nowhere else.
 *
 * WHY THIS EXISTS. The service and brand copy on this site is shared with four
 * other EVS country sites. That is fine for the facts — a contactor fails the
 * same way in Muscat as in Baghdad — but it means a crawler sees 140 pages that
 * closely resemble pages already indexed on evsuae.com. Google's answer to
 * near-duplicates is to index one and ignore the rest, which is precisely the
 * state 334 pages across the existing EVS sites are already in.
 *
 * So each page carries a block of genuinely local material: the heat, the
 * humidity and the salt air, the causeway, the import mix, goEV.bh, the fact
 * that one site covers a 780km² island. None of it appears on another EVS site
 * because none of it is true anywhere else.
 *
 * Keyed most-specific-first — `brand:byd` before `default:brand` — so the pages
 * that matter most get bespoke copy and the long tail still gets something
 * Iraqi rather than nothing.
 */
export default function LocalNotes({ locale = "en", kind = "service", slug = "" }) {
  const base = String(locale).split("-")[0];
  const entry = notes[`${kind}:${slug}`] ?? notes[`default:${kind}`];
  const t = entry?.[base] ?? entry?.en;

  if (!t) return null;

  return (
    <section className="evs-shell evs-section-sm" dir={isRtl(locale) ? "rtl" : undefined}>
      <div className="evs-card p-8 md:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-display-3">{t.heading}</h2>
            {t.body.split("\n\n").map((para) => (
              <p key={para.slice(0, 40)} className="mt-5 leading-relaxed text-content-secondary">
                {para}
              </p>
            ))}
          </div>

          {t.points?.length > 0 && (
            <ul className="flex flex-col gap-4 border-t border-line-subtle pt-8 lg:border-s lg:border-t-0 lg:ps-8 lg:pt-0">
              {t.points.map((point) => (
                <li key={point.slice(0, 40)} className="flex items-start gap-3 text-sm leading-relaxed text-content-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
