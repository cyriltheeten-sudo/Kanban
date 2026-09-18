import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useBoard } from "./useBoard";
import { getBoard } from "../api/boards";
import type { Board } from "../types";

vi.mock("../api/boards", () => ({
    getBoard: vi.fn(),
}));

const getBoardMock = vi.mocked(getBoard);

function makeBoard(overrides: Partial<Board> = {}): Board {
    return {
        id: 1,
        name: "Board de test",
        createdAt: "2026-01-01T00:00:00.000Z",
        columns: [],
        ...overrides,
    };
}

beforeEach(() => {
    getBoardMock.mockReset();
});

describe("useBoard", () => {
    it("signale une erreur sans appeler l'API quand le boardId est NaN", async () => {
        const { result } = renderHook(() => useBoard(NaN));

        await waitFor(() => expect(result.current.error).toBe("Tableau introuvable."));

        expect(result.current.board).toBeNull();
        expect(getBoardMock).not.toHaveBeenCalled();
    });

    it("charge le board au montage quand le boardId est valide", async () => {
        const board = makeBoard({ id: 5 });
        getBoardMock.mockResolvedValue(board);

        const { result } = renderHook(() => useBoard(5));

        await waitFor(() => expect(result.current.board).toEqual(board));

        expect(result.current.error).toBeNull();
        expect(getBoardMock).toHaveBeenCalledExactlyOnceWith(5);
    });

    it("expose le message d'erreur quand l'API échoue", async () => {
        getBoardMock.mockRejectedValue(new Error("Serveur indisponible"));

        const { result } = renderHook(() => useBoard(5));

        await waitFor(() => expect(result.current.error).toBe("Serveur indisponible"));

        expect(result.current.board).toBeNull();
    });

    it("recharge le board quand loadBoard est appelé manuellement", async () => {
        const initial = makeBoard({ name: "Version 1" });
        const updated = makeBoard({ name: "Version 2" });
        getBoardMock.mockResolvedValueOnce(initial).mockResolvedValueOnce(updated);

        const { result } = renderHook(() => useBoard(5));
        await waitFor(() => expect(result.current.board?.name).toBe("Version 1"));

        act(() => {
            result.current.loadBoard();
        });

        await waitFor(() => expect(result.current.board?.name).toBe("Version 2"));
        expect(getBoardMock).toHaveBeenCalledTimes(2);
    });
});
