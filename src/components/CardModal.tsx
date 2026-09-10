import type { Card, Column } from "../types";

interface CardModalProps {
    card: Card;
    columns: Column[];
    onClose: () => void;
}

export default function CardModal({ card, columns, onClose }: CardModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl bg-surface p-6 flex flex-col gap-5"
            >
                <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-bold text-ink">{card.title}</h2>
                    <button
                        onClick={onClose}
                        className="shrink-0 p-2 rounded-lg bg-field text-faint hover:text-ink transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {columns.map((column) => {
                    const entry = card.entries.find((e) => e.columnId === column.id);
                    return (
                        <div key={column.id} className="flex flex-col gap-2">
                            <h3 className="text-sm font-semibold text-ink">{column.title}</h3>

                            {column.description && (
                                <p className="text-xs text-muted">{column.description}</p>
                            )}

                            <p className="text-sm text-ink-soft whitespace-pre-wrap">
                                {entry ? entry.content : <span className="text-faint italic">Rien pour l'instant.</span>}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}