import React from 'react';
import Link from 'next/link';
import { Pentagon } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/chat" className="flex items-center space-x-2">
          <Pentagon className="h-6 w-6 text-[#007AFF]" />
          <span className="hidden font-bold sm:inline-block">CogEvo サポートAI</span>
          <span className="inline-block sm:hidden font-bold">CogEvo</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <Link href="/disclaimer" className="hover:text-foreground">
            免責事項
          </Link>
          <Link href="/inquiry" className="hover:text-foreground">
            問い合わせ
          </Link>
        </nav>
      </div>
    </header>
  );
}
