import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Auto Slot Engine",
  description:
    "Slot machine simulator with automated spinning and statistics tracking."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slot-dark text-white`}>
        {children}
      </body>
    </html>
  );
}
