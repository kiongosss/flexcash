/*
Project Name: Flexit
Project URI: 
Description: A web app where users pay to flex on a public leaderboard
Version: 1.0.0
Author: KaseeMoka
Author URI: https://github.com/kiongosss
Text Domain: 
*/

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Flex Cash - The Internet's Most Expensive Leaderboard",
  description: "Pay to flex. The internet's most expensive leaderboard.",
  openGraph: {
    title: "Flex Cash - The Internet's Most Expensive Leaderboard",
    description: "Pay to flex. The internet's most expensive leaderboard.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Flex Cash",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flex Cash - The Internet's Most Expensive Leaderboard",
    description: "Pay to flex. The internet's most expensive leaderboard.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-black">
      <body className={`${inter.variable} font-sans antialiased h-full text-white`}>
        <div className="min-h-screen bg-black">
          {children}
        </div>
      </body>
    </html>
  );
}
