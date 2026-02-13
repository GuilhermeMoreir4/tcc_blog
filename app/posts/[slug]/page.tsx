type BlogPostMetadata = {
  title: string;
  description: string;
  date: string;
  tags: [];
};

type BlogProps = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: BlogProps) {
  const slug = await params;

  const post = await import(`@/content/${slug.slug}.mdx`);

  const MDXContent = post.default;

  const metadata: BlogPostMetadata = post.metadata;
  const title = metadata.title;
  const date = new Date(metadata.date);
  const tags = metadata.tags;

  const formattedDate = new Intl.DateTimeFormat("pt-br", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      {/* some wrappers for styling and additional content*/}
      <div className="mx-auto w-full max-w-[768px]">
        <article className="prose w-full p-6">
          {/* A title section using the markdown metadata */}
          <div className="mt-6 mb-8">
            <h1 className="mb-2 text-4xl font-bold">{title}</h1>
            <div className="flex items-center gap-2 py-2">
              <span className="text-sm">{formattedDate}</span>|
              <div className="flex gap-1">
                {tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="border-foreground rounded-full border px-2 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <MDXContent />
        </article>
      </div>
    </div>
  );
}

export const defaultParams = false;
