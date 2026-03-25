import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Domclick Assistant — Admin Panel",
  description:
    "Административная панель Domclick Assistant — AI-помощника по недвижимости в Telegram",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
