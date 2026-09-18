import { describe, it, expect, vi, beforeEach } from "vitest";
import { useState } from "react";
import { renderHook, act } from "@testing-library/react";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { useDragAndDrop } from "./useDragAndDrop";
import { moveCard } from "../api/cards";
import type { Board } from "../types";

vi.mock("../api/cards", () => ({
    moveCard: vi.fn(),
}));

const moveCardMock = vi.mocked(moveCard);

function makeBoard(): Board {
    return {
        id: 1,
        name: "Board de test",
        createdAt: "2026-01-01T00:00:00.000Z",
        columns: [
            {
                id: 10,
                title: "Colonne A",
                order: 0,
                cards: [
                    { id: 100, title: "Carte 1", order: 0, entries: [] },
                    { id: 101, title: "Carte 2", order: 1, entries: [] },
                    { id: 102, title: "Carte 3", order: 2, entries: [] },
                ],
            },
            {
                id: 11,
                title: "Colonne B",
                order: 1,
                cards: [{ id: 200, title: "Carte D1", order: 0, entries: [] }],
            },
        ],
    };
}

function dragStart(activeId: string): DragStartEvent {
    return { active: { id: activeId } } as unknown as DragStartEvent;
}

function dragEnd(activeId: string, overId: string | null): DragEndEvent {
    return {
        active: { id: activeId },
        over: overId ? { id: overId } : null,
    } as unknown as DragEndEvent;
}

function useHarness(initialBoard: Board | null, loadBoard: () => void, setError: (msg: string) => void) {
    const [board, setBoard] = useState(initialBoard);
    const dnd = useDragAndDrop(board, setBoard, loadBoard, setError);
    return { board, ...dnd };
}

function renderHarness(initialBoard: Board | null, loadBoard = vi.fn(), setError = vi.fn()) {
    const view = renderHook(() => useHarness(initialBoard, loadBoard, setError));
    return { ...view, loadBoard, setError };
}

function cardIdsOf(board: Board | null, columnId: number): number[] {
    return board?.columns.find((c) => c.id === columnId)?.cards.map((c) => c.id) ?? [];
}

beforeEach(() => {
    moveCardMock.mockReset();
    moveCardMock.mockResolvedValue(undefined);
});

describe("handleDragStart", () => {
    it("mémorise la carte active quand on commence à glisser une carte", () => {
        const { result } = renderHarness(makeBoard());

        act(() => result.current.handleDragStart(dragStart("card-100")));

        expect(result.current.activeCard?.id).toBe(100);
    });

    it("ignore un identifiant qui n'est pas une carte", () => {
        const { result } = renderHarness(makeBoard());

        act(() => result.current.handleDragStart(dragStart("card-100")));
        act(() => result.current.handleDragStart(dragStart("column-10")));

        // La carte active précédente est conservée, l'appel sur une colonne est ignoré.
        expect(result.current.activeCard?.id).toBe(100);
    });

    it("réinitialise la carte active quand l'identifiant ne correspond à aucune carte du board", () => {
        const { result } = renderHarness(makeBoard());

        act(() => result.current.handleDragStart(dragStart("card-100")));
        act(() => result.current.handleDragStart(dragStart("card-999")));

        expect(result.current.activeCard).toBeNull();
    });
});

describe("handleDragEnd — cas ignorés", () => {
    it("ne fait rien quand il n'y a pas de cible (over)", async () => {
        const { result } = renderHarness(makeBoard());

        await act(async () => {
            await result.current.handleDragEnd(dragEnd("card-100", null));
        });

        expect(moveCardMock).not.toHaveBeenCalled();
        expect(cardIdsOf(result.current.board, 10)).toEqual([100, 101, 102]);
    });

    it("ne fait rien quand il n'y a pas de board", async () => {
        const { result } = renderHarness(null);

        await act(async () => {
            await result.current.handleDragEnd(dragEnd("card-100", "column-11"));
        });

        expect(moveCardMock).not.toHaveBeenCalled();
    });

    it("ne fait rien quand la carte déplacée est introuvable dans le board", async () => {
        const { result } = renderHarness(makeBoard());

        await act(async () => {
            await result.current.handleDragEnd(dragEnd("card-999", "column-11"));
        });

        expect(moveCardMock).not.toHaveBeenCalled();
    });

    it("ne fait rien quand on relâche la carte sur sa position d'origine", async () => {
        const { result } = renderHarness(makeBoard());

        await act(async () => {
            await result.current.handleDragEnd(dragEnd("card-100", "card-100"));
        });

        expect(moveCardMock).not.toHaveBeenCalled();
        expect(cardIdsOf(result.current.board, 10)).toEqual([100, 101, 102]);
    });
});

describe("handleDragEnd — réordonnancement dans la même colonne", () => {
    it("réordonne les cartes localement et persiste le nouvel ordre", async () => {
        const { result, loadBoard } = renderHarness(makeBoard());

        await act(async () => {
            await result.current.handleDragEnd(dragEnd("card-100", "card-102"));
        });

        expect(cardIdsOf(result.current.board, 10)).toEqual([101, 102, 100]);
        expect(moveCardMock).toHaveBeenCalledExactlyOnceWith(100, 10, 2);
        expect(loadBoard).not.toHaveBeenCalled();
    });
});

describe("handleDragEnd — déplacement vers une autre colonne", () => {
    it("déplace la carte à la fin quand on la dépose sur l'en-tête de la colonne cible", async () => {
        const { result } = renderHarness(makeBoard());

        await act(async () => {
            await result.current.handleDragEnd(dragEnd("card-100", "column-11"));
        });

        expect(cardIdsOf(result.current.board, 10)).toEqual([101, 102]);
        expect(cardIdsOf(result.current.board, 11)).toEqual([200, 100]);
        expect(moveCardMock).toHaveBeenCalledExactlyOnceWith(100, 11, 1);
    });

    it("insère la carte à la position visée quand on la dépose sur une carte d'une autre colonne", async () => {
        const { result } = renderHarness(makeBoard());

        await act(async () => {
            await result.current.handleDragEnd(dragEnd("card-100", "card-200"));
        });

        expect(cardIdsOf(result.current.board, 10)).toEqual([101, 102]);
        expect(cardIdsOf(result.current.board, 11)).toEqual([100, 200]);
        expect(moveCardMock).toHaveBeenCalledExactlyOnceWith(100, 11, 0);
    });
});

describe("handleDragEnd — échec de la persistance", () => {
    it("signale l'erreur et resynchronise via loadBoard quand l'API échoue", async () => {
        moveCardMock.mockRejectedValue(new Error("Déplacement refusé"));
        const { result, loadBoard, setError } = renderHarness(makeBoard());

        await act(async () => {
            await result.current.handleDragEnd(dragEnd("card-100", "column-11"));
        });

        expect(setError).toHaveBeenCalledExactlyOnceWith("Déplacement refusé");
        expect(loadBoard).toHaveBeenCalledOnce();
    });
});
