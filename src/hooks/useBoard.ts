import { useState, useEffect, useCallback } from "react";
import { getBoard } from "../api/boards";
import type { Board } from "../types";

export function useBoard(boardId: number) {
    const [board, setBoard] = useState<Board | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadBoard = useCallback(() => {
        const request = Number.isNaN(boardId)
            ? Promise.reject(new Error("Tableau introuvable."))
            : getBoard(boardId);
        request
            .then((b) => {
                setBoard(b);
                setError(null);
            })
            .catch((e) => setError(e.message));
    }, [boardId]);

    useEffect(() => {
        loadBoard();
    }, [loadBoard]);

    return { board, setBoard, error, setError, loadBoard };
}