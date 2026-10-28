import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import { AgendaIcon } from '../components/icons/AgendaIcon';
import { BoletimIcon } from '../components/icons/BoletimIcon';
import { TabBar } from '../components/TabBar';
import { strings } from '../constants/strings';
import { LessonsScreen } from '../features/lessons/LessonsScreen';
import { ReportCardScreen } from '../features/report-card/ReportCardScreen';
import type { AppTabsParamList } from './types';

const Tab = createBottomTabNavigator<AppTabsParamList>();

const renderTabBar = (props: BottomTabBarProps) => <TabBar {...props} />;

type TabIconProps = { color: string; size: number };

const agendaIcon = ({ color, size }: TabIconProps) => (
  <AgendaIcon color={color} size={size} />
);
const boletimIcon = ({ color, size }: TabIconProps) => (
  <BoletimIcon color={color} size={size} />
);

/** Abas Agenda e Boletim com a tab bar do Figma (01-design.md, 2.4 e 4.4). */
export function AppTabs() {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
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
    </Tab.Navigator>
  );
}
