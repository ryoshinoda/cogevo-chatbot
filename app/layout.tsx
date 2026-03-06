import type { Metadata } from "next";
import "./globals.css";

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
      <body className={`font-sans bg-background text-foreground antialiased min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
