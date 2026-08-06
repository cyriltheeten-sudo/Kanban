export interface Card {
  id: number;
  title: string;
  description?: string;
  order: number;
}

export interface Column {
  id: number;
  title: string;
  order: number;
  cards: Card[];
}

export interface Board {
  id: number;
  name: string;
  columns: Column[];
}