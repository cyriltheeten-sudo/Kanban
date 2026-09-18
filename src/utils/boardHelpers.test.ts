import { describe, it, expect } from "vitest";
import { findCard, parseId } from "./boardHelpers";
import type { Board } from "../types";

function makeBoard(): Board {
    return {
        id: 1,
        name: "Board de test",
        createdAt: "2026-01-01T00:00:00.000Z",
        columns: [
            {
                id: 10,
                title: "À faire",
                order: 0,
                cards: [
                    { id: 100, title: "Carte A", order: 0, entries: [] },
                    { id: 101, title: "Carte B", order: 1, entries: [] },
                ],
            },
            {
                id: 11,
                title: "Terminé",
                order: 1,
                cards: [{ id: 102, title: "Carte C", order: 0, entries: [] }],
            },
        ],
    };
}

describe("findCard", () => {
    it("retourne la carte et sa colonne quand elle existe", () => {
        const board = makeBoard();

        const result = findCard(board, 101);

        expect(result?.card.title).toBe("Carte B");
        expect(result?.column.id).toBe(10);
    });

    it("retourne null quand la carte n'existe dans aucune colonne", () => {
        const board = makeBoard();

        expect(findCard(board, 999)).toBeNull();
    });

    it("retourne null quand le board est null", () => {
        expect(findCard(null, 100)).toBeNull();
    });

    it("retourne null quand le board n'a aucune colonne", () => {
        const board: Board = { id: 1, name: "Vide", createdAt: "", columns: [] };

        expect(findCard(board, 100)).toBeNull();
    });
});

describe("parseId", () => {
    it("reconnaît un identifiant de carte", () => {
        expect(parseId("card-42")).toEqual({ type: "card", id: 42 });
    });

    it("reconnaît un identifiant de colonne", () => {
        expect(parseId("column-7")).toEqual({ type: "column", id: 7 });
    });

    it("retourne null pour un préfixe inconnu", () => {
        expect(parseId("board-1")).toBeNull();
    });

    it("retourne null pour un identifiant numérique brut", () => {
        expect(parseId(42)).toBeNull();
    });
});
