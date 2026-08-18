"use client";

import { motion } from "motion/react";
import { Github, BookOpen, Cpu, Terminal } from "lucide-react";
import Link from "next/link";

const ease = [0.22, 1, 0.36, 1] as const;

function Section({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

const features = [
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Aprendizado Interativo",
    description:
      "Conceitos de sistemas operacionais apresentados de forma progressiva, com exemplos práticos e visualizações.",
  },
  {
    icon: <Terminal className="w-5 h-5" />,
    title: "Terminal Emulado",
    description:
      "Um emulador x86 rodando Alpine Linux diretamente no navegador — sem instalar nada.",
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    title: "Do Bootloader ao Kernel",
    description:
      "A jornada começa no boot e vai até os fundamentos do kernel, passando por assembly, memória e processos.",
  },
];

export default function SobrePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 flex flex-col gap-16">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="inline-flex items-center gap-2 text-sm font-mono text-moss"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-moss shadow-[0_0_6px_#595f39]" />
          TCC 2026
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.08 }}
          className="text-4xl font-bold tracking-tight text-ethereal"
        >
          Sobre o Projeto
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.16 }}
          className="text-sage text-lg leading-relaxed"
        >
          O <strong className="text-ethereal">Bootloader.blog</strong> é o
          Trabalho de Conclusão de Curso de Guilherme Moreira — um objeto de
          aprendizagem interativo para ensinar conceitos fundamentais de sistemas
          operacionais de forma prática e divertida.
        </motion.p>
      </div>

      {/* Divisor */}
      <motion.hr
        className="border-sage/20"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease }}
        style={{ originX: 0 }}
      />

      {/* Features */}
      <Section>
        <h2 className="text-xl font-semibold text-ethereal mb-6">
          O que você vai encontrar
        </h2>
        <div className="flex flex-col gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.1 }}
              className="flex gap-4 items-start"
            >
              <div className="mt-0.5 p-2 rounded-lg bg-moss/10 text-moss shrink-0">
                {f.icon}
              </div>
              <div>
                <p className="font-medium text-ethereal">{f.title}</p>
                <p className="text-sm text-sage mt-0.5 leading-relaxed">
                  {f.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Divisor */}
      <motion.hr
        className="border-sage/20"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease }}
        style={{ originX: 0 }}
      />

      {/* Autor */}
      <Section>
        <h2 className="text-xl font-semibold text-ethereal mb-4">O Autor</h2>
        <p className="text-sage leading-relaxed">
          Desenvolvido por{" "}
          <strong className="text-ethereal">Guilherme Moreira</strong>, estudante
          de Ciência da Computação. Este projeto une a paixão por jogos, sistemas
          de baixo nível e educação — transformando um TCC em uma experiência
          interativa real.
        </p>
      </Section>

      {/* CTAs */}
      <Section delay={0.1}>
        <div className="flex flex-wrap gap-4">
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Link
              href="/posts/bootloader-na-pratica/parte-1/1-introduction"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-moss text-ethereal font-medium hover:opacity-90 transition-opacity"
            >
              <BookOpen className="w-4 h-4" />
              Começar a Ler
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <a
              href="https://github.com/GuilhermeMoreir4/BootloaderProject"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-moss text-ethereal font-medium hover:opacity-90 transition-opacity"
            >
              <Github className="w-4 h-4" />
              Ver no GitHub
            </a>
          </motion.div>
        </div>
      </Section>
    </div>
  );
}
