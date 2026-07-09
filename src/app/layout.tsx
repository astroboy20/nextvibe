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
    default: "NextVibe — Your Event's Digital Memory Bank",
    template: "%s | NextVibe",
  },
  description:
    "NextVibe is the event memory app for parties, weddings, festivals, and corporate events. Shared photo albums, VibeTags, event games, smart RSVP, and brand sponsorships.",
  keywords: [
    "party photo sharing app",
    "event memory app",
    "shared event photo album",
    "QR code party photos",
    "wedding photo sharing",
    "festival memory app",
    "event photo album",
    "VibeTags",
    "event games",
    "smart RSVP",
    "nextvibe",
  ],
  authors: [
    { name: "Spectroniq", url: "https://www.spectroniq.com/" },
    { name: "Simi Peters" },
    { name: "Kingsley Ihemelandu", url: "https://github.com/kingsleydaprime" },
    { name: "Jeremiah Nwosu" },
    { name: "Tolulope Akinkunmi", url: "https://github.com/astroboy20" },
  ],
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
    other: [
      {
        rel: "android-chrome-icon",
        url: "/favicon/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "android-chrome-icon",
        url: "/favicon/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
