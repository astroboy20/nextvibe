import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { NetworkStatusBanner } from "@/components/network-status-banner";

import "./globals.css";
import ProviderWrapper from "./provider/provider";
import Script from "next/script";
import { GOOGLE_ANALYTICS_ID, GOOGLE_MAP_KEY } from "@/utils/constants";

const nunitoSans = Nunito_Sans({
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mynextvibe.com"),
  title: {
    default: "NextVibe — Party Photo Sharing & Event Memory App",
    template: "%s | NextVibe",
  },
  description:
    "Nextvibe is the ultimate app for parties, weddings, and events. Shared photo albums, VibeTags, event games, and smart RSVP — all in one place.",
  keywords: [
    "party photo sharing app",
    "event memory app",
    "shared event photo album",
    "wedding photo sharing",
    "festival memory app",
    "event games",
    "smart RSVP",
    "nextvibe",
  ],
  authors: [
    { name: "Simi Peters" },
    { name: "Tolulope Akinkunmi", url: "https://github.com/astroboy20" },
    { name: "Kingsley Ihemelandu", url: "https://github.com/kingsleydaprime" },
    { name: "Jeremiah Nwosu" },
  ],
  icons: {
    icon: [{ url: "/favicon/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png" }],
    other: [
      { rel: "android-chrome-icon", url: "/favicon/android-chrome-192x192.png" },
      { rel: "android-chrome-icon", url: "/favicon/android-chrome-512x512.png" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
  verification: {
    google: "heXFOeejdxJGoZFVb4Cn47P3JkurQhSeM2qmdtzmYl0",
  },
  openGraph: {
    type: "website",
    siteName: "NextVibe",
    title: "NextVibe — Party Photo Sharing & Event Memory App",
    description:
      "Capture every moment at parties, weddings, and festivals. Shared albums, VibeTags, and smart RSVP.",
    images: [
      {
        url: "/logos/new/logo_black_text.png",
        width: 1200,
        height: 630,
        alt: "NextVibe — Your Event's Digital Memory Bank",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mynextvibe",
    title: "NextVibe — Party Photo Sharing & Event Memory App",
    description:
      "Capture every moment at parties, weddings, and festivals. Shared albums, VibeTags, and smart RSVP.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_KEY}&libraries=places`}
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${nunitoSans.variable}  antialiased`}>
        <NetworkStatusBanner />
        <ProviderWrapper>
          {children}
          <Toaster position="top-center" />
        </ProviderWrapper>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
        ></Script>
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '2133476360842129');
              fbq('track', 'PageView');
            `,
          }}
        />
      </body>
    </html>
  );
}
