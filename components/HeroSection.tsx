"use client";

import { motion } from "motion/react";
import { BookOpen, CodeXml } from "lucide-react";
import Link from "next/link";

const ease = [0.22, 1, 0.36, 1] as const;

export default function HeroSection() {
  return (
    <div className="flex flex-col items-center justify-center gap-10 text-center px-4">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="inline-flex items-center gap-3 rounded-full border border-moss bg-moss/10 px-4 py-1.5 font-mono text-sm font-medium text-moss shadow-[0_0_2px_rgba(89,95,57,0.4)]"
      >
        <span className="h-2 w-2 rounded-full bg-moss shadow-[0_0_6px_#595f39]" />
        <span className="text-xl">Objeto de Aprendizagem — TCC 2026</span>
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.1 }}
        className="max-w-2xl text-xl leading-relaxed text-sage"
      >
        Um livro interativo para aprendizado de conceitos fundamentais de
        sistemas operacionais de forma prática e divertida
      </motion.h2>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.2 }}
        className="inline-flex gap-5"
      >
        <motion.div
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Link
            href="/posts/bootloader-na-pratica/parte-1/introduction"
            className="text-xl inline-flex items-center gap-3 p-2 px-4 rounded-md bg-moss hover:opacity-90 transition-opacity"
          >
            <BookOpen /> Começar a Ler
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Link
            href="/sobre"
            className="text-xl inline-flex items-center gap-3 p-2 px-4 rounded-md border border-moss hover:opacity-90 transition-opacity"
          >
            <CodeXml color="#595f39" /> Sobre o projeto
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
