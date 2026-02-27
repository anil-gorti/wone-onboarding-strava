"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900">
          WONE
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-zinc-600 hover:text-zinc-900">
            Runners
          </Link>
          <Link href="/pipeline" className="text-zinc-600 hover:text-zinc-900">
            Pipeline
          </Link>
        </nav>
      </div>
    </header>
  );
}
