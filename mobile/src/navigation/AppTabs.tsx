import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import { HeaderEntranceProvider } from '../components/CompactHeader';
import { FloatingTabBar } from '../components/FloatingTabBar';
import { AgendaIcon } from '../components/icons/AgendaIcon';
import { BoletimIcon } from '../components/icons/BoletimIcon';
import { ProfileIcon } from '../components/icons/ProfileIcon';
import { strings } from '../constants/strings';
import { LessonsScreen } from '../features/lessons/LessonsScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { ReportCardScreen } from '../features/report-card/ReportCardScreen';
import type { AppTabsParamList } from './types';

const Tab = createBottomTabNavigator<AppTabsParamList>();

const renderTabBar = (props: BottomTabBarProps) => (
  <FloatingTabBar {...props} />
);

type TabIconProps = { color: string; size: number };

const agendaIcon = ({ color, size }: TabIconProps) => (
  <AgendaIcon color={color} size={size} />
);
const boletimIcon = ({ color, size }: TabIconProps) => (
  <BoletimIcon color={color} size={size} />
);
const profileIcon = ({ color, size }: TabIconProps) => (
  <ProfileIcon color={color} size={size} />
);

/**
 * Abas Agenda, Boletim e Perfil com a tab bar flutuante (01-design.md da
 * v2, 2.4 e 3.0). O voltar do Android numa aba que não é a Agenda volta para
 * ela (`firstRoute`). A entrada do header roda uma vez por montagem (4.3).
 */
export function AppTabs() {
  return (
    <HeaderEntranceProvider>
      <Tab.Navigator
        tabBar={renderTabBar}
        backBehavior="firstRoute"
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        <Tab.Screen
          name="Agenda"
          component={LessonsScreen}
          options={{
            title: strings.tabs.agenda,
            tabBarAccessibilityLabel: strings.tabs.agendaAccessibilityLabel,
            tabBarButtonTestID: 'tab-agenda',
            tabBarIcon: agendaIcon,
          }}
        />
        <Tab.Screen
          name="Boletim"
          component={ReportCardScreen}
          options={{
            title: strings.tabs.boletim,
            tabBarAccessibilityLabel: strings.tabs.boletimAccessibilityLabel,
            tabBarButtonTestID: 'tab-boletim',
            tabBarIcon: boletimIcon,
          }}
        />
        <Tab.Screen
          name="Perfil"
          component={ProfileScreen}
          options={{
            title: strings.tabs.perfil,
            tabBarAccessibilityLabel: strings.tabs.perfilAccessibilityLabel,
            tabBarButtonTestID: 'tab-perfil',
            tabBarIcon: profileIcon,
          }}
        />
      </Tab.Navigator>
    </HeaderEntranceProvider>
  );
}
