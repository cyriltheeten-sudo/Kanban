import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "../types";

interface CardViewProps {
    card: Card;
    gem: string;
    onOpen: (card: Card) => void;
}

export default function CardView({ card, gem, onOpen }: CardViewProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: `card-${card.id}` });

    const baseBg = `linear-gradient(135deg, ${gem}14 0%, #141d22 55%)`;
    const hoverBg = `linear-gradient(135deg, ${gem}24 0%, #172228 55%)`;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        background: baseBg,
        borderLeft: `4px solid ${gem}`,
    } as React.CSSProperties;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative rounded-xl border border-white/10 p-3 flex flex-col gap-2.5 transition-colors duration-200"
            onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = baseBg; }}
        >
            <p
                {...listeners}
                {...attributes}
                className="text-sm text-ink font-medium leading-snug cursor-grab active:cursor-grabbing"
            >
                {card.title}
            </p>

            <span
                className="h-2 w-2 rounded-full"
                style={{ background: gem, boxShadow: `0 0 6px color-mix(in srgb, ${gem} 40%, transparent)` }}
            />

            <button
                onClick={(e) => { e.stopPropagation(); onOpen(card); }}
                className="w-full rounded-lg bg-field py-1.5 text-xs text-faint hover:text-ink transition-colors"
                title="Ouvrir la carte"
            >
                Ouvrir
            </button>
        </div>
    );
}