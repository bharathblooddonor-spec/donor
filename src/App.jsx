import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Smartphone, Monitor } from 'lucide-react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AuthScreen } from './screens/AuthScreen';
import { SearchScreen } from './screens/SearchScreen';
import { RequestsScreen } from './screens/RequestsScreen';
import { BeADonorScreen } from './screens/BeADonorScreen';
import { AboutAPScreen } from './screens/AboutAPScreen';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('search');
  const [isMobileFrame, setIsMobileFrame] = useState(true);

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
    <View style={styles.appRootContainer}>
      {/* Top Floating Control Bar */}
      <View style={styles.viewModeToggleBar}>
        <Text style={styles.appTitleBadge}>BHARATH BLOOD DONOR (ANDHRA PRADESH)</Text>
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setIsMobileFrame(!isMobileFrame)}
          activeOpacity={0.8}
        >
          {isMobileFrame ? (
            <>
              <Monitor size={14} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.toggleBtnText}>Full Screen View</Text>
            </>
          ) : (
            <>
              <Smartphone size={14} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.toggleBtnText}>Mobile Frame Preview</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Main Container */}
      <View style={[styles.mainWrapper, isMobileFrame ? styles.mobileFrameWrapper : styles.fullFrameWrapper]}>
        <View style={styles.mobileShell}>
          {/* Top App Header */}
          <Header
            onLogout={handleLogout}
            onFocus={handleFocus}
          />

          {/* Screen Content */}
          <View style={styles.screenContent}>
            {renderCurrentScreen()}
          </View>

          {/* Bottom Tab Bar */}
          <BottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            requestsBadgeCount={3}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appRootContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
  },
  viewModeToggleBar: {
    width: '100%',
    height: 40,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  appTitleBadge: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  toggleBtn: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileFrameWrapper: {
    paddingVertical: 12,
  },
  fullFrameWrapper: {
    paddingVertical: 0,
  },
  mobileShell: {
    width: '100%',
    maxWidth: 440,
    height: '100%',
    maxHeight: 900,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    display: 'flex',
    flexDirection: 'column',
  },
  screenContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
    position: 'relative',
    overflow: 'hidden',
  },
});
