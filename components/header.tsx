"use client";
import { Github } from "lucide-react";
import Link from "next/link";
import { motion, useScroll } from "motion/react";

export default function Header() {
  const { scrollYProgress } = useScroll();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-eerie/80 backdrop-blur-md">
      {/* Scroll progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-moss"
        style={{ scaleX: scrollYProgress }}
      />

      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex-row items-center gap-2 group">
          <motion.span
            className="font-title font-bold text-xl tracking-tight group-hover:text-sage transition-colors"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            Bootloader.blog
          </motion.span>
        </Link>

        <nav>
          <ul className="flex items-center gap-8">
            <li>
              <Link
                href="/sobre"
                className="font-sans text-lg font-medium hover:text-sage transition-colors"
              >
                Sobre o TCC
              </Link>
            </li>
            <li>
              <motion.a
                href="https://github.com/GuilhermeMoreir4/Implementation-TCC"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Github className="hover:cursor-pointer hover:text-sage transition-colors" />
              </motion.a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
