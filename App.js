import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Header } from './src/components/Header';
import { BottomNav } from './src/components/BottomNav';
import { AuthScreen } from './src/screens/AuthScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { RequestsScreen } from './src/screens/RequestsScreen';
import { BeADonorScreen } from './src/screens/BeADonorScreen';
import { AboutAPScreen } from './src/screens/AboutAPScreen';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('search');

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setActiveTab('search');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleFocus = () => {
    setActiveTab('search');
  };

  const renderCurrentScreen = () => {
    switch (activeTab) {
      case 'auth':
        return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
      case 'search':
        return <SearchScreen />;
      case 'requests':
        return <RequestsScreen />;
      case 'be_a_donor':
        return <BeADonorScreen onRegistered={() => setActiveTab('search')} />;
      case 'about_ap':
        return <AboutAPScreen />;
      default:
        return <SearchScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" backgroundColor="#D32F2F" />
      <View style={styles.appContainer}>
        {/* Native Crimson Top Header */}
        <Header onLogout={handleLogout} onFocus={handleFocus} />

        {/* Native Active Screen View */}
        <View style={styles.screenContent}>
          {renderCurrentScreen()}
        </View>

        {/* Native Bottom Tab Bar */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          requestsBadgeCount={3}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#D32F2F',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  screenContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});
