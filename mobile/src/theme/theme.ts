import { createTheme } from '@shopify/restyle';

import { fonts } from './fonts';
import { motion } from './motion';
import { opacities } from './opacities';
import { palette } from './palette';
import { gradients, shadows } from './shadows';
import { sizes } from './sizes';

/** Dígitos de largura fixa: horários e notas não "dançam" (1.8). */
const tabular = ['tabular-nums'] as const;

/**
 * Base das pílulas: a borda de 1 existe sempre (transparente quando não
 * aparece), para as variantes não mudarem de tamanho entre si.
 */
const pill = {
  borderRadius: 'pill',
  borderWidth: 1,
  borderColor: 'transparent',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
} as const;

/**
 * Tema único do app (escuro, sem modo claro). Fonte: 01-design.md da v2,
 * seção 1. Os nomes da v1 que a v2 não tem ficam nos blocos "legado v1", que
 * saem na fatia 9 junto com as telas antigas.
 */
export const theme = createTheme({
  colors: {
    background: palette.black,
    /** Campos de texto, calha de horas do timetable. */
    surfaceSunken: palette.gray1000,
    /** Cards e o trilho do segmento. */
    surface: palette.gray950,
    /** Tab bar, blocos de aula, chips, linhas de aluno. */
    surfaceRaised: palette.gray900,
    /** Indicador do segmento, trilho da barra, skeleton, botão desabilitado. */
    surfaceHigh: palette.gray850,
    borderSubtle: palette.gray750,
    borderStrong: palette.gray800,
    /** Contorno do campo de texto em repouso (≥ 3 : 1). */
    borderInput: palette.gray600,
    primary: palette.teal,
    primaryMuted: palette.tealMuted,
    /** Rosa do selo: só decoração (anel do avatar do responsável). */
    accent: palette.pink,
    accentMuted: palette.pinkMuted,
    /** Texto e borda de erro, "Sair", faixa "Baixo". */
    danger: palette.pinkLight,
    warning: palette.amber,
    warningMuted: palette.amberMuted,
    text: palette.white,
    textSecondary: palette.gray300,
    textTertiary: palette.gray400,
    textDisabled: palette.gray500,
    /** Texto sobre teal, âmbar ou rosa claro. */
    textOnPrimary: palette.black,
    transparent: 'transparent',

    // Legado v1: sai na fatia 9.
    inputLine: palette.gray600,
    bulletBorder: palette.gray300,
  },
  spacing: {
    none: 0,
    xxs: 2,
    xs: 4,
    s: 8,
    sm: 12,
    m: 16,
    l: 24,
    xl: 28,
    xxl: 32,
    xxxl: 40,
    huge: 48,
    section: 64,
    hero: 80,
  },
  borderRadii: {
    none: 0,
    xs: 6,
    s: 10,
    m: 14,
    l: 20,
    xl: 28,
    pill: 999,
    /** Alias de `pill` para os componentes da v1 (sai na fatia 9). */
    round: 999,
  },
  breakpoints: {
    compact: 0,
    phone: 375,
    tablet: 768,
  },
  textVariants: {
    defaults: {
      fontFamily: fonts.regular,
      fontSize: 15,
      lineHeight: 22,
      color: 'text',
    },
    display: {
      fontFamily: fonts.bold,
      fontSize: 40,
      lineHeight: 44,
      color: 'text',
      fontVariant: tabular,
    },
    /** Título da aba. */
    headline: {
      fontFamily: fonts.bold,
      fontSize: { compact: 24, phone: 28 },
      lineHeight: { compact: 30, phone: 34 },
      color: 'text',
    },
    title: {
      fontFamily: fonts.semiBold,
      fontSize: 20,
      lineHeight: 26,
      color: 'text',
    },
    subtitle: {
      fontFamily: fonts.semiBold,
      fontSize: 17,
      lineHeight: 22,
      color: 'text',
    },
    body: {
      fontFamily: fonts.regular,
      fontSize: 15,
      lineHeight: 22,
      color: 'text',
    },
    bodyStrong: {
      fontFamily: fonts.semiBold,
      fontSize: 15,
      lineHeight: 22,
      color: 'text',
    },
    label: {
      fontFamily: fonts.medium,
      fontSize: 13,
      lineHeight: 18,
      color: 'textSecondary',
    },
    caption: {
      fontFamily: fonts.medium,
      fontSize: 12,
      lineHeight: 16,
      color: 'textSecondary',
    },
    /** Rótulos pequenos: a única variante em caixa alta (DV2). */
    overline: {
      fontFamily: fonts.semiBold,
      fontSize: 11,
      lineHeight: 14,
      color: 'textTertiary',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    tabLabel: {
      fontFamily: fonts.semiBold,
      fontSize: 11,
      lineHeight: 14,
      color: 'textSecondary',
      textAlign: 'center',
    },
    button: {
      fontFamily: fonts.semiBold,
      fontSize: 16,
      lineHeight: 20,
      color: 'textOnPrimary',
      textAlign: 'center',
    },
    buttonSmall: {
      fontFamily: fonts.semiBold,
      fontSize: 14,
      lineHeight: 18,
      color: 'textOnPrimary',
      textAlign: 'center',
    },
    input: {
      fontFamily: fonts.medium,
      fontSize: 17,
      lineHeight: 22,
      color: 'text',
    },
    /** Rótulo do campo em repouso; flutuando, `scale 0.8` (2.5). */
    inputLabel: {
      fontFamily: fonts.medium,
      fontSize: 15,
      lineHeight: 20,
      color: 'textSecondary',
    },
    /** Nota do card de disciplina. */
    grade: {
      fontFamily: fonts.bold,
      fontSize: 24,
      lineHeight: 28,
      color: 'text',
      fontVariant: tabular,
    },
    /** Números do resumo do trimestre. */
    stat: {
      fontFamily: fonts.bold,
      fontSize: 20,
      lineHeight: 26,
      color: 'text',
      fontVariant: tabular,
    },
    /** Horas da grade e marca de agora. */
    time: {
      fontFamily: fonts.semiBold,
      fontSize: 11,
      lineHeight: 14,
      color: 'textTertiary',
      fontVariant: tabular,
    },
    /** Número do chip de dia. */
    dayNumber: {
      fontFamily: fonts.bold,
      fontSize: 18,
      lineHeight: 22,
      color: 'text',
      fontVariant: tabular,
    },
    /** Erro inline de campo e banner. */
    error: {
      fontFamily: fonts.medium,
      fontSize: 13,
      lineHeight: 18,
      color: 'danger',
    },

    // Legado v1: sai na fatia 9. Os nomes que a v2 reaproveita com outro
    // sentido (`title`, `label`, `error`) ficaram com o sufixo V1.
    bodyMedium: {
      fontFamily: fonts.medium,
      fontSize: 16,
      lineHeight: 20,
      color: 'text',
    },
    bodyBold: {
      fontFamily: fonts.bold,
      fontSize: 16,
      lineHeight: 20,
      color: 'text',
    },
    greeting: {
      fontFamily: fonts.regular,
      fontSize: 24,
      lineHeight: 29,
      color: 'text',
      textAlign: 'center',
    },
    greetingName: {
      fontFamily: fonts.bold,
      fontSize: 24,
      lineHeight: 29,
      color: 'text',
      textTransform: 'uppercase',
    },
    titleV1: {
      fontFamily: fonts.regular,
      fontSize: 24,
      lineHeight: 29,
      color: 'text',
      textAlign: 'center',
    },
    inputValue: {
      fontFamily: fonts.regular,
      fontSize: { compact: 28, phone: 32 },
      lineHeight: { compact: 34, phone: 39 },
      color: 'text',
      textAlign: 'center',
    },
    labelV1: {
      fontFamily: fonts.regular,
      fontSize: 20,
      lineHeight: 24,
      color: 'text',
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    labelFocused: {
      fontFamily: fonts.semiBold,
      fontSize: 20,
      lineHeight: 24,
      color: 'text',
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    sectionTitle: {
      fontFamily: fonts.bold,
      fontSize: 20,
      lineHeight: 24,
      color: 'primary',
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    emptyState: {
      fontFamily: fonts.regular,
      fontSize: 20,
      lineHeight: 24,
      color: 'text',
      textAlign: 'center',
    },
    lessonSubject: {
      fontFamily: fonts.semiBold,
      fontSize: 16,
      lineHeight: 20,
      color: 'text',
    },
    termTitle: {
      fontFamily: fonts.bold,
      fontSize: 16,
      lineHeight: 20,
      color: 'primary',
      textTransform: 'uppercase',
    },
    errorV1: {
      fontFamily: fonts.medium,
      fontSize: 16,
      lineHeight: 20,
      color: 'primary',
      textAlign: 'center',
    },
    captionPlain: {
      fontFamily: fonts.regular,
      fontSize: 12,
      lineHeight: 15,
      color: 'text',
    },
    subject: {
      fontFamily: fonts.medium,
      fontSize: 12,
      lineHeight: 15,
      color: 'text',
      textTransform: 'uppercase',
    },
    detail: {
      fontFamily: fonts.medium,
      fontSize: 12,
      lineHeight: 15,
      color: 'text',
    },
  },
  /** Fundo e borda do `PillButton` (2.3); a altura vem do `size`. */
  buttonVariants: {
    defaults: {},
    primary: { ...pill, backgroundColor: 'primary' },
    secondary: {
      ...pill,
      backgroundColor: 'surfaceRaised',
      borderColor: 'borderStrong',
    },
    ghost: { ...pill, backgroundColor: 'transparent' },
    danger: { ...pill, backgroundColor: 'danger' },
    disabled: { ...pill, backgroundColor: 'surfaceHigh' },

    // Legado v1: sai na fatia 9 (`PrimaryButton` e `SecondaryButton`).
    primaryV1: {
      backgroundColor: 'primary',
      height: sizes.primaryButton,
      borderRadius: 'none',
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryV1: {
      borderWidth: 1,
      borderColor: 'primary',
      borderRadius: 'm',
      height: sizes.secondaryButton,
      paddingHorizontal: 'l',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  /**
   * Todas as variantes da v2 têm `borderWidth: 1`: os estados trocam só a cor
   * de uma camada sobreposta, sem pulo de layout (1.11).
   */
  cardVariants: {
    defaults: {},
    surface: {
      backgroundColor: 'surface',
      borderColor: 'borderSubtle',
      borderWidth: 1,
      borderRadius: 'l',
      padding: 'l',
    },
    surfaceCompact: {
      backgroundColor: 'surface',
      borderColor: 'borderSubtle',
      borderWidth: 1,
      borderRadius: 'm',
      padding: 'm',
    },
    raised: {
      backgroundColor: 'surfaceRaised',
      borderColor: 'borderSubtle',
      borderWidth: 1,
      borderRadius: 'm',
      padding: 'sm',
    },
    lesson: {
      backgroundColor: 'surfaceRaised',
      borderColor: 'borderSubtle',
      borderWidth: 1,
      borderRadius: 's',
      paddingHorizontal: 'sm',
      paddingVertical: 's',
    },
    banner: {
      backgroundColor: 'surface',
      borderColor: 'borderSubtle',
      borderWidth: 1,
      borderRadius: 'm',
      paddingHorizontal: 'm',
    },
    floating: {
      backgroundColor: 'surfaceRaised',
      borderColor: 'borderStrong',
      borderWidth: 1,
      borderRadius: 'pill',
    },

    // Legado v1: sai na fatia 9.
    dropdown: {
      backgroundColor: 'surface',
      borderRadius: 'm',
      height: sizes.dropdown,
      paddingHorizontal: 'm',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    options: {
      backgroundColor: 'surface',
      borderRadius: 'm',
      paddingVertical: 'xs',
    },
    term: {
      backgroundColor: 'surfaceRaised',
      borderRadius: 'm',
      height: sizes.termCard,
      paddingHorizontal: 'sm',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    student: {
      backgroundColor: 'surfaceRaised',
      borderRadius: 'm',
      height: sizes.studentCard,
      padding: 'm',
      borderWidth: 1,
      borderColor: 'transparent',
      justifyContent: 'space-between',
    },
  },
  sizes,
  motion,
  shadows,
  gradients,
  opacities,
});

export type Theme = typeof theme;
