import type { Board } from "../types";

const API = "https://localhost:7007/api";

export async function getBoard(id: number): Promise<Board> {
  const token = localStorage.getItem("token");   // on récupère le jeton stocké

  const reponse = await fetch(`${API}/boards/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,   // on le joint à la requête
    },
  });

  if (!reponse.ok) throw new Error(`Erreur HTTP : ${reponse.status}`);
  return (await reponse.json()) as Board;
}