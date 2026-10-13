/**
 * Turns a stored asset path into the URL to actually request.
 *
 * A row stores one of two things, and `0099`'s `asset_ref_ok` is the database
 * saying so:
 *
 *   '/img/services/body-paint.webp'  in the repo, under public/
 *   'https://cdn.acme.com/x.jpg' anywhere else - Cloudflare, Supabase
 *                                Storage, Cloudinary
 *
 * What it must NEVER store is a country's own site - https://evsuae.com/... -
 * because one row is read by every country, and that URL would put the UAE's
 * host on Oman's page. The constraint enforces it; this function does not need
 * to care.
 *
 * WHAT HAPPENS TO EACH:
 *
 *   relative  wrapped in Netlify's image CDN in production, so `w` and `q`
 *             actually resize. Left alone in development, because
 *             /.netlify/images does not exist on a dev server - relative CDN
 *             URLs 404 locally and every background renders black.
 *
 *   absolute  returned untouched, in every environment. It already points at
 *             a host that can serve it, and Netlify's image CDN refuses a
 *             remote source unless its host is allow-listed in netlify.toml.
 *             THE CONSEQUENCE IS THAT `w` IS IGNORED: one file is sent to
 *             every breakpoint. Upload it at the size it should be served, or
 *             host it somewhere that resizes from its own URL - Cloudflare
 *             Images does, with /cdn-cgi/image/width=800/... - or add the host
 *             to `[images] remote_images` in netlify.toml and wrap it here.
 */
export function assetUrl(path, { w, q = 70 } = {}) {
  if (!path) return path;

  // already a full URL, or already wrapped - leave it alone
  if (/^https?:\/\//i.test(path) || path.startsWith("/.netlify/images")) {
    return path;
  }

  if (process.env.NODE_ENV !== "production") return path;

  // encodeURI, not URLSearchParams: the latter escapes the slashes to %2F,
  // and the URLs that are known to work on this site pass the path through
  // unescaped. encodeURI still handles spaces and non-ASCII filenames.
  const parts = [`url=${encodeURI(path)}`];
  if (q) parts.push(`q=${q}`);
  if (w) parts.push(`w=${w}`);

  return `/.netlify/images?${parts.join("&")}`;
}
