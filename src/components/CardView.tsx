import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "../types";

interface CardViewProps {
    card: Card;
    gem: string;
    gemByColumnId: Record<number, string>;
    targetColumns: { id: number; title: string }[];
    isMoving: boolean;
    onOpen: (card: Card) => void;
    onView: (card: Card) => void;
    onMove: (cardId: number, targetColumnId: number) => void;
}

export default function CardView({ card, gem, gemByColumnId, targetColumns, isMoving, onOpen, onView, onMove }: CardViewProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: `card-${card.id}` });
    const [moveOpen, setMoveOpen] = useState(false);

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
                {targetColumns.length > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setMoveOpen((prev) => !prev); }}
                        disabled={isMoving}
                        className="lg:hidden shrink-0 w-8 rounded-lg bg-field text-faint hover:text-ink transition-colors disabled:opacity-50 flex items-center justify-center"
                        title="Déplacer vers une autre colonne"
                    >
                        {isMoving ? (
                            <span className="w-3.5 h-3.5 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        )}
                    </button>
                )}
            </div>

            {moveOpen && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="lg:hidden flex flex-wrap gap-1.5 pt-1 border-t border-hair-soft"
                >
                    {targetColumns.map((col) => (
                        <button
                            key={col.id}
                            onClick={() => { onMove(card.id, col.id); setMoveOpen(false); }}
                            className="flex items-center gap-1.5 rounded-lg bg-raised hover:bg-btn-hover px-2.5 py-1 text-[11px] text-ink-soft transition-colors"
                        >
                            <span
                                className="h-1.5 w-1.5 rounded-full shrink-0"
                                style={{ background: gemByColumnId[col.id] }}
                            />
                            {col.title}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}