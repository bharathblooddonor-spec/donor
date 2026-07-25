import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { X, PlusCircle, Hospital, Phone, User, Droplets } from 'lucide-react';
import { apDistricts, apBloodGroups } from '../data/apData';

export const PostRequestModal = ({ visible, onClose, onSubmit }) => {
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [hospitalName, setHospitalName] = useState('');
  const [district, setDistrict] = useState('NTR');
  const [city, setCity] = useState('Vijayawada');
  const [units, setUnits] = useState('2');
  const [reason, setReason] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = () => {
    if (!patientName || !hospitalName || !phone) {
      alert('Please fill in Patient Name, Hospital Name, and Contact Phone Number.');
      return;
    }

    onSubmit({
      patientName,
      bloodGroup,
      hospitalName,
      district,
      city,
      units: parseInt(units) || 1,
      reason: reason || 'Medical Emergency',
      contactName: contactName || patientName,
      phone,
      isUrgent: true
    });

    // Reset
    setPatientName('');
    setHospitalName('');
    setPhone('');
    setReason('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <PlusCircle size={20} color="#D32F2F" />
              <Text style={styles.modalTitle}>Post Urgent Blood Request</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Patient Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Subbaiah Sastry"
              value={patientName}
              onChangeText={setPatientName}
            />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Blood Group *</Text>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  style={nativeSelectStyle}
                >
                  {apBloodGroups.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </View>

              <View style={{ width: 120 }}>
                <Text style={styles.label}>Units Required *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2"
                  keyboardType="numeric"
                  value={units}
                  onChangeText={setUnits}
                />
              </View>
            </View>

            <Text style={styles.label}>Hospital Name & Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ramesh Hospitals, Vijayawada"
              value={hospitalName}
              onChangeText={setHospitalName}
            />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>District in AP *</Text>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  style={nativeSelectStyle}
                >
                  {apDistricts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </View>

              <View style={styles.flex1}>
                <Text style={styles.label}>City / Area</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Vijayawada"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>

            <Text style={styles.label}>Reason for Request</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Cardiac Surgery Emergency"
              value={reason}
              onChangeText={setReason}
            />

            <Text style={styles.label}>Contact Person Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Narayana (Son)"
              value={contactName}
              onChangeText={setContactName}
            />

            <Text style={styles.label}>Emergency Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. +91 9948512121"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
              <Text style={styles.submitBtnText}>Broadcast Request Urgently</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const nativeSelectStyle = {
  width: '100%',
  height: 44,
  borderRadius: 8,
  borderColor: '#cbd5e1',
  borderWidth: 1,
  paddingLeft: 10,
  paddingRight: 10,
  fontSize: 14,
  backgroundColor: '#ffffff',
  marginBottom: 12,
  outline: 'none'
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 4,
  },
  formScroll: {
    maxHeight: 500,
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
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  submitBtn: {
    backgroundColor: '#D32F2F',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
