import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export const BottomNav = ({ activeTab, setActiveTab, requestsBadgeCount = 0 }) => {
  // Android 3-button navigation, gesture bars, and iOS home indicators overlay
  // the bottom of the screen. Ensure adequate padding so tab items and labels
  // are never covered on any Android or iOS device.
  const insets = useSafeAreaInsets();
  const safeBottomPadding = insets.bottom > 0 ? insets.bottom + 4 : (Platform.OS === 'android' ? 14 : 8);

  const tabs = [
    { id: 'search', label: 'SEARCH', icon: 'search' },
    { id: 'requests', label: 'REQUESTS', icon: 'bell', badge: requestsBadgeCount },
    { id: 'be_a_donor', label: 'BE A DONOR', icon: 'user-plus' },
    { id: 'about', label: 'ABOUT', icon: 'info' },
  ];

  return (
    <View style={[styles.navBar, { paddingBottom: safeBottomPadding }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
          >
            {isActive && <View style={styles.topActiveLine} />}

            <View style={styles.iconWrapper}>
              <Feather
                name={tab.icon}
                size={20}
                color={isActive ? '#D32F2F' : '#64748B'}
              />
              {tab.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText} maxFontSizeMultiplier={1.1}>
                    {tab.badge}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text
              style={[styles.tabLabel, isActive ? styles.activeLabel : styles.inactiveLabel]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              maxFontSizeMultiplier={1.1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    // minHeight rather than a fixed height: the bar has to grow to fit the
    // safe-area inset and any font scaling, not clip its own labels.
    minHeight: 58,
    paddingTop: 6,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'stretch',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    // minWidth:0 lets a flex child shrink below its content width — without it
    // the longest label forces the row wider than the screen.
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    paddingHorizontal: 2,
  },
  topActiveLine: {
    position: 'absolute',
    top: -6,
    width: 30,
    height: 3,
    backgroundColor: '#D32F2F',
    borderRadius: 2,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#D32F2F',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  activeLabel: {
    color: '#D32F2F',
  },
  inactiveLabel: {
    color: '#64748B',
  },
});
