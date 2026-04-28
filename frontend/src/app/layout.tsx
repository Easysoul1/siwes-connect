import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";

const fraunces = Fraunces({ subsets: ["latin"], style: "italic", weight: "900", variable: "--font-display" });
const outfit = Outfit({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "SIWES Connect",
  description: "Find Your Place. Build Your Future."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${outfit.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}