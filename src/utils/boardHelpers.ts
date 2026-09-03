import type { Board } from "../types";

export function findCard(board: Board | null, cardId: number) {
    for (const col of board?.columns ?? []) {
        const card = col.cards.find((c) => c.id === cardId);
        if (card) return { card, column: col };
    }
    return null;
}

export function parseId(raw: string | number) {
    const s = String(raw);
    if (s.startsWith("card-")) return { type: "card" as const, id: Number(s.slice(5)) };
    if (s.startsWith("column-")) return { type: "column" as const, id: Number(s.slice(7)) };
    return null;
}