import { useDroppable } from "@dnd-kit/core";
import type { Column } from "../types";
import CardView from "./CardView";

interface ColumnViewProps {
    column: Column;
    gem: string;
    newCardTitle: string;
    onNewCardTitleChange: (columnId: number, value: string) => void;
    onAddCard: (columnId: number) => void;
    onDeleteColumn: (id: number) => void;
    onEditCard: (id: number, title: string) => void;
    onDeleteCard: (id: number) => void;
}

export default function ColumnView({
    column,
    gem,
    newCardTitle,
    onNewCardTitleChange,
    onAddCard,
    onDeleteColumn,
    onEditCard,
    onDeleteCard,
}: ColumnViewProps) {
    const { setNodeRef, isOver } = useDroppable({ id: column.id });
    return (
        <div
            ref={setNodeRef}
            className={`w-72 flex-shrink-0 rounded-2xl border p-3 transition
        ${isOver ? "bg-white/[0.06] border-white/20" : "bg-white/[0.02] border-white/5"}`}
        >
            {/* En-tête de colonne */}
            <div className="flex items-center gap-2 px-1 pb-3">
                <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: gem, boxShadow: `0 0 8px ${gem}` }}
                />
                <h2 className="font-display text-sm font-semibold tracking-wide flex-1">
                    {column.title}
                </h2>
                <span className="text-xs text-zinc-500">{column.cards.length}</span>
                <button
                    onClick={() => onDeleteColumn(column.id)}
                    className="text-zinc-600 hover:text-red-400 transition text-sm"
                >
                    ✕
                </button>
            </div>

            {/* Cartes */}
            <div className="flex flex-col gap-2">
                {column.cards.map((card) => (
                    <CardView
                        key={card.id}
                        card={card}
                        gem={gem}
                        onEdit={onEditCard}
                        onDelete={onDeleteCard}
                    />
                ))}
            </div>

            {/* Ajout de carte */}
            <input
                value={newCardTitle}
                onChange={(e) => onNewCardTitleChange(column.id, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onAddCard(column.id)}
                placeholder="+ Nouvelle carte"
                className="mt-2 w-full rounded-lg bg-white/5 border border-white/5 px-2.5 py-1.5 text-sm placeholder:text-zinc-600 outline-none focus-visible:border-white/20 transition"
            />
        </div>
    );
}