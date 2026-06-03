import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppIcon } from '../components/AppIcon';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../types/navigation';
import { NotesScreen } from '../screens/notes/NotesScreen';
import { RemindersScreen } from '../screens/reminders/RemindersScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { useThemeColors } from '../hooks/useThemeColors';
import { theme as appTheme } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';

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
          backgroundColor: theme.surface,
          borderTopColor: 'transparent',
          ...(isDark ? appTheme.shadows.dark : appTheme.shadows.light),
        },
        tabBarBackground: () => (
          <View style={[styles.tabBarBackground, { backgroundColor: theme.surface }]} />
        ),
        tabBarIcon: ({ color, focused }) => {
          const icon = route.name === 'Tasks'
            ? (focused ? 'checkmark-circle' : 'checkmark-circle-outline')
            : route.name === 'Reminders'
            ? (focused ? 'calendar' : 'calendar-outline')
            : route.name === 'Notes'
            ? (focused ? 'document-text' : 'document-text-outline')
            : (focused ? 'settings' : 'settings-outline');

          return <AppIcon name={icon} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Reminders" component={RemindersScreen} />
      <Tab.Screen name="Notes" component={NotesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: appTheme.typography.caption.fontFamily,
    fontSize: 10,
    marginTop: -4,
    marginBottom: 8,
  },
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    elevation: 8,
    height: 72,
    borderRadius: appTheme.radius.pill,
    paddingTop: 12,
    paddingBottom: 0,
    borderTopWidth: 0,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: appTheme.radius.pill,
  },
});
