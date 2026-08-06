import { useEffect, useState } from "react";
import { getBoard } from "./api/boards";
import type { Board } from "./types";
import Login from "./pages/Login";

function App() {
  const [connecte, setConnecte] = useState<boolean>(!!localStorage.getItem("token"));
  const [board, setBoard] = useState<Board | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!connecte) return;   // pas connecté → on ne charge rien
    getBoard(1).then(setBoard).catch((e) => setErreur(e.message));
  }, [connecte]);

  if (!connecte) return <Login onLogin={() => setConnecte(true)} />;

  if (erreur) return <p>Erreur : {erreur}</p>;
  if (!board) return <p>Chargement...</p>;

  return (
    <div>
      <h1>{board.name}</h1>
      {board.columns.map((col) => (
        <div key={col.id}>
          <h2>{col.title}</h2>
          {col.cards.map((card) => (
            <p key={card.id}>{card.title}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

export default App;