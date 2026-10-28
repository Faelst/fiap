import { Box, Text, useTheme } from '../theme';
import { initials } from '../utils/names';

type AvatarProps = {
  firstName: string;
  lastName: string;
  size: 's' | 'm' | 'l';
  /** `guardian` ganha o anel rosa do selo (só decoração). */
  tone: 'student' | 'guardian';
  testID?: string;
};

const textVariant = { s: 'overline', m: 'bodyStrong', l: 'title' } as const;

/** Espessura do anel do responsável. */
const GUARDIAN_RING = 1.5;

/**
 * Círculo com as iniciais (01-design.md da v2, 2.2). Decorativo: o rótulo de
 * acessibilidade fica no pai (chip do aluno, linha do perfil).
 */
export function Avatar({
  firstName,
  lastName,
  size,
  tone,
  testID,
}: AvatarProps) {
  const { sizes } = useTheme();
  const side = sizes.avatar[size];
  const guardian = tone === 'guardian';

  return (
    <Box
      testID={testID}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      width={side}
      height={side}
      borderRadius="pill"
      alignItems="center"
      justifyContent="center"
      backgroundColor={guardian ? 'accentMuted' : 'primaryMuted'}
      borderColor={guardian ? 'accent' : 'transparent'}
      style={guardian ? { borderWidth: GUARDIAN_RING } : undefined}
    >
      <Text
        variant={textVariant[size]}
        color={guardian ? 'danger' : 'primary'}
        letterSpacing={size === 's' ? 0 : undefined}
        maxFontSizeMultiplier={sizes.fixedHeightFontScale}
      >
        {initials(firstName, lastName)}
      </Text>
    </Box>
  );
}
