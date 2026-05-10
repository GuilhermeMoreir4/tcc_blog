import { Zap, Sword, Flame } from "lucide-react";

type ChallengeProps = {
  level: 1 | 2 | 3;
  children: React.ReactNode;
};

const levelConfig = {
  1: {
    label: "Nível 1 · Aquecimento",
    Icon: Zap,
    border: "border-moss",
    accent: "text-moss",
    bg: "bg-moss/5",
  },
  2: {
    label: "Nível 2 · Prática",
    Icon: Sword,
    border: "border-sage",
    accent: "text-sage",
    bg: "bg-sage/5",
  },
  3: {
    label: "Nível 3 · Desafio",
    Icon: Flame,
    border: "border-ethereal/40",
    accent: "text-ethereal/70",
    bg: "bg-ethereal/5",
  },
};

export default function Challenge({ level, children }: ChallengeProps) {
  const { label, Icon, border, accent, bg } = levelConfig[level];

  return (
    <div className={`my-6 rounded-r-md border-l-2 ${border} ${bg} pl-5 pr-5 py-4`}>
      <div className={`mb-2 flex items-center gap-2 ${accent}`}>
        <Icon size={15} className="shrink-0" />
        <span className="font-mono text-sm font-semibold">{label}</span>
      </div>
      <div className="text-sm leading-relaxed text-sage [&_code]:font-mono [&_code]:text-moss [&_strong]:text-ethereal">
        {children}
      </div>
    </div>
  );
}
