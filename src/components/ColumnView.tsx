import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Card, Column } from "../types";
import CardView from "./CardView";

interface ColumnViewProps {
    column: Column;
    gem: string;
    newCardTitle: string;
    onNewCardTitleChange: (columnId: number, value: string) => void;
    onAddCard: (columnId: number) => void;
    onDeleteColumn: (id: number) => void;
    onDeleteCard: (id: number) => void;
    onOpenCard: (card: Card) => void;
}

export default function ColumnView({
    column,
    gem,
    newCardTitle,
    onNewCardTitleChange,
    onAddCard,
    onDeleteColumn,
    onDeleteCard,
    onOpenCard,
}: ColumnViewProps) {
    const { setNodeRef, isOver } = useDroppable({ id: `column-${column.id}` });
    return (
        <div
            ref={setNodeRef}
            className={`w-72 shrink-0 flex flex-col min-h-0 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-200 bg-surface ${isOver ? "ring-1 ring-teal-500/40 bg-drop" : ""}`}
        >
            {/* En-tête : fixe (shrink-0) */}
            <div className="shrink-0 flex items-center gap-2 px-1 pb-4">
                {/* gem = var(--color-gem-N) ; color-mix applique 35 % d'opacité au halo */}
                <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: gem, boxShadow: `0 0 8px color-mix(in srgb, ${gem} 35%, transparent)` }}
                />
                <h2 className="font-bold text-sm text-ink tracking-wide flex-1 truncate">
                    {column.title}
                </h2>
                <span className="text-xs text-faint">{column.cards.length}</span>
                <button
                    onClick={() => onDeleteColumn(column.id)}
                    className="text-faint hover:text-red-400 transition text-sm ml-1"
                >
                    ✕
                </button>
            </div>

            <input
                value={newCardTitle}
                onChange={(e) => onNewCardTitleChange(column.id, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onAddCard(column.id)}
                placeholder="+ Nouvelle carte"
                className="shrink-0 mb-3 w-full rounded-xl bg-field px-4 py-2.5 text-sm text-ink placeholder:text-placeholder outline-none transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-teal-500/30 autofill:shadow-[0_0_0_30px_var(--color-field)_inset] autofill:[-webkit-text-fill-color:var(--color-ink)] autofill:caret-white"
            />

            {/* Zone des cartes : prend tout l'espace restant et scrolle seule */}
            <SortableContext
                items={column.cards.map((c) => `card-${c.id}`)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-1">
                    {column.cards.map((card) => (
                        <CardView key={card.id} card={card} gem={gem} onDelete={onDeleteCard} onOpen={onOpenCard} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}
