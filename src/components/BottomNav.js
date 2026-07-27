import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export const BottomNav = ({ activeTab, setActiveTab, requestsBadgeCount = 0 }) => {
  // Android gesture/3-button navigation and the iPhone home indicator both sit
  // over the bottom of the window. Without this padding the tab labels are
  // physically covered by the system bar on most real devices.
  const insets = useSafeAreaInsets();

  const tabs = [
    { id: 'search', label: 'SEARCH', icon: 'search' },
    { id: 'requests', label: 'REQUESTS', icon: 'bell', badge: requestsBadgeCount },
    { id: 'be_a_donor', label: 'BE A DONOR', icon: 'user-plus' },
    { id: 'about', label: 'ABOUT', icon: 'info' },
  ];

  return (
    <View style={[styles.navBar, { paddingBottom: Math.max(insets.bottom, 6) }]}>
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
                  <Text style={styles.badgeText} maxFontSizeMultiplier={1.2}>
                    {tab.badge}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* "BE A DONOR" is the longest label and overflows on narrow screens
                at large system font sizes, so cap the scale and allow shrink. */}
            <Text
              style={[styles.tabLabel, isActive ? styles.activeLabel : styles.inactiveLabel]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              maxFontSizeMultiplier={1.2}
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
