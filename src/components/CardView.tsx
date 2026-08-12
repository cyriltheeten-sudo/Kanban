import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "../types";

interface CardViewProps {
    card: Card;
    gem: string;
    onEdit: (id: number, title: string) => void;
    onDelete: (id: number) => void;
}

export default function CardView({ card, gem, onEdit, onDelete }: CardViewProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: `card-${card.id}` });

    const style = {
        ["--gem"]: gem,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    } as React.CSSProperties;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="gem-card group rounded-xl px-3 py-2.5 cursor-grab active:cursor-grabbing"
        >
            <div className="flex items-start justify-between gap-2">
                <p {...listeners} {...attributes} className="text-sm text-zinc-100 leading-snug flex-1">
                    {card.title}
                </p>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                    <button onClick={() => onEdit(card.id, card.title)} className="text-zinc-400 hover:text-zinc-100 text-xs">✎</button>
                    <button onClick={() => onDelete(card.id)} className="text-zinc-400 hover:text-red-400 text-xs">✕</button>
                </div>
            </div>
            {card.description && <p className="mt-1 text-xs text-zinc-500">{card.description}</p>}
        </div>
    );
}