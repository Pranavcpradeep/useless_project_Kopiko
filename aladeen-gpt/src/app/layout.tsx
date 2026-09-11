import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlladeenGPT — The Supreme AI Dictator",
  description:
    "Chat with Admiral General Aladeen, the world's greatest dictator. He will insult you, give wrong answers, and make you feel magnificent about how wrong you are.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
