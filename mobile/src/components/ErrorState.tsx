import { useEffect, type ComponentType } from 'react';
import { AccessibilityInfo } from 'react-native';
import Animated from 'react-native-reanimated';

import { strings } from '../constants/strings';
import { useShakeStyle } from '../hooks/useShakeStyle';
import { EmptyState } from './EmptyState';
import { AlertIcon } from './icons/AlertIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import type { IconProps } from './icons/StrokeIcon';
import { PillButton } from './PillButton';

/** Ícone do retry, na cor que o `PillButton` passa. */
const retryIcon = (color: string) => <RefreshIcon color={color} />;

type ErrorStateProps = {
  title: string;
  description: string;
  onRetry: () => void;
  retrying: boolean;
  testID: string;
  /** Padrão `AlertIcon`; o BootError usa o `WifiOffIcon`. */
  icon?: ComponentType<IconProps>;
  /** Muda a cada retry que falha: dispara o shake curto. */
  shakeKey?: number;
  /**
   * Se o leitor de tela deve ouvir o erro agora. As abas ficam montadas, então
   * cada tela passa `useIsFocused()`: só a visível anuncia, e a outra anuncia
   * quando o usuário chega nela. Fora de um navigator (BootError), `true`.
   */
  announce: boolean;
};

/**
 * Erro com "Tentar de novo" (01-design.md da v2, 2.16): o `EmptyState` em tom
 * de perigo com a pílula secundária pequena. O leitor de tela ouve o erro
 * quando ele aparece e a cada retry que falha; o spinner do retry não repete
 * o anúncio.
 */
export function ErrorState({
  title,
  description,
  onRetry,
  retrying,
  testID,
  icon = AlertIcon,
  shakeKey = 0,
  announce,
}: ErrorStateProps) {
  const shakeStyle = useShakeStyle(shakeKey, 'short');
  const spoken = `${title} ${description}`;

  // Anúncio explícito nas duas plataformas, sem live region (que no Android
  // só avisa mudança numa view que já existia e leria duas vezes).
  useEffect(() => {
    if (announce) AccessibilityInfo.announceForAccessibility(spoken);
  }, [spoken, shakeKey, announce]);

  return (
    <Animated.View style={shakeStyle}>
      <EmptyState
        testID={testID}
        icon={icon}
        tone="danger"
        title={title}
        description={description}
        action={
          <PillButton
            testID={`${testID}-retry`}
            label={strings.common.retry}
            accessibilityLabel={strings.common.retryAccessibilityLabel}
            variant="secondary"
            size="sm"
            icon={retryIcon}
            loading={retrying}
            onPress={onRetry}
          />
        }
      />
    </Animated.View>
  );
}
