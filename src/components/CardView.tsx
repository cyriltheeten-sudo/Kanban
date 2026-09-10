import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "../types";

interface CardViewProps {
    card: Card;
    gem: string;
    onEdit: (id: number, title: string) => void;
    onDelete: (id: number) => void;
    onOpen: (card: Card) => void;
}

export default function CardView({ card, gem, onEdit, onDelete, onOpen }: CardViewProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: `card-${card.id}` });

    const baseBg = `linear-gradient(135deg, ${gem}14 0%, #141d22 55%)`;
    const hoverBg = `linear-gradient(135deg, ${gem}24 0%, #172228 55%)`;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        background: baseBg,
        borderLeft: `3px solid ${gem}`,
    } as React.CSSProperties;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative rounded-xl border border-transparent p-3.5 cursor-grab active:cursor-grabbing transition-colors duration-200"
            onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = baseBg; }}
        >
            <div className="flex items-start justify-between gap-2">
                <p {...listeners} {...attributes} className="text-sm text-ink font-medium leading-snug flex-1">
                    {card.title}
                </p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                    <button onClick={() => onEdit(card.id, card.title)} className="text-faint hover:text-ink text-xs px-1">✎</button>
                    <button onClick={() => onDelete(card.id)} className="text-faint hover:text-red-400 text-xs px-1">✕</button>
                    <button onClick={(e) => { e.stopPropagation(); onOpen(card); }} className="text-faint hover:text-ink text-xs px-1" title="Ouvrir la carte">⋯</button>
                </div>
            </div>
        </div>
    );
}
