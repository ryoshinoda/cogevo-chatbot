import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "CogEvo サポートAI",
  description: "CogEvo社内・特約店向け問い合わせ対応AIチャットボット",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.className} bg-background text-foreground antialiased min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
