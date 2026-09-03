import { useState } from "react";
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { moveCard } from "../api/cards";
import { findCard, parseId } from "../utils/boardHelpers";
import type { Board, Card } from "../types";

export function useDragAndDrop(
    board: Board | null,
    setBoard: React.Dispatch<React.SetStateAction<Board | null>>,
    loadBoard: () => void,
    setError: (msg: string) => void
) {
    const [activeCard, setActiveCard] = useState<Card | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
    );

    function handleDragStart(event: DragStartEvent) {
        const info = parseId(event.active.id);
        if (!info || info.type !== "card") return;
        const found = findCard(board, info.id);
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
        const from = findCard(board, activeCardId);
        if (!from) return;

        // Colonne cible + position visée, selon qu'on lâche sur une colonne ou une carte
        let targetColumn;
        let overIndex: number;
        if (overInfo.type === "column") {
            targetColumn = board.columns.find((c) => c.id === overInfo.id);
            overIndex = targetColumn ? targetColumn.cards.length : 0;
        } else {
            const overCard = findCard(board, overInfo.id);
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

    return { sensors, activeCard, handleDragStart, handleDragEnd };
}