import Head from "next/head";
import Link from "next/link";

/**
 * A custom 500.
 *
 * Next ships a built-in one, and it has no <head> at all — no robots
 * directive, no title worth reading. An error page that a crawler can index is
 * a page that can rank for the brand and show a visitor a dead end, so this
 * exists mainly to say `noindex`.
 */
export default function ServerError() {
  return (
    <>
      <Head>
        <title>Something went wrong — EVS Iraq</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Something went wrong on our side. Please try again in a moment." />
      </Head>
      <section className="evs-shell evs-section">
        <div className="mx-auto max-w-xl text-center">
          <span className="evs-eyebrow mb-6 inline-block">Error</span>
          <h1 className="text-display-2 uppercase">Something went wrong.</h1>
          <p className="mt-6 text-lead text-content-secondary">
            That is on our side, not yours. Try again in a moment.
          </p>
          <Link href="/" className="evs-btn evs-btn-primary evs-btn-lg mt-10">
            Back to the home page
          </Link>
        </div>
      </section>
    </>
  );
}
