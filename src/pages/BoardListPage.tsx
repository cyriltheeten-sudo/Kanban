import { useState, useEffect } from "react";
import { getBoards, createBoard } from "../api/boards";
import type { Board } from "../types";

interface BoardListPageProps {
    onSelectBoard: (id: number) => void;
    onLogout: () => void;
}

export default function BoardListPage({ onSelectBoard, onLogout }: BoardListPageProps) {
    const [boards, setBoards] = useState<Board[]>([]);
    const [newName, setNewName] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getBoards()
            .then(setBoards)
            .catch((error) => {
                setError(error instanceof Error ? error.message : "Erreur inconnue");
            });
    }, []);

    async function handleCreate() {
        const name = newName.trim();
        if (!name) return;
        try {
            const newBoard = await createBoard(name);
            setNewName("");
            setBoards((prev) => [...prev, newBoard]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        }
    }

    if (error) return <p className="min-h-screen bg-[#0a0a0f] text-red-400 p-6">Erreur : {error}</p>;
    if (!boards.length) return <p className="min-h-screen bg-[#0a0a0f] text-zinc-400 p-6">Aucun projet disponible.</p>;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-zinc-100 p-6">
            <header className="flex justify-between mb-6">
                <h1 className="font-display text-xl font-bold text-emerald-400/80">Mes projets</h1>
                <button onClick={onLogout} className="text-sm text-zinc-400 hover:text-zinc-100">Déconnexion</button>
            </header>

            <div className="flex gap-2 mb-6">
                <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nom du nouveau projet"
                    className="rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-sm outline-none"
                />
                <button onClick={handleCreate} className="rounded-lg bg-emerald-500/80 px-4 py-2 text-sm">
                    Créer
                </button>
            </div>

            <div className="grid gap-3">
                {boards.map((board) => (
                    <div
                        key={board.id}
                        onClick={() => onSelectBoard(board.id)}
                    >
                        <h2 className="font-bold text-lg">{board.name}</h2>
                    </div>
                ))}
            </div>
        </div>
    );
}