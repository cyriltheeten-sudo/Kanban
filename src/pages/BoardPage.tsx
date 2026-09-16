import { useState } from "react";
import { updateBoard } from "../api/boards";
import { createCard, deleteCard, moveCard } from "../api/cards";
import ColumnView from "../components/ColumnView";
import { DndContext, pointerWithin, DragOverlay } from "@dnd-kit/core";
import { useBoard } from "../hooks/useBoard";
import { useBoardRealTime } from "../hooks/useBoardRealTime";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useAutoDismiss } from "../hooks/useAutoDismiss";
import { useParams, useNavigate } from "react-router";
import type { Card } from "../types";
import CardModal from "../components/CardModal";
import CardViewModal from "../components/CardViewModal";
import Toast from "../components/Toast";
import LogoutButton from "../components/LogoutButton";

const GEMS = [
    "var(--color-gem-1)",
    "var(--color-gem-2)",
    "var(--color-gem-3)",
    "var(--color-gem-4)",
    "var(--color-gem-5)",
    "var(--color-gem-6)",
    "var(--color-gem-7)",
];

export default function BoardPage() {
    const navigate = useNavigate();
    const { boardId } = useParams();
    const id = Number(boardId);
    const { board, setBoard, error, loadBoard } = useBoard(id);
    const [actionError, setActionError] = useState<string | null>(null);
    useBoardRealTime(id, loadBoard);
    const { sensors, activeCard, handleDragStart, handleDragEnd } =
        useDragAndDrop(board, setBoard, loadBoard, setActionError);
    const [newCardTitles, setNewCardTitles] = useState<Record<number, string>>({});
    const [addingColumns, setAddingColumns] = useState<Record<number, boolean>>({});
    const [openCard, setOpenCard] = useState<Card | null>(null);
    const [viewingCard, setViewingCard] = useState<Card | null>(null);
    const [movingCardId, setMovingCardId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState("");


    useAutoDismiss(actionError, setActionError);

    async function handleAddCard(columnId: number) {
        const title = newCardTitles[columnId]?.trim();
        if (!title || addingColumns[columnId]) return;
        setAddingColumns((prev) => ({ ...prev, [columnId]: true }));
        try {
            await createCard(title, columnId);
            setNewCardTitles((prev) => ({ ...prev, [columnId]: "" }));
            loadBoard();
        } catch (e) {
            setActionError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setAddingColumns((prev) => ({ ...prev, [columnId]: false }));
        }
    }

    async function handleDeleteCard(id: number) {
        try { await deleteCard(id); loadBoard(); }
        catch (e) { setActionError(e instanceof Error ? e.message : "Erreur inconnue"); }
    }

    async function handleMoveCard(cardId: number, targetColumnId: number) {
        if (!board || movingCardId) return;
        const target = board.columns.find((c) => c.id === targetColumnId);
        if (!target) return;
        setMovingCardId(cardId);
        try {
            await moveCard(cardId, targetColumnId, target.cards.length);
            loadBoard();
        } catch (e) {
            setActionError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setMovingCardId(null);
        }
    }

    function startEditingName() {
        if (!board) return;
        setNameDraft(board.name);
        setEditingName(true);
    }

    async function handleSaveName() {
        if (!board) return;
        const next = nameDraft.trim();
        setEditingName(false);
        if (!next || next === board.name) return;   // rien à changer
        try {
            await updateBoard(board.id, next);
            loadBoard();
        } catch (e) {
            setActionError(e instanceof Error ? e.message : "Erreur inconnue");
        }
    }

    function handleNewCardTitleChange(columnId: number, value: string) {
        setNewCardTitles((prev) => ({ ...prev, [columnId]: value }));
    }


    if (error) {
        return (
            <div className="relative min-h-screen w-full bg-app bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.12)_0%,rgba(13,148,136,0.05)_30%,rgba(10,15,16,0)_60%)] text-ink flex items-center justify-center p-4 text-center overflow-hidden font-sans">
                <p className="relative z-10 text-red-400 text-sm">Erreur : {error}</p>
            </div>
        );
    }


    if (!board) {
        return (
            <div className="relative min-h-screen w-full bg-app bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.12)_0%,rgba(13,148,136,0.05)_30%,rgba(10,15,16,0)_60%)] text-ink flex items-center justify-center p-4 text-center overflow-hidden font-sans">
                <p className="relative z-10 text-muted text-xs sm:text-sm animate-pulse">
                    Chargement… <span className="text-faint block sm:inline">(le serveur peut mettre jusqu'à 30 s à se réveiller)</span>
                </p>
            </div>
        );
    }

    const gemByColumnId: Record<number, string> = {};
    board.columns.forEach((col, index) => {
        gemByColumnId[col.id] = GEMS[index % GEMS.length];
    });

    return (
        <div className="relative h-screen w-full bg-app bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.12)_0%,rgba(13,148,136,0.05)_30%,rgba(10,15,16,0)_60%)] text-ink flex flex-col overflow-hidden font-sans selection:bg-teal-500/20 selection:text-teal-300">

            <header className="relative z-10 shrink-0 w-full flex items-center justify-between px-4 sm:px-6 py-3 bg-surface">
                <button
                    onClick={() => navigate("/")}
                    title="Mes tableaux"
                    className="text-xs px-2.5 py-2 sm:px-3 sm:py-1.5 rounded-xl text-muted hover:text-ink bg-raised hover:bg-btn-hover transition-colors duration-200 active:scale-[0.98] flex items-center gap-1.5 shrink-0"
                >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="hidden sm:inline">Mes tableaux</span>
                </button>

                <div className="flex items-center gap-2 sm:gap-3">
                    <h1 className="text-base sm:text-lg font-bold tracking-tight">
                        <span className="bg-linear-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
                            Gem
                        </span>
                        <span className="text-white">Board</span>
                    </h1>
                    <span className="text-faint">/</span>
                    {editingName ? (
                        <input
                            autoFocus
                            value={nameDraft}
                            onChange={(e) => setNameDraft(e.target.value)}
                            onBlur={() => setEditingName(false)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveName();
                                if (e.key === "Escape") setEditingName(false);
                            }}
                            className="text-sm sm:text-base font-semibold bg-field text-ink rounded-lg px-2 py-1 outline-none focus-visible:ring-1 focus-visible:ring-teal-500/30 min-w-0"
                        />
                    ) : (
                        <h2
                            onClick={startEditingName}
                            className="text-sm sm:text-base font-semibold text-ink cursor-pointer hover:text-teal-300 transition-colors"
                            title="Cliquer pour renommer"
                        >
                            {board.name}
                        </h2>
                    )}
                </div>

                <LogoutButton className="text-xs px-2.5 py-2 sm:px-3 sm:py-1.5 rounded-xl text-muted hover:text-ink bg-raised hover:bg-btn-hover transition-colors duration-200 active:scale-[0.98] flex items-center gap-1.5 shrink-0" />
            </header>

            <main className="relative z-10 flex-1 min-h-0 flex flex-col w-full overflow-hidden pt-4 animate-[smoothSlideDown_0.45s_cubic-bezier(0.22,1,0.36,1)_forwards] will-change-[opacity,transform]">
                {actionError && <Toast message={actionError} variant="error" />}
                {viewingCard && (
                    <CardViewModal
                        card={viewingCard}
                        columns={board.columns}
                        gems={GEMS}
                        onClose={() => setViewingCard(null)}
                        onEdit={() => { setViewingCard(null); setOpenCard(viewingCard); }}
                    />
                )}
                {openCard && (
                    <CardModal
                        card={openCard}
                        columns={board.columns}
                        gems={GEMS}
                        onClose={() => setOpenCard(null)}
                        onSaved={loadBoard}
                        onDelete={async () => {
                            await handleDeleteCard(openCard.id);
                            setOpenCard(null);
                        }}
                    />
                )}

                <DndContext
                    sensors={sensors}
                    collisionDetection={pointerWithin}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="scroll-kanban flex gap-3 overflow-x-auto px-4 sm:px-6 pb-4 items-stretch select-none flex-1 min-h-0">
                        {board.columns.map((col, index) => (
                            <ColumnView
                                key={col.id}
                                column={col}
                                allColumns={board.columns}
                                gem={GEMS[index % GEMS.length]}
                                gemByColumnId={gemByColumnId}
                                newCardTitle={newCardTitles[col.id] ?? ""}
                                isAddingCard={addingColumns[col.id] ?? false}
                                movingCardId={movingCardId}
                                onNewCardTitleChange={handleNewCardTitleChange}
                                onAddCard={handleAddCard}
                                onOpenCard={setOpenCard}
                                onViewCard={setViewingCard}
                                onMoveCard={handleMoveCard}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeCard ? (
                            <div className="rounded-xl px-3.5 py-2.5 w-72 bg-raised border border-teal-500/40 shadow-[0_10px_30px_-10px_rgba(20,184,166,0.4)]">
                                <p className="text-sm text-ink font-medium">{activeCard.title}</p>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </main>

            <footer className="relative z-10 shrink-0 text-[11px] sm:text-xs text-faint text-center py-2">
                Gemboard © {new Date().getFullYear()}
            </footer>

        </div>
    );
}
