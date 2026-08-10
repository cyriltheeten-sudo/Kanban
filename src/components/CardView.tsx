import type { Card } from "../types";

interface CardViewProps {
  card: Card;
  gem: string;
  onEdit: (id: number, title: string) => void;
  onDelete: (id: number) => void;
}

export default function CardView({ card, gem, onEdit, onDelete }: CardViewProps) {
  return (
    <div
      className="gem-card group rounded-xl px-3 py-2.5"
      style={{ ["--gem"]: gem } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-zinc-100 leading-snug">{card.title}</p>
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition shrink-0">
          <button
            onClick={() => onEdit(card.id, card.title)}
            className="text-zinc-400 hover:text-zinc-100 text-xs"
          >
            ✎
          </button>
          <button
            onClick={() => onDelete(card.id)}
            className="text-zinc-400 hover:text-red-400 text-xs"
          >
            ✕
          </button>
        </div>
      </div>
      {card.description && (
        <p className="mt-1 text-xs text-zinc-500">{card.description}</p>
      )}
    </div>
  );
}