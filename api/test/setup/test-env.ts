// Carregado antes de cada arquivo e2e: o ConfigModule não sobrescreve o que já
// está em process.env, então estes valores vencem o .env local.
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'segredo-dos-testes-e2e';
process.env.JWT_EXPIRES_IN = '7d';
process.env.CORS_ORIGINS = '*';
// Os e2e fazem dezenas de logins do mesmo IP. O limite real (5/min) é testado
// em auth-throttle.e2e-spec.ts, que baixa este valor antes de subir o app.
process.env.LOGIN_THROTTLE_LIMIT = '1000';
process.env.LOGIN_THROTTLE_TTL_MS = '60000';
