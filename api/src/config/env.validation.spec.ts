import { parseCorsOrigins, validateEnv } from './env.validation';

const validEnv = {
  DATABASE_URL: 'file:./dev.db',
  JWT_SECRET: 'segredo',
};

describe('validateEnv', () => {
  it('aplica os padrões de porta, expiração do token e CORS', () => {
    expect(validateEnv(validEnv)).toMatchObject({
      DATABASE_URL: 'file:./dev.db',
      JWT_SECRET: 'segredo',
      PORT: 3333,
      JWT_EXPIRES_IN: '7d',
      CORS_ORIGINS: '*',
      LOGIN_THROTTLE_LIMIT: 5,
      LOGIN_THROTTLE_TTL_MS: 60000,
    });
  });

  it('converte a porta de texto para número', () => {
    expect(validateEnv({ ...validEnv, PORT: '4000' }).PORT).toBe(4000);
  });

  it.each(['DATABASE_URL', 'JWT_SECRET'])(
    'recusa a configuração sem %s',
    (key) => {
      const env: Record<string, unknown> = { ...validEnv };
      delete env[key];

      expect(() => validateEnv(env)).toThrow(key);
    },
  );

  it('recusa JWT_SECRET vazio', () => {
    expect(() => validateEnv({ ...validEnv, JWT_SECRET: '' })).toThrow(
      'JWT_SECRET',
    );
  });

  it.each(['0', '70000', 'abc'])('recusa a porta "%s"', (port) => {
    expect(() => validateEnv({ ...validEnv, PORT: port })).toThrow('PORT');
  });

  it.each(['7d', '12h', '30m', '900s', '1w'])(
    'aceita JWT_EXPIRES_IN "%s"',
    (value) => {
      expect(
        validateEnv({ ...validEnv, JWT_EXPIRES_IN: value }).JWT_EXPIRES_IN,
      ).toBe(value);
    },
  );

  it.each(['3600', '500ms', 'sete dias', '7 dias', '-1d', '7x'])(
    'recusa JWT_EXPIRES_IN "%s"',
    (value) => {
      expect(() => validateEnv({ ...validEnv, JWT_EXPIRES_IN: value })).toThrow(
        'JWT_EXPIRES_IN',
      );
    },
  );

  it('converte o limite e a janela do rate limit do login para número', () => {
    expect(
      validateEnv({
        ...validEnv,
        LOGIN_THROTTLE_LIMIT: '1000',
        LOGIN_THROTTLE_TTL_MS: '1000',
      }),
    ).toMatchObject({
      LOGIN_THROTTLE_LIMIT: 1000,
      LOGIN_THROTTLE_TTL_MS: 1000,
    });
  });

  it.each([
    ['LOGIN_THROTTLE_LIMIT', '0'],
    ['LOGIN_THROTTLE_LIMIT', 'abc'],
    ['LOGIN_THROTTLE_TTL_MS', '0'],
  ])('recusa %s = "%s"', (key, value) => {
    expect(() => validateEnv({ ...validEnv, [key]: value })).toThrow(key);
  });
});

describe('parseCorsOrigins', () => {
  it('libera todas as origens com *', () => {
    expect(parseCorsOrigins('*')).toBe('*');
  });

  it('separa a lista por vírgula e ignora espaços e itens vazios', () => {
    expect(
      parseCorsOrigins(' http://localhost:8081, https://app.example.com ,'),
    ).toEqual(['http://localhost:8081', 'https://app.example.com']);
  });
});
