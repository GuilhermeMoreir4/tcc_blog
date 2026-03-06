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

const tccParts = [
  {
    id: "part-1",
    part: "PARTE I",
    title: "Assembly e o Parede de Carne",
    chapters: [
      {
        number: "1.",
        name: "Seu primeiro Assembly",
        link: "introduction",
      },
      //     { number: "2.", name: "Modo Real e Registradores", link: "modo-real" },
      //     {
      //       number: "3.",
      //       name: "Falando com o Hardware",
      //       link: "falando-com-hardware",
      //     },
      //     { number: "4.", name: "Hello, Bare Metal!", link: "hello-bare-metal" },
      //   ],
      // },
      // {
      //   id: "part-2",
      //   part: "PARTE II",
      //   title: "O Bootloader",
      //   chapters: [
      //     { number: "5.", name: "A Regra dos 512 Bytes", link: "regra-512-bytes" },
      //     { number: "6.", name: "A Assinatura Mágica", link: "assinatura-magica" },
      //     { number: "7.", name: "Lendo o Disco (int 0x13)", link: "lendo-o-disco" },
      //     { number: "8.", name: "O Salto de Fé", link: "salto-de-fe" },
      //   ],
      // },
      // {
      //   id: "part-3",
      //   part: "PARTE III",
      //   title: "Kernel Mínimo",
      //   chapters: [
      //     {
      //       number: "9.",
      //       name: "Assumindo o Controle",
      //       link: "assumindo-controle",
      //     },
      //     {
      //       number: "10.",
      //       name: "Preparando o Terreno",
      //       link: "preparando-terreno",
      //     },
      //     { number: "11.", name: "Limpando a Tela", link: "limpando-a-tela" },
      //     { number: "12.", name: "Hello, Kernel!", link: "hello-kernel" },
    ],
  },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-[calc(100vh-64px)] sticky top-16 bg-eerie text-ethereal border-r border-sage/20">
      <div className="p-6 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-moss" strokeWidth={2} />
          <h1 className="text-xl font-bold tracking-tight text-ethereal">
            Bootloader na Prática
          </h1>
        </div>
        <p className="mt-2 ml-9 text-sm text-sage font-medium">Sumário</p>
      </div>

      <hr className="border-sage/20 mx-4 shrink-0" />

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
        <Accordion
          type="multiple"
          defaultValue={["part-1", "part-2", "part-3"]}
          className="w-full space-y-1"
        >
          {tccParts.map((section) => (
            <AccordionItem
              value={section.id}
              key={section.id}
              className="border-none"
            >
              <AccordionTrigger className="hover:no-underline py-3 px-2 rounded-md hover:bg-moss/10 transition-colors">
                <div className="flex items-center text-xs tracking-wider uppercase text-left">
                  <span className="font-semibold text-moss whitespace-nowrap">
                    {section.part}
                  </span>
                  <span className="ml-2 text-sage font-medium lowercase">
                    · {section.title}
                  </span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pb-4 pt-1">
                <ul className="flex flex-col gap-4 pl-[26px] ml-4 border-l border-sage/20">
                  {section.chapters.map((chapter) => {
                    const isActive = pathname === `/${chapter.link}`;

                    return (
                      <li key={chapter.number}>
                        <Link
                          href={`/posts/${chapter.link}`}
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
    </nav>
  );
}
