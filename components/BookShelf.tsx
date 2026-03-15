"use client";

import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useState } from "react";
import Link from "next/link";

export interface ShelfBook {
  id: string;
  title: string;
  description: string;
  coverColor: string;
  spineColor: string;
  textColor: string;
  href: string;
  postCount: number;
  emoji?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

function Book({ book }: { book: ShelfBook }) {
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const bookVariants = {
    hidden: { opacity: 0, y: 60, rotateX: -15 },
    show: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { duration: 0.6, ease },
    },
  };

  return (
    <motion.div
      variants={shouldReduceMotion ? {} : bookVariants}
      className="relative"
      style={{ perspective: "800px" }}
    >
      <motion.div
        className="relative cursor-pointer"
        style={{
          width: "120px",
          height: "170px",
          transformStyle: "preserve-3d",
        }}
        animate={shouldReduceMotion ? {} : { rotateY: isOpen ? -35 : 0 }}
        whileHover={shouldReduceMotion ? { scale: 1.05 } : { rotateY: -25, y: -8 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        onClick={() => setIsOpen(!isOpen)}
        // onHoverStart={() => !isOpen && setIsOpen(true)}
        // onHoverEnd={() => setIsOpen(false)}
      >
        {/* Lombada */}
        <div
          className="absolute inset-y-0 left-0 flex items-center justify-center rounded-l-sm"
          style={{
            width: "18px",
            background: book.spineColor,
            transform: "translateX(-18px) rotateY(-90deg)",
            transformOrigin: "right center",
          }}
        >
          <span
            style={{
              color: book.textColor,
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              fontSize: "9px",
              letterSpacing: "0.05em",
              transform: "rotate(180deg)",
              fontWeight: 600,
            }}
          >
            {book.title}
          </span>
        </div>

        {/* Capa frontal */}
        <div
          className="absolute inset-0 flex flex-col justify-between rounded-r-sm p-3 shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${book.coverColor} 0%, ${book.spineColor} 100%)`,
            backfaceVisibility: "hidden",
          }}
        >
          {/* Textura sutil */}
          <div
            className="absolute inset-0 rounded-r-sm opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)",
            }}
          />

          <div className="relative z-10">
            {book.emoji && (
              <span className="mb-1 block text-2xl">{book.emoji}</span>
            )}
            <p
              className="font-bold leading-tight"
              style={{ color: book.textColor, fontSize: "11px" }}
            >
              {book.title}
            </p>
          </div>

          <div className="relative z-10">
            <p className="opacity-70" style={{ color: book.textColor, fontSize: "9px" }}>
              {book.postCount} {book.postCount === 1 ? "capítulo" : "capítulos"}
            </p>
          </div>

          {/* Brilho */}
          <div
            className="absolute right-2 top-2 h-8 w-8 rounded-full opacity-20 blur-md"
            style={{ background: "white" }}
          />
        </div>

        {/* Páginas internas */}
        <div
          className="absolute inset-0 rounded-r-sm"
          style={{
            background: "var(--color-background, #1b1b1b)",
            transform: "translateZ(-2px)",
            boxShadow: "inset -3px 0 6px rgba(0,0,0,0.3)",
          }}
        />
      </motion.div>

      {/* Tooltip de preview */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-1/2 top-full z-50 mt-3 w-52 -translate-x-1/2 rounded-xl border p-4 shadow-2xl"
            style={{
              background: "var(--color-surface, #242424)",
              borderColor: "var(--color-border, #334155)",
            }}
          >
            {/* Setinha */}
            <div
              className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45"
              style={{
                background: "var(--color-surface, #242424)",
                borderLeft: "1px solid var(--color-border, #334155)",
                borderTop: "1px solid var(--color-border, #334155)",
              }}
            />
            <p className="mb-1 text-sm font-semibold text-ethereal">{book.title}</p>
            <p className="mb-3 text-xs leading-relaxed text-sage">{book.description}</p>
            <Link
              href={book.href}
              className="inline-block rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
              style={{ background: book.coverColor, color: book.textColor }}
            >
              Começar a ler →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface BookShelfProps {
  books: ShelfBook[];
  title?: string;
}

export function BookShelf({ books, title = "Capítulos" }: BookShelfProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <section className="py-12 px-4 w-full max-w-4xl mx-auto">
      {title && (
        <motion.h2
          className="mb-12 text-center text-2xl font-bold tracking-tight text-ethereal"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h2>
      )}

      <motion.div
        className="flex flex-wrap justify-center gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        {books.map((book) => (
          <Book key={book.id} book={book} />
        ))}
      </motion.div>

      {/* Sombra da prateleira */}
      <motion.div
        className="mx-auto mt-6 h-3 max-w-2xl rounded-full bg-black opacity-20 blur-md"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.2 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      />
    </section>
  );
}
