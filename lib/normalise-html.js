import { parseFragment, serialize } from "parse5";
import { marked } from "marked";

/**
 * Rewrite authored HTML into exactly what a browser's parser will produce.
 *
 * THE PROBLEM THIS SOLVES. The 155 blog bodies were hand-written HTML, and a
 * browser silently CORRECTS such markup while parsing it: it inserts the
 * `<tbody>` a `<table>` was missing, escapes a bare `&` into `&amp;`, and drops
 * a stray `</div>`. Measured on this content, 30 of the 82 English posts differ
 * from what the parser produces.
 *
 * That was invisible for as long as the posts were standalone .html files. The
 * moment they became React props it stopped being invisible: the server writes
 * the authored string, the browser parses it into a CORRECTED DOM, and React
 * then compares its own tree - built from the uncorrected string - against that
 * DOM. They differ, so it throws "Hydration failed because the server rendered
 * HTML didn't match the client" and re-renders the whole article on the client.
 *
 * WHY A REAL PARSER AND NOT A REGEX. Three defects were found by inspection;
 * there is no reason to believe those are the only three, and the next post
 * pasted into the Supabase table editor will bring its own. parse5 implements
 * the HTML spec's tree construction algorithm - the same one the browser runs -
 * so parse-then-serialise is not a list of fixes, it is the fix: whatever a
 * browser would do to the markup has already been done to it.
 *
 * THE `div` CONTEXT MATTERS. A fragment is parsed differently depending on the
 * element it is being inserted into, and this content lands in a `<div>` via
 * dangerouslySetInnerHTML. Parsing in the same context is what makes the output
 * match `div.innerHTML = html` and not something close to it.
 *
 * SERVER ONLY. This is called from getStaticProps, so parse5 never reaches the
 * browser bundle.
 */
export function normaliseHtml(html) {
  if (typeof html !== "string" || html === "") return html;

  /*
   * Carriage returns first, and separately, because the parser is not the only
   * thing that removes them - the HTML spec's input stream preprocessing drops
   * \r before tree construction even begins, so they would never survive to the
   * DOM anyway. The blog rows carry CRLF throughout (288 of them in an average
   * post) because the source files were written on Windows and 0078/0079 moved
   * them in byte for byte.
   */
  const text = html.replace(/\r\n?/g, "\n");

  try {
    return serialize(parseFragment(text, { sourceCodeLocationInfo: false }));
  } catch (error) {
    // Never fail a page over formatting. An un-normalised body still renders;
    // it just costs the client re-render this function exists to avoid.
    console.error("[normaliseHtml]", error.message);
    return text;
  }
}

/**
 * What a blog route actually calls: markdown in if it has to be, HTML out.
 *
 * AFTER 0084 EVERY ROW IS HTML, so the markdown branch below is a net and not
 * the path. It is here because the bug it catches already happened once: 9 of
 * the 82 English rows held the raw markdown of the old public/blog/*.md files,
 * and when the routes started rendering `content` directly those posts printed
 * their own source - "## Understanding the Basics" and "**Liability Coverage**"
 * as literal text in one long paragraph. 0084 converted them.
 *
 * The next post pasted into the Supabase table editor could be markdown again,
 * and someone writing a post should not have to know which of two formats the
 * column expects. Detected the same way the deleted lib/blogs.js detected it -
 * whether the body opens with a tag - so this is the rule that was already in
 * force, just no longer spread across three call sites.
 */
export function toHtml(content) {
  if (typeof content !== "string" || content === "") return content;

  const text = content.replace(/\r\n?/g, "\n");
  const isHtml = text.trimStart().startsWith("<");

  return normaliseHtml(isHtml ? text : marked.parse(text));
}
