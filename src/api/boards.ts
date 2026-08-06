import type { Board } from "../types";

const API = "https://localhost:7007/api";   // ← ton port d'API

export async function getBoard(id: number): Promise<Board> {
  const reponse = await fetch(`${API}/boards/${id}`);
  if (!reponse.ok) throw new Error(`Erreur HTTP : ${reponse.status}`);
  return (await reponse.json()) as Board;
}