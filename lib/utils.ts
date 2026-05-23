import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility to format price levels for UI display
export function getPriceRangeLabel(priceRange: string): string {
  switch (priceRange) {
    case "budget":
      return "₱";
    case "mid-range":
      return "₱₱";
    case "luxury":
      return "₱₱₱";
    default:
      return "₱";
  }
}
