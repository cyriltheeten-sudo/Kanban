import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBoardActions } from "./useBoardActions";
import { updateBoard } from "../api/boards";
import { createCard, deleteCard, moveCard } from "../api/cards";
import type { Board, Card } from "../types";

vi.mock("../api/boards", () => ({
    updateBoard: vi.fn(),
}));

vi.mock("../api/cards", () => ({
    createCard: vi.fn(),
    deleteCard: vi.fn(),
    moveCard: vi.fn(),
}));

const updateBoardMock = vi.mocked(updateBoard);
const createCardMock = vi.mocked(createCard);
const deleteCardMock = vi.mocked(deleteCard);
const moveCardMock = vi.mocked(moveCard);

function makeBoard(): Board {
    return {
        id: 1,
        name: "Mon board",
        createdAt: "2026-01-01T00:00:00.000Z",
        columns: [
            {
                id: 10,
                title: "Colonne A",
                order: 0,
                cards: [{ id: 100, title: "Carte 1", order: 0, entries: [] }],
            },
            { id: 11, title: "Colonne B", order: 1, cards: [] },
        ],
    };
}

function makeCard(): Card {
    return { id: 200, title: "Nouvelle carte", order: 0, entries: [] };
}

function renderUseBoardActions(board: Board | null, loadBoard = vi.fn()) {
    const view = renderHook(({ board }) => useBoardActions(board, loadBoard), {
        initialProps: { board },
    });
    return { ...view, loadBoard };
}

beforeEach(() => {
    updateBoardMock.mockReset();
    createCardMock.mockReset();
    deleteCardMock.mockReset();
    moveCardMock.mockReset();
});

describe("handleNewCardTitleChange", () => {
    it("met à jour uniquement le brouillon de la colonne concernée", () => {
        const { result } = renderUseBoardActions(makeBoard());

        act(() => result.current.handleNewCardTitleChange(10, "Titre A"));
        act(() => result.current.handleNewCardTitleChange(11, "Titre B"));

        expect(result.current.newCardTitles).toEqual({ 10: "Titre A", 11: "Titre B" });
    });
});

describe("handleAddCard", () => {
    it("ne fait rien si le titre est vide ou ne contient que des espaces", async () => {
        const { result } = renderUseBoardActions(makeBoard());

        act(() => result.current.handleNewCardTitleChange(10, "   "));
        await act(async () => {
            await result.current.handleAddCard(10);
        });

        expect(createCardMock).not.toHaveBeenCalled();
    });

    it("crée la carte, vide le brouillon et recharge le board en cas de succès", async () => {
        createCardMock.mockResolvedValue(makeCard());
        const { result, loadBoard } = renderUseBoardActions(makeBoard());

        act(() => result.current.handleNewCardTitleChange(10, "  Ma carte  "));
        await act(async () => {
            await result.current.handleAddCard(10);
        });

        expect(createCardMock).toHaveBeenCalledExactlyOnceWith("Ma carte", 10);
        expect(result.current.newCardTitles[10]).toBe("");
        expect(loadBoard).toHaveBeenCalledOnce();
        expect(result.current.addingColumns[10]).toBe(false);
    });

    it("signale une erreur et conserve le brouillon en cas d'échec", async () => {
        createCardMock.mockRejectedValue(new Error("Titre invalide"));
        const { result, loadBoard } = renderUseBoardActions(makeBoard());

        act(() => result.current.handleNewCardTitleChange(10, "Ma carte"));
        await act(async () => {
            await result.current.handleAddCard(10);
        });

        expect(result.current.actionError).toBe("Titre invalide");
        expect(result.current.newCardTitles[10]).toBe("Ma carte");
        expect(result.current.addingColumns[10]).toBe(false);
        expect(loadBoard).not.toHaveBeenCalled();
    });

    it("ignore un second appel tant que la création précédente est en cours", async () => {
        let resolveCreate!: (card: Card) => void;
        createCardMock.mockImplementation(
            () => new Promise<Card>((resolve) => { resolveCreate = resolve; })
        );
        const { result } = renderUseBoardActions(makeBoard());

        act(() => result.current.handleNewCardTitleChange(10, "Ma carte"));

        act(() => {
            result.current.handleAddCard(10);
        });
        expect(result.current.addingColumns[10]).toBe(true);

        // Deuxième appel pendant que le premier est encore en vol : doit être ignoré.
        act(() => {
            result.current.handleAddCard(10);
        });
        expect(createCardMock).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveCreate(makeCard());
            await Promise.resolve();
        });
    });
});

describe("handleDeleteCard", () => {
    it("supprime la carte et recharge le board en cas de succès", async () => {
        deleteCardMock.mockResolvedValue(undefined);
        const { result, loadBoard } = renderUseBoardActions(makeBoard());

        await act(async () => {
            await result.current.handleDeleteCard(100);
        });

        expect(deleteCardMock).toHaveBeenCalledExactlyOnceWith(100);
        expect(loadBoard).toHaveBeenCalledOnce();
        expect(result.current.actionError).toBeNull();
    });

    it("signale une erreur en cas d'échec", async () => {
        deleteCardMock.mockRejectedValue(new Error("Suppression impossible"));
        const { result, loadBoard } = renderUseBoardActions(makeBoard());

        await act(async () => {
            await result.current.handleDeleteCard(100);
        });

        expect(result.current.actionError).toBe("Suppression impossible");
        expect(loadBoard).not.toHaveBeenCalled();
    });
});

describe("handleMoveCard", () => {
    it("ne fait rien quand il n'y a pas de board", async () => {
        const { result } = renderUseBoardActions(null);

        await act(async () => {
            await result.current.handleMoveCard(100, 11);
        });

        expect(moveCardMock).not.toHaveBeenCalled();
    });

    it("ne fait rien quand la colonne cible n'existe pas", async () => {
        const { result } = renderUseBoardActions(makeBoard());

        await act(async () => {
            await result.current.handleMoveCard(100, 999);
        });

        expect(moveCardMock).not.toHaveBeenCalled();
    });

    it("déplace la carte à la fin de la colonne cible et recharge le board", async () => {
        moveCardMock.mockResolvedValue(undefined);
        const { result, loadBoard } = renderUseBoardActions(makeBoard());

        await act(async () => {
            await result.current.handleMoveCard(100, 11);
        });

        expect(moveCardMock).toHaveBeenCalledExactlyOnceWith(100, 11, 0);
        expect(loadBoard).toHaveBeenCalledOnce();
        expect(result.current.movingCardId).toBeNull();
    });

    it("signale une erreur et réinitialise movingCardId en cas d'échec", async () => {
        moveCardMock.mockRejectedValue(new Error("Déplacement impossible"));
        const { result, loadBoard } = renderUseBoardActions(makeBoard());

        await act(async () => {
            await result.current.handleMoveCard(100, 11);
        });

        expect(result.current.actionError).toBe("Déplacement impossible");
        expect(result.current.movingCardId).toBeNull();
        expect(loadBoard).not.toHaveBeenCalled();
    });

    it("ignore un second déplacement tant que le premier est en cours", async () => {
        let resolveMove!: () => void;
        moveCardMock.mockImplementation(
            () => new Promise<void>((resolve) => { resolveMove = resolve; })
        );
        const { result } = renderUseBoardActions(makeBoard());

        act(() => {
            result.current.handleMoveCard(100, 11);
        });
        expect(result.current.movingCardId).toBe(100);

        act(() => {
            result.current.handleMoveCard(100, 11);
        });
        expect(moveCardMock).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveMove();
            await Promise.resolve();
        });
    });
});

describe("startEditingName / cancelEditingName", () => {
    it("ne fait rien si aucun board n'est chargé", () => {
        const { result } = renderUseBoardActions(null);

        act(() => result.current.startEditingName());

        expect(result.current.editingName).toBe(false);
    });

    it("initialise le brouillon avec le nom actuel du board et active l'édition", () => {
        const { result } = renderUseBoardActions(makeBoard());

        act(() => result.current.startEditingName());

        expect(result.current.editingName).toBe(true);
        expect(result.current.nameDraft).toBe("Mon board");
    });

    it("désactive l'édition sans rien enregistrer", () => {
        const { result } = renderUseBoardActions(makeBoard());

        act(() => result.current.startEditingName());
        act(() => result.current.cancelEditingName());

        expect(result.current.editingName).toBe(false);
        expect(updateBoardMock).not.toHaveBeenCalled();
    });
});

describe("handleSaveName", () => {
    it("ne fait rien si aucun board n'est chargé", async () => {
        const { result } = renderUseBoardActions(null);

        await act(async () => {
            await result.current.handleSaveName();
        });

        expect(updateBoardMock).not.toHaveBeenCalled();
    });

    it("n'appelle pas l'API si le nom est vide", async () => {
        const { result } = renderUseBoardActions(makeBoard());

        act(() => result.current.setNameDraft("   "));
        await act(async () => {
            await result.current.handleSaveName();
        });

        expect(updateBoardMock).not.toHaveBeenCalled();
        expect(result.current.editingName).toBe(false);
    });

    it("n'appelle pas l'API si le nom n'a pas changé", async () => {
        const { result } = renderUseBoardActions(makeBoard());

        act(() => result.current.setNameDraft("Mon board"));
        await act(async () => {
            await result.current.handleSaveName();
        });

        expect(updateBoardMock).not.toHaveBeenCalled();
    });

    it("enregistre le nouveau nom et recharge le board en cas de succès", async () => {
        updateBoardMock.mockResolvedValue(undefined);
        const { result, loadBoard } = renderUseBoardActions(makeBoard());

        act(() => result.current.setNameDraft("Nouveau nom"));
        await act(async () => {
            await result.current.handleSaveName();
        });

        expect(updateBoardMock).toHaveBeenCalledExactlyOnceWith(1, "Nouveau nom");
        expect(loadBoard).toHaveBeenCalledOnce();
    });

    it("signale une erreur en cas d'échec", async () => {
        updateBoardMock.mockRejectedValue(new Error("Nom déjà pris"));
        const { result, loadBoard } = renderUseBoardActions(makeBoard());

        act(() => result.current.setNameDraft("Nouveau nom"));
        await act(async () => {
            await result.current.handleSaveName();
        });

        expect(result.current.actionError).toBe("Nom déjà pris");
        expect(loadBoard).not.toHaveBeenCalled();
    });
});
