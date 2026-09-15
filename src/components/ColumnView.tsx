import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Card, Column } from "../types";
import CardView from "./CardView";
import { useSlowRequestHint } from "../hooks/useSlowRequestHint";

interface ColumnViewProps {
    column: Column;
    gem: string;
    newCardTitle: string;
    isAddingCard: boolean;
    gemByColumnId: Record<number, string>;
    onNewCardTitleChange: (columnId: number, value: string) => void;
    onAddCard: (columnId: number) => void;
    onOpenCard: (card: Card) => void;
    onViewCard: (card: Card) => void;
}

export default function ColumnView({
    column,
    gem,
    gemByColumnId,
    newCardTitle,
    isAddingCard,
    onNewCardTitleChange,
    onAddCard,
    onOpenCard,
    onViewCard,
}: ColumnViewProps) {
    const { setNodeRef, isOver } = useDroppable({ id: `column-${column.id}` });
    const showSlowHint = useSlowRequestHint(isAddingCard);
    return (
        <div
            ref={setNodeRef}
            className={`w-72 shrink-0 flex flex-col min-h-0 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-200 bg-surface ${isOver ? "ring-1 ring-teal-500/40 bg-drop" : ""}`}
        >
            {/* En-tête : fixe (shrink-0) */}
            <div className="shrink-0 flex items-center gap-2 px-1 pb-4">

                <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: gem, boxShadow: `0 0 8px color-mix(in srgb, ${gem} 35%, transparent)` }}
                />
                <h2 className="font-bold text-sm text-ink tracking-wide flex-1 truncate">
                    {column.title}
                </h2>

            </div>

            <div className="shrink-0 mb-3">
                <div className="relative">
                    <input
                        value={newCardTitle}
                        onChange={(e) => onNewCardTitleChange(column.id, e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.repeat) onAddCard(column.id);
                        }}
                        disabled={isAddingCard}
                        placeholder={isAddingCard ? "Création en cours…" : "+ Nouvelle carte"}
                        className="w-full rounded-xl bg-field px-4 py-2.5 pr-9 text-sm text-ink placeholder:text-placeholder outline-none transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-teal-500/30 autofill:shadow-[0_0_0_30px_var(--color-field)_inset] autofill:[-webkit-text-fill-color:var(--color-ink)] autofill:caret-white disabled:opacity-60"
                    />
                    {isAddingCard && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
                    )}
                </div>
                {showSlowHint && (
                    <p className="mt-1.5 text-[11px] text-faint animate-pulse">
                        Le serveur met un peu de temps à répondre (mise en veille possible)…
                    </p>
                )}
            </div>

            {/* Zone des cartes : prend tout l'espace restant et scrolle seule */}
            <SortableContext
                items={column.cards.map((c) => `card-${c.id}`)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-1">
                    {column.cards.map((card) => (
                        <CardView key={card.id} card={card} gem={gem} gemByColumnId={gemByColumnId} onOpen={onOpenCard} onView={onViewCard} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}
