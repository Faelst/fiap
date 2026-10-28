import { screen } from '@testing-library/react-native';

import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { Avatar } from '../Avatar';

const { colors, sizes } = theme;

// O avatar é escondido do leitor de tela, então as consultas incluem
// elementos ocultos.
const hidden = { includeHiddenElements: true };
const avatar = () => screen.getByTestId('avatar', hidden);
const text = (value: string) => screen.getByText(value, hidden);

describe('Avatar', () => {
  it('aluno: iniciais em primary sobre primaryMuted, círculo do tamanho m', async () => {
    await renderWithTheme(
      <Avatar
        testID="avatar"
        firstName="Rafael"
        lastName="da Silva"
        size="m"
        tone="student"
      />,
    );

    expect(avatar()).toHaveStyle({
      width: sizes.avatar.m,
      height: sizes.avatar.m,
      borderRadius: 999,
      backgroundColor: colors.primaryMuted,
    });
    expect(text('RS')).toHaveStyle({
      color: colors.primary,
      fontFamily: 'Montserrat-SemiBold',
      fontSize: 15,
    });
  });

  it('responsável: rosa claro sobre accentMuted, com o anel accent de 1,5', async () => {
    await renderWithTheme(
      <Avatar
        testID="avatar"
        firstName="Gustavo"
        lastName="da Silva"
        size="l"
        tone="guardian"
      />,
    );

    expect(avatar()).toHaveStyle({
      width: sizes.avatar.l,
      height: sizes.avatar.l,
      backgroundColor: colors.accentMuted,
      borderColor: colors.accent,
      borderWidth: 1.5,
    });
    expect(text('GS')).toHaveStyle({
      color: colors.danger,
      fontSize: 20,
    });
  });

  it('tamanho s: overline sem o espaçamento entre letras', async () => {
    await renderWithTheme(
      <Avatar
        testID="avatar"
        firstName="Bianca"
        lastName="Silveira da Costa"
        size="s"
        tone="student"
      />,
    );

    expect(avatar()).toHaveStyle({
      width: sizes.avatar.s,
      height: sizes.avatar.s,
    });
    expect(text('BC')).toHaveStyle({
      fontSize: 11,
      letterSpacing: 0,
      color: colors.primary,
    });
  });

  it('é decorativo: quem tem rótulo é o pai', async () => {
    await renderWithTheme(
      <Avatar
        testID="avatar"
        firstName="Rafael"
        lastName="da Silva"
        size="m"
        tone="student"
      />,
    );

    expect(avatar()).toHaveProp('accessible', false);
    expect(avatar()).toHaveProp(
      'importantForAccessibility',
      'no-hide-descendants',
    );
    expect(text('RS')).toHaveProp(
      'maxFontSizeMultiplier',
      sizes.fixedHeightFontScale,
    );
  });
});
