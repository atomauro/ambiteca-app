import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import Providers from "../components/Providers";
import { Toaster } from "@/components/ui/toaster";
import 'react-phone-number-input/style.css'


function MyApp({ Component, pageProps }: AppProps) {
  const SITE_NAME = "AMBITECA APP";
  const SITE_TITLE = "AMBITECA APP – Reciclaje y puntos Perla Verde (PLV) en San Luis, Antioquia";
  const SITE_DESC =
    "Proyecto del municipio de San Luis, Antioquia: registra reciclaje, pesa materiales y gana puntos cripto Perla Verde (PLV).";
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const OG_IMAGE = "https://diarioriente.com/wp-content/uploads/2022/08/san-luis.jpg";
  const OG_LOCALE = "es_CO";
  return (
    <>
      <Head>
        <link
          rel="preload"
          href="/fonts/AdelleSans-Regular.woff"
          as="font"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/AdelleSans-Regular.woff2"
          as="font"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/AdelleSans-Semibold.woff"
          as="font"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/AdelleSans-Semibold.woff2"
          as="font"
          crossOrigin=""
        />

        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/manifest.json" />
        <meta name="theme-color" content="#16a34a" />

        <title>{SITE_TITLE}</title>
        <meta name="description" content={SITE_DESC} />
        <meta name="keywords" content="reciclaje, San Luis, Antioquia, puntos, Perla Verde, PLV, ambiteca, ambiente" />
        <link rel="canonical" href={SITE_URL} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESC} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:locale" content={OG_LOCALE} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={SITE_DESC} />
        <meta name="twitter:image" content={OG_IMAGE} />

        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              url: SITE_URL,
              inLanguage: "es-CO",
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </Head>
      <Providers>
        <Component {...pageProps} />
        <Toaster />
      </Providers>
    </>
  );
}

export default MyApp;
