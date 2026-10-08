import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { authService } from '../api/authService';
import { apDistricts, apCitiesByDistrict, apBloodGroups } from '../data/apData';
import { NativePicker } from './NativePicker';

/**
 * Apply a stored value to form state, leaving the existing default in place
 * when the field was never saved. `false` is a real value and must survive.
 */
function applyIfSet(value, setter) {
  if (value !== undefined && value !== null && value !== '') setter(value);
}

export const ProfileModal = ({ visible, onClose, currentUser, onProfileUpdated }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('NTR');
  const [city, setCity] = useState('Vijayawada');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [age, setAge] = useState('25');
  const [availableToDonate, setAvailableToDonate] = useState(true);
  const [hasDonorListing, setHasDonorListing] = useState(false);
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

      const [profile, donor] = await Promise.all([
        authService.getProfile(currentUser.uid),
        authService.getDonorProfile(currentUser.uid),
      ]);

      applyIfSet(profile?.name, setName);
      applyIfSet(profile?.phone, setPhone);
      applyIfSet(profile?.district, setDistrict);
      applyIfSet(profile?.city, setCity);
      applyIfSet(profile?.bloodGroup, setBloodGroup);

      // age and isActive are stored on the listing, not the private profile.
      setHasDonorListing(Boolean(donor));
      applyIfSet(donor?.age && String(donor.age), setAge);
      applyIfSet(donor?.isActive, setAvailableToDonate);
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
      const { donorListingUpdated } = await authService.updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        district,
        city,
        bloodGroup,
        age: age ? parseInt(age, 10) : 25,
        availableToDonate,
      });

      Alert.alert(
        'Profile Updated',
        donorListingUpdated
          ? 'Your profile and donor listing have been saved.'
          : 'Your profile has been saved. You are not listed as a donor yet, so your ' +
            'availability and age were not published — register on the Be a Donor tab first.',
      );
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
              {/* Initials stand in for a photo: there is no upload, and stock
                  portraits of strangers would misrepresent who a donor is. */}
              <View style={styles.dpSection}>
                <View style={styles.dpContainer}>
                  <View style={styles.dpFallback}>
                    <Text style={styles.dpInitial}>
                      {(name || currentUser?.email || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                </View>
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
                    items={apDistricts}
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
                    items={cities}
                    onValueChange={setCity}
                  />
                </View>
              </View>

              <View style={styles.rowTwo}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <NativePicker
                    label="Blood Group"
                    selectedValue={bloodGroup}
                    items={apBloodGroups}
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
                    {hasDonorListing
                      ? 'Show your contact in blood search results for recipients in need.'
                      : 'You are not listed as a donor yet. Register on the Be a Donor tab to ' +
                        'publish your listing — this switch has no effect until then.'}
                  </Text>
                </View>
                <Switch
                  value={hasDonorListing && availableToDonate}
                  onValueChange={setAvailableToDonate}
                  disabled={!hasDonorListing}
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
