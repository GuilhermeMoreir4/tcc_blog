import RoadMap from "@/components/roadMap";
import { BookOpen, CodeXml } from "lucide-react";

export default function Home() {
  return (
    <div className="pt-10 flex flex-col items-center justify-center gap-10 min-h-screen">
      <div
        className="
    inline-flex items-center gap-3 
    rounded-full border border-moss 
    bg-moss/10 px-4 py-1.5 
    font-mono text-sm font-medium text-moss
    shadow-[0_0_2px_rgba(89,95,57,0.4)]
  "
      >
        <span
          className="
      h-2 w-2 rounded-full 
      bg-moss 
      shadow-[0_0_6px_#595f39]
      
    "
        ></span>
        <div className="text-xl">Objeto de Aprendizagem — TCC 2026</div>
      </div>
      <h2 className="text-xl">
        Um livro interativo para aprendizado de conceitos fundamentais de
        sistemas operacionais de forma prática e divertida
      </h2>
      <div className="inline-flex gap-5">
        <a className="text-xl inline-flex items-center gap-3 p-2 rounded-md bg-moss hover:cursor-pointer hover:opacity-90">
          <BookOpen /> Começar a Ler
        </a>
        <a className="text-xl inline-flex items-center gap-3 p-2 rounded-md border border-moss hover:cursor-pointer hover:opacity-90">
          <CodeXml color="#595f39" /> Sobre o projeto
        </a>
      </div>
      <RoadMap />
      <footer>
        <section>
          <p>Guigo ink</p>
        </section>
        <section>Abababa</section>
      </footer>
    </div>
  );
}
