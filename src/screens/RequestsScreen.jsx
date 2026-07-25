import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AlertCircle, Plus, Heart, CheckCircle, Flag, Building2, Calendar, Phone, User } from 'lucide-react';
import { apDistricts, apBloodGroups } from '../data/apData';
import { apiService } from '../api/apiService';
import { PostRequestModal } from '../components/PostRequestModal';

export const RequestsScreen = () => {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All Blood Groups');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRequests = async () => {
    try {
      const data = await apiService.getRequests({
        district: selectedDistrict,
        bloodGroup: selectedBloodGroup
      });
      setRequests(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedDistrict, selectedBloodGroup]);

  const handlePostRequest = async (newRequestData) => {
    await apiService.createRequest(newRequestData);
    fetchRequests();
    alert('Your emergency request has been posted successfully!');
  };

  const handleIDonate = (req) => {
    const text = encodeURIComponent(`Hello ${req.contactName}, I saw your emergency blood request for ${req.patientName} (${req.bloodGroup}, ${req.units} units) at ${req.hospitalName}. I want to donate!`);
    window.open(`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  const handleMarkFulfilled = async (id) => {
    await apiService.fulfillRequest(id);
    fetchRequests();
    alert('Thank you! Request marked as fulfilled.');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Emergency Board Header Banner */}
      <View style={styles.emergencyCard}>
        <View style={styles.boardHeaderRow}>
          <View style={styles.boardBadge}>
            <Text style={styles.boardBadgeText}>EMERGENCY BOARD</Text>
          </View>
        </View>

        <View style={styles.boardBodyRow}>
          <View style={styles.boardTextCol}>
            <Text style={styles.boardTitle}>Need Blood Urgently?</Text>
            <Text style={styles.boardSubtitle}>
              Broadcast your request to thousands of volunteers across AP.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.postReqBtn}
            onPress={() => setIsModalOpen(true)}
            activeOpacity={0.85}
          >
            <Plus size={16} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.postReqBtnText}>Post Request</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Dropdowns Row */}
      <View style={styles.filtersRow}>
        <View style={styles.flex1}>
          <select
            value={selectedBloodGroup}
            onChange={(e) => setSelectedBloodGroup(e.target.value)}
            style={filterSelectStyle}
          >
            <option value="All Blood Groups">All Blood Groups</option>
            {apBloodGroups.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </View>

        <View style={styles.flex1}>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            style={filterSelectStyle}
          >
            <option value="All Districts">All Districts</option>
            {apDistricts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </View>
      </View>

      {/* Requests List */}
      <View style={styles.requestsList}>
        {requests.map((item) => (
          <View key={item.id} style={[styles.requestCard, item.fulfilled && styles.fulfilledCard]}>
            {/* Top Row: Blood Circle + Name + Units */}
            <View style={styles.cardTopRow}>
              <View style={styles.bloodReqCircle}>
                <Text style={styles.bloodReqCircleText}>{item.bloodGroup}</Text>
                <Text style={styles.bloodReqCircleSub}>REQUIRED</Text>
              </View>

              <View style={styles.patientMetaCol}>
                <View style={styles.patientNameRow}>
                  <Text style={styles.patientName}>{item.patientName}</Text>
                  {item.isUrgent && !item.fulfilled && (
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentBadgeText}>URGENT</Text>
                    </View>
                  )}
                  {item.fulfilled && (
                    <View style={styles.fulfilledBadge}>
                      <Text style={styles.fulfilledBadgeText}>FULFILLED</Text>
                    </View>
                  )}
                </View>

                <View style={styles.metaIconRow}>
                  <Building2 size={13} color="#64748B" style={{ marginRight: 4 }} />
                  <Text style={styles.metaText}>{item.hospitalName}</Text>
                </View>

                <View style={styles.metaIconRow}>
                  <Calendar size={13} color="#64748B" style={{ marginRight: 4 }} />
                  <Text style={styles.metaText}>{item.dateNeeded}</Text>
                </View>
              </View>

              <View style={styles.unitsPill}>
                <Text style={styles.unitsText}>{item.units} Units</Text>
              </View>
            </View>

            {/* Pink Detail Box */}
            <View style={styles.detailBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reason: </Text>
                <Text style={styles.detailValueBold}>{item.reason}</Text>
              </View>

              <View style={styles.detailRowBetween}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Contact: </Text>
                  <Text style={styles.detailValueBold}>{item.contactName}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone: </Text>
                  <Text style={styles.detailValueBold}>{item.phone}</Text>
                </View>
              </View>
            </View>

            {/* Buttons Row */}
            {!item.fulfilled ? (
              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.donateBtn}
                  onPress={() => handleIDonate(item)}
                  activeOpacity={0.85}
                >
                  <Heart size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.donateBtnText}>I Can Donate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.fulfillBtn}
                  onPress={() => handleMarkFulfilled(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.fulfillBtnText}>Mark Fulfilled</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Footer Flag */}
            <TouchableOpacity style={styles.reportFooter} activeOpacity={0.7}>
              <Flag size={12} color="#94a3b8" style={{ marginRight: 4 }} />
              <Text style={styles.reportText}>Report request</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <PostRequestModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePostRequest}
      />
    </ScrollView>
  );
};

const filterSelectStyle = {
  width: '100%',
  height: 44,
  borderRadius: 8,
  borderColor: '#cbd5e1',
  borderWidth: 1,
  paddingLeft: 12,
  paddingRight: 12,
  fontSize: 13,
  backgroundColor: '#ffffff',
  color: '#0f172a',
  outline: 'none',
  fontWeight: '600'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  emergencyCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  boardHeaderRow: {
    marginBottom: 8,
  },
  boardBadge: {
    backgroundColor: '#D32F2F',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  boardBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  boardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  boardTextCol: {
    flex: 1,
  },
  boardTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  boardSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 16,
  },
  postReqBtn: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  postReqBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  flex1: {
    flex: 1,
  },
  requestsList: {
    gap: 16,
    paddingBottom: 24,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  fulfilledCard: {
    opacity: 0.7,
    backgroundColor: '#f1f5f9',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bloodReqCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bloodReqCircleText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  bloodReqCircleSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 7,
    fontWeight: '800',
  },
  patientMetaCol: {
    flex: 1,
  },
  patientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  urgentBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgentBadgeText: {
    color: '#D32F2F',
    fontSize: 10,
    fontWeight: '800',
  },
  fulfilledBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fulfilledBadgeText: {
    color: '#16a34a',
    fontSize: 10,
    fontWeight: '800',
  },
  metaIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
  },
  unitsPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unitsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  detailBox: {
    backgroundColor: '#fff5f5',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
    marginBottom: 14,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  detailValueBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991b1b',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  donateBtn: {
    flex: 1,
    backgroundColor: '#D32F2F',
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  donateBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  fulfillBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fulfillBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  reportFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  reportText: {
    fontSize: 11,
    color: '#94a3b8',
  },
});
