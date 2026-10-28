import { ValidationPipe } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { RawParam } from './raw-param';

type ArgsMetadata = Record<
  string,
  { factory: (data: unknown, context: ExecutionContextHost) => unknown }
>;

class Probe {
  handler(@RawParam('year') year: number): number {
    return year;
  }
}

function resolveRawParam(params: Record<string, string>): unknown {
  const metadata = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    Probe,
    'handler',
  ) as ArgsMetadata;
  const [{ factory }] = Object.values(metadata);
  const context = new ExecutionContextHost([{ params }, {}, () => undefined]);
  context.setType('http');
  return factory('year', context);
}

describe('RawParam', () => {
  it('devolve o parâmetro de rota como texto cru, sem conversão', () => {
    expect(resolveRawParam({ year: '0x7E9' })).toBe('0x7E9');
  });

  it('devolve undefined quando o parâmetro não existe', () => {
    expect(resolveRawParam({})).toBeUndefined();
  });

  it('o ValidationPipe global (transform) não converte um parâmetro custom, mesmo com metatipo Number', async () => {
    const pipe = new ValidationPipe({ transform: true });

    // Com type 'param' o pipe faria Number('0x7E9') = 2025.
    await expect(
      pipe.transform('0x7E9', {
        type: 'param',
        metatype: Number,
        data: 'year',
      }),
    ).resolves.toBe(2025);
    await expect(
      pipe.transform('0x7E9', {
        type: 'custom',
        metatype: Number,
        data: 'year',
      }),
    ).resolves.toBe('0x7E9');
  });
});
