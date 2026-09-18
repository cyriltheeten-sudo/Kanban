import { useState } from "react";
import { updateBoard } from "../api/boards";
import { createCard, deleteCard, moveCard } from "../api/cards";
import { useAutoDismiss } from "./useAutoDismiss";
import type { Board } from "../types";

export function useBoardActions(board: Board | null, loadBoard: () => void) {
    const [actionError, setActionError] = useState<string | null>(null);
    const [newCardTitles, setNewCardTitles] = useState<Record<number, string>>({});
    const [addingColumns, setAddingColumns] = useState<Record<number, boolean>>({});
    const [movingCardId, setMovingCardId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState("");

    useAutoDismiss(actionError, setActionError);

    function reportError(e: unknown) {
        setActionError(e instanceof Error ? e.message : "Erreur inconnue");
    }

    function handleNewCardTitleChange(columnId: number, value: string) {
        setNewCardTitles((prev) => ({ ...prev, [columnId]: value }));
    }

    async function handleAddCard(columnId: number) {
        const title = newCardTitles[columnId]?.trim();
        if (!title || addingColumns[columnId]) return;
        setAddingColumns((prev) => ({ ...prev, [columnId]: true }));
        try {
            await createCard(title, columnId);
            setNewCardTitles((prev) => ({ ...prev, [columnId]: "" }));
            loadBoard();
        } catch (e) {
            reportError(e);
        } finally {
            setAddingColumns((prev) => ({ ...prev, [columnId]: false }));
        }
    }

    async function handleDeleteCard(id: number) {
        try {
            await deleteCard(id);
            loadBoard();
        } catch (e) {
            reportError(e);
        }
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
            reportError(e);
        } finally {
            setMovingCardId(null);
        }
    }

    function startEditingName() {
        if (!board) return;
        setNameDraft(board.name);
        setEditingName(true);
    }

    function cancelEditingName() {
        setEditingName(false);
    }

    async function handleSaveName() {
        if (!board) return;
        const next = nameDraft.trim();
        setEditingName(false);
        if (!next || next === board.name) return;
        try {
            await updateBoard(board.id, next);
            loadBoard();
        } catch (e) {
            reportError(e);
        }
    }

    return {
        actionError,
        setActionError,
        newCardTitles,
        addingColumns,
        movingCardId,
        editingName,
        nameDraft,
        setNameDraft,
        handleNewCardTitleChange,
        handleAddCard,
        handleDeleteCard,
        handleMoveCard,
        startEditingName,
        cancelEditingName,
        handleSaveName,
    };
}
