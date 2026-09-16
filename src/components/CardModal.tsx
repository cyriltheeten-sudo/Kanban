import { useEffect, useState } from "react";
import type { Card, Column } from "../types";
import { updateCard, upsertCardEntry } from "../api/cards";

interface CardModalProps {
    card: Card;
    columns: Column[];
    gems: string[];
    onClose: () => void;
    onSaved: () => void;
    onDelete: () => void
}

export default function CardModal({ card, columns, gems, onClose, onSaved, onDelete }: CardModalProps) {
    const [drafts, setDrafts] = useState<Record<number, string>>(() => {
        const initial: Record<number, string> = {};
        for (const col of columns) {
            const entry = card.entries.find((e) => e.columnId === col.id);
            initial[col.id] = entry?.content ?? "";
        }
        return initial;
    });
    const [titleDraft, setTitleDraft] = useState(card.title);
    const [savingTitle, setSavingTitle] = useState(false);
    const [savingColumnId, setSavingColumnId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [confirmingDelete, setConfirmingDelete] = useState(false)

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    async function handleSaveTitle() {
        const next = titleDraft.trim();
        if (!next) return;              // on n'enregistre pas un titre vide
        setSavingTitle(true);
        setError(null);
        try {
            await updateCard(card.id, next);
            onSaved();                  // ferme + recharge, comme les sections
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setSavingTitle(false);
        }
    }

    async function handleSave(columnId: number) {
        setSavingColumnId(columnId);
        setError(null);
        try {
            await upsertCardEntry(card.id, columnId, drafts[columnId] ?? "");
            onSaved();          // BoardPage recharge → la modale se ferme (voir plus bas)
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setSavingColumnId(null);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl bg-surface p-6 flex flex-col gap-5"
            >
                <div className="flex items-start gap-3">
                    <div className="flex-1 flex flex-col gap-2">
                        <input
                            value={titleDraft}
                            onChange={(e) => setTitleDraft(e.target.value)}
                            placeholder="Titre de la carte"
                            className="w-full rounded-xl bg-field px-3 py-2 text-lg font-bold text-ink placeholder:text-placeholder outline-none focus-visible:ring-1 focus-visible:ring-teal-500/30"
                        />
                        <button
                            onClick={handleSaveTitle}
                            disabled={savingTitle}
                            className="self-start rounded-lg bg-raised hover:bg-btn-hover px-4 py-1.5 text-xs font-semibold text-ink transition-colors duration-200 disabled:opacity-50"
                        >
                            {savingTitle ? "Enregistrement…" : "Renommer"}
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="shrink-0 p-2 rounded-lg bg-field text-faint hover:text-ink transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 text-xs text-red-400">
                        {error}
                    </div>
                )}

                {columns.map((column, index) => {
                    const gem = gems[index % gems.length];
                    return (
                        <div key={column.id} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span
                                    className="h-2 w-2 rounded-full shrink-0"
                                    style={{ background: gem }}
                                />
                                <h3 className="text-sm font-semibold text-ink">{column.title}</h3>
                            </div>

                            {column.description && (
                                <p className="text-xs text-muted">{column.description}</p>
                            )}

                            <textarea
                                value={drafts[column.id] ?? ""}
                                onChange={(e) =>
                                    setDrafts((prev) => ({ ...prev, [column.id]: e.target.value }))
                                }
                                rows={3}
                                placeholder="Écris ici…"
                                className="w-full rounded-xl bg-field px-3 py-2 text-sm text-ink placeholder:text-placeholder outline-none resize-y focus-visible:ring-1 focus-visible:ring-teal-500/30"
                            />

                            <button
                                onClick={() => handleSave(column.id)}
                                disabled={savingColumnId === column.id}
                                style={{ background: gem }}
                                className="self-end rounded-lg px-4 py-1.5 text-xs font-semibold text-black transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
                            >
                                {savingColumnId === column.id ? "Enregistrement…" : "Enregistrer"}
                            </button>

                        </div>

                    );
                })}
                <div className="mt-2 border-t border-hair-soft pt-4">
                    {confirmingDelete ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted flex-1">Supprimer cette carte définitivement ?</span>
                            <button
                                onClick={onDelete}
                                className="rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 text-xs font-semibold transition-colors"
                            >
                                Confirmer
                            </button>
                            <button
                                onClick={() => setConfirmingDelete(false)}
                                className="rounded-lg bg-field text-faint hover:text-ink px-3 py-1.5 text-xs transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmingDelete(true)}
                            className="text-xs text-faint hover:text-red-400 transition-colors"
                        >
                            Supprimer la carte
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
}