import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { useResponsive } from '../../hooks/use-responsive';
import { useLanguage } from '../../context/LanguageContext';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { width, isTablet, isShort, isCompact, contentMaxWidth, fs } = useResponsive();

  // Base bar height (icons + label) plus the real bottom inset reported by the OS.
  // Landscape phones / short windows get a slimmer bar to keep content visible.
  const baseHeight = isShort ? 52 : isTablet ? 68 : 60;
  const bottomInset = Math.max(insets.bottom, 6);
  const sideInset = contentMaxWidth ? Math.max((width - contentMaxWidth) / 2, 0) : 0;
  const iconSize = isTablet ? 24 : isCompact ? 20 : 22;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#8E9EB5',
        tabBarStyle: [
          styles.tabBar,
          {
            height: baseHeight + bottomInset,
            paddingBottom: bottomInset,
            paddingHorizontal: sideInset,
          },
        ],
        tabBarLabelStyle: [styles.tabBarLabel, { fontSize: fs(11) }],
        tabBarAllowFontScaling: false,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab_home', 'Home'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={iconSize}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('tab_history', 'History'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'stats-chart' : 'stats-chart-outline'}
              size={iconSize}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: t('tab_report', 'Report'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'document-text' : 'document-text-outline'}
              size={iconSize}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="medicine"
        options={{
          title: t('tab_medicine', 'Medicine'),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'pill' : 'pill'}
              size={iconSize + 1}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('tab_more', 'More'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={iconSize - 1}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabBarItem: {
    minWidth: 0,
  },
});
