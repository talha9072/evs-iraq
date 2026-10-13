import { localePath, isRtl } from "@/lib/locale";

/**
 * Where the launch form lands.
 *
 * Netlify posts the form and then redirects here, so this page is the only
 * confirmation the sender gets — which is why it says what will actually
 * happen rather than just "thanks". It is `noindex`: a confirmation page in
 * search results is a page that ranks for the brand and tells the searcher
 * nothing.
 */

const COPY = {
  en: {
    eyebrow: "Got it",
    heading: "Thanks — you are on the list.",
    body: "We will email you once, when the Baghdad centre opens. No newsletter, no drip campaign.",
    meanwhile: "In the meantime",
    services: "See what the centre will offer",
    network: "Where EVS already operates",
  },
  ar: {
    eyebrow: "تم",
    heading: "شكراً — أنت على القائمة.",
    body: "سنراسلك مرة واحدة فقط، عند افتتاح مركز بغداد. بلا نشرات بريدية ولا حملات متكررة.",
    meanwhile: "في هذه الأثناء",
    services: "اطّلع على خدمات المركز",
    network: "أين تعمل إي في إس اليوم",
  },
};

export default function LaunchThanks({ locale = "en" }) {
  const t = COPY[String(locale).split("-")[0]] ?? COPY.en;

  return (
    <div dir={isRtl(locale) ? "rtl" : undefined}>
      <section className="evs-shell evs-section">
        <div className="mx-auto max-w-2xl text-center">
          <span className="evs-eyebrow mb-6 inline-block">{t.eyebrow}</span>
          <h1 className="text-display-2 uppercase">{t.heading}</h1>
          <p className="mt-6 text-lead text-content-secondary">{t.body}</p>

          <p className="mt-12 text-sm font-semibold tracking-[0.14em] text-content-muted uppercase">
            {t.meanwhile}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
            <a href={localePath(locale, "services")} className="evs-btn evs-btn-primary">
              {t.services}
            </a>
            <a href={localePath(locale, "our-network")} className="evs-btn evs-btn-secondary">
              {t.network}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
