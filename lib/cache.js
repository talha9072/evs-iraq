/**
 * A tiny in-process cache for the reads that every page repeats.
 *
 * WHY. Each services page fetched the whole tree plus the branch, its cities,
 * its locations and its reviews - five round trips, 143 KB - and every page of
 * the same locale got byte-identical answers. Across the 152 pages in the
 * services section that was 760 requests and 21 MB per build, and the same
 * multiplier again on every ISR revalidation.
 *
 * WHAT IT IS NOT. Not a substitute for ISR and not a correctness mechanism:
 * `revalidate` still decides how fresh a page is. This only stops the same
 * answer being fetched dozens of times inside one process.
 *
 * TTL. Deliberately much shorter than `revalidate` (3600s), so nothing is ever
 * staler than the revalidate contract already allows: a render can be up to an
 * hour old, and its data at most five minutes older than the render.
 *
 * PER PROCESS, NOT PER BUILD. Next.js builds pages in several worker
 * processes, and each holds its own copy - so the real saving is
 * "once per locale per worker", not "once per locale". Still an order of
 * magnitude, just not literally 4 requests.
 */

const store = new Map();

/**
 * Five minutes DURING A BUILD. A quarter of a second at runtime. One second in dev.
 *
 * WHY THREE VALUES. This Map exists for one reason: a build renders 159 pages and
 * every one of them asks for the same tree, the same branch, the same locations. Without
 * it that was 760 requests and 21 MB. That argument applies to a BUILD and to nothing
 * else.
 *
 * At runtime it was doing the opposite of what anyone wanted. A page regenerated after
 * a content edit could be rebuilt from rows this Map remembered minutes earlier, so the
 * edit did not appear and nothing looked broken. Cutting it to 60s and then 10s only
 * made the window smaller - the behaviour was still 'sometimes the old value'.
 *
 * `NEXT_PHASE` is how the two are told apart: Next sets it to 'phase-production-build'
 * while building and leaves it unset in the serverless runtime. Verified, not assumed.
 *
 * 250ms rather than zero, because the point was never the seconds - it is that ONE
 * render asks for the same rows several times CONCURRENTLY (a category page wants the
 * tree, the locations and the reviews, and each of those wants the branch). A quarter
 * of a second collapses that fan-out and is far below anything a person can perceive.
 *
 * Dev keeps one second for the same reason it always did: `next dev` ignores
 * `revalidate` entirely, so this Map was the whole delay, and restarting the server
 * "fixed" it because that emptied the Map.
 */
/*
 * 250ms WAS TOO SHORT, and the note above says why it was thought to be enough:
 * "ONE render asks for the same rows several times CONCURRENTLY". Measured, it does
 * not. Regenerating /xpeng makes SIXTEEN round trips over FOUR SECONDS at only 1.3x
 * parallelism, so a quarter of a second expires several times inside one render:
 *
 *   sel branches   818ms   \
 *   sel branches   364ms    >  the same row, three times, in one page
 *   sel branches   224ms   /
 *   sel cities     286ms   \
 *   sel cities     252ms    >  and the same for its cities
 *   sel cities     244ms   /
 *
 * 30 seconds covers the slowest single render with room to spare, and it cannot
 * serve anything stale: `/api/revalidate` calls `clearCache()` before it regenerates,
 * and the only other path to a regeneration is `revalidate: 2592000`, a day later.
 */
const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";
export const DEFAULT_TTL =
  IS_BUILD ? 5 * 60 * 1000 : process.env.NODE_ENV === "production" ? 30 * 1000 : 1000;

/**
 * The PROMISE is cached, not the resolved value.
 *
 * That is the whole point: a build renders pages concurrently, so several
 * callers ask for the same tree within milliseconds of each other. Caching the
 * resolved value would let all of them miss and all of them fetch; caching the
 * in-flight promise makes them share one request.
 *
 * A rejected promise is evicted rather than remembered, so one network blip
 * does not poison the cache for the rest of the TTL.
 *
 * SO IS A NULL. The loaders here return `null` for "could not read it" rather
 * than throwing - getServicesTree, getCarBrandsTree and getPage all do - so a
 * failure resolves instead of rejecting and the catch above never sees it.
 * Remembering that null caches the FAILURE: every page asking for the same key
 * gets it for the rest of the TTL, and getStaticProps turns it into notFound.
 *
 * That is exactly what happened when `pages` shipped without an RLS policy:
 * `resolve_pages` returned an empty set, getPage returned null, and /branches
 * kept 404ing for five minutes after the policy was added - long enough to look
 * like the fix had not worked.
 */
export function cached(key, load, ttl = DEFAULT_TTL) {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.promise;

  const promise = Promise.resolve()
    .then(load)
    .then((value) => {
      if (value == null) store.delete(key);
      return value;
    })
    .catch((error) => {
      store.delete(key);
      throw error;
    });

  store.set(key, { promise, expires: Date.now() + ttl });
  return promise;
}

/** For tests and for a webhook, if one is ever added. */
export function clearCache() {
  store.clear();
}

/** What is currently held - used by scripts/verify to prove the cache works. */
export function cacheKeys() {
  return [...store.keys()];
}
