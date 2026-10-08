import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { authService } from '../api/authService';
import { apiService } from '../api/apiService';
import { PRIVACY_POLICY_URL, TERMS_URL, SUPPORT_URL, SUPPORT_EMAIL } from '../constants/legal';
import { formatReadableDate, MEDICAL_DISCLAIMER_TEXT, DEFAULT_COOLDOWN_SETTINGS } from '../utils/cooldown';

const helplines = [
  {
    title: 'Emergency Ambulance (All India)',
    number: '108',
    note: 'Free 24/7 emergency ambulance',
  },
  {
    title: 'Health Helpline (Andhra Pradesh)',
    number: '104',
    note: 'State medical advice helpline',
  },
];

export const AboutAPScreen = ({ currentUser }) => {
  const [deleting, setDeleting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [password, setPassword] = useState('');
  const [showDeleteForm, setShowDeleteForm] = useState(false);

  // Admin Dashboard State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [maleMonths, setMaleMonths] = useState('3');
  const [femaleMonths, setFemaleMonths] = useState('4');
  const [adminDonors, setAdminDonors] = useState([]);
  const [selectedDonorHistory, setSelectedDonorHistory] = useState(null);
  const [donorHistoryList, setDonorHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const openUrl = (url) => {
    Linking.openURL(url).catch(() =>
      Alert.alert('Could not open link', `Please visit ${url} in your browser.`)
    );
  };

  const handleOpenAdmin = async () => {
    setIsAdminModalOpen(true);
    setAdminLoading(true);
    try {
      const [settings, donors] = await Promise.all([
        apiService.getDonationSettings(),
        apiService.getAdminDonorsList(),
      ]);
      setMaleMonths(String(settings.maleCooldownMonths || 3));
      setFemaleMonths(String(settings.femaleCooldownMonths || 4));
      setAdminDonors(donors || []);
    } catch (e) {
      Alert.alert('Admin Access', e.message || 'Could not load admin data.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    const m = parseInt(maleMonths, 10);
    const f = parseInt(femaleMonths, 10);
    if (!m || m < 1 || !f || f < 1) {
      Alert.alert('Invalid Configuration', 'Please enter valid numbers of months (minimum 1).');
      return;
    }

    try {
      await apiService.updateDonationSettings({ maleCooldownMonths: m, femaleCooldownMonths: f });
      Alert.alert('Settings Saved', `Cooldown rules updated: Male ${m} months, Female ${f} months.`);
    } catch (e) {
      Alert.alert('Save Failed', e.message);
    }
  };

  const handleViewHistory = async (donor) => {
    setSelectedDonorHistory(donor);
    setHistoryLoading(true);
    try {
      const history = await apiService.getDonationHistory(donor.id);
      setDonorHistoryList(history || []);
    } catch (e) {
      setDonorHistoryList([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleWithdrawListing = () => {
    Alert.alert(
      'Hide my donor listing',
      'Your listing will stop appearing in searches. Your account stays active and you can list again at any time.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Hide listing',
          style: 'destructive',
          onPress: async () => {
            setWithdrawing(true);
            try {
              await apiService.withdrawDonorListing();
              Alert.alert('Listing hidden', 'You no longer appear in donor searches.');
            } catch (e) {
              Alert.alert('Could not hide listing', e.message);
            } finally {
              setWithdrawing(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    if (!password) {
      Alert.alert('Password required', 'Enter your current password to confirm deletion.');
      return;
    }

    Alert.alert(
      'Delete account permanently?',
      'This removes your account, your profile, and your donor listing. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await authService.deleteAccount(password);
            } catch (e) {
              Alert.alert('Could not delete account', e.message);
            } finally {
              setDeleting(false);
              setPassword('');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <View style={styles.logoCircle}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
        </View>
        <Text style={styles.heroTitle}>BHARATH BLOOD DONOR</Text>
        <Text style={styles.heroSubtitle}>Andhra Pradesh Voluntary Blood Donor Network</Text>
        <Text style={styles.heroDesc}>
          A free, non-commercial platform connecting voluntary blood donors with patients across
          the 26 districts of Andhra Pradesh.
        </Text>
      </View>

      <View style={styles.disclaimerCard}>
        <Feather name="alert-triangle" size={18} color="#991b1b" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.disclaimerTitle}>Important</Text>
          <Text style={styles.disclaimerText}>{MEDICAL_DISCLAIMER_TEXT}</Text>
        </View>
      </View>

      <View style={styles.helplinesCard}>
        <Text style={styles.cardHeaderDark}>VERIFIED EMERGENCY HELPLINES</Text>

        <View style={styles.helplinesList}>
          {helplines.map((h) => (
            <View key={h.number} style={styles.helplineItem}>
              <View style={styles.helplineLeft}>
                <Feather name="phone-call" size={15} color="#D32F2F" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.helplineTitle}>{h.title}</Text>
                  <Text style={styles.helplineNote}>{h.note}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.callCallBtn}
                onPress={() => Linking.openURL(`tel:${h.number}`)}
                activeOpacity={0.7}
              >
                <Text style={styles.callCallText}>{h.number}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => openUrl('https://eraktkosh.mohfw.gov.in/')}
          activeOpacity={0.7}
        >
          <Feather name="external-link" size={13} color="#D32F2F" style={{ marginRight: 6 }} />
          <Text style={styles.linkText}>Find a licensed blood bank on e-RaktKosh (Govt. of India)</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Panel Access Button */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardHeaderDark}>ADMINISTRATION</Text>
        <TouchableOpacity style={styles.settingRow} onPress={handleOpenAdmin} activeOpacity={0.7}>
          <Feather name="sliders" size={15} color="#D32F2F" style={{ marginRight: 10 }} />
          <Text style={[styles.settingLabel, { color: '#D32F2F', fontWeight: '700' }]}>
            Admin Control Center & Cooldown Rules
          </Text>
          <Feather name="chevron-right" size={16} color="#D32F2F" />
        </TouchableOpacity>
      </View>

      {/* Privacy and legal */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardHeaderDark}>PRIVACY & LEGAL</Text>

        <TouchableOpacity style={styles.settingRow} onPress={() => openUrl(PRIVACY_POLICY_URL)} activeOpacity={0.7}>
          <Feather name="shield" size={15} color="#475569" style={{ marginRight: 10 }} />
          <Text style={styles.settingLabel}>Privacy Policy</Text>
          <Feather name="chevron-right" size={16} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={() => openUrl(TERMS_URL)} activeOpacity={0.7}>
          <Feather name="file-text" size={15} color="#475569" style={{ marginRight: 10 }} />
          <Text style={styles.settingLabel}>Terms of Use</Text>
          <Feather name="chevron-right" size={16} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={() => openUrl(SUPPORT_URL)} activeOpacity={0.7}>
          <Feather name="help-circle" size={15} color="#475569" style={{ marginRight: 10 }} />
          <Text style={styles.settingLabel}>Help & Support</Text>
          <Feather name="chevron-right" size={16} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={() => openUrl(`mailto:${SUPPORT_EMAIL}`)} activeOpacity={0.7}>
          <Feather name="mail" size={15} color="#475569" style={{ marginRight: 10 }} />
          <Text style={styles.settingLabel}>Email us directly</Text>
          <Feather name="chevron-right" size={16} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Account management */}
      {currentUser && (
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderDark}>YOUR ACCOUNT</Text>
          <Text style={styles.accountEmail}>{currentUser.email}</Text>

          <TouchableOpacity
            style={[styles.settingRow, withdrawing && styles.rowDisabled]}
            onPress={handleWithdrawListing}
            disabled={withdrawing}
            activeOpacity={0.7}
          >
            <Feather name="eye-off" size={15} color="#475569" style={{ marginRight: 10 }} />
            <Text style={styles.settingLabel}>
              {withdrawing ? 'Hiding listing…' : 'Hide my donor listing'}
            </Text>
            {withdrawing && <ActivityIndicator size="small" color="#64748B" />}
          </TouchableOpacity>

          {!showDeleteForm ? (
            <TouchableOpacity style={styles.settingRow} onPress={() => setShowDeleteForm(true)} activeOpacity={0.7}>
              <Feather name="trash-2" size={15} color="#D32F2F" style={{ marginRight: 10 }} />
              <Text style={[styles.settingLabel, styles.dangerLabel]}>Delete my account</Text>
              <Feather name="chevron-right" size={16} color="#94a3b8" />
            </TouchableOpacity>
          ) : (
            <View style={styles.deleteBox}>
              <Text style={styles.deleteWarning}>
                Deleting your account permanently removes your profile and donor listing. This cannot be undone.
              </Text>
              <TextInput
                style={styles.passwordInput}
                placeholder="Current password"
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
              <View style={styles.deleteActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setShowDeleteForm(false);
                    setPassword('');
                  }}
                  disabled={deleting}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmDeleteBtn, deleting && styles.rowDisabled]}
                  onPress={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting && <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 6 }} />}
                  <Text style={styles.confirmDeleteText}>{deleting ? 'Deleting…' : 'Delete account'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      <Text style={styles.footerNote}>
        Bharath Blood Donor is a free, non-commercial community service. We never charge for blood or contact details.
      </Text>

      {/* Admin Dashboard Modal */}
      <Modal visible={isAdminModalOpen} animationType="slide" transparent onRequestClose={() => setIsAdminModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.adminModalContent}>
            <View style={styles.adminHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="shield" size={20} color="#D32F2F" />
                <Text style={styles.adminTitle}>Admin Control Center</Text>
              </View>
              <TouchableOpacity onPress={() => setIsAdminModalOpen(false)} style={styles.closeBtn}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {adminLoading ? (
              <View style={styles.adminLoadingContainer}>
                <ActivityIndicator size="large" color="#D32F2F" />
                <Text style={styles.adminLoadingText}>Loading donor records and settings...</Text>
              </View>
            ) : (
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* Central Cooldown Config Section */}
                <View style={styles.configSection}>
                  <Text style={styles.configHeader}>DONATION COOLDOWN CONFIGURATION</Text>
                  <Text style={styles.configSub}>
                    Medical policy settings for minimum donation recovery periods (in calendar months).
                  </Text>

                  <View style={styles.configRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Male Cooldown (Months)</Text>
                      <TextInput
                        style={styles.adminInput}
                        value={maleMonths}
                        onChangeText={setMaleMonths}
                        keyboardType="number-pad"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Female Cooldown (Months)</Text>
                      <TextInput
                        style={styles.adminInput}
                        value={femaleMonths}
                        onChangeText={setFemaleMonths}
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>

                  <TouchableOpacity style={styles.saveConfigBtn} onPress={handleSaveSettings}>
                    <Text style={styles.saveConfigText}>Save Cooldown Policy</Text>
                  </TouchableOpacity>
                </View>

                {/* Donor Status Table */}
                <View style={styles.tableSection}>
                  <Text style={styles.configHeader}>DONOR DIRECTORY & COOLDOWN STATUS ({adminDonors.length})</Text>

                  {adminDonors.map((d) => (
                    <View key={d.id} style={styles.donorCard}>
                      <View style={styles.donorTopRow}>
                        <Text style={styles.donorName}>{d.name || 'Anonymous'}</Text>
                        <View style={d.evaluatedStatus === 'AVAILABLE' ? styles.statusAvailable : styles.statusCooldown}>
                          <Text style={d.evaluatedStatus === 'AVAILABLE' ? styles.statusTextAvailable : styles.statusTextCooldown}>
                            {d.evaluatedStatus}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.donorDetailsRow}>
                        <Text style={styles.donorDetailText}>Blood: <Text style={styles.boldText}>{d.bloodGroup}</Text></Text>
                        <Text style={styles.donorDetailText}>Gender: <Text style={styles.boldText}>{d.gender || 'Male'}</Text></Text>
                        <Text style={styles.donorDetailText}>District: <Text style={styles.boldText}>{d.district}</Text></Text>
                      </View>

                      {d.cooldownUntil && (
                        <View style={styles.cooldownDetailBox}>
                          <Text style={styles.cooldownDetailText}>
                            Donation: {formatReadableDate(d.lastDonatedDate)} | Cooldown Until: <Text style={{ fontWeight: '700', color: '#be123c' }}>{formatReadableDate(d.cooldownUntil)}</Text>
                          </Text>
                        </View>
                      )}

                      <TouchableOpacity style={styles.viewHistoryBtn} onPress={() => handleViewHistory(d)}>
                        <Feather name="clock" size={13} color="#D32F2F" style={{ marginRight: 4 }} />
                        <Text style={styles.viewHistoryText}>View Donation History</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            {/* Donation History Sub-modal */}
            {selectedDonorHistory && (
              <View style={styles.historySubOverlay}>
                <View style={styles.historySubCard}>
                  <View style={styles.historySubHeader}>
                    <Text style={styles.historySubTitle}>{selectedDonorHistory.name}'s History</Text>
                    <TouchableOpacity onPress={() => setSelectedDonorHistory(null)}>
                      <Feather name="x" size={18} color="#64748B" />
                    </TouchableOpacity>
                  </View>

                  {historyLoading ? (
                    <ActivityIndicator size="small" color="#D32F2F" style={{ marginVertical: 20 }} />
                  ) : donorHistoryList.length === 0 ? (
                    <Text style={{ fontSize: 12, color: '#94a3b8', marginVertical: 14 }}>No donation history records found.</Text>
                  ) : (
                    donorHistoryList.map((h, i) => (
                      <View key={h.id || i} style={styles.historyRow}>
                        <Text style={styles.historyRowTitle}>Donation #{donorHistoryList.length - i}</Text>
                        <Text style={styles.historyRowText}>Date: {formatReadableDate(h.donationDate)}</Text>
                        <Text style={styles.historyRowText}>Cooldown: {h.cooldownMonths || 3} months</Text>
                        <Text style={styles.historyRowText}>Available: {formatReadableDate(h.cooldownUntil)}</Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#fee2e2',
  },
  logoImg: {
    width: 54,
    height: 54,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#D32F2F',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991b1b',
    marginBottom: 3,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#7f1d1d',
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  helplinesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeaderDark: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  helplinesList: {
    gap: 8,
  },
  helplineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  helplineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  helplineTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  helplineNote: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 1,
  },
  callCallBtn: {
    backgroundColor: '#fff5f5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  callCallText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '700',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 11,
    color: '#D32F2F',
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowDisabled: {
    opacity: 0.6,
  },
  settingLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  dangerLabel: {
    color: '#D32F2F',
  },
  accountEmail: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
  },
  deleteBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  deleteWarning: {
    fontSize: 11,
    color: '#7f1d1d',
    lineHeight: 16,
    marginBottom: 10,
  },
  passwordInput: {
    height: 42,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  confirmDeleteBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D32F2F',
  },
  confirmDeleteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  footerNote: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  adminModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    padding: 16,
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 4,
  },
  adminLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  adminLoadingText: {
    fontSize: 13,
    color: '#64748b',
  },
  configSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  configHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 4,
  },
  configSub: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 12,
  },
  configRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  adminInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    fontSize: 14,
  },
  saveConfigBtn: {
    backgroundColor: '#D32F2F',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveConfigText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  tableSection: {
    marginTop: 8,
  },
  donorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  donorTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  donorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusAvailable: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusTextAvailable: {
    color: '#15803d',
    fontSize: 10,
    fontWeight: '700',
  },
  statusCooldown: {
    backgroundColor: '#ffe4e6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusTextCooldown: {
    color: '#be123c',
    fontSize: 10,
    fontWeight: '700',
  },
  donorDetailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  donorDetailText: {
    fontSize: 11,
    color: '#64748b',
  },
  boldText: {
    fontWeight: '600',
    color: '#334155',
  },
  cooldownDetailBox: {
    backgroundColor: '#fff1f2',
    padding: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  cooldownDetailText: {
    fontSize: 11,
    color: '#881337',
  },
  viewHistoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  viewHistoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D32F2F',
  },
  historySubOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  historySubCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    maxHeight: '70%',
  },
  historySubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  historySubTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  historyRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  historyRowTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  historyRowText: {
    fontSize: 11,
    color: '#64748b',
  },
});
