/**
 * A branch's opening hours, as a timetable rather than a sentence.
 *
 * WHAT IT REPLACES, in three places at once - the footer, the contact page and
 * the workshop pages - each of which printed the stored strings straight out:
 *
 *   Sat - Thurs
 *   09:00 AM – 01:00 PM, 02:00 PM – 06:00 PM
 *   Friday Closed
 *
 * The middle line is the problem. Those are two SHIFTS with a break between
 * them, and joined by a comma they read as one unbroken stretch of time - a
 * reader has to notice the comma, then work out that the workshop is shut
 * between one and two. It is the one line on the page that has to be understood
 * at a glance and it was the hardest thing on it to parse.
 *
 * SO THE DAY AND THE HOURS BECOME COLUMNS, and each shift gets its own line:
 *
 *   Sat – Thurs    09:00 AM – 01:00 PM
 *                  02:00 PM – 06:00 PM
 *   Friday         Closed
 *
 * Nothing is computed and nothing is reworded: every string is the row it
 * already was, and the only new thing is where it sits.
 *
 * WHY THE SPLIT IS ON THE STORED STRING and not on `opening_hours.spec` - which
 * IS structured, and holds the same two shifts as `{opens, closes}` pairs.
 * `spec` is in 24-hour time, so using it means FORMATTING a clock in three
 * languages, and this project has already learned what that costs: see the note
 * on `displayPhone` in LocationPage, where a formatter disagreed with five of
 * the nine stored numbers. `time` is what the branch wants printed, in its own
 * language, and splitting a list on its list separator changes no character of
 * it. `spec` stays what it is for - the `openingHoursSpecification` in the
 * structured data.
 *
 * IT DEGRADES INTO THE OLD SHAPE. A row whose `time` has no separator renders as
 * one line, which is exactly what it renders as today.
 */

/**
 * "09:00 AM – 01:00 PM, 02:00 PM – 06:00 PM" -> two strings.
 *
 * BOTH COMMAS. Arabic separates its list with U+060C, the Arabic comma, and the
 * Arabic rows use it - "9 صباحًا – 1 مساءً، 2 مساءً – 6 مساءً". A split on ","
 * alone would leave the Arabic hours as one line while English got two.
 */
export function shifts(time) {
  return String(time ?? "")
    .split(/[,،]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function OpeningHours({
  /** `{ day, time, closedDay, closedNote }` - already localised by the caller. */
  day,
  time,
  closedDay,
  closedNote,
  className = "",
}) {
  const rows = shifts(time);
  if (!day && rows.length === 0) return null;

  return (
    /* `auto 1fr` rather than two equal columns: the day column is as wide as the
       longest label in whatever language this is, and the hours take the rest.
       An `items-baseline` grid keeps the first shift on the day's own line. */
    <dl
      className={`grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-1 text-[0.9375rem] ${className}`}
    >
      {day && <dt className="text-content">{day}</dt>}

      <dd className="text-content-muted">
        {rows.map((shift) => (
          /* One line per shift. `block` rather than separate <dd>s so the whole
             day's hours stay one definition of one term. */
          <span key={shift} className="block">
            {shift}
          </span>
        ))}
      </dd>

      {/* THE CLOSED DAY IS A ROW OF THE SAME TABLE, so "Friday" lines up under
          "Sat – Thurs" and "Closed" under the hours. It used to be a sentence
          below them, which is why it read as a footnote rather than as part of
          the week. */}
      {closedDay && (
        <>
          <dt className="text-content-secondary">{closedDay}</dt>
          <dd className="text-content-muted">{closedNote}</dd>
        </>
      )}
    </dl>
  );
}
