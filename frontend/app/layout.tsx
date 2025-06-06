import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Nomado - Your Smart Travel Companion | Visa Info & Trip Planning",
  description: "Plan your perfect trip with Nomado! Get instant visa information, personalized travel itineraries, and smart packing lists. Your all-in-one travel companion for hassle-free adventures.",
  keywords: "travel planning, visa information, trip itinerary, travel companion, visa requirements, travel tips, packing list, travel guide",
  openGraph: {
    title: "Nomado - Your Smart Travel Companion",
    description: "Plan your perfect trip with Nomado! Get instant visa information, personalized travel itineraries, and smart packing lists.",
    type: "website",
    locale: "en_US",
    siteName: "Nomado",
    images: [
      {
        url: "https://nomado.live/image.png",
        width: 1200,
        height: 630,
        alt: "Nomado - Your Smart Travel Companion",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nomado - Your Smart Travel Companion",
    description: "Plan your perfect trip with Nomado! Get instant visa information, personalized travel itineraries, and smart packing lists.",
    images: [
      {
        url: "https://nomado.live/image.png",
        width: 1200,
        height: 630,
        alt: "Nomado - Your Smart Travel Companion",
        type: "image/png",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
