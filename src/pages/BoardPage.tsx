import { useEffect, useState, useRef } from "react";
import { getBoard, updateBoard } from "../api/boards";
import { setConnectionId } from "../api/realtime";
import { createCard, deleteCard, updateCard, moveCard } from "../api/cards";
import { createColumn, deleteColumn } from "../api/columns";
import type { Board, Card } from "../types";
import ColumnView from "../components/ColumnView";
import { arrayMove } from "@dnd-kit/sortable";
import { DndContext, PointerSensor, useSensor, useSensors, closestCorners, DragOverlay } from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import * as signalR from "@microsoft/signalr";



const GEMS = ["#10b981", "#f59e0b", "#e11d48"]; // émeraude, topaze, rubis

interface BoardPageProps {
    onLogout: () => void;
}

export default function BoardPage({ onLogout }: BoardPageProps) {
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const [board, setBoard] = useState<Board | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [newCardTitles, setNewCardTitles] = useState<Record<number, string>>({});
    const [newColumnTitle, setNewColumnTitle] = useState("");
    const [activeCard, setActiveCard] = useState<Card | null>(null);

    // Capteur : on n'attrape une carte qu'après un petit mouvement de 6px
    // (sinon un simple clic sur ✎/✕ déclencherait un drag)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
    );

    function loadBoard() {
        getBoard(1).then(setBoard).catch((e) => setError(e.message));
    }

    useEffect(() => {
        loadBoard();
    }, []);

    useEffect(() => {
        if (!board) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7007/hubs/kanban")
            .withAutomaticReconnect()
            .build();

        connectionRef.current = connection;

        connection.on("BoardChanged", () => {
            loadBoard();
        });

        // le connectionId change après une reconnexion → on le remet à jour
        connection.onreconnected((id) => setConnectionId(id ?? null));

        connection
            .start()
            .then(() => {
                console.log("SignalR connecté ✅");
                setConnectionId(connection.connectionId);
                return connection.invoke("JoinBoard", board.id);
            })
            .catch((err) => console.error("SignalR erreur :", err));

        return () => {
            setConnectionId(null);
            connection.stop();
        };
    }, [board?.id]);

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

    function findCard(cardId: number) {
        for (const col of board?.columns ?? []) {
            const card = col.cards.find((c) => c.id === cardId);
            if (card) return { card, column: col };
        }
        return null;
    }

    function parseId(raw: string | number) {
        const s = String(raw);
        if (s.startsWith("card-")) return { type: "card" as const, id: Number(s.slice(5)) };
        if (s.startsWith("column-")) return { type: "column" as const, id: Number(s.slice(7)) };
        return null;
    }

    function handleDragStart(event: DragStartEvent) {
        const info = parseId(event.active.id);
        if (!info || info.type !== "card") return;
        const found = findCard(info.id);
        setActiveCard(found?.card ?? null);
    }

    async function handleDragEnd(event: DragEndEvent) {
        setActiveCard(null);
        const { active, over } = event;
        if (!over || !board) return;

        const activeInfo = parseId(active.id);
        const overInfo = parseId(over.id);
        if (!activeInfo || activeInfo.type !== "card" || !overInfo) return;

        const activeCardId = activeInfo.id;
        const from = findCard(activeCardId);
        if (!from) return;

        // Colonne cible + position visée, selon qu'on lâche sur une colonne ou une carte
        let targetColumn;
        let overIndex: number;
        if (overInfo.type === "column") {
            targetColumn = board.columns.find((c) => c.id === overInfo.id);
            overIndex = targetColumn ? targetColumn.cards.length : 0;
        } else {
            const overCard = findCard(overInfo.id);
            targetColumn = overCard?.column;
            overIndex = targetColumn ? targetColumn.cards.findIndex((c) => c.id === overInfo.id) : 0;
        }
        if (!targetColumn) return;

        const sameColumn = from.column.id === targetColumn.id;
        const oldIndex = from.column.cards.findIndex((c) => c.id === activeCardId);

        let finalIndex: number;

        if (sameColumn) {
            // Réordonnancement dans la colonne : arrayMove gère le décalage tout seul
            finalIndex = overIndex;
            if (oldIndex === finalIndex) return; // rien ne change

            setBoard((prev) => {
                if (!prev) return prev;
                const columns = prev.columns.map((col) => ({ ...col, cards: [...col.cards] }));
                const col = columns.find((c) => c.id === targetColumn!.id)!;
                col.cards = arrayMove(col.cards, oldIndex, finalIndex);
                return { ...prev, columns };
            });
        } else {
            // Déplacement vers une autre colonne : insertion à la position visée
            finalIndex = overIndex;

            setBoard((prev) => {
                if (!prev) return prev;
                const columns = prev.columns.map((col) => ({ ...col, cards: [...col.cards] }));
                const source = columns.find((c) => c.cards.some((cc) => cc.id === activeCardId))!;
                const target = columns.find((c) => c.id === targetColumn!.id)!;
                const idx = source.cards.findIndex((c) => c.id === activeCardId);
                const [moved] = source.cards.splice(idx, 1);
                target.cards.splice(finalIndex, 0, moved);
                return { ...prev, columns };
            });
        }

        // ── Persistance : on envoie le déplacement à l'API ──
        // C'est CE que déclenche la diffusion SignalR côté serveur.
        try {
            await moveCard(activeCardId, targetColumn.id, finalIndex);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
            loadBoard(); // en cas d'échec, on resynchronise avec la vérité du serveur
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
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="scroll-kanban flex gap-4 overflow-x-auto px-6 py-6 items-start select-none">
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
                <DragOverlay>
                    {activeCard ? (
                        <div className="gem-card rounded-xl px-3 py-2.5 w-72 shadow-2xl"
                            style={{ ["--gem"]: "#10b981" } as React.CSSProperties}>
                            <p className="text-sm text-zinc-100">{activeCard.title}</p>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}