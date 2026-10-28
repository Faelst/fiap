import { parseCorsOrigins, validateEnv } from './env.validation';
import {
  COMPOSE_JWT_SECRET,
  EXAMPLE_JWT_SECRET,
  publicSecretWarning,
} from './public-secrets';

const validEnv = {
  DATABASE_URL: 'file:./dev.db',
  JWT_SECRET: 'um-segredo-de-testes-com-mais-de-32-caracteres',
};

describe('validateEnv', () => {
  it('aplica os padrões de porta, expiração do token e CORS', () => {
    expect(validateEnv(validEnv)).toMatchObject({
      DATABASE_URL: 'file:./dev.db',
      JWT_SECRET: 'um-segredo-de-testes-com-mais-de-32-caracteres',
      PORT: 3333,
      JWT_EXPIRES_IN: '7d',
      CORS_ORIGINS: '*',
      LOGIN_THROTTLE_LIMIT: 5,
      LOGIN_THROTTLE_TTL_MS: 60000,
      LOG_LEVEL: 'info',
      SWAGGER_ENABLED: true,
      TRUST_PROXY: 'false',
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

  it.each([
    '3600',
    '500ms',
    'sete dias',
    '7 dias',
    '-1d',
    '7x',
    '0s',
    '0m',
    '00d',
    '07d',
  ])('recusa JWT_EXPIRES_IN "%s"', (value) => {
    expect(() => validateEnv({ ...validEnv, JWT_EXPIRES_IN: value })).toThrow(
      'JWT_EXPIRES_IN',
    );
  });

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

describe('validateEnv: JWT_SECRET', () => {
  it('recusa segredo com menos de 32 caracteres', () => {
    expect(() =>
      validateEnv({ ...validEnv, JWT_SECRET: 'a'.repeat(31) }),
    ).toThrow('JWT_SECRET');
  });

  it('aceita segredo de 32 caracteres', () => {
    expect(
      validateEnv({ ...validEnv, JWT_SECRET: 'a'.repeat(32) }).JWT_SECRET,
    ).toHaveLength(32);
  });

  it('os segredos públicos do repo têm 32+ caracteres (sobem em dev)', () => {
    for (const secret of [EXAMPLE_JWT_SECRET, COMPOSE_JWT_SECRET]) {
      expect(validateEnv({ ...validEnv, JWT_SECRET: secret }).JWT_SECRET).toBe(
        secret,
      );
    }
  });

  it('em produção recusa o segredo do .env.example', () => {
    expect(() =>
      validateEnv({
        ...validEnv,
        NODE_ENV: 'production',
        CORS_ORIGINS: 'https://app.example.com',
        JWT_SECRET: EXAMPLE_JWT_SECRET,
      }),
    ).toThrow('JWT_SECRET');
  });

  it('em produção aceita um segredo próprio', () => {
    expect(() =>
      validateEnv({
        ...validEnv,
        NODE_ENV: 'production',
        CORS_ORIGINS: 'https://app.example.com',
      }),
    ).not.toThrow();
  });
});

describe('publicSecretWarning', () => {
  it('avisa quando o segredo é o padrão do docker-compose', () => {
    expect(publicSecretWarning(COMPOSE_JWT_SECRET)).toContain('JWT_SECRET');
  });

  it('avisa quando o segredo é o do .env.example', () => {
    expect(publicSecretWarning(EXAMPLE_JWT_SECRET)).toContain('JWT_SECRET');
  });

  it('não avisa para um segredo próprio', () => {
    expect(publicSecretWarning(validEnv.JWT_SECRET)).toBeNull();
  });
});

describe('validateEnv: logs, Swagger e proxy', () => {
  it.each(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])(
    'aceita LOG_LEVEL "%s"',
    (level) => {
      expect(validateEnv({ ...validEnv, LOG_LEVEL: level }).LOG_LEVEL).toBe(
        level,
      );
    },
  );

  it.each(['verbose', 'INFO', ''])('recusa LOG_LEVEL "%s"', (level) => {
    expect(() => validateEnv({ ...validEnv, LOG_LEVEL: level })).toThrow(
      'LOG_LEVEL',
    );
  });

  it.each([
    ['true', true],
    ['false', false],
    ['TRUE', true],
    [' false ', false],
  ])('lê SWAGGER_ENABLED "%s" como %p', (value, expected) => {
    expect(
      validateEnv({ ...validEnv, SWAGGER_ENABLED: value }).SWAGGER_ENABLED,
    ).toBe(expected);
  });

  it.each(['sim', '0', ''])('recusa SWAGGER_ENABLED "%s"', (value) => {
    expect(() => validateEnv({ ...validEnv, SWAGGER_ENABLED: value })).toThrow(
      'SWAGGER_ENABLED',
    );
  });

  it.each(['true', '1', 'loopback, 10.0.0.0/8'])(
    'aceita TRUST_PROXY "%s"',
    (value) => {
      expect(validateEnv({ ...validEnv, TRUST_PROXY: value }).TRUST_PROXY).toBe(
        value,
      );
    },
  );

  it.each(['-1', 'sim', '10.0.0.0/40'])('recusa TRUST_PROXY "%s"', (value) => {
    expect(() => validateEnv({ ...validEnv, TRUST_PROXY: value })).toThrow(
      'TRUST_PROXY',
    );
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
