import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../components/language-provider";
import { ApiErrorAlert } from "../components/api-error-alert";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Logos College | Student Portal",
  description: "Register and manage your academic journey at Logos College",
  icons: {
    icon: [
      { url: "/icons/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon.png", sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          {children}
          <ApiErrorAlert />
        </LanguageProvider>
      </body>
    </html>
  );
}
