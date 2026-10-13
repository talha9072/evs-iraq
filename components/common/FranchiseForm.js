import { useState } from "react";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * The franchise enquiry form, for every language.
 *
 * It replaces itself and `components/ar/common/FranchiseFormAR.js` - the same form
 * twice, one with English strings hardcoded and one with Arabic. This one had no
 * locale table at all, so a Bengali franchise page would have shown English
 * placeholders even once its route existed.
 *
 * The strings are `page_content.labels.form` (0073). Two of them are EMPTY on the
 * Arabic row rather than translated, because the Arabic page on evsuae.com genuinely
 * does not show them - see the note in the migration.
 */
export default function FranchiseForm({ locale = DEFAULT_LOCALE, labels }) {
  const [loading, setLoading] = useState(false);

  const t = labels;
  if (!t) {
    throw new Error(
      "FranchiseForm: no labels - pass page_content.labels.form from the franchise route"
    );
  }

  /*
   * Three differences between the two forms this replaces, all measured against the
   * live pages rather than guessed:
   *
   *   button column   `text-md-start` and NO `sm-mt-25px` in Arabic
   *   phone input     `text-end` in Arabic, so a Latin-digit number reads left to
   *                   right inside an RTL form
   *   `required`      present on name/phone/email in ENGLISH ONLY
   *
   * The first two WERE reproduced, and both are gone now - see below. The third
   * was NOT, deliberately: `.required` is what Litho's validation binds to -
   * `formObj.find('.required')` and a blur handler in public/js/main.js - so the
   * Arabic form had been accepting an empty name, phone and email. That is a
   * defect rather than a design difference, and both forms were plainly meant to
   * be the same form.
   *
   * THE PHONE FIELD IS `.evs-field` LIKE THE OTHER FOUR. It carried
   * `form-control required` - Bootstrap and Litho classes - which is what it had
   * before this page was converted, and neither stylesheet nor script is loaded
   * on a redesigned route. So the moment `.evs-field` gained a real rule, four of
   * these five fields grew an underline and this one stayed invisible.
   *
   * `text-end` went with it: the field inherits `direction: rtl` from the form
   * around it, so its text already sits at the reading edge without being told.
   */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const formData = new FormData(form);

    try {
      /* Our own endpoint, not a Netlify stub page. `locale` goes with it so the
         enquiry records which language the visitor was reading. */
      const res = await fetch("/api/forms/franchise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(formData), locale }),
      });

      if (!res.ok) throw new Error("Failed");

      // A full reload, in the visitor's own language: this was unprefixed, so
      // submitting the Arabic franchise form landed on the English thank-you page.
      window.location.href =
        locale === DEFAULT_LOCALE ? "/thank-you" : `/${locale}/thank-you`;
    } catch (err) {
      alert(t.failed);
      setLoading(false);
    }
  };

  return (
    <form
      name="franchise"
      method="POST"
      onSubmit={handleSubmit}
      className="grid gap-5 sm:grid-cols-2"
    >
      {/* The honeypot - two hidden fields, of which `website` is the one a bot
          will actually fill. A hit is recorded rather than silently dropped.
          See the fuller note on ContactForm. */}
      <p hidden aria-hidden="true">
        <input name="website" tabIndex={-1} autoComplete="off" />
        <input name="bot-field" tabIndex={-1} autoComplete="off" />
      </p>

      {/* `required` ON ALL THREE, which they have never carried.
          The note above explains that Litho's `.required` class was on the
          English form and not the Arabic one, so the Arabic form accepted an
          empty name, phone and email - and Netlify duly delivered a blank
          enquiry. Neither form validated anything at all once those scripts
          stopped being loaded. `franchise_submissions` declares all three
          `not null`, so this is the rule the database now has anyway; putting
          it on the input is what lets the browser say so before the round
          trip. */}
      <div>
        <input className="evs-field" type="text" name="name" placeholder={t.name} required />
      </div>

      <div>
        <input className="evs-field" type="tel" name="phone" placeholder={t.phone} required />
      </div>

      <div>
        <input className="evs-field" type="email" name="email" placeholder={t.email} required />
      </div>

      <div>
        <input className="evs-field" type="text" name="subject" placeholder={t.subject} />
      </div>

      <div className="sm:col-span-2">
        {/* `message`, not `comment` - see the same note on ContactForm. */}
        <textarea className="evs-field" rows="4" name="message" placeholder={t.message} />
      </div>

      {/* Empty on the Arabic row - the live Arabic form does not carry this line. */}
      {t.privacy && (
        <div className="sm:col-span-2">
          <p className="text-sm text-content-muted">{t.privacy}</p>
        </div>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="evs-btn evs-btn-primary evs-btn-lg disabled:opacity-60"
          disabled={loading}
        >
          {loading ? t.sending : t.send}
        </button>
      </div>
    </form>
  );
}
