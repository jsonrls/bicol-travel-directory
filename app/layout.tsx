import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const bebasNeue = Bebas_Neue({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
});

// Load Inter for modern body copy
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BicolStay | Discover Resorts, Beaches & Hotels in Bicol Region",
  description:
    "Explore curated resorts, white sand beach camps, cozy staycations, and premium boutique hotels across Albay, Camarines Sur, Sorsogon, and more.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  keywords: [
    "Bicol Stay",
    "Bicol resorts",
    "Caramoan beach",
    "Calaguas island camp",
    "Misibis Bay Albay",
    "Siama Hotel Sorsogon",
    "Lola Sayong Gubat",
    "Philippine travel guide",
  ],
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "https://bicolstay.com",
    title: "BicolStay | Discover Resorts, Beaches & Hotels in Bicol Region",
    description:
      "Explore curated resorts, white sand beach camps, cozy staycations, and premium boutique hotels across Albay, Camarines Sur, Sorsogon, and more.",
    siteName: "BicolStay",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${inter.variable} font-sans antialiased scroll-smooth`}
    >
      <body suppressHydrationWarning className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
