import { apiFetch } from "./client";
import type { Card } from "../types";

export function createCard(title: string, columnId: number): Promise<Card> {
  return apiFetch<Card>("/cards", {
    method: "POST",
    body: JSON.stringify({ title, columnId }),
  });
}