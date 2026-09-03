import { useState, useEffect } from "react";
import { getBoard } from "../api/boards";
import type { Board } from "../types";

export function useBoard(boardId: number) {
    const [board, setBoard] = useState<Board | null>(null);
    const [error, setError] = useState<string | null>(null);

    function loadBoard() {
        getBoard(boardId).then(setBoard).catch((e) => setError(e.message));
    }

    useEffect(() => {
        loadBoard();
    }, [boardId]);

    return { board, setBoard, error, setError, loadBoard };
}