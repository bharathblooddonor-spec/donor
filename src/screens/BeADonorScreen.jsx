import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Phone, Target, CheckCircle2, UserCheck, ShieldCheck, Info } from 'lucide-react';
import { apDistricts, apCitiesByDistrict, apBloodGroups } from '../data/apData';
import { apiService } from '../api/apiService';

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
    setGpsText('Detecting GPS coordinates...');
    setTimeout(() => {
      setGpsText('Coordinates Saved: 16.5062° N, 80.6480° E (Vijayawada, NTR)');
      setDistrict('NTR');
      setCity('Vijayawada');
    }, 800);
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      alert('Please enter your full name.');
      return;
    }
    if (gender === 'Select') {
      alert('Please select your gender.');
      return;
    }
    if (!phone || phone.trim().length < 10) {
      alert('Please enter a valid mobile number.');
      return;
    }
    if (district === 'Select District') {
      alert('Please select your district in Andhra Pradesh.');
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

      alert(`Success! ${newDonor.name}, you are now registered as an emergency blood donor in ${newDonor.district}, AP.`);
      if (onRegistered) onRegistered();
    } catch (e) {
      alert('Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableCities = apCitiesByDistrict[district] || ["Vijayawada", "Guntur", "Visakhapatnam", "Tirupati"];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Banner */}
      <View style={styles.topInfoCard}>
        <ShieldCheck size={28} color="#D32F2F" style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>Register as a Hero in AP</Text>
          <Text style={styles.infoSub}>
            Your registration can save lives during emergency surgeries and trauma cases in Andhra Pradesh.
          </Text>
        </View>
      </View>

      {/* Main Registration Card */}
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
            <Text style={styles.label}>Blood Group *</Text>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              style={formSelectStyle}
            >
              {apBloodGroups.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </View>
        </View>

        <Text style={styles.label}>Gender *</Text>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          style={formSelectStyle}
        >
          <option value="Select">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <Text style={styles.label}>Current Status *</Text>
        <select
          value={currentStatus}
          onChange={(e) => setCurrentStatus(e.target.value)}
          style={formSelectStyle}
        >
          <option value="Available for Call">Available for Call</option>
          <option value="Busy / Temporarily Unavailable">Busy / Temporarily Unavailable</option>
          <option value="Donated Recently">Donated Recently</option>
        </select>

        <Text style={styles.label}>Caretaker / Personal Mobile *</Text>
        <View style={styles.phoneInputWrapper}>
          <Phone size={16} color="#94a3b8" style={{ marginRight: 8 }} />
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

        <Text style={styles.label}>District in AP *</Text>
        <select
          value={district}
          onChange={(e) => {
            setDistrict(e.target.value);
            const cities = apCitiesByDistrict[e.target.value];
            if (cities && cities.length > 0) setCity(cities[0]);
          }}
          style={formSelectStyle}
        >
          <option value="Select District">Select District</option>
          {apDistricts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <Text style={styles.label}>City / Area *</Text>
        {district !== 'Select District' ? (
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={formSelectStyle}
          >
            {availableCities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Select District first"
            editable={false}
          />
        )}

        <TouchableOpacity style={styles.gpsButton} onPress={handleDetectGps} activeOpacity={0.8}>
          <Target size={16} color="#D32F2F" style={{ marginRight: 6 }} />
          <Text style={styles.gpsButtonText}>Detect My Coordinates (GPS)</Text>
        </TouchableOpacity>
        {gpsText ? <Text style={styles.gpsText}>{gpsText}</Text> : null}

        <Text style={styles.label}>Last Blood Donation Date</Text>
        <select
          value={lastDonated}
          onChange={(e) => setLastDonated(e.target.value)}
          style={formSelectStyle}
        >
          <option value="First Time Donor (Never)">First Time Donor (Never)</option>
          <option value="Within 3 Months">Within 3 Months</option>
          <option value="More than 3 Months Ago">More than 3 Months Ago</option>
          <option value="More than 6 Months Ago">More than 6 Months Ago</option>
        </select>

        <TouchableOpacity
          style={[styles.registerSubmitBtn, isSubmitting && { opacity: 0.6 }]}
          onPress={handleRegister}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <CheckCircle2 size={18} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.registerSubmitText}>
            {isSubmitting ? 'Registering...' : 'Register Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const formSelectStyle = {
  width: '100%',
  height: 46,
  borderRadius: 8,
  borderColor: '#cbd5e1',
  borderWidth: 1,
  paddingLeft: 12,
  paddingRight: 12,
  fontSize: 14,
  backgroundColor: '#ffffff',
  marginBottom: 14,
  outline: 'none',
  color: '#0f172a'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  topInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
    elevation: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#D32F2F',
    marginBottom: 2,
  },
  infoSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  formHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
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
    backgroundColor: '#ffffff',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
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
    height: 46,
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
    fontSize: 11,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 15,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D32F2F',
    borderStyle: 'dashed',
    borderRadius: 8,
    height: 44,
    backgroundColor: '#fff5f5',
    marginBottom: 10,
  },
  gpsButtonText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '700',
  },
  gpsText: {
    fontSize: 11,
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  registerSubmitBtn: {
    backgroundColor: '#D32F2F',
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  registerSubmitText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
