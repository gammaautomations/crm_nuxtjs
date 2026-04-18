// utils/igic.ts
export const IGIC_RATES = [0, 3, 7, 9.5, 15, 20] as const
export type IgicRate = (typeof IGIC_RATES)[number]

export const IGIC_LABELS: Record<number, string> = {
  0: 'Exento (0%)',
  3: 'Superreducido (3%)',
  7: 'Reducido (7%)',
  9.5: 'General (9,5%)',
  15: 'Incrementado (15%)',
  20: 'Especial tabaco (20%)',
}
