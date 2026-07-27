import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export const NativePicker = ({ label, selectedValue, onValueChange, items, placeholder = 'Select...' }) => {
  const [modalVisible, setModalVisible] = useState(false);
  // This sheet sits flush against the bottom of the window, directly over the
  // Android navigation bar / iOS home indicator.
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        style={styles.pickerTrigger}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.triggerText, !selectedValue && styles.placeholderText]} numberOfLines={1}>
          {selectedValue || placeholder}
        </Text>
        <Feather name="chevron-down" size={18} color="#64748B" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item) => (typeof item === 'string' ? item : item.value)}
              renderItem={({ item }) => {
                const val = typeof item === 'string' ? item : item.value;
                const isSelected = selectedValue === val;
                return (
                  <TouchableOpacity
                    style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                    onPress={() => {
                      onValueChange(val);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                      {val}
                    </Text>
                    {isSelected && <Feather name="check" size={16} color="#D32F2F" />}
                  </TouchableOpacity>
                );
              }}
              style={styles.flatList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  pickerTrigger: {
    height: 46,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: {
    fontSize: 14,
    color: '#0f172a',
    flex: 1,
  },
  placeholderText: {
    color: '#94a3b8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
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
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 4,
  },
  flatList: {
    paddingHorizontal: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  itemRowSelected: {
    backgroundColor: '#fff5f5',
    borderRadius: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#334155',
  },
  itemTextSelected: {
    color: '#D32F2F',
    fontWeight: '700',
  },
});
