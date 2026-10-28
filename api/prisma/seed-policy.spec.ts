import { decideSeed } from './seed-policy';

describe('decideSeed', () => {
  it('popula um banco vazio', () => {
    expect(decideSeed({ existingGuardians: 0, seedReset: undefined })).toBe(
      'seed',
    );
  });

  it('banco vazio com SEED_RESET=true também só popula', () => {
    expect(decideSeed({ existingGuardians: 0, seedReset: 'true' })).toBe(
      'seed',
    );
  });

  it.each([undefined, '', 'false', 'sim', '1'])(
    'banco com dados e SEED_RESET=%p: não mexe (mantém ids e tokens)',
    (seedReset) => {
      expect(decideSeed({ existingGuardians: 3, seedReset })).toBe('skip');
    },
  );

  it.each(['true', 'TRUE', ' true '])(
    'banco com dados e SEED_RESET=%p: apaga e recria',
    (seedReset) => {
      expect(decideSeed({ existingGuardians: 3, seedReset })).toBe('reset');
    },
  );
});
