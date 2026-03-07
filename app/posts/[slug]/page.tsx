import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";

type BlogPostMetadata = {
  title: string;
  description: string;
  date: string;
  tags: string[];
};

type BlogProps = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: BlogProps) {
  const slug = await params;

  // Importa o arquivo MDX dinamicamente
  const post = await import(`@/content/${slug.slug}.mdx`);

  const MDXContent = post.default;

  const metadata: BlogPostMetadata = post.metadata;
  const title = metadata.title;
  const date = new Date(metadata.date);
  const tags = metadata.tags;
  const description = metadata.description;

  const formattedDate = new Intl.DateTimeFormat("pt-br", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  return (
    <div className="min-h-screen bg-eerie text-ethereal font-sans">
      {/* Menu Lateral Fixo (Fixed) */}
      <aside className="fixed top-0 left-0 z-40 h-screen w-80 overflow-y-auto border-r border-sage/20 bg-eerie">
        <Navigation />
      </aside>

      {/* Área de Conteúdo Principal (Margem ml-80 compensa a largura do menu) */}
      <main className="ml-80 flex flex-col items-center py-12 px-8 min-h-screen">
        <div className="w-full max-w-[800px]">
          {/* Cabeçalho da Postagem (Metadados) */}
          <header className="flex flex-col mt-6 mb-12 border-b border-sage/20 pb-8 gap-4">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-ethereal">
              {title}
            </h1>
            <span>{description}</span>
            <div className="flex items-center gap-3 text-sm text-sage">
              <span>{formattedDate}</span>
              {tags && tags.length > 0 && (
                <>
                  <span className="text-sage/50">|</span>
                  <div className="flex gap-2">
                    {tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full border border-moss/50 text-moss px-3 py-1 text-xs font-medium bg-moss/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Conteúdo MDX */}
          <article className="prose max-w-none w-full pb-16">
            <MDXContent />
          </article>
          
        </div>
      </main>
    </div>
  );
}

export const defaultParams = false;
