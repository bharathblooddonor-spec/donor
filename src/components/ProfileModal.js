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
import { apiService } from '../api/apiService';
import { apDistricts, apCitiesByDistrict, apBloodGroups } from '../data/apData';
import { NativePicker } from './NativePicker';
import {
  evaluateDonorStatus,
  formatReadableDate,
  getRemainingCooldownDays,
  MEDICAL_DISCLAIMER_TEXT,
} from '../utils/cooldown';

function applyIfSet(value, setter) {
  if (value !== undefined && value !== null && value !== '') setter(value);
}

export const ProfileModal = ({ visible, onClose, currentUser, onProfileUpdated }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [district, setDistrict] = useState('NTR');
  const [city, setCity] = useState('Vijayawada');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [age, setAge] = useState('25');
  const [availableToDonate, setAvailableToDonate] = useState(true);
  const [hasDonorListing, setHasDonorListing] = useState(false);
  const [donorRecord, setDonorRecord] = useState(null);
  const [donationHistory, setDonationHistory] = useState([]);
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

      const [profile, donor, history] = await Promise.all([
        authService.getProfile(currentUser.uid),
        authService.getDonorProfile(currentUser.uid),
        apiService.getDonationHistory(currentUser.uid),
      ]);

      setDonorRecord(donor);
      setDonationHistory(history || []);

      applyIfSet(profile?.name, setName);
      applyIfSet(profile?.phone, setPhone);
      applyIfSet(profile?.gender || donor?.gender, setGender);
      applyIfSet(profile?.district, setDistrict);
      applyIfSet(profile?.city, setCity);
      applyIfSet(profile?.bloodGroup, setBloodGroup);

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
        gender,
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
            'availability and age were not published — register on the Be a Donor tab first.'
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

  const donorStatus = evaluateDonorStatus(donorRecord);
  const isCooldownActive = donorStatus === 'DONATION_COOLDOWN';
  const remainingDays = isCooldownActive ? getRemainingCooldownDays(donorRecord?.cooldownUntil) : 0;

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
              {/* DP & Status Badge */}
              <View style={styles.dpSection}>
                <View style={styles.dpContainer}>
                  <View style={styles.dpFallback}>
                    <Text style={styles.dpInitial}>
                      {(name || currentUser?.email || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Donor Availability / Cooldown Badge */}
                {hasDonorListing && (
                  <View style={isCooldownActive ? styles.cooldownBadge : styles.availableBadge}>
                    <Text style={isCooldownActive ? styles.cooldownBadgeText : styles.availableBadgeText}>
                      {isCooldownActive ? '● DONATION COOLDOWN' : '● AVAILABLE TO DONATE'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Cooldown Information Card */}
              {hasDonorListing && isCooldownActive && (
                <View style={styles.cooldownInfoCard}>
                  <View style={styles.cooldownHeader}>
                    <Ionicons name="time-outline" size={18} color="#9f1239" />
                    <Text style={styles.cooldownCardTitle}>Donation Cooldown Active</Text>
                  </View>
                  <Text style={styles.cooldownCardBody}>
                    You recently donated blood. You will be eligible to appear as an available donor again on:
                  </Text>
                  <View style={styles.cooldownDateBox}>
                    <Text style={styles.cooldownDateText}>{formatReadableDate(donorRecord?.cooldownUntil)}</Text>
                    <Text style={styles.cooldownDaysText}>Remaining: {remainingDays} days</Text>
                  </View>
                  <Text style={styles.disclaimerText}>{MEDICAL_DISCLAIMER_TEXT}</Text>
                </View>
              )}

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
                    label="Gender"
                    selectedValue={gender}
                    items={['Male', 'Female', 'Other']}
                    onValueChange={setGender}
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

              <View style={styles.formGroup}>
                <NativePicker
                  label="Blood Group"
                  selectedValue={bloodGroup}
                  items={apBloodGroups}
                  onValueChange={setBloodGroup}
                />
              </View>

              {/* Emergency Donor Availability Switch */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={styles.switchTitle}>Available for Emergency Donation</Text>
                  <Text style={styles.switchSubtitle}>
                    {isCooldownActive
                      ? `Your availability is locked during donation cooldown until ${formatReadableDate(donorRecord?.cooldownUntil)}.`
                      : hasDonorListing
                      ? 'Show your contact in blood search results for recipients in need.'
                      : 'You are not listed as a donor yet. Register on the Be a Donor tab to publish your listing.'}
                  </Text>
                </View>
                <Switch
                  value={hasDonorListing && !isCooldownActive && availableToDonate}
                  onValueChange={setAvailableToDonate}
                  disabled={!hasDonorListing || isCooldownActive}
                  trackColor={{ false: '#d1d5db', true: '#ef4444' }}
                  thumbColor={availableToDonate && !isCooldownActive ? '#ffffff' : '#f4f4f5'}
                />
              </View>

              {/* Donation History Section */}
              <View style={styles.historySection}>
                <View style={styles.historyHeaderRow}>
                  <Feather name="award" size={16} color="#D32F2F" />
                  <Text style={styles.historyTitle}>Donation History</Text>
                </View>

                {donationHistory.length === 0 ? (
                  <Text style={styles.noHistoryText}>No confirmed donations recorded yet.</Text>
                ) : (
                  donationHistory.map((item, idx) => (
                    <View key={item.id || idx} style={styles.historyCard}>
                      <View style={styles.historyCardRow}>
                        <Text style={styles.historyNum}>Donation #{donationHistory.length - idx}</Text>
                        <Text style={styles.historyStatusBadge}>Completed</Text>
                      </View>

                      <View style={styles.historyDetailsGrid}>
                        <Text style={styles.historyDetailText}>
                          Date: <Text style={styles.boldDetail}>{formatReadableDate(item.donationDate)}</Text>
                        </Text>
                        <Text style={styles.historyDetailText}>
                          Blood Group: <Text style={styles.boldDetail}>{item.bloodGroup || bloodGroup}</Text>
                        </Text>
                        <Text style={styles.historyDetailText}>
                          Cooldown: <Text style={styles.boldDetail}>{item.cooldownMonths || 3} months</Text>
                        </Text>
                        <Text style={styles.historyDetailText}>
                          Available Again: <Text style={styles.boldDetail}>{formatReadableDate(item.cooldownUntil)}</Text>
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>

              <View style={{ height: 20 }} />
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
  availableBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  availableBadgeText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '700',
  },
  cooldownBadge: {
    backgroundColor: '#ffe4e6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  cooldownBadgeText: {
    color: '#be123c',
    fontSize: 11,
    fontWeight: '700',
  },
  cooldownInfoCard: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  cooldownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cooldownCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9f1239',
  },
  cooldownCardBody: {
    fontSize: 12,
    color: '#881337',
    marginBottom: 8,
    lineHeight: 16,
  },
  cooldownDateBox: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe4e6',
  },
  cooldownDateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#be123c',
  },
  cooldownDaysText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9f1239',
  },
  disclaimerText: {
    fontSize: 10,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 6,
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
  historySection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  noHistoryText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  historyCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  historyCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  historyStatusBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  historyDetailsGrid: {
    gap: 2,
  },
  historyDetailText: {
    fontSize: 12,
    color: '#64748b',
  },
  boldDetail: {
    fontWeight: '600',
    color: '#334155',
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
