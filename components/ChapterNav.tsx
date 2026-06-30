import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";

type ChapterNavProps = {
  prev?: string;
  next?: string;
};

export default function ChapterNav({ prev, next }: ChapterNavProps) {
  return (
    <footer className="flex justify-between mt-8">
      {prev ? (
        <a href={prev} className="flex items-center gap-2 hover:cursor-pointer no-underline">
          <ArrowLeft />
          Capítulo anterior
        </a>
      ) : (
        <a href="" className="flex items-center gap-2 hover:cursor-pointer no-underline">
          Sumário
          <ArrowUp />
        </a>
      )}
      {next && (
        <a href={next} className="flex items-center gap-2 hover:cursor-pointer no-underline">
          Próximo capítulo
          <ArrowRight />
        </a>
      )}
    </footer>
  );
}
