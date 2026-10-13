import Head from "next/head";
import LaunchThanks from "@/components/launch/LaunchThanks";
import { DEFAULT_LOCALE } from "@/lib/locale";

export default function ThankYouRoute({ locale }) {
  return (
    <>
      <Head>
        <title>Thanks — EVS Iraq</title>
        {/* A confirmation page has nothing to offer a searcher. */}
        <meta name="robots" content="noindex, follow" />
        <meta name="description" content="Thanks — you are on the list. We will email you once, when the EVS Baghdad centre opens." />
        <link rel="canonical" href="https://evsiraq.com/thank-you" />
      </Head>
      <LaunchThanks locale={locale} />
    </>
  );
}

export async function getStaticProps() {
  return { props: { locale: DEFAULT_LOCALE } };
}
