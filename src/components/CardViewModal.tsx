import { useEffect } from "react";
import type { Card, Column } from "../types";

interface CardViewModalProps {
    card: Card;
    columns: Column[];
    gems: string[];
    onClose: () => void;
    onEdit: () => void;
}

export default function CardViewModal({ card, columns, gems, onClose, onEdit }: CardViewModalProps) {
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

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
                    <h2 className="flex-1 text-lg font-bold text-ink leading-snug break-words">
                        {card.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="shrink-0 p-2 rounded-lg bg-field text-faint hover:text-ink transition-colors"
                        title="Fermer"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex flex-col gap-5">
                    {columns.map((column, index) => {
                        const gem = gems[index % gems.length];
                        const content = card.entries.find((e) => e.columnId === column.id)?.content?.trim();
                        return (
                            <div key={column.id} className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="h-2 w-2 rounded-full shrink-0"
                                        style={{ background: gem, boxShadow: `0 0 6px color-mix(in srgb, ${gem} 40%, transparent)` }}
                                    />
                                    <h3 className="text-sm font-semibold text-ink">{column.title}</h3>
                                </div>

                                {content ? (
                                    <p className="whitespace-pre-wrap break-words text-sm text-ink-soft leading-relaxed pl-4">
                                        {content}
                                    </p>
                                ) : (
                                    <p className="text-xs text-faint italic pl-4">
                                        Aucune description
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-1 border-t border-hair-soft pt-4 flex justify-end">
                    <button
                        onClick={onEdit}
                        className="rounded-lg bg-raised hover:bg-btn-hover px-4 py-1.5 text-xs font-semibold text-ink transition-colors duration-200"
                    >
                        Modifier
                    </button>
                </div>
            </div>
        </div>
    );
}
