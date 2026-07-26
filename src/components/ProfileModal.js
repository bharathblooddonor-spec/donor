import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { authService } from '../api/authService';
import { apDistricts, apCitiesByDistrict, apBloodGroups } from '../data/apData';
import { NativePicker } from './NativePicker';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
];

export const ProfileModal = ({ visible, onClose, currentUser, onProfileUpdated }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('NTR');
  const [city, setCity] = useState('Vijayawada');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [age, setAge] = useState('25');
  const [photoURL, setPhotoURL] = useState('');
  const [availableToDonate, setAvailableToDonate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (visible && currentUser) {
      loadUserProfile();
    }
  }, [visible, currentUser]);

  const loadUserProfile = async () => {
    setFetching(true);
    try {
      setName(currentUser.displayName || '');
      setPhotoURL(currentUser.photoURL || AVATAR_PRESETS[0]);

      const profile = await authService.getProfile(currentUser.uid);
      if (profile) {
        if (profile.name) setName(profile.name);
        if (profile.phone) setPhone(profile.phone);
        if (profile.district) setDistrict(profile.district);
        if (profile.city) setCity(profile.city);
        if (profile.bloodGroup) setBloodGroup(profile.bloodGroup);
        if (profile.age) setAge(String(profile.age));
        if (profile.photoURL) setPhotoURL(profile.photoURL);
        if (profile.isActive !== undefined) setAvailableToDonate(profile.isActive);
      }
    } catch (e) {
      console.warn('Could not fetch existing profile data', e);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required field', 'Please enter your name.');
      return;
    }

    setLoading(true);
    try {
      await authService.updateUserProfile({
        name: name.trim(),
        photoURL,
        phone: phone.trim(),
        district,
        city,
        bloodGroup,
        age: age ? parseInt(age, 10) : 25,
        availableToDonate,
      });

      Alert.alert('Profile Updated', 'Your profile details have been saved successfully!');
      if (onProfileUpdated) onProfileUpdated();
      onClose();
    } catch (e) {
      Alert.alert('Save Failed', e.message || 'Could not save profile details.');
    } finally {
      setLoading(false);
    }
  };

  const cities = apCitiesByDistrict[district] || ['Main Area'];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="person-circle-outline" size={24} color="#D32F2F" />
              <Text style={styles.modalTitle}>User Profile</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Feather name="x" size={20} color="#555" />
            </TouchableOpacity>
          </View>

          {fetching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#D32F2F" />
              <Text style={styles.loadingText}>Loading profile details...</Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
              {/* DP / Profile Picture Section */}
              <View style={styles.dpSection}>
                <View style={styles.dpContainer}>
                  {photoURL ? (
                    <Image source={{ uri: photoURL }} style={styles.dpImage} />
                  ) : (
                    <View style={styles.dpFallback}>
                      <Text style={styles.dpInitial}>
                        {(name || currentUser?.email || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.dpBadge}>
                    <Feather name="camera" size={12} color="#ffffff" />
                  </View>
                </View>

                <Text style={styles.dpLabel}>Choose Avatar / Profile Picture</Text>

                {/* Avatar Presets */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarList}>
                  {AVATAR_PRESETS.map((url, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setPhotoURL(url)}
                      style={[styles.avatarOption, photoURL === url && styles.avatarOptionSelected]}
                    >
                      <Image source={{ uri: url }} style={styles.avatarPresetImg} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Account Email Display */}
              <View style={styles.infoBadgeContainer}>
                <Feather name="mail" size={14} color="#666" />
                <Text style={styles.infoBadgeText}>{currentUser?.email || 'Signed In'}</Text>
              </View>

              {/* Form Fields */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Mobile Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="10-digit mobile number"
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.rowTwo}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <NativePicker
                    label="District"
                    selectedValue={district}
                    options={apDistricts}
                    onValueChange={(val) => {
                      setDistrict(val);
                      const availableCities = apCitiesByDistrict[val] || [];
                      setCity(availableCities[0] || '');
                    }}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <NativePicker
                    label="City / Town"
                    selectedValue={city}
                    options={cities}
                    onValueChange={setCity}
                  />
                </View>
              </View>

              <View style={styles.rowTwo}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <NativePicker
                    label="Blood Group"
                    selectedValue={bloodGroup}
                    options={apBloodGroups}
                    onValueChange={setBloodGroup}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Age</Text>
                  <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="number-pad"
                    placeholder="18 - 65"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              {/* Emergency Donor Availability Switch */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={styles.switchTitle}>Available for Emergency Donation</Text>
                  <Text style={styles.switchSubtitle}>
                    Show your contact in blood search results for recipients in need.
                  </Text>
                </View>
                <Switch
                  value={availableToDonate}
                  onValueChange={setAvailableToDonate}
                  trackColor={{ false: '#d1d5db', true: '#ef4444' }}
                  thumbColor={availableToDonate ? '#ffffff' : '#f4f4f5'}
                />
              </View>
            </ScrollView>
          )}

          {/* Action Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading || fetching}>
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Profile</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '65%',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 14,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  dpSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  dpContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  dpImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#D32F2F',
  },
  dpFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpInitial: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
  },
  dpBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#D32F2F',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  dpLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  avatarList: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  avatarOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  avatarOptionSelected: {
    borderColor: '#D32F2F',
    transform: [{ scale: 1.08 }],
  },
  avatarPresetImg: {
    width: '100%',
    height: '100%',
  },
  infoBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'center',
    marginVertical: 8,
    gap: 6,
  },
  infoBadgeText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginVertical: 10,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991b1b',
  },
  switchSubtitle: {
    fontSize: 11,
    color: '#7f1d1d',
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1.5,
    backgroundColor: '#D32F2F',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
