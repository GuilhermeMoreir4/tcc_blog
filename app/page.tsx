import RoadMap from "@/components/roadMap";
import HeroSection from "@/components/HeroSection";
import { BookShelf, type ShelfBook } from "@/components/BookShelf";
import { getBooks } from "@/lib/content";

function buildShelfBooks(): ShelfBook[] {
  const books = getBooks();

  const palette: Array<{
    coverColor: string;
    spineColor: string;
    textColor: string;
  }> = [
    {
      coverColor: "#595f39",
      spineColor: "#3a3f25",
      textColor: "#e4e4de",
    },
    {
      coverColor: "#3b82f6",
      spineColor: "#1d4ed8",
      textColor: "#eff6ff",
    },
    {
      coverColor: "#8b5cf6",
      spineColor: "#5b21b6",
      textColor: "#f5f3ff",
    },
    {
      coverColor: "#10b981",
      spineColor: "#047857",
      textColor: "#ecfdf5",
    },
  ];

  const result: ShelfBook[] = [];
  let colorIdx = 0;

  for (const book of books) {
    for (const part of book.parts) {
      const colors = palette[colorIdx % palette.length];
      colorIdx++;

      const firstChapter = part.chapters[0];
      const href = firstChapter
        ? `/posts/${book.slug}/${part.slug}/${firstChapter.slug}`
        : `/posts/${book.slug}`;

      result.push({
        id: `${book.slug}-${part.slug}`,
        title: part.title,
        description: `Parte do livro "${book.title}" — ${part.chapters.length} ${
          part.chapters.length === 1 ? "capítulo" : "capítulos"
        } sobre este tema.`,
        href,
        postCount: part.chapters.length,
        ...colors,
      });
    }
  }

  return result;
}

export default function Home() {
  const shelfBooks = buildShelfBooks();

  return (
    <div className="pt-10 flex flex-col items-center justify-center gap-10 min-h-screen">
      <HeroSection />
      {/* <RoadMap /> */}
      {shelfBooks.length > 0 && (
        <BookShelf books={shelfBooks} title="Conteúdo do Livro" />
      )}
      <footer className="pb-8 text-center text-xs text-sage/60">
        <p>© 2026 Guigo ink · Todos os direitos reservados</p>
      </footer>
    </div>
  );
}
