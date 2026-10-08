import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { apDistricts, apCitiesByDistrict, apBloodGroups } from '../data/apData';
import { apiService } from '../api/apiService';
import { authService } from '../api/authService';
import { detectDistrictAndCity } from '../utils/location';
import { NativePicker } from '../components/NativePicker';
import { evaluateDonorStatus, formatReadableDate, getRemainingCooldownDays, MEDICAL_DISCLAIMER_TEXT } from '../utils/cooldown';

const INDIAN_MOBILE_RE = /^(?:\+?91)?[6-9]\d{9}$/;

export const BeADonorScreen = ({ onRegistered }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [currentStatus, setCurrentStatus] = useState('Available for Call');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Select District');
  const [city, setCity] = useState('');
  const [lastDonated, setLastDonated] = useState('First Time Donor (Never)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsText, setGpsText] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [existingDonor, setExistingDonor] = useState(null);

  useEffect(() => {
    loadExistingDonorProfile();
  }, []);

  const loadExistingDonorProfile = async () => {
    const user = authService.getCurrentUser();
    if (user) {
      try {
        const d = await authService.getDonorProfile(user.uid);
        if (d) {
          setExistingDonor(d);
          if (d.name) setName(d.name);
          if (d.age) setAge(String(d.age));
          if (d.gender) setGender(d.gender);
          if (d.bloodGroup) setBloodGroup(d.bloodGroup);
          if (d.phone) setPhone(d.phone);
          if (d.district) setDistrict(d.district);
          if (d.city) setCity(d.city);
        }
      } catch (e) {
        console.warn('Could not load donor profile', e);
      }
    }
  };

  const handleRecordDonationToday = () => {
    const user = authService.getCurrentUser();
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to record your blood donation.');
      return;
    }

    const monthsText = (gender || '').toUpperCase() === 'FEMALE' ? '4 months' : '3 months';

    Alert.alert(
      'Record Blood Donation',
      `Did you donate blood today? This will lock your profile in recovery mode for ${monthsText} as per medical safety guidelines.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Donation',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await apiService.recordDonation({
                donorId: user.uid,
                donorGender: gender || 'Male',
                bloodGroup: bloodGroup || 'O+',
                donationDate: new Date().toISOString().split('T')[0],
                notes: 'Self-reported donation today',
              });
              Alert.alert(
                'Donation Recorded ❤️',
                `Thank you for donating blood and helping save a life! Your donor profile is now locked in recovery for ${monthsText}.`
              );
              await loadExistingDonorProfile();
            } catch (e) {
              Alert.alert('Error', e.message || 'Could not record donation.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const handleDetectGps = async () => {
    setGpsLoading(true);
    setGpsText('');
    try {
      const detected = await detectDistrictAndCity();
      setDistrict(detected.district);
      if (detected.city) setCity(detected.city);
      setGpsText(detected.label);
    } catch (e) {
      setGpsText('');
      Alert.alert('Location unavailable', e.message);
    } finally {
      setGpsLoading(false);
    }
  };

  const handleRegister = async () => {
    const parsedAge = Number.parseInt(age, 10);

    if (!name.trim()) {
      Alert.alert('Form Error', 'Please enter your full name.');
      return;
    }
    if (!gender || gender === 'Select') {
      Alert.alert('Form Error', 'Please select your gender.');
      return;
    }
    if (!Number.isFinite(parsedAge) || parsedAge < 18 || parsedAge > 65) {
      Alert.alert(
        'Age Not Eligible',
        'Blood donors in India must be between 18 and 65 years old. Please enter your correct age.'
      );
      return;
    }
    if (!INDIAN_MOBILE_RE.test(phone.replace(/[\s-]/g, ''))) {
      Alert.alert('Form Error', 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (district === 'Select District') {
      Alert.alert('Form Error', 'Please select your district in Andhra Pradesh.');
      return;
    }
    if (!consentGiven) {
      Alert.alert(
        'Consent Required',
        'Please confirm you agree to your name, blood group, district and phone number being shown to people searching for donors.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const newDonor = await apiService.registerDonor({
        name: name.trim(),
        age: parsedAge,
        gender,
        bloodGroup,
        status: currentStatus,
        phone: phone.replace(/[\s-]/g, ''),
        district,
        city: city || district,
        lastDonated,
        consentedAt: new Date().toISOString(),
      });

      Alert.alert(
        'Registered Successfully',
        `${newDonor?.name || name}, you are now a registered blood donor in ${newDonor?.district || district}, AP.`
      );
      await loadExistingDonorProfile();
      if (onRegistered) onRegistered();
    } catch (e) {
      Alert.alert('Registration failed', e.message || 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableCities = apCitiesByDistrict[district] || ["Vijayawada", "Guntur", "Visakhapatnam", "Tirupati"];
  const districtOptions = ['Select District', ...apDistricts];

  const donorStatus = evaluateDonorStatus(existingDonor);
  const isCooldownActive = donorStatus === 'DONATION_COOLDOWN';
  const remainingDays = isCooldownActive ? getRemainingCooldownDays(existingDonor?.cooldownUntil) : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Recovery Card when Donor is in Cooldown */}
      {isCooldownActive && (
        <View style={styles.cooldownCard}>
          <View style={styles.cooldownHeaderRow}>
            <Text style={styles.cooldownEmoji}>🩸</Text>
            <Text style={styles.cooldownTitle}>Donation Recovery Active</Text>
          </View>
          <Text style={styles.cooldownBody}>
            Thank you for donating blood and helping save a life. Your donor profile is locked and temporarily unavailable for new donation requests.
          </Text>
          <View style={styles.cooldownMetaRow}>
            <View style={styles.cooldownMetaItem}>
              <Text style={styles.cooldownMetaLabel}>Available again:</Text>
              <Text style={styles.cooldownMetaValue}>{formatReadableDate(existingDonor.cooldownUntil)}</Text>
            </View>
            <View style={styles.cooldownMetaItem}>
              <Text style={styles.cooldownMetaLabel}>Remaining:</Text>
              <Text style={styles.cooldownMetaValue}>{remainingDays} days</Text>
            </View>
          </View>
          <Text style={styles.disclaimerText}>{MEDICAL_DISCLAIMER_TEXT}</Text>
        </View>
      )}

      {/* Record Donation Action Card for Registered Donors */}
      {existingDonor && !isCooldownActive && (
        <View style={styles.recordDonationCard}>
          <View style={styles.recordDonationHeader}>
            <Text style={styles.recordEmoji}>🩸</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.recordTitle}>Did you donate blood recently?</Text>
              <Text style={styles.recordSub}>
                Record your donation to automatically lock your profile for recovery ({gender === 'Female' ? '4 months' : '3 months'}).
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.recordBtn}
            onPress={handleRecordDonationToday}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Feather name="check-circle" size={16} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.recordBtnText}>I Donated Blood Today</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.topInfoCard}>
        <Feather name="shield" size={26} color="#D32F2F" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>Register as a Hero in AP</Text>
          <Text style={styles.infoSub}>
            Your registration can save lives during emergency surgeries and trauma cases in Andhra Pradesh.
          </Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formHeaderTitle}>DONOR REGISTRATION</Text>

        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Srinivasa Rao"
          value={name}
          onChangeText={setName}
        />

        <View style={styles.row}>
          <View style={styles.ageField}>
            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={styles.input}
              placeholder="25"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
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

        <NativePicker
          label="Gender *"
          selectedValue={gender}
          onValueChange={setGender}
          items={['Male', 'Female', 'Other']}
        />

        <NativePicker
          label="Current Status *"
          selectedValue={currentStatus}
          onValueChange={setCurrentStatus}
          items={['Available for Call', 'Busy / Temporarily Unavailable', 'Donated Recently']}
        />

        <Text style={styles.label}>Caretaker / Personal Mobile *</Text>
        <View style={styles.phoneInputWrapper}>
          <Feather name="phone" size={16} color="#94a3b8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.phoneInput}
            placeholder="e.g. 9848012345"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
        <Text style={styles.footnote}>
          Will be displayed exclusively to users searching for emergency matching blood groups.
        </Text>

        <NativePicker
          label="District in AP *"
          selectedValue={district}
          onValueChange={(val) => {
            setDistrict(val);
            const cities = apCitiesByDistrict[val];
            if (cities && cities.length > 0) setCity(cities[0]);
          }}
          items={districtOptions}
        />

        {district !== 'Select District' ? (
          <NativePicker
            label="City / Area *"
            selectedValue={city}
            onValueChange={setCity}
            items={availableCities}
          />
        ) : (
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.label}>City / Area *</Text>
            <TextInput style={styles.input} placeholder="Select District first" editable={false} />
          </View>
        )}

        <TouchableOpacity
          style={[styles.gpsButton, gpsLoading && styles.gpsButtonDisabled]}
          onPress={handleDetectGps}
          disabled={gpsLoading}
          activeOpacity={0.8}
        >
          {gpsLoading ? (
            <ActivityIndicator size="small" color="#D32F2F" style={{ marginRight: 6 }} />
          ) : (
            <Feather name="target" size={15} color="#D32F2F" style={{ marginRight: 6 }} />
          )}
          <Text style={styles.gpsButtonText}>
            {gpsLoading ? 'Detecting location…' : 'Detect My District (GPS)'}
          </Text>
        </TouchableOpacity>
        {gpsText ? <Text style={styles.gpsText}>{gpsText}</Text> : null}

        <NativePicker
          label="Last Blood Donation Date"
          selectedValue={lastDonated}
          onValueChange={setLastDonated}
          items={['First Time Donor (Never)', 'Within 3 Months', 'More than 3 Months Ago', 'More than 6 Months Ago']}
        />

        <TouchableOpacity
          style={styles.consentRow}
          onPress={() => setConsentGiven((prev) => !prev)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, consentGiven && styles.checkboxChecked]}>
            {consentGiven && <Feather name="check" size={13} color="#ffffff" />}
          </View>
          <Text style={styles.consentText}>
            I agree that my <Text style={styles.consentBold}>name, age, gender, blood group,
            district and phone number</Text> will be publicly visible to anyone searching for
            donors in AP.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleRegister}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>PUBLISH DONOR PROFILE</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cooldownCard: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cooldownHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cooldownEmoji: {
    fontSize: 20,
  },
  cooldownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9f1239',
  },
  cooldownBody: {
    fontSize: 13,
    color: '#881337',
    lineHeight: 18,
    marginBottom: 12,
  },
  cooldownMetaRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    justifyContent: 'space-around',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ffe4e6',
  },
  cooldownMetaItem: {
    alignItems: 'center',
  },
  cooldownMetaLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  cooldownMetaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#be123c',
    marginTop: 2,
  },
  recordDonationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
    elevation: 2,
  },
  recordDonationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  recordEmoji: {
    fontSize: 24,
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991b1b',
  },
  recordSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 15,
  },
  recordBtn: {
    backgroundColor: '#D32F2F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  recordBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  disclaimerText: {
    fontSize: 10,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  topInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  infoSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  formHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D32F2F',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  ageField: {
    flex: 0.45,
  },
  flex1: {
    flex: 1,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  footnote: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 12,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 12,
  },
  gpsButtonDisabled: {
    opacity: 0.6,
  },
  gpsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D32F2F',
  },
  gpsText: {
    fontSize: 12,
    color: '#16a34a',
    marginBottom: 12,
    fontWeight: '500',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 12,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
  },
  consentText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  consentBold: {
    fontWeight: '700',
    color: '#1e293b',
  },
  submitBtn: {
    backgroundColor: '#D32F2F',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    backgroundColor: '#f87171',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
