import { useState, useEffect, useCallback } from "react";
import { getBoard } from "../api/boards";
import type { Board } from "../types";

export function useBoard(boardId: number) {
    const [board, setBoard] = useState<Board | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadBoard = useCallback(() => {
        getBoard(boardId).then(setBoard).catch((e) => setError(e.message));
    }, [boardId]);

    useEffect(() => {
        loadBoard();
    }, [loadBoard]);

    return { board, setBoard, error, setError, loadBoard };
}