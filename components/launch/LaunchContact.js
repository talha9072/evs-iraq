import { useState } from "react";
import { useRouter } from "next/router";
import copy from "@/data/launch-contact.json";
import { localePath, isRtl } from "@/lib/locale";
import Accordion from "@/components/modern/Accordion";
import Reveal from "@/components/modern/Reveal";
import { ArrowRight, Mail, Loader2 } from "lucide-react";

/**
 * The only page on this site that asks the visitor for anything.
 *
 * WHAT IT DELIBERATELY DOES NOT HAVE: a phone number, an address, opening
 * hours, or LocalBusiness schema. There is no Iraq workshop yet. A
 * placeholder number misleads anyone who dials it, and a placeholder address is
 * how a Google Business Profile gets suspended on the day the real one is
 * finally claimed.
 *
 * SO THE FAQ IS THE PAGE'S REAL CONTENT. A contact page with no contact details
 * is a thin page, and thin pages do not get indexed. The six questions are the
 * ones somebody would otherwise ring to ask — when do you open, where will you
 * be, can I book, do you work on my car — which both answers them and gives the
 * page something to rank for. They are emitted as FAQPage so an answer can be
 * lifted straight into a result.
 *
 * THE FORM IS A NETLIFY FORM, AND IT IS NOT WIRED THE WAY THE DOCS FOR A PLAIN
 * STATIC SITE DESCRIBE IT. `data-netlify="true"` on this form is not enough and
 * actually breaks the deploy: Netlify registers forms by scanning STATIC HTML,
 * every page here is served by the Next.js runtime, and
 * @netlify/plugin-nextjs@5 refuses to build when it sees the attribute with no
 * static definition to back it ("Failed assembling prerendered content for
 * upload"). That is what killed deploy 6acdeb49.
 *
 * So the definition lives in `public/__forms.html` — a static, unlinked,
 * noindexed page whose only job is to declare the form's name and fields — and
 * this form POSTS TO THAT PATH. The documented pattern:
 * opennext.js.org/netlify/forms.
 *
 * Two submission paths, because a coming-soon site should not lose a lead to a
 * blocked script:
 *   with JS  — onSubmit sends the fields with fetch() and routes to /thank-you.
 *   without  — the browser posts natively to the same path, and Netlify sends
 *              the visitor to the `action` on the form in __forms.html.
 * The markup is in the static HTML either way, because the page is
 * getStaticProps, so the no-JS path really works rather than only sounding good.
 *
 * ANY FIELD ADDED BELOW MUST BE ADDED TO public/__forms.html TOO, in the same
 * commit. A field this form posts and that file does not declare is dropped
 * from the submission with no error anywhere. `company-website` is the
 * honeypot — hidden from people, filled in by bots — and the pairing is
 * configured there, not here.
 */

const EMAIL = "contact@evsworldwide.com";
const FORM_NAME = "iraq-launch-interest";
/* Where submissions are POSTed. The static definition file, not this page. */
const FORM_ENDPOINT = "/__forms.html";

const field =
  "w-full rounded-sm border border-line bg-surface-sunken px-4 py-3 text-content transition-colors placeholder:text-content-muted focus:border-brand-500 focus:outline-none";
const label = "mb-2 block text-sm font-semibold text-content";

export default function LaunchContact({ locale = "en" }) {
  const base = String(locale).split("-")[0];
  const t = copy[base] ?? copy.en;
  const rtl = isRtl(locale);
  const router = useRouter();

  /* "idle" | "sending" | "failed". Success is not a state — it navigates. */
  const [status, setStatus] = useState("idle");

  const faqItems = t.faqs.map((f) => ({ question: f.q, answer: f.a }));

  /**
   * Post the fields, then move the visitor on.
   *
   * FormData reads the real <form>, so the field list here can never drift
   * from the inputs; URLSearchParams gives the urlencoded body Netlify's form
   * handler expects. If the request fails the form is left exactly as the
   * visitor filled it and the error offers the mailbox instead — the one thing
   * that must not happen on a page whose only purpose is collecting leads is
   * losing what somebody typed.
   */
  async function handleSubmit(event) {
    event.preventDefault();
    if (status === "sending") return;

    const form = event.currentTarget;
    setStatus("sending");

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      if (!response.ok) throw new Error(`Netlify forms responded ${response.status}`);

      router.push(localePath(locale, "thank-you"));
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div dir={rtl ? "rtl" : undefined}>
      {/* ----------------------------------------------------------- lead */}
      <section className="evs-shell evs-section-sm">
        <Reveal className="max-w-3xl">
          <span className="evs-eyebrow mb-5 inline-block">{t.eyebrow}</span>
          <h1 className="text-display-2 uppercase">{t.heading}</h1>
          <p className="mt-6 text-lead text-content-secondary">{t.lead}</p>
          <p className="mt-4 leading-relaxed text-content-secondary">{t.body}</p>
        </Reveal>
      </section>

      {/* -------------------------------------------------- form + aside */}
      <section className="evs-shell evs-section-sm">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          {/* ---- the form ---- */}
          <div className="evs-card p-8 md:p-10">
            <h2 className="text-subheading text-content">{t.formTitle}</h2>

            <form
              name={FORM_NAME}
              method="POST"
              /* The static definition file, which is also the no-JS fallback's
                 target. NOT /thank-you, and NOT this page. */
              action={FORM_ENDPOINT}
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col gap-5"
            >
              <input type="hidden" name="form-name" value={FORM_NAME} />
              <input type="hidden" name="locale" value={locale} />

              {/* Hidden from people, irresistible to bots. */}
              <p className="hidden">
                <label>
                  Do not fill this in:{" "}
                  <input name="company-website" tabIndex={-1} autoComplete="off" />
                </label>
              </p>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className={label} htmlFor="c-name">
                    {t.name}
                  </label>
                  <input id="c-name" type="text" name="name" required autoComplete="name" className={field} />
                </div>
                <div>
                  <label className={label} htmlFor="c-email">
                    {t.email}
                  </label>
                  <input
                    id="c-email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    dir="ltr"
                    className={field}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className={label} htmlFor="c-vehicle">
                    {t.car}
                  </label>
                  <input id="c-vehicle" type="text" name="vehicle" placeholder={t.carHint} className={field} />
                </div>
                <div>
                  <label className={label} htmlFor="c-topic">
                    {t.topic}
                  </label>
                  <select id="c-topic" name="topic" className={field} defaultValue={t.topics[0]}>
                    {t.topics.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={label} htmlFor="c-message">
                  {t.message}
                </label>
                <textarea id="c-message" name="message" rows={4} className={field} />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="evs-btn evs-btn-primary evs-btn-lg mt-1 justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? t.sending : t.submit}
                {status === "sending" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
                )}
              </button>

              {/* aria-live so a screen reader is told the send failed, rather
                  than the message appearing silently below the button. */}
              <p aria-live="polite" className="sr-only">
                {status === "failed" ? t.errorTitle : ""}
              </p>

              {status === "failed" ? (
                <div className="rounded-sm border border-brand-500/40 bg-brand-500/5 p-4">
                  <p className="text-sm font-semibold text-content">{t.errorTitle}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-content-secondary">{t.errorBody}</p>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-500"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    <span dir="ltr" className={rtl ? "evs-latin" : undefined}>
                      {EMAIL}
                    </span>
                  </a>
                </div>
              ) : null}

              <p className="text-sm text-content-muted">{t.note}</p>
            </form>
          </div>

          {/* ---- what happens next ---- */}
          <Reveal stagger={80} className="flex flex-col gap-4">
            <div className="evs-card p-7">
              <h2 className="text-subheading text-content">{t.asideTitle}</h2>
              <ol className="mt-6 flex flex-col gap-6">
                {t.steps.map((step, index) => (
                  <li key={step.title} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full border border-brand-500/40 bg-brand-500/10 text-eyebrow font-semibold text-brand-500">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-content">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-content-secondary">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="evs-card p-7">
              <h2 className="text-subheading text-content">{t.directTitle}</h2>
              <p className="mt-3 text-sm leading-relaxed text-content-secondary">{t.directBody}</p>
              <a
                href={`mailto:${EMAIL}`}
                className="mt-5 inline-flex items-center gap-3 text-sm font-semibold text-brand-500"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span dir="ltr" className={rtl ? "evs-latin" : undefined}>
                  {EMAIL}
                </span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ faq */}
      <section className="evs-shell evs-section-sm">
        <div className="evs-measure">
          <Reveal className="mb-10">
            <h2 className="text-display-3">
              {t.faqTitle}
              <span className="text-brand-500">.</span>
            </h2>
          </Reveal>
          <Accordion items={faqItems} idPrefix="contact-faq" />

          <div className="mt-10 flex flex-wrap gap-4">
            <a href={localePath(locale, "ev-car-brands")} className="evs-btn evs-btn-secondary">
              {base === "ar" ? "العلامات التي نخدمها" : "Brands we service"}
            </a>
            <a href={localePath(locale, "franchise")} className="evs-btn evs-btn-secondary">
              {base === "ar" ? "الامتياز في العراق" : "Franchise in Iraq"}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/** The contact FAQs as schema, so an answer can be lifted into a result. */
export function contactFaqJsonLd(locale = "en") {
  const base = String(locale).split("-")[0];
  const t = copy[base] ?? copy.en;

  return {
    "@type": "FAQPage",
    mainEntity: t.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
