import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Feather, Ionicons } from '@expo/vector-icons';

export const Header = ({ onLogout, onFocus, onOpenProfile, currentUser }) => {
  return (
    <View style={styles.headerContainer}>
      {/* Left section: Logo + Title + Subtitle */}
      <View style={styles.leftSection}>
        <View style={styles.logoCircle}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
        <View style={styles.titleColumn}>
          <Text
            style={styles.headerTitle}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            maxFontSizeMultiplier={1.0}
          >
            BHARATH BLOOD DONOR
          </Text>
          <Text
            style={styles.headerSubtitle}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            maxFontSizeMultiplier={1.0}
          >
            Donate Blood, Save Lives
          </Text>
        </View>
      </View>

      {/* Right section: Focus pill + Profile DP + Sign Out */}
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.focusPill}
          onPress={onFocus}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Jump to donor search"
        >
          <Feather name="target" size={12} color="#ffffff" />
          <Text style={styles.focusText} numberOfLines={1} maxFontSizeMultiplier={1.0}>
            FOCUS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileBtn}
          onPress={onOpenProfile}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open user profile"
        >
          {currentUser?.photoURL ? (
            <ExpoImage source={{ uri: currentUser.photoURL }} style={styles.profileDpImg} contentFit="cover" transition={200} />
          ) : (
            <Ionicons name="person-circle" size={24} color="#ffffff" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={onLogout}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Feather name="log-out" size={13} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#D32F2F',
    minHeight: 54,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    gap: 6,
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
    gap: 6,
  },
  logoCircle: {
    width: 34,
    height: 34,
    flexShrink: 0,
    borderRadius: 17,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  logoImage: {
    width: 30,
    height: 30,
  },
  titleColumn: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 9.5,
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 4,
  },
  focusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    gap: 3,
  },
  focusText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  profileBtn: {
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: 14,
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
    borderRadius: 14,
  },
  logoutBtn: {
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
