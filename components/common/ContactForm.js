import { useState } from "react";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * The contact form, on /contact and /ar/contact.
 *
 * WHAT WAS WRONG. The "Select EVS Location" dropdown listed five UAE workshops,
 * written out by hand - EVS Dubai, Abu Dhabi, Ajman, Alain, Sharjah - so on the
 * Qatar site a visitor booking a service had to pick a UAE branch, and the
 * enquiry arrived naming a workshop in another country. The options are the
 * branch's own workshops now, from `locations`.
 *
 * Two more things the Arabic page inherited by reusing this component: every
 * placeholder was English, and the redirect after a successful submit went to
 * `/thank-you` unprefixed, dropping an Arabic visitor onto the English page.
 */

const pick = (map, locale) =>
  map?.[locale] ?? map?.[String(locale).split("-")[0]] ?? map?.en ?? null;

export default function ContactForm({
  locale = DEFAULT_LOCALE,
  /** This branch's workshops. */
  locations = [],
  /** `page_content.labels.form` for this locale - see 0072. */
  labels,
}) {
  const [loading, setLoading] = useState(false);

  /*
   * The nine placeholders used to be a COPY table in this file with en, ar and bn
   * written into it. All three languages were there, so nothing was BROKEN - but
   * changing "Your phone*" meant a deploy, and a country that wants a different
   * wording had nowhere to put it. They are a row now.
   *
   * Thrown rather than defaulted, the same as BranchesList: a form whose fields
   * silently lose their placeholders is worse than one that fails loudly in a build.
   */
  const t = labels;
  if (!t) {
    throw new Error(
      "ContactForm: no labels - pass page_content.labels.form from the contact route"
    );
  }

  /**
   * THE OPTION VALUE IS THE SLUG, and the label is the localised name.
   *
   * It used to be the English NAME, because that is what landed in the Netlify
   * submission and nobody reading those wanted to match Arabic strings back to
   * a workshop. The submission is a row in our own database now, and the API
   * looks the workshop up to decide which inbox the enquiry goes to (0104) - so
   * the value has to be the one thing that never changes. Renaming "EVS Dubai"
   * would have broken the routing silently; renaming it now changes nothing.
   */
  const options = locations
    // The ordinary workshops only, which is the five the hand-written list had on
    // the UAE - the same filter the footer and the Contact cards use.
    .filter((row) => row.variant !== "express")
    .slice()
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))
    .map((row) => ({
      value: row.slug,
      label: pick(row.name, locale) ?? row.slug,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const formData = new FormData(form);

    try {
      /* Our own endpoint, not a Netlify stub page. `locale` goes with it so the
         enquiry records which language the visitor was reading - the API cannot
         tell from the request, and a reply should be written in it. */
      const res = await fetch("/api/forms/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(formData), locale }),
      });

      if (!res.ok) throw new Error("Failed");

      // ✅ FULL PAGE REDIRECT - in the visitor's own language.
      window.location.href =
        locale === DEFAULT_LOCALE ? "/thank-you" : `/${locale}/thank-you`;
    } catch (err) {
      alert(t.failed);
      setLoading(false);
    }
  };

  return (
    <form
      name="contact-form"
      method="POST"
      onSubmit={handleSubmit}
      className="grid gap-5 sm:grid-cols-2"
    >
      {/* THE HONEYPOT. `data-netlify` and the hidden `form-name` went with
          Netlify Forms - and so did the Akismet pass that came with them, so
          these two fields a person never sees are most of what stands between a
          public endpoint and a script. The rest is the rate limit in
          lib/forms/submit.js.

          TWO FIELDS, AND `website` IS THE ONE THAT WORKS. `bot-field` is
          Netlify's own documented honeypot name, which is precisely why a bot
          written against Netlify sites knows to leave it alone; it stays
          because it costs nothing. `website` looks like a field this form would
          really have, so a script has no reason to skip it.

          A CAUGHT BOT IS NOW A ROW rather than a silent 200 - see the note in
          lib/forms/submit.js and `blocked_by` in 0106. The response is still a
          cheerful 200, so the script never learns which field gave it away.

          `hidden` keeps it out of the layout; `tabIndex={-1}` keeps it out of
          the keyboard order for anyone tabbing through; `autoComplete="off"`
          stops a browser helpfully filling it in and getting a real person
          blocked.

          THE LABEL IS GONE, and that is not an accessibility regression: the
          wrapper is `hidden` and `aria-hidden`, so no screen reader ever
          reached it. What it did do was read "Don’t fill this out" in the
          markup, right beside the field - an instruction aimed at the one
          reader it was not meant for. `page_content.labels.form.honeypot`
          still holds the string; nothing renders it now.
      */}
      <p hidden aria-hidden="true">
        <input name="website" tabIndex={-1} autoComplete="off" />
        <input name="bot-field" tabIndex={-1} autoComplete="off" />
      </p>

      <div>
        <input
          className="evs-field"
          type="text"
          name="name"
          placeholder={t.name}
          required
        />
      </div>

      <div>
        <input
          className="evs-field"
          type="tel"
          name="phone"
          placeholder={t.phone}
          required
        />
      </div>

      <div>
        <input
          className="evs-field"
          type="email"
          name="email"
          placeholder={t.email}
          required
        />
      </div>

      <div>
        <select className="evs-field" name="location" required>
          <option value="">{t.location}</option>
          {options.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        {/* `message`, which this was not: it was `comment`, the name Netlify's
            stub page used. The column is `message` and so is the API field, so
            the three now read the same word - a mismatch here would have
            dropped the one part of the enquiry that is not a form field. */}
        {/* REQUIRED. An enquiry came in with every other box filled and
            nothing written, which is an enquiry nobody can act on - there is
            no way to tell a service booking from a complaint from a wrong
            number, so somebody has to call and start from nothing.

            The browser stops it here and lib/forms/submit.js stops it again:
            `required` is a courtesy that a script skips and this endpoint is
            reachable without one, so the rule has to exist in both places. */}
        <textarea
          className="evs-field"
          name="message"
          placeholder={t.message}
          required
        />
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="evs-btn evs-btn-primary evs-btn-lg w-full disabled:opacity-60 sm:w-auto"
          disabled={loading}
        >
          {loading ? t.sending : t.send}
        </button>
      </div>
    </form>
  );
}
