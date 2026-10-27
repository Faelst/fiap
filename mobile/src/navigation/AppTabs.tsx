import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { LessonsScreen } from '../features/lessons/LessonsScreen';
import { ReportCardScreen } from '../features/report-card/ReportCardScreen';
import { useTheme } from '../theme';
import type { AppTabsParamList } from './types';

const Tab = createBottomTabNavigator<AppTabsParamList>();

/**
 * Abas Agenda e Boletim. A tab bar customizada do Figma entra na Tarefa 10;
 * aqui só as cores do tema na tab bar padrão.
 */
export function AppTabs() {
  const { colors, sizes } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        tabBarIcon: () => null,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          minHeight: sizes.tabBar,
        },
      }}
    >
      <Tab.Screen
        name="Agenda"
        component={LessonsScreen}
        options={{ tabBarButtonTestID: 'tab-agenda', title: 'AGENDA' }}
      />
      <Tab.Screen
        name="Boletim"
        component={ReportCardScreen}
        options={{ tabBarButtonTestID: 'tab-boletim', title: 'BOLETIM' }}
      />
    </Tab.Navigator>
  );
}
