import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Nomado - Your Smart Travel Companion",
    description: "Plan your perfect trip with Nomado! Get instant visa information, personalized travel itineraries, and smart packing lists.",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
