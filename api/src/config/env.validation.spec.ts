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
