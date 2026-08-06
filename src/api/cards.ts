import { apiFetch } from "./client";
import type { Card } from "../types";

export function createCard(title: string, columnId: number): Promise<Card> {
  return apiFetch<Card>("/cards", {
    method: "POST",
    body: JSON.stringify({ title, columnId }),
  });
}

export function deleteCard(id: number): Promise<void> {
  return apiFetch<void>(`/cards/${id}`, { method: "DELETE" });
}

export function updateCard(id: number, title: string, description?: string): Promise<void> {
  return apiFetch<void>(`/cards/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title, description }),
  });
}