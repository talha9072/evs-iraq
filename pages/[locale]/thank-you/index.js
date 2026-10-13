import Head from "next/head";
import LaunchThanks from "@/components/launch/LaunchThanks";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/locale";

export default function ThankYouRoute({ locale }) {
  return (
    <>
      <Head>
        <title>شكراً — إي في إس العراق</title>
        <meta name="robots" content="noindex, follow" />
        <meta name="description" content="شكراً — أنت على القائمة. سنراسلك مرة واحدة عند افتتاح مركز إي في إس بغداد." />
        <link rel="canonical" href="https://evsiraq.com/ar/thank-you" />
      </Head>
      <LaunchThanks locale={locale} />
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: LOCALES.filter((l) => l !== DEFAULT_LOCALE).map((locale) => ({ params: { locale } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  return { props: { locale: params.locale } };
}
