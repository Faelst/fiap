/** Opacidades com significado (01-design.md da v2, 1.7). */
export const opacities = {
  /** Aula que já terminou. Mínimo para AA (1.3): não baixe de 0,72. */
  past: 0.72,
  /** Ações de texto pressionadas (ghost, "Hoje"). */
  pressed: 0.6,
  /** Campos do login durante o envio. */
  busy: 0.6,
  hidden: 0,
} as const;
