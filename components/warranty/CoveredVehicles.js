"use client";

import { useMemo, useState } from "react";
import { isRtl } from "@/lib/locale";
import { ArrowUpRight } from "@/components/chrome/icons";

/**
 * "Is your EV covered?" - the warranty coverage grid.
 *
 * Rows from `warranties` (0058), one per covered model, grouped here into a card
 * per brand. Nothing about the list is in this file: brands, models, their order
 * and their documents all come from the table, so a country covering a different
 * set renders a different grid with no code change.
 *
 * THE COUNTS ARE DERIVED from the rows rather than written in. The reference
 * design says 64 models and the seed has 62, because two ZEEKR models are still
 * unconfirmed - a hardcoded 64 would have been wrong and silent about it.
 *
 * Search and filter are client-side over a few dozen strings. No debounce and no
 * fetch: filtering 62 items per keystroke is free, and a round trip per
 * character would be slower than what it replaced.
 */

const COPY = {
  en: {
    eyebrow: "Covered Vehicles",
    heading: "Is your EV covered?",
    badge: (b, m) => `${b} brands · ${m} models covered`,
    search: "Search your car — try 'Model 3', 'SU7', 'NIO'…",
    all: "All brands",
    models: (n) => `${n} ${n === 1 ? "model" : "models"}`,
    pdf: "Coverage PDF",
    empty: "No match. Try a brand name, or ask us — we cover more than we list.",
  },
  ar: {
    eyebrow: "المركبات المشمولة",
    heading: "هل مركبتك الكهربائية مشمولة؟",
    badge: (b, m) => `${b} ماركة · ${m} طرازًا مشمولًا`,
    search: "ابحث عن سيارتك — مثل 'Model 3' أو 'SU7'…",
    all: "كل الماركات",
    models: (n) => `${n} ${n === 1 ? "طراز" : "طرازات"}`,
    pdf: "وثيقة التغطية",
    empty: "لا توجد نتائج. جرّب اسم الماركة، أو تواصل معنا — تغطيتنا أوسع من هذه القائمة.",
  },
  bn: {
    eyebrow: "কভার করা গাড়ি",
    heading: "আপনার ইভি কি কভার করা আছে?",
    badge: (b, m) => `${b} ব্র্যান্ড · ${m} মডেল কভার করা`,
    search: "আপনার গাড়ি খুঁজুন — যেমন 'Model 3', 'SU7'…",
    all: "সব ব্র্যান্ড",
    models: (n) => `${n} মডেল`,
    pdf: "কভারেজ PDF",
    empty: "কোনো মিল নেই। ব্র্যান্ডের নাম দিয়ে দেখুন, বা আমাদের জিজ্ঞাসা করুন।",
  },
};

/**
 * Flat rows -> one entry per brand, order preserved.
 *
 * `pdfs` is the DISTINCT set of documents across the brand's models, because a
 * document covers a model group: Tesla has three across its six models and BYD
 * three across its eight. Where a brand resolves to exactly one, the card itself
 * links; where it resolves to several, only the model chips do - so nobody is
 * handed the Model 3 terms for a Model S.
 */
function groupByBrand(rows) {
  const out = new Map();

  for (const r of rows) {
    if (!out.has(r.brand)) out.set(r.brand, { name: r.brand, models: [] });
    out.get(r.brand).models.push({ name: r.model, pdf: r.pdf_path || null });
  }

  for (const b of out.values()) {
    b.pdfs = [...new Set(b.models.map((m) => m.pdf).filter(Boolean))];
  }
  return [...out.values()];
}

export default function CoveredVehicles({ rows = [], locale = "en" }) {
  const rtl = isRtl(locale);
  const t = COPY[locale] ?? COPY[String(locale).split("-")[0]] ?? COPY.en;

  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState(null);

  const brands = useMemo(() => groupByBrand(rows), [rows]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return brands
      .filter((b) => !brand || b.name === brand)
      .map((b) => {
        if (!q) return b;
        // A brand-name match keeps the whole card: someone typing "tesla" wants
        // Tesla's models, not an empty card because no model is called "tesla".
        if (b.name.toLowerCase().includes(q)) return b;
        const models = b.models.filter((m) => m.name.toLowerCase().includes(q));
        return models.length ? { ...b, models } : null;
      })
      .filter(Boolean);
  }, [brands, brand, query]);

  if (!rows.length) return null;

  return (
    <section className="evs-shell evs-section-sm" dir={rtl ? "rtl" : undefined}>
      {/* ---- heading, with the derived count on the far end ---- */}
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="evs-eyebrow mb-5">{t.eyebrow}</span>
          <h2 className="text-display-3">
            {t.heading}
            <span className="text-brand-500">.</span>
          </h2>
        </div>

        <span className="inline-flex flex-none items-center gap-2.5 rounded-full border border-line-subtle bg-surface-raised px-4 py-2 text-eyebrow font-semibold tracking-[0.12em] text-content uppercase">
          <span className="h-2 w-2 rounded-full bg-brand-500" />
          {t.badge(brands.length, rows.length)}
        </span>
      </div>

      {/* ---- search and brand filter ---- */}
      <div className="mb-10 rounded-lg border border-line-subtle bg-surface-raised p-5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search}
          aria-label={t.search}
          className="evs-field mb-5"
        />

        <div className="flex flex-wrap gap-2">
          <Chip active={!brand} onClick={() => setBrand(null)}>
            {t.all}
          </Chip>
          {brands.map((b) => (
            <Chip
              key={b.name}
              active={brand === b.name}
              onClick={() => setBrand(brand === b.name ? null : b.name)}
            >
              {b.name}
            </Chip>
          ))}
        </div>
      </div>

      {/* ---- the grid ---- */}
      {shown.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((b) => (
            <div key={b.name} className="evs-card flex flex-col p-5">
              <div className="mb-5 flex items-baseline justify-between gap-3 border-b border-line-subtle pb-4">
                <span className="font-display text-lg text-content uppercase">{b.name}</span>
                <span className="flex-none text-xs text-content-muted uppercase">
                  {t.models(b.models.length)}
                </span>
              </div>

              {/* EVERY MODEL IS ITS DOCUMENT'S LINK AGAIN. The Tailwind
                  conversion turned these into plain text and the coverage PDFs
                  became unreachable from this page - 56 of the 62 rows carry a
                  `pdf_path`, and the grouping below this file's header has been
                  computing `m.pdf` and `b.pdfs` the whole time with nothing
                  reading them.

                  A LINK LOOKS LIKE A LINK. Linked models are a step brighter
                  than the rest and carry a rule under them; the six rows with no
                  document stay flat text rather than becoming an anchor with
                  nowhere to go - which is still focusable and still looks
                  clickable, the defect Qatar's branch card shipped with. */}
              <ul className="mb-6 flex flex-col gap-2">
                {b.models.map((m) => (
                  <li key={m.name} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-brand-500" />
                    {m.pdf ? (
                      <a
                        href={m.pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${m.name} — ${t.pdf}`}
                        className="group/model inline-flex items-center gap-1.5 text-content underline decoration-line-strong underline-offset-4 transition-colors duration-200 hover:text-brand-500 hover:decoration-brand-500"
                      >
                        {m.name}
                        <ArrowUpRight
                          className="h-3 w-3 flex-none opacity-0 transition-opacity duration-200 group-hover/model:opacity-100 rtl:-scale-x-100"
                          aria-hidden="true"
                        />
                      </a>
                    ) : (
                      <span className="text-content-secondary">{m.name}</span>
                    )}
                  </li>
                ))}
              </ul>

              {/* ONE DOCUMENT FOR THE WHOLE BRAND: the card links too, so
                  clicking the brand is unambiguous. Brands whose models resolve
                  to several get no card-level link - BYD and Tesla have three
                  each and Xiaomi two, and a single link here would have to pick
                  one, handing someone the Model 3 terms for a Model S.
                  `mt-auto` keeps it on the card's floor whatever the model count,
                  so the fourteen that have one line up across the grid. */}
              {b.pdfs.length === 1 && (
                <a
                  href={b.pdfs[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 border-t border-line-subtle pt-4 text-xs font-semibold text-brand-500 uppercase transition-colors duration-200 hover:text-brand-300"
                >
                  {t.pdf}
                  <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden="true" />
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-line-subtle bg-surface-raised p-8 text-center text-content-muted">
          {t.empty}
        </p>
      )}
    </section>
  );
}

/**
 * A brand filter toggle.
 *
 * `aria-pressed` is what makes this a toggle rather than a link to a screen
 * reader, and it was already right - kept as it was. Only the styling moved
 * from inline `style` objects to tokens.
 */
function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase transition-colors duration-200 ${
        active
          ? "border-brand-500 bg-brand-500/12 text-brand-500"
          : "border-line text-content-secondary hover:border-content hover:text-content"
      }`}
    >
      {children}
    </button>
  );
}
