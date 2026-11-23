/**
 * Lista padronizada de Unidades Básicas de Saúde (UBS) do sistema FilaFácil.
 */
export const UBS_UNITS = [
  'UBS Centro - Dr. José Silva',
  'UBS Jardim das Flores',
  'UBS Vila Esperança',
  'UBS São Francisco',
  'UBS Santa Rita de Cássia',
  'UBS Central 01',
] as const;

export type UbsUnitName = typeof UBS_UNITS[number] | string;

/**
 * Normaliza códigos legados (ex: "UBS-1", "UBS-2") para os nomes oficiais por extenso.
 */
export function normalizeUnitName(unit?: string | null): string {
  if (!unit || typeof unit !== 'string' || unit.trim() === '') {
    return 'UBS Centro - Dr. José Silva';
  }

  const trimmed = unit.trim();
  switch (trimmed) {
    case 'UBS-1':
      return 'UBS Centro - Dr. José Silva';
    case 'UBS-2':
      return 'UBS Jardim das Flores';
    case 'UBS-3':
      return 'UBS Vila Esperança';
    case 'UBS-4':
      return 'UBS São Francisco';
    case 'UBS-5':
      return 'UBS Santa Rita de Cássia';
    default:
      return trimmed;
  }
}
