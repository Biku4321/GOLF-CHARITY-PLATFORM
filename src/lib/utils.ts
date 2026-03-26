import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely — handles conflicts and conditional classes. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format pence (integer) to a human-readable GBP string, e.g. 999 → "£9.99" */
export function formatPence(pence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style:    'currency',
    currency: 'GBP',
  }).format(pence / 100)
}

/** Format an ISO date string to a readable date, e.g. "26 Mar 2026" */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  }).format(new Date(iso))
}

/** Return initials for a display name, e.g. "John Smith" → "JS" */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}