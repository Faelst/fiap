// Carregado antes de cada arquivo e2e: o ConfigModule não sobrescreve o que já
// está em process.env, então estes valores vencem o .env local.
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'segredo-dos-testes-e2e';
process.env.JWT_EXPIRES_IN = '7d';
process.env.CORS_ORIGINS = '*';
