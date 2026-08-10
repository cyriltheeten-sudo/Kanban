import { useEffect, useState } from "react";
import { getBoard, updateBoard } from "../api/boards";
import { createCard, deleteCard, updateCard } from "../api/cards";
import { createColumn, deleteColumn } from "../api/columns";
import type { Board } from "../types";
import ColumnView from "../components/ColumnView";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { moveCard } from "../api/cards";

const GEMS = ["#10b981", "#f59e0b", "#e11d48"]; // émeraude, topaze, rubis

interface BoardPageProps {
    onLogout: () => void;
}

export default function BoardPage({ onLogout }: BoardPageProps) {
    const [board, setBoard] = useState<Board | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [newCardTitles, setNewCardTitles] = useState<Record<number, string>>({});
    const [newColumnTitle, setNewColumnTitle] = useState("");

    // Capteur : on n'attrape une carte qu'après un petit mouvement de 6px
    // (sinon un simple clic sur ✎/✕ déclencherait un drag)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 2 } })
    );

    function loadBoard() {
        getBoard(1).then(setBoard).catch((e) => setError(e.message));
    }

    useEffect(() => {
        loadBoard();
    }, []);

    async function handleAddCard(columnId: number) {
        const title = newCardTitles[columnId]?.trim();
        if (!title) return;
        try {
            await createCard(title, columnId);
            setNewCardTitles((prev) => ({ ...prev, [columnId]: "" }));
            loadBoard();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        }
    }

    async function handleDeleteCard(id: number) {
        try { await deleteCard(id); loadBoard(); }
        catch (e) { setError(e instanceof Error ? e.message : "Erreur inconnue"); }
    }

    async function handleEditCard(id: number, currentTitle: string) {
        const next = prompt("Nouveau titre :", currentTitle);
        if (next === null || next.trim() === "") return;
        try { await updateCard(id, next.trim()); loadBoard(); }
        catch (e) { setError(e instanceof Error ? e.message : "Erreur inconnue"); }
    }

    async function handleAddColumn() {
        const title = newColumnTitle.trim();
        if (!title || !board) return;
        try { await createColumn(title, board.id); setNewColumnTitle(""); loadBoard(); }
        catch (e) { setError(e instanceof Error ? e.message : "Erreur inconnue"); }
    }

    async function handleDeleteColumn(id: number) {
        try { await deleteColumn(id); loadBoard(); }
        catch (e) { setError(e instanceof Error ? e.message : "Erreur inconnue"); }
    }

    async function handleRenameBoard() {
        if (!board) return;
        const next = prompt("Nom du tableau :", board.name);
        if (next === null || next.trim() === "") return;
        try { await updateBoard(board.id, next.trim()); loadBoard(); }
        catch (e) { setError(e instanceof Error ? e.message : "Erreur inconnue"); }
    }

    function handleNewCardTitleChange(columnId: number, value: string) {
        setNewCardTitles((prev) => ({ ...prev, [columnId]: value }));
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over) return; // lâché dans le vide    
        const cardId = Number(active.id);
        const targetColumnId = Number(over.id);
        // la carte qu'on déplace (pour connaître sa colonne d'origine)
        const sourceColumn = board?.columns.find((col) =>
            col.cards.some((c) => c.id === cardId)
        );
        if (!sourceColumn) return;
        // si on lâche dans la même colonne, on ne fait rien pour l'instant
        // (le réordonnancement fin viendra ensuite)
        if (sourceColumn.id === targetColumnId) return;
        // on place la carte à la fin de la colonne cible
        const targetColumn = board?.columns.find((col) => col.id === targetColumnId);
        const newOrder = targetColumn ? targetColumn.cards.length : 0;
        try {
            await moveCard(cardId, targetColumnId, newOrder);
            loadBoard();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        }
    }



    if (error) return <p className="min-h-screen bg-[#0a0a0f] text-red-400 p-6">Erreur : {error}</p>;
    if (!board) return <p className="min-h-screen bg-[#0a0a0f] text-zinc-400 p-6">Chargement…</p>;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-zinc-100">
            <header className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <span className="font-display text-sm font-bold tracking-widest text-emerald-400/80 uppercase">
                        Gemboard
                    </span>
                    <span className="text-white/20">/</span>
                    <h1
                        onClick={handleRenameBoard}
                        className="font-display text-xl font-bold tracking-tight cursor-pointer hover:text-zinc-300 transition"
                        title="Cliquer pour renommer"
                    >
                        {board.name}
                    </h1>
                </div>
                <button onClick={onLogout} className="text-sm text-zinc-400 hover:text-zinc-100 transition">
                    Déconnexion
                </button>
            </header>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="scroll-kanban flex gap-4 overflow-x-auto px-6 py-6 items-start">
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

                    {/* Ajouter une colonne */}
                    <div className="w-72 flex-shrink-0">
                        <input
                            value={newColumnTitle}
                            onChange={(e) => setNewColumnTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                            placeholder="+ Nouvelle colonne"
                            className="w-full rounded-xl bg-white/[0.03] border border-dashed border-white/10 px-3 py-2.5 text-sm placeholder:text-zinc-600 outline-none focus-visible:border-white/25 transition"
                        />
                    </div>
                </div>
            </DndContext>
        </div>
    );
}