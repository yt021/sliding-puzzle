import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start"
});

export const metadata: Metadata = {
  title: "Sliding Puzzle",
  description: "Retro 4x4 sliding puzzle with sounds and timer"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={pressStart.className}>{children}</body>
    </html>
  );
}
