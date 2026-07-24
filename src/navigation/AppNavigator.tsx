import React from 'react';
import { View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../types/navigation';
import { NotesScreen } from '../screens/notes/NotesScreen';
import { RemindersScreen } from '../screens/reminders/RemindersScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { TodayScreen } from '../screens/today/TodayScreen';
import { useThemeColors } from '../hooks/useThemeColors';
import { theme as appTheme } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';
import { styles } from './AppNavigator.styles';

const Tab = createBottomTabNavigator<RootTabParamList>();

export function AppNavigator() {
  const theme = useThemeColors();
  const { resolvedTheme } = useSettingsStore();
  const isDark = resolvedTheme === 'dark';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.secondaryText,
        tabBarLabelStyle: styles.label,
        tabBarStyle: {
          ...styles.tabBar,
          backgroundColor: 'transparent',
          borderTopColor: 'transparent',
        },
        tabBarBackground: () => (
          <View style={[
            styles.tabBarBackground, 
            { backgroundColor: theme.surface + 'DD' },
            isDark ? { ...appTheme.shadows.dark, shadowOpacity: 0.4, shadowRadius: 20 } : { ...appTheme.shadows.light, shadowOpacity: 0.15, shadowRadius: 20 }
          ]} />
        ),
        tabBarIcon: ({ color, focused }) => {
          const icon = route.name === 'Tasks'
            ? (focused ? 'checkmark-circle' : 'checkmark-circle-outline')
            : route.name === 'Today'
            ? (focused ? 'calendar' : 'calendar-outline')
            : route.name === 'Reminders'
            ? (focused ? 'time' : 'time-outline')
            : route.name === 'Notes'
            ? (focused ? 'document-text' : 'document-text-outline')
            : (focused ? 'settings' : 'settings-outline');

          return <AppIcon name={icon} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Reminders" component={RemindersScreen} />
      <Tab.Screen name="Notes" component={NotesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
