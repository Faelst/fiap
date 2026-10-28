import { parseTrustProxy } from './trust-proxy';

describe('parseTrustProxy', () => {
  it.each(['false', 'FALSE', ' false ', ''])(
    'desliga com "%s" (padrão: não confia em proxy)',
    (value) => {
      expect(parseTrustProxy(value)).toBe(false);
    },
  );

  it.each(['true', 'True', ' TRUE '])(
    'recusa "%s": confiar em qualquer X-Forwarded-For anula o rate limit',
    (value) => {
      expect(() => parseTrustProxy(value)).toThrow('TRUST_PROXY');
    },
  );

  it.each([
    ['0', 0],
    ['1', 1],
    ['2', 2],
  ])('número de saltos: "%s" vira %d', (value, hops) => {
    expect(parseTrustProxy(value)).toBe(hops);
  });

  it('aceita lista de IPs, sub-redes e os nomes do express', () => {
    expect(
      parseTrustProxy(
        ' loopback, 10.0.0.0/8 ,172.16.0.1, ::1, fd00::/8, uniquelocal, linklocal,',
      ),
    ).toEqual([
      'loopback',
      '10.0.0.0/8',
      '172.16.0.1',
      '::1',
      'fd00::/8',
      'uniquelocal',
      'linklocal',
    ]);
  });

  it.each([
    '-1',
    '1.5',
    'sim',
    'proxy.example.com',
    '10.0.0.0/33',
    '::1/129',
    '10.0.0.0/',
    '10.0.0.0/8/1',
    '999.0.0.1',
    'loopback, abc',
    ',',
  ])('recusa "%s"', (value) => {
    expect(() => parseTrustProxy(value)).toThrow('TRUST_PROXY');
  });
});
