import { apiFetch } from "./client";
import type { Board } from "../types";

export function getBoards(): Promise<Board[]> {
    return apiFetch<Board[]>("/boards");
}

export function getBoard(id: number): Promise<Board> {
  return apiFetch<Board>(`/boards/${id}`);
}

export function updateBoard(id: number, name: string): Promise<void> {
  return apiFetch<void>(`/boards/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}

export function createBoard(name: string): Promise<Board> {
    return apiFetch<Board>("/boards", {
        method: "POST",
        body: JSON.stringify({ name }),
    });
}