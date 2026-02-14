import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Radar — LLM Visibility Monitor",
  description:
    "Track whether your brand gets cited in ChatGPT, Perplexity, Gemini & AI Overviews. The affordable LLM citation monitoring tool for growing brands.",
  openGraph: {
    title: "AI Radar — LLM Visibility Monitor",
    description: "Track your brand's visibility across AI platforms",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
