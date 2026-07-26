import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

export const Header = ({ onLogout, onFocus, onOpenProfile, currentUser }) => {
  return (
    <View style={styles.headerContainer}>
      {/* The left block shrinks; the action buttons never do. */}
      <View style={styles.leftSection}>
        <View style={styles.logoCircle}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
        <View style={styles.titleColumn}>
          <Text
            style={styles.headerTitle}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            maxFontSizeMultiplier={1.2}
          >
            BHARATH BLOOD DONOR
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1} maxFontSizeMultiplier={1.2}>
            Donate Blood, Save Lives
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.focusPill}
          onPress={onFocus}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Jump to donor search"
        >
          <Feather name="target" size={13} color="#ffffff" />
          <Text style={styles.focusText} numberOfLines={1} maxFontSizeMultiplier={1.1}>
            FOCUS
          </Text>
        </TouchableOpacity>

        {/* User Profile DP Icon Button right beside focus pill */}
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={onOpenProfile}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open user profile"
        >
          {currentUser?.photoURL ? (
            <Image source={{ uri: currentUser.photoURL }} style={styles.profileDpImg} />
          ) : (
            <Ionicons name="person-circle" size={26} color="#ffffff" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={onLogout}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Feather name="log-out" size={15} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#D32F2F',
    minHeight: 62,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  leftSection: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  logoImage: {
    width: 36,
    height: 36,
  },
  titleColumn: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 6,
  },
  focusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    gap: 4,
  },
  focusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  profileBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  profileDpImg: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  logoutBtn: {
    width: 34,
    height: 34,
    flexShrink: 0,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
