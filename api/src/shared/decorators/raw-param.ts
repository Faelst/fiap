import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Parâmetro de rota como texto cru (`@RawParam('year', ParseYearPipe)`).
 *
 * Use no lugar de `@Param()` quando o pipe precisa ver o texto original. Com
 * `@Param('year') year: number`, o ValidationPipe global (`transform: true`)
 * faz `Number(valor)` antes do pipe da rota, e `0x7E9`, `2025.0` ou ` 2025`
 * viram 2025. Parâmetro de decorator próprio (`type: 'custom'`) não é
 * convertido, seja qual for o tipo declarado.
 */
export const RawParam = createParamDecorator(
  (name: string, context: ExecutionContext): unknown =>
    context.switchToHttp().getRequest<Request>().params?.[name],
);
