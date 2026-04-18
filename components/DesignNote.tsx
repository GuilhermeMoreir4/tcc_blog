import { Info } from "lucide-react";

type DesignNoteProps = {
  title: string;
  children: React.ReactNode;
};

export default function DesignNote({ title, children }: DesignNoteProps) {
  return (
    <aside className="my-8 rounded-r-md border-l-2 border-moss bg-surface pl-5 pr-5 py-4">
      <div className="mb-2 flex items-center gap-2">
        <Info size={15} className="shrink-0 text-moss" />
        <span className="font-mono text-sm font-semibold text-moss">
          {title}
        </span>
      </div>
      <div className="text-sm leading-relaxed text-sage [&_code]:font-mono [&_code]:text-moss">
        {children}
      </div>
    </aside>
  );
}
