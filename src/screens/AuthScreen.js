import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { apDistricts, apBloodGroups } from '../data/apData';
import { NativePicker } from '../components/NativePicker';

export const AuthScreen = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('NTR');
  const [bloodGroup, setBloodGroup] = useState('O+');

  const handleSubmit = () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }
    onLoginSuccess({
      email,
      name: name || (email.split('@')[0]),
      district,
      bloodGroup
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.brandingHeader}>
        <View style={styles.logoWrapper}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.brandTitle}>BHARATH BLOOD DONOR</Text>
        <Text style={styles.brandSubtitle}>Donate Blood, Save Lives</Text>
      </View>

      <View style={styles.authCard}>
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

        <View style={styles.formContainer}>
          {activeTab === 'register' && (
            <>
              <Text style={styles.fieldLabel}>Full Name *</Text>
              <View style={styles.inputWrapper}>
                <Feather name="user" size={18} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Srinivasa Rao"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.flex1}>
                  <NativePicker
                    label="AP District *"
                    selectedValue={district}
                    onValueChange={setDistrict}
                    items={apDistricts}
                  />
                </View>

                <View style={styles.flex1}>
                  <NativePicker
                    label="Blood Group *"
                    selectedValue={bloodGroup}
                    onValueChange={setBloodGroup}
                    items={apBloodGroups}
                  />
                </View>
              </View>
            </>
          )}

          <Text style={styles.fieldLabel}>Email Address *</Text>
          <View style={styles.inputWrapper}>
            <Feather name="mail" size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="e.g. name@domain.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.fieldLabel}>Password *</Text>
          <View style={styles.inputWrapper}>
            <Feather name="lock" size={18} color="#94a3b8" style={styles.inputIcon} />
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
              <Feather name="arrow-right" size={18} color="#ffffff" style={{ marginRight: 6 }} />
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

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff5f5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 30,
  },
  brandingHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoWrapper: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#d32f2f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#fee2e2',
  },
  logoImage: {
    width: 72,
    height: 72,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D32F2F',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  authCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  activeTabButton: {},
  tabText: {
    fontSize: 13,
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
    fontSize: 12,
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
    height: 46,
    backgroundColor: '#ffffff',
    marginBottom: 14,
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
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    elevation: 2,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
