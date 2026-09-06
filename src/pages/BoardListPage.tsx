import { useState, useEffect } from "react";
import { getBoards, createBoard, deleteBoard } from "../api/boards";
import type { Board, Template } from "../types";
import { getTemplates } from "../api/template";

interface BoardListPageProps {
    onSelectBoard: (id: number) => void;
    onLogout: () => void;
}

export default function BoardListPage({ onSelectBoard, onLogout }: BoardListPageProps) {
    const [boards, setBoards] = useState<Board[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [newName, setNewName] = useState("");
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [chargement, setChargement] = useState(true);   // ← nouvel état

    useEffect(() => {
        Promise.all([getBoards(), getTemplates()])
            .then(([boardsData, templatesData]) => {
                setBoards(boardsData);
                setTemplates(templatesData);
                const defaut = templatesData.find((t) => t.name === "Kanban simple") ?? templatesData[0];
                if (defaut) setSelectedTemplateId(defaut.id);
            })
            .catch((e) => {
                setError(e instanceof Error ? e.message : "Erreur inconnue");
            })
            .finally(() => {
                setChargement(false);
            });
    }, []);

    async function handleCreate() {
        const name = newName.trim();
        if (!name) return;
        try {
            const newBoard = await createBoard(name, selectedTemplateId);
            setNewName("");
            setBoards((prev) => [...prev, newBoard]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Supprimer ce projet et toutes ses cartes ?")) return;
        try {
            await deleteBoard(id);
            setBoards((prev) => prev.filter((b) => b.id !== id));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        }
    }

    if (chargement) {
        return (
            <p className="min-h-screen bg-[#0a0a0f] text-zinc-400 p-6">
                Chargement… <span className="text-zinc-600">(le serveur peut mettre jusqu'à 30 s à se réveiller)</span>
            </p>
        );
    }
    if (error) return <p className="min-h-screen bg-[#0a0a0f] text-red-400 p-6">Erreur : {error}</p>;

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
                    className="rounded-lg bg-white/3 border border-white/10 px-3 py-2 text-sm outline-none"
                />
                <select
                    value={selectedTemplateId ?? ""}
                    onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
                    className="rounded-lg bg-white/3 border border-white/10 px-3 py-2 text-sm outline-none"
                >
                    {templates.map((template) => (
                        <option className="bg-[#0a0a0f]" key={template.id} value={template.id}>
                            {template.name}
                        </option>
                    ))}
                </select>
                <button onClick={handleCreate} className="rounded-lg bg-emerald-500/80 px-4 py-2 text-sm">
                    Créer
                </button>
            </div>

            <div className="grid gap-3 border-2 border-white/10 rounded-lg p-4">
                {boards.length === 0 ? (
                    <p className="text-zinc-500 text-sm">Aucun projet pour l'instant. Créez-en un ci-dessus !</p>
                ) : (
                    boards.map((board) => (
                        <div className="p-3 border border-white/10 rounded-lg hover:bg-white/5 transition cursor-pointer"
                            key={board.id}
                            onClick={() => onSelectBoard(board.id)}
                        >
                            <h2 className="font-bold text-lg">{board.name}</h2>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(board.id);
                                }}
                                className="mt-2 text-xs text-red-400 hover:text-red-300 transition"
                            >
                                Supprimer
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}