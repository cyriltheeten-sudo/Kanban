import { useEffect, useState } from "react";
import { getBoard } from "./api/boards";
import { createCard, deleteCard, updateCard } from "./api/cards";
import {createColumn, deleteColumn} from "./api/columns";
import type { Board } from "./types";
import Login from "./pages/Login";

function App() {
  const [connecte, setConnecte] = useState<boolean>(!!localStorage.getItem("token"));
  const [board, setBoard] = useState<Board | null>(null);
  const [nouvelleColonne, setNouvelleColonne] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [nouveauTitre, setNouveauTitre] = useState<Record<number, string>>({});

  function chargerBoard() {
    getBoard(1).then(setBoard).catch((e) => setErreur(e.message));
  }

  useEffect(() => {
    if (!connecte) return;
    chargerBoard();
  }, [connecte]);

  async function ajouterColonne() {
    const titre = nouvelleColonne.trim();
    if (!titre || !board) return;
    try {
      await createColumn(titre, board.id);
      setNouvelleColonne("");
      chargerBoard();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur inconnue");
    }
  }

  async function supprimerColonne(id: number) {
    try {
      await deleteColumn(id);
      chargerBoard();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur inconnue");
    }
  }

  async function ajouterCarte(columnId: number) {
    const titre = nouveauTitre[columnId]?.trim();
    if (!titre) return;
    try {
      await createCard(titre, columnId);
      setNouveauTitre((prev) => ({ ...prev, [columnId]: "" }));   // vide le champ
      chargerBoard();                                             // recharge le board
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur inconnue");
    }
  }

  async function supprimerCarte(id: number) {
    try {
      await deleteCard(id);
      chargerBoard();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur inconnue");
    }
  }

  async function editerCarte(id: number, titreActuel: string) {
    const nouveau = prompt("Nouveau titre :", titreActuel);
    if (nouveau === null || nouveau.trim() === "") return;   // annulé ou vide
    try {
      await updateCard(id, nouveau.trim());
      chargerBoard();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur inconnue");
    }
  }

  if (!connecte) return <Login onLogin={() => setConnecte(true)} />;
  if (erreur) return <p>Erreur : {erreur}</p>;
  if (!board) return <p>Chargement...</p>;

  return (
    <div>
      <h1>{board.name}</h1>
      {board.columns.map((col) => (
        <div key={col.id}>
          <h2>
            {col.title}
            <button onClick={() => supprimerColonne(col.id)}>✕ colonne</button>
          </h2>
          {col.cards.map((card) => (
            <p key={card.id}>
              {card.title}
              <button onClick={() => editerCarte(card.id, card.title)}>✎</button>
              <button onClick={() => supprimerCarte(card.id)}>✕</button>
            </p>
          ))}
          <input
            value={nouveauTitre[col.id] ?? ""}
            onChange={(e) =>
              setNouveauTitre((prev) => ({ ...prev, [col.id]: e.target.value }))
            }
            placeholder="Nouvelle carte..."
          />
          <button onClick={() => ajouterCarte(col.id)}>Ajouter</button>
        </div>
      ))}
      <div>
        <input
          value={nouvelleColonne}
          onChange={(e) => setNouvelleColonne(e.target.value)}
          placeholder="Nouvelle colonne..."
        />
        <button onClick={ajouterColonne}>Ajouter une colonne</button>
      </div>      
    </div>
  );
}

export default App;