import { useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';
import { EnterDown } from '../../../components/EnterDown';
import { AlertIcon } from '../../../components/icons/AlertIcon';
import { Box, Text, useTheme } from '../../../theme';

type LoginErrorBannerProps = { message: string };

/**
 * Banner de erro do login (01-design.md da v2, 3.2 e 4.2), acima do botão:
 * erros de envio e o aviso de sessão expirada. Rosa escuro com borda
 * `danger`, ícone de alerta e o texto em `text`. Entra com fade de baixo e é
 * anunciado uma vez ao leitor de tela.
 */
export function LoginErrorBanner({ message }: LoginErrorBannerProps) {
  const { colors, sizes } = useTheme();

  // A live region do Android só avisa mudança numa view que já existia, e o
  // banner nasce agora (remonta a cada erro): o anúncio é explícito nas duas
  // plataformas, sem live region para não ler duas vezes.
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(message);
  }, [message]);

  return (
    // Valor animado, não layout animation: o banner nasce depois do envio, e
    // no Android a entrada de layout podia deixá-lo montado e invisível. Sai
    // sem animação (some quando um campo muda).
    <EnterDown testID="login-error-banner">
      <Box
        testID="login-error-box"
        minHeight={sizes.banner}
        borderRadius="m"
        backgroundColor="accentMuted"
        borderColor="danger"
        borderWidth={1}
        paddingHorizontal="sm"
        paddingVertical="s"
        flexDirection="row"
        alignItems="center"
      >
        <AlertIcon color={colors.danger} />
        <Text
          testID="login-error-message"
          variant="error"
          color="text"
          marginLeft="s"
          flexShrink={1}
          accessibilityLabel={message}
        >
          {message}
        </Text>
      </Box>
    </EnterDown>
  );
}
