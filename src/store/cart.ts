// src/store/cart.ts
// Lightweight cart store using nanostores (no external dependency needed)
// Packages section uses direct #contact links — no cart required.
// This file exists to satisfy any legacy imports during migration.

export interface CartItem {
  id: string;
  name: string;
  price_inr: number;
  price_usd: number | null;
}

// Simple in-memory cart (non-reactive, safe for SSR)
let items: CartItem[] = [];

export function getCart(): CartItem[] {
  return items;
}

export function addToCart(item: CartItem): void {
  if (!items.find(i => i.id === item.id)) {
    items = [...items, item];
  }
}

export function removeFromCart(id: string): void {
  items = items.filter(i => i.id !== id);
}

export function clearCart(): void {
  items = [];
}

export function getTotal(): number {
  return items.reduce((sum, i) => sum + i.price_inr, 0);
}
