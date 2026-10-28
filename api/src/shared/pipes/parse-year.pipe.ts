import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

export const INVALID_YEAR_MESSAGE = 'Ano inválido: use 4 dígitos, ex.: 2025.';

const YEAR_FORMAT = /^\d{4}$/;

/**
 * Aceita só o texto cru com 4 dígitos ASCII (`2025`); o resto dá 400. Use com
 * `@RawParam()`: com `@Param()` o ValidationPipe global já teria convertido o
 * valor em número, e o pipe recusaria tudo.
 */
@Injectable()
export class ParseYearPipe implements PipeTransform<unknown, number> {
  transform(value: unknown): number {
    if (typeof value !== 'string' || !YEAR_FORMAT.test(value)) {
      throw new BadRequestException(INVALID_YEAR_MESSAGE);
    }
    return Number(value);
  }
}
