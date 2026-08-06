import { apiFetch } from "./client";
import type { Board } from "../types";

export function getBoard(id: number): Promise<Board> {
  return apiFetch<Board>(`/boards/${id}`);
}