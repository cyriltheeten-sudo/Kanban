import { useState, useEffect, useRef } from "react";
import { getBoards, createBoard, deleteBoard } from "../api/boards";
import type { Board, Template } from "../types";
import { getTemplates } from "../api/template";
import { useNavigate } from "react-router";


export default function BoardListPage() {
    const navigate = useNavigate();
    const [boards, setBoards] = useState<Board[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [newName, setNewName] = useState("");
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chargement, setChargement] = useState(true);
    const [confirmingId, setConfirmingId] = useState<number | null>(null);
    const [nameError, setNameError] = useState(false);

    const selectRef = useRef<HTMLDivElement>(null);

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        return new Intl.DateTimeFormat("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date);
    };

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

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
                setIsSelectOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function handleCreate() {
        const name = newName.trim();
        if (!name) {
            setNameError(true);
            return;
        }
        setNameError(false);
        try {
            const newBoard = await createBoard(name, selectedTemplateId);
            setNewName("");
            setBoards((prev) => [...prev, newBoard]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        }
    }

    async function handleDelete(id: number) {
        try {
            await deleteBoard(id);
            setBoards((prev) => prev.filter((b) => b.id !== id));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setConfirmingId(null);
        }
    }

    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

    if (chargement) {
        return (
            <div className="relative min-h-screen w-full bg-app text-ink flex items-center justify-center p-6 overflow-hidden font-sans">
                <div className="relative z-10 flex items-center gap-3">
                    <span className="w-4 h-4 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
                    <p className="text-muted text-sm animate-pulse">
                        Chargement… <span className="text-faint">(le serveur peut mettre jusqu'à 30 s à se réveiller)</span>
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative min-h-screen w-full bg-app text-ink flex items-center justify-center p-6 overflow-hidden font-sans">
                <div className="relative z-10 rounded-2xl bg-surface p-6 text-red-400 text-sm shadow-2xl">
                    Erreur : {error}
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full bg-app text-ink flex flex-col justify-between items-center px-6 py-8 overflow-x-hidden font-sans selection:bg-teal-500/20 selection:text-teal-300">

            <header className="relative z-10 w-full max-w-4xl flex items-center justify-between py-3 px-6 rounded-2xl bg-surface">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight">
                        <span className="bg-linear-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
                            Gem
                        </span>
                        <span className="text-white">Board</span>
                    </h1>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/login");
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-ink bg-raised hover:bg-btn-hover transition-colors duration-200 active:scale-95"
                >
                    Déconnexion
                </button>
            </header>

            <main className="relative z-10 flex flex-col items-center w-full max-w-4xl my-auto py-8 gap-8">

                <div className="relative z-30 w-full rounded-3xl bg-surface p-6 sm:p-8">
                    <h2 className="text-xs font-bold tracking-wider text-teal-400 mb-4">
                        Créer un nouveau tableau
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            value={newName}
                            onChange={(e) => {
                                setNewName(e.target.value);
                                if (nameError) setNameError(false);
                            }}
                            placeholder="Nom du tableau..."
                            className={`flex-1 rounded-xl bg-field px-4 py-3 text-sm text-ink placeholder:text-placeholder outline-none transition-colors duration-200 autofill:shadow-[0_0_0_30px_var(--color-field)_inset] autofill:[-webkit-text-fill-color:var(--color-ink)] autofill:caret-white ${nameError ? "ring-1 ring-red-500/60" : ""}`}
                        />

                        <div className="relative min-w-50" ref={selectRef}>
                            <button
                                type="button"
                                onClick={() => setIsSelectOpen((prev) => !prev)}
                                className="w-full flex items-center justify-between rounded-xl bg-field hover:bg-raised px-4 py-3 text-sm text-ink-soft outline-none transition-colors duration-200 cursor-pointer"
                            >
                                <span>{selectedTemplate ? selectedTemplate.name : "Sélectionner..."}</span>
                                <svg className={`w-4 h-4 text-faint transition-transform duration-200 ${isSelectOpen ? "rotate-180 text-teal-400" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isSelectOpen && (
                                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-xl bg-raised overflow-hidden p-1.5 flex flex-col gap-1 shadow-2xl">
                                    {templates.map((template) => (
                                        <button
                                            key={template.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedTemplateId(template.id);
                                                setIsSelectOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${selectedTemplateId === template.id
                                                ? "bg-teal-500/20 text-teal-300"
                                                : "text-muted hover:text-ink hover:bg-field"
                                                }`}
                                        >
                                            {template.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleCreate}
                            className="rounded-xl bg-linear-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-black font-semibold text-sm px-6 py-3 transition-colors duration-200 active:scale-[0.98] shrink-0"
                        >
                            Créer
                        </button>
                    </div>
                </div>

                <div className="relative z-10 w-full rounded-3xl bg-surface p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold tracking-tight text-ink">
                            Vos Tableaux
                        </h2>
                        <span className="text-xs text-faint font-medium">
                            {boards.length} {boards.length > 1 ? "tableaux" : "tableau"}
                        </span>
                    </div>

                    {boards.length === 0 ? (
                        <p className="text-muted text-sm text-center py-8">
                            Aucun tableau pour l'instant. Créez-en un ci-dessus !
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {boards.map((board) => (
                                <div
                                    key={board.id}
                                    onClick={() => navigate(`/board/${board.id}`)}
                                    className="group relative rounded-2xl bg-raised border border-transparent hover:border-teal-500/30 hover:bg-raised-hover hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(20,184,166,0.15)] transition-all duration-200 cursor-pointer p-6 h-36 flex flex-col justify-between"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="font-semibold text-lg text-ink group-hover:text-teal-300 transition-colors line-clamp-1">
                                            {board.name}
                                        </h3>
                                        {confirmingId === board.id ? (
                                            <div className="shrink-0 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(board.id)}
                                                    className="rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 px-2.5 py-1 text-xs font-semibold transition-colors"
                                                >
                                                    Confirmer
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmingId(null)}
                                                    className="rounded-lg bg-field text-faint hover:text-ink px-2.5 py-1 text-xs transition-colors"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setConfirmingId(board.id); }}
                                                title="Supprimer ce tableau"
                                                className="shrink-0 p-2 rounded-lg bg-field text-faint hover:text-red-400 hover:bg-red-500/20 transition-colors duration-200"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center pt-3">
                                        <span className="text-xs text-faint group-hover:text-teal-300/80 transition-colors font-medium">
                                            {formatDate(board.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </main>

            <footer className="relative z-10 text-xs text-faint font-medium text-center py-2">
                Gemboard © {new Date().getFullYear()}
            </footer>

        </div>
    );
}
