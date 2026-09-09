import { useState, useEffect } from "react";
import { updateBoard } from "../api/boards";
import { createCard, deleteCard, updateCard } from "../api/cards";
import { createColumn, deleteColumn } from "../api/columns";
import ColumnView from "../components/ColumnView";
import { DndContext, closestCorners, DragOverlay } from "@dnd-kit/core";
import { useBoard } from "../hooks/useBoard";
import { useBoardRealTime } from "../hooks/useBoardRealTime";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useParams, useNavigate } from "react-router";

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
    const [newColumnTitle, setNewColumnTitle] = useState("");

    useEffect(() => {
        if (!actionError) return;
        const t = setTimeout(() => setActionError(null), 4000);
        return () => clearTimeout(t);
    }, [actionError]);

    async function handleAddCard(columnId: number) {
        const title = newCardTitles[columnId]?.trim();
        if (!title) return;
        try {
            await createCard(title, columnId);
            setNewCardTitles((prev) => ({ ...prev, [columnId]: "" }));
            loadBoard();
        } catch (e) {
            setActionError(e instanceof Error ? e.message : "Erreur inconnue");
        }
    }

    async function handleDeleteCard(id: number) {
        try { await deleteCard(id); loadBoard(); }
        catch (e) { setActionError(e instanceof Error ? e.message : "Erreur inconnue"); }
    }

    async function handleEditCard(id: number, currentTitle: string) {
        const next = prompt("Nouveau titre :", currentTitle);
        if (next === null || next.trim() === "") return;
        try { await updateCard(id, next.trim()); loadBoard(); }
        catch (e) { setActionError(e instanceof Error ? e.message : "Erreur inconnue"); }
    }

    async function handleAddColumn() {
        const title = newColumnTitle.trim();
        if (!title || !board) return;
        try { await createColumn(title, board.id); setNewColumnTitle(""); loadBoard(); }
        catch (e) { setActionError(e instanceof Error ? e.message : "Erreur inconnue"); }
    }

    async function handleDeleteColumn(id: number) {
        try { await deleteColumn(id); loadBoard(); }
        catch (e) { setActionError(e instanceof Error ? e.message : "Erreur inconnue"); }
    }

    async function handleRenameBoard() {
        if (!board) return;
        const next = prompt("Nom du tableau :", board.name);
        if (next === null || next.trim() === "") return;
        try { await updateBoard(board.id, next.trim()); loadBoard(); }
        catch (e) { setActionError(e instanceof Error ? e.message : "Erreur inconnue"); }
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

    return (
        <div className="relative h-screen w-full bg-app bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.12)_0%,rgba(13,148,136,0.05)_30%,rgba(10,15,16,0)_60%)] text-ink flex flex-col overflow-hidden font-sans selection:bg-teal-500/20 selection:text-teal-300">

            <header className="relative z-10 shrink-0 w-full flex items-center justify-between px-4 sm:px-6 py-3 bg-surface">
                <button
                    onClick={() => navigate("/")}
                    className="text-[10px] sm:text-xs px-3 py-1.5 rounded-xl text-muted hover:text-ink bg-raised hover:bg-btn-hover transition-colors duration-200 active:scale-[0.98] flex items-center gap-1.5"
                >
                    ← Mes tableaux
                </button>

                <div className="flex items-center gap-2 sm:gap-3">
                    <h1 className="text-base sm:text-lg font-bold tracking-tight">
                        <span className="bg-linear-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
                            Gem
                        </span>
                        <span className="text-white">Board</span>
                    </h1>
                    <span className="text-faint">/</span>
                    <h2
                        onClick={handleRenameBoard}
                        className="text-sm sm:text-base font-semibold text-ink cursor-pointer hover:text-teal-300 transition-colors"
                        title="Cliquer pour renommer"
                    >
                        {board.name}
                    </h2>
                </div>

                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/login");
                    }}
                    className="text-[10px] sm:text-xs px-3 py-1.5 rounded-xl text-muted hover:text-ink bg-raised hover:bg-btn-hover transition-colors duration-200 active:scale-[0.98]"
                >
                    Déconnexion
                </button>
            </header>

            <main className="relative z-10 flex-1 min-h-0 flex flex-col w-full overflow-hidden pt-4 animate-[smoothSlideDown_0.45s_cubic-bezier(0.22,1,0.36,1)_forwards] will-change-[opacity,transform]">
                {actionError && (
                    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl bg-surface border border-red-500/30 px-4 py-3 text-sm text-red-400 shadow-2xl">
                        {actionError}
                    </div>
                )}
                <div className="shrink-0 px-4 sm:px-6 pb-3">
                    <input
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                        placeholder="+ Nouvelle colonne"
                        className="w-full sm:w-72 rounded-xl bg-field px-4 py-2.5 text-sm text-ink placeholder:text-placeholder outline-none transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-teal-500/30 autofill:shadow-[0_0_0_30px_var(--color-field)_inset] autofill:[-webkit-text-fill-color:var(--color-ink)] autofill:caret-white"
                    />
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="scroll-kanban flex gap-3 overflow-x-auto px-4 sm:px-6 pb-4 items-stretch select-none flex-1 min-h-0">
                        {board.columns.map((col, index) => (
                            <ColumnView
                                key={col.id}
                                column={col}
                                gem={GEMS[index % GEMS.length]}
                                newCardTitle={newCardTitles[col.id] ?? ""}
                                onNewCardTitleChange={handleNewCardTitleChange}
                                onAddCard={handleAddCard}
                                onDeleteColumn={handleDeleteColumn}
                                onEditCard={handleEditCard}
                                onDeleteCard={handleDeleteCard}
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
