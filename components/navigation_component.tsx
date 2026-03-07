import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";

type NavigationFooterComponentProps = {
  last_chapter: string;
  next_chapter: string;
  last_chapter_link: string;
  next_chapter_link: string;
};

export default function NavigationFooterComponent({
  last_chapter,
  next_chapter,
  last_chapter_link,
  next_chapter_link,
}: NavigationFooterComponentProps) {
  return (
    <footer className="flex justify-between">
      <a
        href={last_chapter_link}
        className="hover:cursor-pointer no-underline gap-2"
      >
        {last_chapter}
        <ArrowLeft />
      </a>

      <a href="" className="hover:cursor-pointer no-underline gap-2">
        Sumário
        <ArrowUp />
      </a>
      <a
        href={next_chapter_link}
        className="hover:cursor-pointer no-underline gap-2"
      >
        {next_chapter}
        <ArrowRight />
      </a>
    </footer>
  );
}
