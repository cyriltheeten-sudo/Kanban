import { useEffect, useState } from "react";
import { getBoard } from "./api/boards";
import { createCard, deleteCard, updateCard } from "./api/cards";
import { createColumn, deleteColumn } from "./api/columns";
import type { Board } from "./types";
import Login from "./pages/Login";

const GEMMES = ["#10b981", "#f59e0b", "#e11d48"]; // émeraude, topaze, rubis

function App() {
  const [connecte, setConnecte] = useState<boolean>(!!localStorage.getItem("token"));
  const [board, setBoard] = useState<Board | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [nouveauTitre, setNouveauTitre] = useState<Record<number, string>>({});
  const [nouvelleColonne, setNouvelleColonne] = useState("");

  function chargerBoard() {
    getBoard(1).then(setBoard).catch((e) => setErreur(e.message));
  }

  useEffect(() => {
    if (!connecte) return;
    chargerBoard();
  }, [connecte]);

  async function ajouterCarte(columnId: number) {
    const titre = nouveauTitre[columnId]?.trim();
    if (!titre) return;
    try {
      await createCard(titre, columnId);
      setNouveauTitre((prev) => ({ ...prev, [columnId]: "" }));
      chargerBoard();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur inconnue");
    }
  }

  async function supprimerCarte(id: number) {
    try { await deleteCard(id); chargerBoard(); }
    catch (e) { setErreur(e instanceof Error ? e.message : "Erreur inconnue"); }
  }

  async function editerCarte(id: number, titreActuel: string) {
    const nouveau = prompt("Nouveau titre :", titreActuel);
    if (nouveau === null || nouveau.trim() === "") return;
    try { await updateCard(id, nouveau.trim()); chargerBoard(); }
    catch (e) { setErreur(e instanceof Error ? e.message : "Erreur inconnue"); }
  }

  async function ajouterColonne() {
    const titre = nouvelleColonne.trim();
    if (!titre || !board) return;
    try { await createColumn(titre, board.id); setNouvelleColonne(""); chargerBoard(); }
    catch (e) { setErreur(e instanceof Error ? e.message : "Erreur inconnue"); }
  }

  async function supprimerColonne(id: number) {
    try { await deleteColumn(id); chargerBoard(); }
    catch (e) { setErreur(e instanceof Error ? e.message : "Erreur inconnue"); }
  }

  function deconnexion() {
    localStorage.removeItem("token");
    setBoard(null);
    setConnecte(false);
  }

  if (!connecte) return <Login onLogin={() => setConnecte(true)} />;
  if (erreur) return <p className="min-h-screen bg-[#0a0a0f] text-red-400 p-6">Erreur : {erreur}</p>;
  if (!board) return <p className="min-h-screen bg-[#0a0a0f] text-zinc-400 p-6">Chargement…</p>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100">
      <header className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-bold tracking-widest text-emerald-400/80 uppercase">
            Gemboard
          </span>
          <span className="text-white/20">/</span>
          <h1 className="font-display text-xl font-bold tracking-tight">{board.name}</h1>
        </div>
        <button
          onClick={deconnexion}
          className="text-sm text-zinc-400 hover:text-zinc-100 transition"
        >
          Déconnexion
        </button>
      </header>

      {/* Colonnes côte à côte, défilement horizontal */}
      <div className="scroll-kanban flex gap-4 overflow-x-auto px-6 py-6 items-start">
        {board.columns.map((col, index) => {
          const gem = GEMMES[index % GEMMES.length];
          return (
            <div
              key={col.id}
              className="w-72 flex-shrink-0 rounded-2xl bg-white/[0.02] border border-white/5 p-3"
            >
              {/* En-tête de colonne */}
              <div className="flex items-center gap-2 px-1 pb-3">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: gem, boxShadow: `0 0 8px ${gem}` }}
                />
                <h2 className="font-display text-sm font-semibold tracking-wide flex-1">
                  {col.title}
                </h2>
                <span className="text-xs text-zinc-500">{col.cards.length}</span>
                <button
                  onClick={() => supprimerColonne(col.id)}
                  className="text-zinc-600 hover:text-red-400 transition text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Cartes */}
              <div className="flex flex-col gap-2">
                {col.cards.map((card) => (
                  <div
                    key={card.id}
                    className="gem-card group rounded-xl px-3 py-2.5"
                    style={{ ["--gem"]: gem } as React.CSSProperties}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-zinc-100 leading-snug">{card.title}</p>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                        <button
                          onClick={() => editerCarte(card.id, card.title)}
                          className="text-zinc-400 hover:text-zinc-100 text-xs"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => supprimerCarte(card.id)}
                          className="text-zinc-400 hover:text-red-400 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    {card.description && (
                      <p className="mt-1 text-xs text-zinc-500">{card.description}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Ajout de carte (Entrée pour valider) */}
              <input
                value={nouveauTitre[col.id] ?? ""}
                onChange={(e) =>
                  setNouveauTitre((prev) => ({ ...prev, [col.id]: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && ajouterCarte(col.id)}
                placeholder="+ Nouvelle carte"
                className="mt-2 w-full rounded-lg bg-white/5 border border-white/5 px-2.5 py-1.5 text-sm placeholder:text-zinc-600 outline-none focus-visible:border-white/20 transition"
              />
            </div>
          );
        })}

        {/* Colonne fantôme : ajouter une colonne */}
        <div className="w-72 flex-shrink-0">
          <input
            value={nouvelleColonne}
            onChange={(e) => setNouvelleColonne(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ajouterColonne()}
            placeholder="+ Nouvelle colonne"
            className="w-full rounded-xl bg-white/[0.03] border border-dashed border-white/10 px-3 py-2.5 text-sm placeholder:text-zinc-600 outline-none focus-visible:border-white/25 transition"
          />
        </div>
      </div>
    </div>
  );
}

export default App;