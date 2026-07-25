import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, Bell, UserPlus, Info } from 'lucide-react';

export const BottomNav = ({ activeTab, setActiveTab, requestsBadgeCount = 5 }) => {
  const tabs = [
    { id: 'search', label: 'SEARCH', icon: Search },
    { id: 'requests', label: 'REQUESTS', icon: Bell, badge: requestsBadgeCount },
    { id: 'be_a_donor', label: 'BE A DONOR', icon: UserPlus },
    { id: 'about_ap', label: 'ABOUT AP', icon: Info },
  ];

  return (
    <View style={styles.navBar}>
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            {isActive && <View style={styles.topActiveLine} />}

            <View style={styles.iconWrapper}>
              <IconComponent
                size={22}
                color={isActive ? '#D32F2F' : '#64748B'}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              {tab.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              ) : null}
            </View>

            <Text style={[styles.tabLabel, isActive ? styles.activeLabel : styles.inactiveLabel]}>
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
    height: 64,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
    paddingTop: 4,
  },
  topActiveLine: {
    position: 'absolute',
    bottom: 0,
    width: 32,
    height: 3,
    backgroundColor: '#D32F2F',
    borderRadius: 2,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 3,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#D32F2F',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
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
