import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ভূমিসেবা সহায়তা কেন্দ্র (LSFC) - ব্যবস্থাপনা প্ল্যাটফর্ম",
  description: "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত ভূমিসেবা সহায়তা কেন্দ্র (LSFC) স্বয়ংক্রিয় ব্যবস্থাপনা প্ল্যাটফর্ম",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className="antialiased bg-slate-50 text-slate-800 font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
