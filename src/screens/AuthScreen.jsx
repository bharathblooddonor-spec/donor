import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Mail, Lock, User, MapPin, Droplet, ArrowRight } from 'lucide-react';
import logoImg from '../assets/logo.jpg';
import { apDistricts, apBloodGroups } from '../data/apData';

export const AuthScreen = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('NTR');
  const [bloodGroup, setBloodGroup] = useState('O+');

  const handleSubmit = () => {
    if (!email || !password) {
      alert('Please enter your email and password.');
      return;
    }
    // Authenticate
    onLoginSuccess({
      email,
      name: name || (email.split('@')[0]),
      district,
      bloodGroup
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Header Branding */}
      <View style={styles.brandingHeader}>
        <View style={styles.logoWrapper}>
          <Image source={{ uri: logoImg }} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.brandTitle}>BHARATH BLOOD DONOR</Text>
        <Text style={styles.brandSubtitle}>Donate Blood, Save Lives</Text>
      </View>

      {/* Main Floating Auth Card */}
      <View style={styles.authCard}>
        {/* Tab Selector */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'signin' && styles.activeTabButton]}
            onPress={() => setActiveTab('signin')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'signin' && styles.activeTabText]}>
              Sign In
            </Text>
            {activeTab === 'signin' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'register' && styles.activeTabButton]}
            onPress={() => setActiveTab('register')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
              Create Account
            </Text>
            {activeTab === 'register' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* Form Body */}
        <View style={styles.formContainer}>
          {activeTab === 'register' && (
            <>
              <Text style={styles.fieldLabel}>Full Name *</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Srinivasa Rao"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.flex1}>
                  <Text style={styles.fieldLabel}>AP District *</Text>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    style={selectStyle}
                  >
                    {apDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </View>

                <View style={styles.flex1}>
                  <Text style={styles.fieldLabel}>Blood Group *</Text>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    style={selectStyle}
                  >
                    {apBloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </View>
              </View>
            </>
          )}

          <Text style={styles.fieldLabel}>Email Address *</Text>
          <View style={styles.inputWrapper}>
            <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="e.g. name@domain.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.fieldLabel}>Password *</Text>
          <View style={styles.inputWrapper}>
            <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} activeOpacity={0.85}>
            <View style={styles.btnContent}>
              <ArrowRight size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.primaryButtonText}>
                {activeTab === 'signin' ? 'Sign In' : 'Register Account'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const selectStyle = {
  width: '100%',
  height: 48,
  borderRadius: 8,
  borderColor: '#e2e8f0',
  borderWidth: 1,
  paddingLeft: 12,
  paddingRight: 12,
  fontSize: 14,
  backgroundColor: '#ffffff',
  marginBottom: 16,
  outline: 'none',
  color: '#0f172a'
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff5f5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  brandingHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#d32f2f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#fee2e2',
  },
  logoImage: {
    width: 76,
    height: 76,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#D32F2F',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  authCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  activeTabButton: {},
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#D32F2F',
    fontWeight: '700',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#D32F2F',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  formContainer: {},
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#D32F2F',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
