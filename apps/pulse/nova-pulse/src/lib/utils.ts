import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function _cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
