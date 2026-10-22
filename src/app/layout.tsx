import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SITE_URL } from "@/lib/constants";
import "@/app/globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Pernikahan Nurpalah Setiawan & Irma Suryaningsih",
  description:
    "Dengan penuh kebahagiaan, kami mengundang Anda untuk menyaksikan dan memberikan doa restu atas pernikahan Nurpalah Setiawan & Irma Suryaningsih",
  keywords: [
    "pernikahan",
    "wedding",
    "Nurpalah Setiawan",
    "Irma Suryaningsih",
    "undangan digital",
    "#NurpalahIrma2026",
  ],
  authors: [{ name: "Nurpalah Setiawan & Irma Suryaningsih" }],
  creator: "Nurpalah Setiawan & Irma Suryaningsih",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: "/icon.png",
  },
  robots: {
    index: true,
    follow: false,
    googleBot: {
      index: true,
      follow: false,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Pernikahan Nurpalah Setiawan & Irma Suryaningsih — ",
    description:
      "Kami mengundang Anda untuk menyaksikan dan memberikan doa restu atas pernikahan kami. ",
    siteName: "Undangan Pernikahan Nurpalah Setiawan & Irma Suryaningsih",
    locale: "id_ID",
    images: [
      {
        url: `${SITE_URL}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Pernikahan Nurpalah Setiawan & Irma Suryaningsih",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pernikahan Nurpalah Setiawan & Irma Suryaningsih — ",
    description:
      "Kami mengundang Anda untuk menyaksikan momen bahagia kami.",
    images: [`${SITE_URL}/images/og-image.png`],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF8E7" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0A08" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${playfair.variable} ${inter.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
