import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "../types";

interface CardViewProps {
    card: Card;
    gem: string;
    gemByColumnId: Record<number, string>;
    onOpen: (card: Card) => void;
    onView: (card: Card) => void;
}

export default function CardView({ card, gem, gemByColumnId, onOpen, onView }: CardViewProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: `card-${card.id}` });

    const baseBg = `linear-gradient(135deg, ${gem}14 0%, #141d22 55%)`;
    const hoverBg = `linear-gradient(135deg, ${gem}24 0%, #172228 55%)`;
    const sortedEntries = [...card.entries].sort((a, b) => a.columnId - b.columnId);


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

            {sortedEntries.length > 0 && (
                <div className="flex items-center gap-1">
                    {sortedEntries.map((entry) => (
                        <span
                            key={entry.id}
                            className="h-2 w-2 rounded-full"
                            style={{
                                background: gemByColumnId[entry.columnId],
                                boxShadow: `0 0 5px color-mix(in srgb, ${gemByColumnId[entry.columnId]} 40%, transparent)`,
                            }}
                            title="Étape renseignée"
                        />
                    ))}
                </div>
            )}

            <div className="flex gap-1.5">
                <button
                    onClick={(e) => { e.stopPropagation(); onView(card); }}
                    className="flex-1 rounded-lg bg-field py-1.5 text-xs text-faint hover:text-ink transition-colors"
                    title="Voir la fiche"
                >
                    Voir
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onOpen(card); }}
                    className="flex-1 rounded-lg bg-field py-1.5 text-xs text-faint hover:text-ink transition-colors"
                    title="Modifier la carte"
                >
                    Modifier
                </button>
            </div>
        </div>
    );
}