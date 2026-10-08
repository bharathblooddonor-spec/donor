import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { apDistricts, apBloodGroups } from '../data/apData';
import { NativePicker } from '../components/NativePicker';
import { authService } from '../api/authService';
import { PRIVACY_POLICY_URL, TERMS_URL } from '../constants/legal';

function isValidEmail(value) {
  if (!/^[^\s@]+@[^\s@]+$/.test(value)) return false;
  const domain = value.slice(value.indexOf('@') + 1);
  return domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.');
}

export const AuthScreen = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('NTR');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [submitting, setSubmitting] = useState(false);

  const isRegister = activeTab === 'register';

  let submitLabel;
  if (submitting) {
    submitLabel = isRegister ? 'Creating account…' : 'Signing in…';
  } else {
    submitLabel = isRegister ? 'Register Account' : 'Sign In';
  }

  const switchTab = (tab) => {
    if (submitting) return;
    setActiveTab(tab);
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (!password) {
      Alert.alert('Required Fields', 'Please enter your password.');
      return;
    }
    if (isRegister && password.length < 8) {
      Alert.alert('Weak Password', 'Please choose a password of at least 8 characters.');
      return;
    }
    if (isRegister && !name.trim()) {
      Alert.alert('Required Fields', 'Please enter your full name.');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await authService.register({
          email: trimmedEmail,
          password,
          name,
          district,
          bloodGroup,
        });
      } else {
        await authService.signIn({ email: trimmedEmail, password });
      }
    } catch (e) {
      Alert.alert(isRegister ? 'Could not create account' : 'Could not sign in', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      Alert.alert('Enter your email', 'Type your email address above, then tap "Forgot password" again.');
      return;
    }

    Alert.alert(
      'Reset password',
      `Send a password reset link to ${trimmedEmail}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              await authService.sendPasswordReset(trimmedEmail);
              Alert.alert('Check your email', 'If an account exists for that address, a reset link is on its way.');
            } catch (e) {
              Alert.alert('Could not send reset email', e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex1}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
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
              onPress={() => switchTab('signin')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'signin' && styles.activeTabText]}>
                Sign In
              </Text>
              {activeTab === 'signin' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'register' && styles.activeTabButton]}
              onPress={() => switchTab('register')}
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
                placeholder={isRegister ? 'At least 8 characters' : '••••••••'}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                textContentType={isRegister ? 'newPassword' : 'password'}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={handleSubmit}
                returnKeyType="go"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((prev) => !prev)}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {!isRegister && (
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              <View style={styles.btnContent}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 6 }} />
                ) : (
                  <Feather name="arrow-right" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                )}
                <Text style={styles.primaryButtonText}>{submitLabel}</Text>
              </View>
            </TouchableOpacity>

            {isRegister && (
              <Text style={styles.legalText}>
                By creating an account you agree to our{' '}
                <Text style={styles.legalLink} onPress={() => Linking.openURL(TERMS_URL)}>
                  Terms of Use
                </Text>{' '}
                and{' '}
                <Text style={styles.legalLink} onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
                  Privacy Policy
                </Text>
                . Creating an account does not publish your details — you choose separately
                whether to list yourself as a donor.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.emergencyNotice}>
          <Feather name="alert-circle" size={14} color="#991b1b" style={{ marginRight: 6 }} />
          <Text style={styles.emergencyNoticeText}>
            This app is not a substitute for emergency medical care. In an emergency, call 108.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    backgroundColor: '#fff5f5',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#fff5f5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  brandingHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#d32f2f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#fee2e2',
  },
  logoImage: {
    width: 66,
    height: 66,
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
  eyeBtn: {
    padding: 4,
    marginLeft: 6,
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
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    marginBottom: 6,
  },
  forgotText: {
    fontSize: 12,
    color: '#D32F2F',
    fontWeight: '600',
  },
  legalText: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 15,
    marginTop: 12,
  },
  legalLink: {
    color: '#D32F2F',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  emergencyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 8,
    padding: 10,
    marginTop: 16,
    maxWidth: 420,
  },
  emergencyNoticeText: {
    flex: 1,
    fontSize: 10,
    color: '#991b1b',
    lineHeight: 14,
  },
});
