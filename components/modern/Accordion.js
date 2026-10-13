import { useState } from "react";
import Reveal from "@/components/modern/Reveal";
import { Plus } from "@/components/chrome/icons";

/**
 * The question-and-answer accordion.
 *
 * Shared by /frequently-asked-questions and by the FAQ block on every service
 * and category page - three tables, one component. They were three different
 * pieces of markup before: the FAQ page used Crafto's `accordion-style-02` with
 * hardcoded `#accordion-style-02-01..10` collapse targets, and the service pages
 * used a second copy with its own ids, so two accordions on one page would have
 * collided.
 *
 * WHAT IT REPLACES BEHAVIOURALLY. Bootstrap's `data-bs-toggle="collapse"`,
 * which needs a script the redesigned pages do not load, plus `data-active-icon`
 * / `data-inactive-icon` attributes that Crafto's JS read to swap a chevron.
 * State here, and the icon is a `+` that rotates to an `x`.
 *
 * ANSWERS ARE HTML. Eight of the ten FAQ answers carry links to workshop, brand
 * and service pages, and their hrefs arrive already prefixed for the locale -
 * the resolver fills `{{locale_prefix}}` - so nothing here rewrites them.
 * Service-level FAQs are plain text, which is valid HTML too, so one path
 * handles both.
 *
 * The height transition uses `grid-template-rows: 0fr -> 1fr`, which animates a
 * genuinely unknown content height. `max-height` guessing is what makes most
 * accordions either clip a long answer or ease against a value nothing reaches.
 */

function Item({ question, answerHtml, open, onToggle, id }) {
  return (
    <div className="border-b border-line-subtle">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={id}
          className="group flex w-full items-start justify-between gap-6 py-6 text-start"
        >
          {/* THE QUESTION IS BODY TYPE, NOT DISPLAY TYPE.

              It is inside an <h3> - which is right, a question IS the heading of
              its answer - and the base layer gives every heading
              korolev-condensed at 600. That face is a condensed display face
              built for two or three words at 50px; a full sentence of it at
              22px, ten times down a page, is a wall. `font-sans` and 500 put
              the question in the same Urbanist the answer under it is set in,
              which is what a question is: something to read, not a title to
              look at.

              The <h3> stays, so the document outline and the structured data
              are unchanged - only the type is. */}
          <span
            className={`font-sans text-subheading font-medium transition-colors duration-200 ${
              open ? "text-brand-500" : "text-content group-hover:text-brand-500"
            }`}
          >
            {question}
          </span>

          <span
            className={`mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-full border transition-all duration-300 ${
              open
                ? "rotate-45 border-brand-500 bg-brand-500 text-content-inverse"
                : "border-line text-content-muted group-hover:border-brand-500 group-hover:text-brand-500"
            }`}
          >
            <Plus className="h-4 w-4" />
          </span>
        </button>
      </h3>

      {/* `inert` rather than `hidden`: `hidden` takes the panel out of layout,
          which cancels the transition it is supposed to animate. `inert` keeps
          it in the grid, collapsed to 0fr, while removing it from the tab order
          and from the accessibility tree - so a closed answer is neither
          focusable nor read out, and it still animates. */}
      <div
        id={id}
        role="region"
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className="evs-prose max-w-3xl pb-7"
            dangerouslySetInnerHTML={{ __html: answerHtml }}
          />
        </div>
      </div>
    </div>
  );
}

export default function Accordion({
  /** [{ question, answer_html | answer, slug? }] - both key names are accepted
   *  because the FAQ table stores HTML and the service tables store text. */
  items = [],
  /** Index opened on load. `null` opens none. */
  defaultOpen = 0,
  /** Namespaces the generated ids, so two accordions can share a page. */
  idPrefix = "faq",
  className = "",
}) {
  const [open, setOpen] = useState(() =>
    defaultOpen == null ? new Set() : new Set([defaultOpen])
  );

  const toggle = (index) =>
    setOpen((current) => {
      const next = new Set(current);
      if (!next.delete(index)) next.add(index);
      return next;
    });

  if (items.length === 0) return null;

  return (
    <Reveal className={`border-t border-line-subtle ${className}`}>
      {items.map((item, index) => (
        <Item
          key={item.slug ?? item.question ?? index}
          id={`${idPrefix}-${index}`}
          question={item.question}
          answerHtml={item.answer_html ?? item.answer ?? ""}
          open={open.has(index)}
          onToggle={() => toggle(index)}
        />
      ))}
    </Reveal>
  );
}
