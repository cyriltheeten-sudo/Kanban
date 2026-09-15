import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Card, Column } from "../types";
import CardView from "./CardView";
import { useSlowRequestHint } from "../hooks/useSlowRequestHint";

interface ColumnViewProps {
    column: Column;
    allColumns: Column[];
    gem: string;
    newCardTitle: string;
    isAddingCard: boolean;
    gemByColumnId: Record<number, string>;
    movingCardId: number | null;
    onNewCardTitleChange: (columnId: number, value: string) => void;
    onAddCard: (columnId: number) => void;
    onOpenCard: (card: Card) => void;
    onViewCard: (card: Card) => void;
    onMoveCard: (cardId: number, targetColumnId: number) => void;
}

export default function ColumnView({
    column,
    allColumns,
    gem,
    gemByColumnId,
    newCardTitle,
    isAddingCard,
    movingCardId,
    onNewCardTitleChange,
    onAddCard,
    onOpenCard,
    onViewCard,
    onMoveCard,
}: ColumnViewProps) {
    const { setNodeRef, isOver } = useDroppable({ id: `column-${column.id}` });
    const showSlowHint = useSlowRequestHint(isAddingCard);
    const targetColumns = allColumns
        .filter((c) => c.id !== column.id)
        .map((c) => ({ id: c.id, title: c.title }));
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
                        enterKeyHint="done"
                        placeholder={isAddingCard ? "Création en cours…" : "+ Nouvelle carte"}
                        className="w-full rounded-xl bg-field pl-4 pr-11 py-2.5 text-sm text-ink placeholder:text-placeholder outline-none transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-teal-500/30 autofill:shadow-[0_0_0_30px_var(--color-field)_inset] autofill:[-webkit-text-fill-color:var(--color-ink)] autofill:caret-white disabled:opacity-60"
                    />
                    <button
                        type="button"
                        onClick={() => onAddCard(column.id)}
                        disabled={isAddingCard || !newCardTitle.trim()}
                        title="Ajouter la carte"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-field hover:bg-btn-hover text-faint hover:text-ink transition-colors disabled:opacity-40 flex items-center justify-center"
                    >
                        {isAddingCard ? (
                            <span className="w-3.5 h-3.5 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                        )}
                    </button>
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
                        <CardView
                            key={card.id}
                            card={card}
                            gem={gem}
                            gemByColumnId={gemByColumnId}
                            targetColumns={targetColumns}
                            isMoving={movingCardId === card.id}
                            onOpen={onOpenCard}
                            onView={onViewCard}
                            onMove={onMoveCard}
                        />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}
