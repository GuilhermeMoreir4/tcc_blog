import Navigation from "@/components/navigation";
import { getBooks } from "@/lib/content";

export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const books = getBooks();

  return (
    <div className="min-h-screen bg-eerie text-ethereal font-sans">
      <aside className="fixed top-0 left-0 z-40 h-screen w-80 overflow-y-auto border-r border-sage/20 bg-eerie">
        <Navigation books={books} />
      </aside>
      <main className="ml-80 flex flex-col items-center py-12 px-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
