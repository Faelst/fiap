import { resolveApiUrl } from '../apiUrl';

describe('resolveApiUrl', () => {
  it('usa o API_URL do .env, sem barra no fim', () => {
    expect(resolveApiUrl('http://192.168.0.10:3333/api/', 'ios')).toBe(
      'http://192.168.0.10:3333/api',
    );
    expect(resolveApiUrl(' http://x/api ', 'android')).toBe('http://x/api');
  });

  it('sem .env usa localhost no iOS e 10.0.2.2 no emulador Android', () => {
    expect(resolveApiUrl(undefined, 'ios')).toBe('http://localhost:3333/api');
    expect(resolveApiUrl('', 'android')).toBe('http://10.0.2.2:3333/api');
  });

  it('no Android troca localhost por 10.0.2.2 (o emulador não enxerga o host por localhost)', () => {
    expect(resolveApiUrl('http://localhost:3333/api', 'android')).toBe(
      'http://10.0.2.2:3333/api',
    );
    expect(resolveApiUrl('http://localhost:3333/api', 'ios')).toBe(
      'http://localhost:3333/api',
    );
  });
});
