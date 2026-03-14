"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import type { NavBook } from "@/lib/content";

type NavigationProps = {
  books: NavBook[];
};

export default function Navigation({ books }: NavigationProps) {
  const pathname = usePathname();

  const defaultOpenParts = books.flatMap((b) => b.parts.map((p) => p.id));

  return (
    <nav className="flex flex-col h-[calc(100vh-64px)] sticky top-16 bg-eerie text-ethereal border-r border-sage/20">
      {books.map((book) => (
        <div key={book.slug} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-moss" strokeWidth={2} />
              <h1 className="text-xl font-bold tracking-tight text-ethereal">
                {book.title}
              </h1>
            </div>
            <p className="mt-2 ml-9 text-sm text-sage font-medium">Sumário</p>
          </div>

          <hr className="border-sage/20 mx-4 shrink-0" />

          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
            <Accordion
              type="multiple"
              defaultValue={defaultOpenParts}
              className="w-full space-y-1"
            >
              {book.parts.map((part) => (
                <AccordionItem
                  value={part.id}
                  key={part.id}
                  className="border-none"
                >
                  <AccordionTrigger className="hover:no-underline py-3 px-2 rounded-md hover:bg-moss/10 transition-colors">
                    <div className="flex items-center text-xs tracking-wider uppercase text-left">
                      <span className="font-semibold text-moss whitespace-nowrap">
                        {part.label}
                      </span>
                      <span className="ml-2 text-sage font-medium lowercase">
                        · {part.title}
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-4 pt-1">
                    <ul className="flex flex-col gap-4 pl-[26px] ml-4 border-l border-sage/20">
                      {part.chapters.map((chapter) => {
                        const href = `/posts/${book.slug}/${part.slug}/${chapter.slug}`;
                        const isActive = pathname === href;

                        return (
                          <li key={chapter.slug}>
                            <Link
                              href={href}
                              className="flex gap-4 text-[15px] group cursor-pointer leading-tight no-underline outline-none"
                            >
                              <span className="text-moss/80 font-mono text-sm w-5 text-right shrink-0">
                                {chapter.number}
                              </span>
                              <span
                                className={`transition-colors ${
                                  isActive
                                    ? "text-ethereal font-medium"
                                    : "text-sage group-hover:text-ethereal"
                                }`}
                              >
                                {chapter.name}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <hr className="border-sage/20 mx-4 shrink-0" />

          <div className="p-5 text-center text-xs text-sage/60 font-medium shrink-0">
            © 2026 · Todos os direitos reservados
          </div>
        </div>
      ))}
    </nav>
  );
}
