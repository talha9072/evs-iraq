import extras from "@/data/launch-extras.json";
import Reveal from "@/components/modern/Reveal";
import { isRtl } from "@/lib/locale";

/**
 * Two more sections for every brand, model, category and service page.
 *
 * With `LocalNotes` these give each of the 143 inner pages three blocks of
 * material that exists nowhere else in the EVS estate. That matters for two
 * reasons: a page that is 90% shared copy is a near-duplicate of the page
 * already indexed on evsuae.com, and a page with one local block still reads as
 * a template with a paragraph bolted on.
 *
 * "Faults" is written as symptoms rather than part names on purpose — "the car
 * is completely dead", "range has quietly dropped" — because that is what an
 * owner types into Google, and it is the long tail a new domain can actually
 * win while the head terms are still out of reach.
 *
 * "Process" is honest about the centre not being open. It describes what a
 * visit will look like rather than inviting a booking that cannot be honoured.
 */

const HEAD = "text-display-3";

export default function PageExtras({ locale = "en", kind = "service" }) {
  const base = String(locale).split("-")[0];
  const faults = extras.faults[kind]?.[base] ?? extras.faults[kind]?.en ?? extras.faults.service.en;
  const process = extras.process[base] ?? extras.process.en;
  const rtl = isRtl(locale);

  return (
    <div dir={rtl ? "rtl" : undefined}>
      {/* --------------------------------------------------------- faults */}
      <section className="evs-shell evs-section-sm">
        <Reveal className="max-w-3xl">
          <span className="evs-eyebrow mb-5 inline-block">{faults.eyebrow}</span>
          <h2 className={HEAD}>
            {faults.heading}
            <span className="text-brand-500">.</span>
          </h2>
          <p className="mt-5 leading-relaxed text-content-secondary">{faults.intro}</p>
        </Reveal>

        <Reveal stagger={70} className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {faults.items.map((item) => (
            <div key={item.title} className="evs-card flex flex-col p-6">
              <h3 className="text-subheading text-content">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-content-secondary">{item.body}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* -------------------------------------------------------- process */}
      <section className="evs-shell evs-section-sm">
        <Reveal className="max-w-3xl">
          <span className="evs-eyebrow mb-5 inline-block">{process.eyebrow}</span>
          <h2 className={HEAD}>
            {process.heading}
            <span className="text-brand-500">.</span>
          </h2>
          <p className="mt-5 leading-relaxed text-content-secondary">{process.intro}</p>
        </Reveal>

        <Reveal stagger={80} className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-[12px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {process.steps.map((step) => (
            <div key={step.n} className="flex flex-col bg-surface-raised p-6">
              <span className="font-display text-display-3 text-brand-500/40">{step.n}</span>
              <h3 className="mt-4 text-subheading text-content">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-content-secondary">{step.body}</p>
            </div>
          ))}
        </Reveal>
      </section>
    </div>
  );
}
