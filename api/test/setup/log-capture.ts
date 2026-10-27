import { Writable } from 'node:stream';

export interface LogCapture {
  /** Cada linha do log já como objeto. */
  lines: Record<string, unknown>[];
  stream: Writable;
  /** Tudo o que foi logado, como texto, para procurar segredos. */
  text(): string;
}

/** Destino do pino nos e2e: guarda o que seria escrito no stdout. */
export function createLogCapture(): LogCapture {
  const lines: Record<string, unknown>[] = [];
  const raw: string[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _encoding, done) {
      for (const line of chunk.toString().split('\n').filter(Boolean)) {
        raw.push(line);
        lines.push(JSON.parse(line) as Record<string, unknown>);
      }
      done();
    },
  });
  return { lines, stream, text: () => raw.join('\n') };
}
