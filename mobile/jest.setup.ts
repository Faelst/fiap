/* eslint-env jest */

jest.mock('react-native-worklets', () =>
  require('react-native-worklets/src/mock'),
);

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn().mockResolvedValue(undefined),
  isVisible: jest.fn().mockReturnValue(false),
  useHideAnimation: jest.fn().mockReturnValue({ container: {}, logo: {} }),
}));

jest.mock('react-native-keychain', () =>
  require('./jest/mocks/react-native-keychain'),
);

// O react-native-mmkv usa um mock em memória quando roda no Jest, mas importa o
// Nitro, que procura o módulo nativo ao carregar.
jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => {
      throw new Error('Nitro não existe no Jest');
    }),
  },
}));

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: { API_URL: 'http://localhost:3333/api' },
  Config: { API_URL: 'http://localhost:3333/api' },
}));

beforeEach(() => {
  require('./jest/mocks/react-native-keychain').__reset();
});

// API falsa (MSW) para services e hooks. Request sem handler falha o teste.
const { server } = require('./src/test/msw/server');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// O app usa um QueryClient único. Com o gcTime padrão (5 min), toda query ou
// mutation que fica sem observador agenda um setTimeout, e o `clear()` do
// MutationCache não cancela esse timer: o worker do Jest não terminava
// ("failed to exit gracefully"). Com gcTime infinito nenhum timer de GC é
// criado (recomendação do TanStack para testes); o cache é limpo por arquivo.
const { queryClient } = require('./src/app/queryClient');
const appDefaults = queryClient.getDefaultOptions();
queryClient.setDefaultOptions({
  ...appDefaults,
  queries: { ...appDefaults.queries, gcTime: Infinity },
  mutations: { ...appDefaults.mutations, gcTime: Infinity },
});
afterAll(() => queryClient.clear());
