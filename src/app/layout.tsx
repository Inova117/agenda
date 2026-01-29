import type { Metadata } from "next";
import { Playfair_Display, Nunito } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agenda - Tactile Sanctuary",
  description: "A minimalist, tactile personal organizer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${playfair.variable} ${nunito.variable} antialiased bg-[#0a0a0a] text-[#e5e5e0] selection:bg-[#3a0d0d] selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
