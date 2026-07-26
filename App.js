import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Text, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Header } from './src/components/Header';
import { BottomNav } from './src/components/BottomNav';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AuthScreen } from './src/screens/AuthScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { RequestsScreen } from './src/screens/RequestsScreen';
import { BeADonorScreen } from './src/screens/BeADonorScreen';
import { AboutAPScreen } from './src/screens/AboutAPScreen';
import { authService } from './src/api/authService';

function SplashGate() {
  return (
    <View style={styles.splash}>
      <Image
        source={require('./assets/logo.png')}
        style={styles.splashLogo}
        resizeMode="contain"
      />
      <Text style={styles.splashTitle}>BHARATH BLOOD DONOR</Text>
      <ActivityIndicator size="large" color="#D32F2F" style={{ marginTop: 20 }} />
    </View>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  // Fires once with the session restored from AsyncStorage, then on every
  // sign-in/sign-out. Until it fires we cannot tell "signed out" from "not
  // checked yet", so we hold the splash rather than flashing the login screen.
  useEffect(() => {
    const unsubscribe = authService.subscribe((user) => {
      setCurrentUser(user);
      setAuthResolved(true);
    });
    return unsubscribe;
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.signOut();
            setActiveTab('search');
          } catch (e) {
            Alert.alert('Could not sign out', e.message);
          }
        },
      },
    ]);
  }, []);

  const handleFocus = useCallback(() => setActiveTab('search'), []);

  const renderCurrentScreen = () => {
    switch (activeTab) {
      case 'search':
        return <SearchScreen />;
      case 'requests':
        return <RequestsScreen />;
      case 'be_a_donor':
        return <BeADonorScreen onRegistered={() => setActiveTab('search')} />;
      case 'about':
        return <AboutAPScreen currentUser={currentUser} />;
      default:
        return <SearchScreen />;
    }
  };

  if (!authResolved) {
    return (
      <SafeAreaProvider>
        <ExpoStatusBar style="dark" />
        <SplashGate />
      </SafeAreaProvider>
    );
  }

  // Donor listings carry personal phone numbers, so the whole directory sits
  // behind a sign-in. This mirrors the read rule in firestore.rules — without
  // an account, Firestore would reject the queries anyway.
  if (!currentUser) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.authSafeArea} edges={['top', 'bottom']}>
          <ExpoStatusBar style="dark" />
          <ErrorBoundary>
            <AuthScreen />
          </ErrorBoundary>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ExpoStatusBar style="light" backgroundColor="#D32F2F" />
        <View style={styles.appContainer}>
          <Header onLogout={handleLogout} onFocus={handleFocus} />

          <View style={styles.screenContent}>
            <ErrorBoundary>{renderCurrentScreen()}</ErrorBoundary>
          </View>

          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#D32F2F',
  },
  authSafeArea: {
    flex: 1,
    backgroundColor: '#fff5f5',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  screenContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f5',
  },
  splashLogo: {
    width: 96,
    height: 96,
  },
  splashTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '800',
    color: '#D32F2F',
    letterSpacing: 0.8,
  },
});
