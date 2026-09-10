export interface CardEntry {
  id: number;
  columnId: number;
  content: string;
  updatedAt: string;
}

export interface Card {
  id: number;
  title: string;
  order: number;
  entries: CardEntry[];  
}

export interface Column {
  id: number;
  title: string;
  description?: string;   
  order: number;
  cards: Card[];
}

export interface Board {
  id: number;
  name: string;
  columns: Column[];
  createdAt: string;
}

export interface Template {
  id: number;
  name: string;
  columns: Column[];
  ownerId: number;
}