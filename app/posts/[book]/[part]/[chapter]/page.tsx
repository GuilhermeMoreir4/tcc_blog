type BlogPostMetadata = {
  title: string;
  description: string;
  date: string;
  tags: string[];
};

type PageProps = {
  params: Promise<{ book: string; part: string; chapter: string }>;
};

export default async function Page({ params }: PageProps) {
  const { book, part, chapter } = await params;

  const post = await import(`@/content/${book}/${part}/${chapter}.mdx`);

  const MDXContent = post.default;
  const metadata: BlogPostMetadata = post.metadata;

  const date = new Date(metadata.date);
  const formattedDate = new Intl.DateTimeFormat("pt-br", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  return (
    <div className="w-full max-w-[800px]">
      <header className="flex flex-col mt-6 mb-12 border-b border-sage/20 pb-8 gap-4">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-ethereal">
          {metadata.title}
        </h1>
        <span>{metadata.description}</span>
        <div className="flex items-center gap-3 text-sm text-sage">
          <span>{formattedDate}</span>
          {metadata.tags && metadata.tags.length > 0 && (
            <>
              <span className="text-sage/50">|</span>
              <div className="flex gap-2">
                {metadata.tags.map((tag: string) => (
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

      <article className="prose max-w-none w-full pb-16">
        <MDXContent />
      </article>
    </div>
  );
}
