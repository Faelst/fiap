export type SeedAction = 'seed' | 'skip' | 'reset';

export interface SeedState {
  /** Quantos responsáveis o banco já tem. */
  existingGuardians: number;
  /** Env SEED_RESET: só "true" apaga e recria um banco já populado. */
  seedReset: string | undefined;
}

/**
 * Banco vazio → popula. Banco com dados → não mexe (mantém ids e, com eles,
 * os tokens já emitidos), a não ser com SEED_RESET=true.
 */
export function decideSeed({
  existingGuardians,
  seedReset,
}: SeedState): SeedAction {
  if (existingGuardians === 0) {
    return 'seed';
  }
  return seedReset?.trim().toLowerCase() === 'true' ? 'reset' : 'skip';
}
