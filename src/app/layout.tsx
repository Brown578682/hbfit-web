import type { Metadata } from "next";
import { Inter, Montserrat, Lora } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", weight: ["400", "600", "700", "800"] });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: {
    default: "Honor Bound FIT | Veteran-Owned Strength & Conditioning",
    template: "%s | Honor Bound FIT",
  },
  description:
    "A veteran-owned strength and conditioning facility in Fredericksburg, VA. Forging mission-ready members through discipline, resilience, and service.",
  metadataBase: new URL("https://honorboundfit.com"),
  openGraph: {
    siteName: "Honor Bound FIT",
    locale: "en_US",
    type: "website",
  },
  manifest: "/manifest.json",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} ${lora.variable}`}>
      <body className="bg-black text-white antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
