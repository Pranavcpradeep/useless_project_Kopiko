import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlladeenGPT — The AI That Refuses to Help",
  description:
    "AlladeenGPT is a deliberately useless AI chatbot inspired by General Aladeen. It refuses to answer, roasts you for asking, and loads forever on purpose.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0d0202] text-[#f4e7c1] antialiased">{children}</body>
    </html>
  );
}
