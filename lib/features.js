/**
 * `NEXT_PUBLIC_BRANCH` is read here directly rather than importing
 * `CURRENT_BRANCH` from lib/branches.
 *
 * The header and the footer import this module, and they are client components.
 * Importing lib/branches for one string would pull the Supabase platform client
 * and both content trees into their bundle for nothing.
 */
const CURRENT_BRANCH = process.env.NEXT_PUBLIC_BRANCH || "uae";

/**
 * Pages that only some countries publish.
 *
 * WHY THIS IS A CONSTANT AND NOT A COLUMN. It is one boolean per branch, read
 * synchronously in three places that cannot await a query - the header's nav list,
 * the footer's Quick Links, and the page's own `getStaticProps`. A `features`
 * column would be the right home for it the moment there are several of these;
 * with one, a documented list beside the other per-branch exceptions
 * (`CROSS_SITE` in lib/nav.js, `NETWORK_FIRST` in lib/footer.js) is the honest
 * shape.
 *
 * `/sos` is the case. Measured, not assumed:
 *
 *   evsuae.com/sos    200
 *   evsoman.com/sos   404
 *   evsqtr.com/sos    404
 *
 * Before this, the header and the footer offered "Roadside Assitance" on all
 * three sites and Oman and Qatar answered 404 - a dead link in the main nav of
 * two countries.
 *
 * `/franchise` and `/blog` are 200 on all three, so they are not listed.
 */
const SOS_BRANCHES = new Set(["uae"]);

/*
 * `/evs-riyadh` used to be the second case here, with its own branch set. The
 * page is gone: it was a hand-written cross-link to the Saudi site - directions
 * to evsksa.com, mailbox info@evsksa.com - so it was never a workshop of any
 * branch here, and Saudi Arabia is already in the footer's EVS Network column,
 * which is where a link to another country's site belongs.
 */

/**
 * Does this deployment publish the roadside-assistance page?
 *
 * Reads `NEXT_PUBLIC_BRANCH`, which is inlined into the client bundle, so the
 * header and footer get the same answer on the server and on the first client
 * render - no flicker, and no waiting on /api/nav.
 */
export function hasSos(branch = CURRENT_BRANCH) {
  return SOS_BRANCHES.has(branch);
}

