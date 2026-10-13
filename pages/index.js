import HomePage from "@/components/homepage/HomePage";
import { homeProps } from "@/lib/home-page";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * / - the unprefixed locale's home page.
 *
 * Was a hardcoded UAE page: the <head> named evsuae.com eleven times, the only <h1>
 * read "Service Center in UAE", and the sections were hand-written lists of UAE
 * workshops and UAE reviews. Every one of those was wrong on the Qatar site.
 *
 * Now every word is a row, and the markup is one component shared with
 * pages/[locale]/index.js - so /ar, /ar-IQ and /bn are the same page.
 *
 * STATIC, NOT SERVER-RENDERED, and that was measured rather than assumed. Rendering
 * this page per request made a content edit appear instantly - which is the goal -
 * but took 3.3s per view against 7ms for a static page, because it is five Supabase
 * queries on the request path. `pages/api/revalidate.js` gets the same instant edit
 * while keeping the 7ms, so that is the trade this project takes.
 */
export default HomePage;

export async function getStaticProps() {
  const result = await homeProps(DEFAULT_LOCALE);

  // The backstop only. In practice a row edit regenerates this within seconds via
  // the revalidate webhook; the hour is what happens if that ever stops firing.
  return result.notFound ? result : { ...result, revalidate: 2592000 };
}
