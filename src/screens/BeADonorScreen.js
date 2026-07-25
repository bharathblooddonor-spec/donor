import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { apDistricts, apCitiesByDistrict, apBloodGroups } from '../data/apData';
import { apiService } from '../api/apiService';
import { NativePicker } from '../components/NativePicker';

export const BeADonorScreen = ({ onRegistered }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('Select');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [currentStatus, setCurrentStatus] = useState('Available for Call');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Select District');
  const [city, setCity] = useState('');
  const [lastDonated, setLastDonated] = useState('First Time Donor (Never)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsText, setGpsText] = useState('');

  const handleDetectGps = () => {
    setGpsText('GPS Detected: 16.5062° N, 80.6480° E (Vijayawada, NTR)');
    setDistrict('NTR');
    setCity('Vijayawada');
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Form Error', 'Please enter your full name.');
      return;
    }
    if (gender === 'Select') {
      Alert.alert('Form Error', 'Please select your gender.');
      return;
    }
    if (!phone || phone.trim().length < 10) {
      Alert.alert('Form Error', 'Please enter a valid mobile number.');
      return;
    }
    if (district === 'Select District') {
      Alert.alert('Form Error', 'Please select your district in Andhra Pradesh.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newDonor = await apiService.registerDonor({
        name,
        age: parseInt(age) || 25,
        gender,
        bloodGroup,
        status: currentStatus,
        phone,
        district,
        city: city || district,
        lastDonated
      });

      Alert.alert('Registered Successfully', `${newDonor.name}, you are now a registered blood donor in ${newDonor.district}, AP.`);
      if (onRegistered) onRegistered();
    } catch (e) {
      Alert.alert('Error', 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableCities = apCitiesByDistrict[district] || ["Vijayawada", "Guntur", "Visakhapatnam", "Tirupati"];
  const districtOptions = ['Select District', ...apDistricts];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
          <View style={{ width: 100 }}>
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
          items={['Select', 'Male', 'Female', 'Other']}
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
            placeholder="e.g. +91 98480 12345"
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

        <TouchableOpacity style={styles.gpsButton} onPress={handleDetectGps} activeOpacity={0.8}>
          <Feather name="target" size={15} color="#D32F2F" style={{ marginRight: 6 }} />
          <Text style={styles.gpsButtonText}>Detect My Coordinates (GPS)</Text>
        </TouchableOpacity>
        {gpsText ? <Text style={styles.gpsText}>{gpsText}</Text> : null}

        <NativePicker
          label="Last Blood Donation Date"
          selectedValue={lastDonated}
          onValueChange={setLastDonated}
          items={['First Time Donor (Never)', 'Within 3 Months', 'More than 3 Months Ago', 'More than 6 Months Ago']}
        />

        <TouchableOpacity
          style={[styles.registerSubmitBtn, isSubmitting && { opacity: 0.6 }]}
          onPress={handleRegister}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <Feather name="check-circle" size={18} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.registerSubmitText}>
            {isSubmitting ? 'Registering...' : 'Register Now'}
          </Text>
        </TouchableOpacity>
      </View>
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
  topInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#fee2e2',
    elevation: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D32F2F',
    marginBottom: 2,
  },
  infoSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  formHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#ffffff',
    marginBottom: 4,
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    height: '100%',
  },
  footnote: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 14,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D32F2F',
    borderStyle: 'dashed',
    borderRadius: 8,
    height: 42,
    backgroundColor: '#fff5f5',
    marginBottom: 8,
  },
  gpsButtonText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '700',
  },
  gpsText: {
    fontSize: 11,
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  registerSubmitBtn: {
    backgroundColor: '#D32F2F',
    height: 46,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    elevation: 2,
  },
  registerSubmitText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
