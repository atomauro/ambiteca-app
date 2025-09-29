import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRoleLabel(role?: string | null): string {
  switch ((role || '').toLowerCase()) {
    case 'admin':
      return 'Admin'
    case 'asistente':
      return 'Asistente'
    case 'ciudadano':
      return 'Ciudadano'
    default:
      return role || 'Ciudadano'
  }
}


