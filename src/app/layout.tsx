import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";
import ProviderWrapper from "./provider/provider";
import Script from "next/script";
import { GOOGLE_ANALYTICS_ID } from "@/utils/constants";

const nunitoSans = Nunito_Sans({
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextVibe",
  description: "Getting closer to your next event",
  keywords: [
    "nextvibe",
    "events",
    "AI",
    "lovenvibes",
    "Simi Peters",
    "event",
    "Spectroniq",
  ],
  authors: [
    { name: "Spectroniq", url: "https://www.spectroniq.com/" },
    { name: "Simi Peters" },
    { name: "Kingsley Ihemelandu", url: "https://github.com/kijuchihe" },
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
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyC73yaRGGiQ-W1qpni-3WlKJJ3A1vWtmUs&libraries=places`}
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${nunitoSans.variable}  antialiased`}>
        <ProviderWrapper>
          {children}
          <Toaster />
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
      </body>
    </html>
  );
}
