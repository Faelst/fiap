import { Controller, Get } from '@nestjs/common';
import {
  type AuthenticatedGuardian,
  CurrentGuardian,
} from '../../src/shared/decorators/current-guardian';

/**
 * Rota protegida mínima, só dos e2e: prova o guard global e o
 * `@CurrentGuardian()` antes de existir o `/api/me` (Tarefa 5).
 */
@Controller('e2e-protected')
export class ProtectedProbeController {
  @Get()
  whoAmI(@CurrentGuardian() guardian: AuthenticatedGuardian) {
    return guardian;
  }

  /** Sem `@CurrentGuardian()`: o 401 aqui só pode vir do guard global. */
  @Get('ping')
  ping(): { ok: true } {
    return { ok: true };
  }
}
