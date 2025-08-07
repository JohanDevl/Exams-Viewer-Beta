import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeInitializer } from "@/components/providers/ThemeInitializer";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ModalsProvider } from "@/components/providers/ModalsProvider";
import { KeyboardShortcutsProvider } from "@/components/providers/KeyboardShortcutsProvider";

// Base path for GitHub Pages deployment
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/Exams-Viewer' : '';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Exams Viewer - ServiceNow Certification Training",
  description: "Modern platform for ServiceNow certification exam preparation with practice questions, statistics, and progress tracking.",
  keywords: "ServiceNow, certification, exam, training, CAD, CSA, CIS",
  authors: [{ name: "Exams Viewer Team" }],
  creator: "Exams Viewer",
  publisher: "Exams Viewer",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://exams-viewer.app'),
  openGraph: {
    title: "Exams Viewer - ServiceNow Certification Training",
    description: "Modern platform for ServiceNow certification exam preparation",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Exams Viewer - ServiceNow Certification Training",
    description: "Modern platform for ServiceNow certification exam preparation",
  },
  manifest: `${BASE_PATH}/manifest.json`,
  icons: {
    icon: [
      { url: `${BASE_PATH}/favicon.ico`, sizes: "any" },
      { url: `${BASE_PATH}/favicon.svg`, type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility
  userScalable: true, // Allow user scaling - iOS requires this for proper touch behavior
  viewportFit: "cover", // Better mobile viewport handling
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeInitializer />
        <ToastProvider />
        <ModalsProvider />
        <KeyboardShortcutsProvider />
        <div id="root" className="min-h-screen bg-background text-foreground">
          {children}
        </div>
      </body>
    </html>
  );
}
