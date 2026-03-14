import fs from "fs";
import path from "path";

export type NavChapter = {
  slug: string;
  number: string;
  name: string;
};

export type NavPart = {
  id: string;
  slug: string;
  label: string;
  title: string;
  chapters: NavChapter[];
};

export type NavBook = {
  slug: string;
  title: string;
  parts: NavPart[];
};

function toRoman(n: number): string {
  const numerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return numerals[n - 1] ?? String(n);
}

function partSlugToLabel(slug: string): string {
  const match = slug.match(/parte-(\d+)/i);
  if (match) return `PARTE ${toRoman(parseInt(match[1]))}`;
  return slug.toUpperCase();
}

function extractMdxTitle(filePath: string): string | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const match = content.match(/title:\s*["']([^"']+)["']/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function readMeta(dir: string): Record<string, string> {
  const metaPath = path.join(dir, "_meta.json");
  try {
    return JSON.parse(fs.readFileSync(metaPath, "utf-8"));
  } catch {
    return {};
  }
}

export function getBooks(): NavBook[] {
  const contentDir = path.join(process.cwd(), "content");
  const books: NavBook[] = [];

  const bookFolders = fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const bookSlug of bookFolders) {
    const bookDir = path.join(contentDir, bookSlug);
    const bookMeta = readMeta(bookDir);
    const bookTitle = bookMeta.title ?? bookSlug;

    const parts: NavPart[] = [];

    const partFolders = fs
      .readdirSync(bookDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    for (const partSlug of partFolders) {
      const partDir = path.join(bookDir, partSlug);
      const partMeta = readMeta(partDir);
      const partTitle = partMeta.title ?? partSlug;
      const partLabel = partSlugToLabel(partSlug);

      const chapterFiles = fs
        .readdirSync(partDir)
        .filter((f) => f.endsWith(".mdx"))
        .sort();

      const chapters: NavChapter[] = chapterFiles.map((file, i) => {
        const slug = file.replace(".mdx", "");
        const name =
          extractMdxTitle(path.join(partDir, file)) ?? slug;
        return { slug, number: `${i + 1}.`, name };
      });

      parts.push({
        id: `${bookSlug}-${partSlug}`,
        slug: partSlug,
        label: partLabel,
        title: partTitle,
        chapters,
      });
    }

    books.push({ slug: bookSlug, title: bookTitle, parts });
  }

  return books;
}
