import { apiFetch } from "./client";
import type { Column } from "../types";

export function createColumn(title: string, boardId: number): Promise<Column> {
  return apiFetch<Column>("/columns", {
    method: "POST",
    body: JSON.stringify({ title, boardId }),
  });
}

export function deleteColumn(id: number): Promise<void> {
  return apiFetch<void>(`/columns/${id}`, { method: "DELETE" });
}