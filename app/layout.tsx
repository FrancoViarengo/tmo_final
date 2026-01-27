import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#141414",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: "NeoManga - Tu lector de manga online",
    template: "%s | NeoManga",
  },
  description: "Lee manga, manhwa y manhua online gratis en alta calidad. Actualizaciones diarias.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NeoManga",
  },
  openGraph: {
    title: "NeoManga",
    description: "Lee manga, manhwa y manhua online gratis.",
    type: "website",
    locale: "es_ES",
    siteName: "NeoManga",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "NeoManga Icon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NeoManga",
    description: "La mejor experiencia de lectura de manga.",
    images: ["/icon-512.png"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <div className="min-h-screen flex flex-col">
          <Navbar />

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-[#141414] border-t border-white/5 py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-gray-500 text-sm">
                © 2024 TMO Clone. Todos los derechos reservados.
              </p>
            </div>
          </footer>
          {/* Toaster for Notifications */}
          <Toaster richColors position="top-right" theme="dark" />
        </div>
      </body>
    </html>
  );
}
