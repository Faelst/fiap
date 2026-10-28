import { useNavigation } from '@react-navigation/native';
import type { ReactElement, ReactNode } from 'react';
import { StyleSheet, type RefreshControlProps } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import { CompactHeader } from '../../components/CompactHeader';
import { useFloatingTabBarInset } from '../../hooks/useFloatingTabBarInset';
import { useHeaderViewModel } from './useHeaderViewModel';

type TabScreenLayoutProps = {
  title: string;
  titleTestID: string;
  scrollTestID: string;
  /** No Perfil o chip não aparece (a lista de alunos já está embaixo). */
  showChip?: boolean;
  refreshControl?: ReactElement<RefreshControlProps>;
  children: ReactNode;
};

/** Um evento de rolagem por quadro: a divisória do header acompanha o dedo. */
const SCROLL_THROTTLE = 16;

/**
 * Estrutura das abas (01-design.md da v2, 2.6 e 3.3–3.5): o header
 * compacto fixo, ligado à sessão, e o conteúdo rolando embaixo dele até
 * acima da tab bar flutuante (V6/N1). A rolagem acende a divisória do
 * header na UI thread.
 */
export function TabScreenLayout({
  title,
  titleTestID,
  scrollTestID,
  showChip = true,
  refreshControl,
  children,
}: TabScreenLayoutProps) {
  const vm = useHeaderViewModel(useNavigation());
  const insetBottom = useFloatingTabBarInset();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.set(event.contentOffset.y);
    },
  });

  return (
    <>
      <CompactHeader
        title={title}
        titleTestID={titleTestID}
        guardianFirstName={vm.guardianFirstName}
        student={vm.student}
        onPressStudent={vm.onPressStudent}
        scrollY={scrollY}
        showChip={showChip}
      />
      <Animated.ScrollView
        testID={scrollTestID}
        style={styles.fill}
        contentContainerStyle={[styles.grow, { paddingBottom: insetBottom }]}
        scrollIndicatorInsets={{ bottom: insetBottom }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={SCROLL_THROTTLE}
        refreshControl={refreshControl}
      >
        {children}
      </Animated.ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  grow: { flexGrow: 1 },
});
