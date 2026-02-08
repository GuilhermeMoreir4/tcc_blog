"use client";
import { Github } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-title font-bold text-xl tracking-tight group-hover:text-sage transition-colors">
            Bootloader.blog
          </span>
        </Link>

        <nav>
          <ul className="flex items-center gap-8">
            <li>
              <Link
                href="/capitulos"
                className="font-sans text-lg font-medium hover:text-sage"
              >
                Capítulos
              </Link>
            </li>
            <li>
              <Link
                href="/sobre"
                className="font-sans text-lg font-medium  hover:text-sage"
              >
                Sobre o TCC
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/GuilhermeMoreir4/Implementation-TCC"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="hover:cursor-pointer" />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
