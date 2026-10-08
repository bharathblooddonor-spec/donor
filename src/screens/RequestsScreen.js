import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { apDistricts, apBloodGroups } from '../data/apData';
import { apiService } from '../api/apiService';
import { PostRequestModal } from '../components/PostRequestModal';
import { NativePicker } from '../components/NativePicker';

export const RequestsScreen = () => {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All Blood Groups');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const requestIdRef = useRef(0);

  const fetchRequests = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getRequests({
        district: selectedDistrict,
        bloodGroup: selectedBloodGroup
      });
      if (requestId !== requestIdRef.current) return;
      setRequests(data);
    } catch (e) {
      if (requestId !== requestIdRef.current) return;
      setRequests([]);
      setError(e.message || 'Something went wrong while loading requests.');
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [selectedDistrict, selectedBloodGroup]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handlePostRequest = async (newRequestData) => {
    try {
      await apiService.createRequest(newRequestData);
      Alert.alert('Success', 'Your emergency request has been broadcast across AP.');
      fetchRequests();
    } catch (e) {
      Alert.alert('Could not post request', e.message || 'Please try again.');
    }
  };

  const handleIDonate = async (req) => {
    const user = authService.getCurrentUser();
    if (user) {
      const check = await apiService.canDonorAcceptRequest(user.uid);
      if (!check.allowed) {
        Alert.alert('Donation Unavailable', check.message);
        return;
      }
    }

    const text = encodeURIComponent(`Hello ${req.contactName}, I saw your emergency blood request for ${req.patientName} (${req.bloodGroup}, ${req.units} units) at ${req.hospitalName}. I want to donate!`);
    const url = `whatsapp://send?phone=${req.phone.replace(/[^0-9]/g, '')}&text=${text}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}?text=${text}`).catch(() => {});
    });
  };

  const handleMarkFulfilled = async (item) => {
    const reqId = item?.id || item;
    Alert.alert(
      'Fulfill Request',
      'Was this blood request fulfilled by a blood donation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, I Donated Blood',
          onPress: async () => {
            try {
              const currentUid = authService.getCurrentUser()?.uid;
              await apiService.fulfillRequestWithDonor({ requestId: reqId, donorId: currentUid });
              Alert.alert(
                'Thank You For Donating ❤️',
                'Your donation has been confirmed! Your donor profile is temporarily in cooldown to ensure safe recovery.'
              );
              fetchRequests();
            } catch (e) {
              Alert.alert('Could not update request', e.message || 'Please try again.');
            }
          },
        },
        {
          text: 'Yes, Fulfilled (Other)',
          onPress: async () => {
            try {
              await apiService.fulfillRequest(reqId);
              Alert.alert('Thank you', 'Request marked as fulfilled.');
              fetchRequests();
            } catch (e) {
              Alert.alert('Could not update request', e.message || 'Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleReportRequest = (item) => {
    Alert.alert(
      'Report this request',
      `Report the request for ${item.patientName} as fake, resolved, or abusive? Our team reviews every report.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.reportListing({
                listingType: 'request',
                listingId: item.id,
                reason: 'Reported from emergency board',
              });
              Alert.alert('Thank you', 'This request has been reported for review.');
            } catch (e) {
              Alert.alert('Could not send report', e.message);
            }
          },
        },
      ]
    );
  };

  const bloodGroupOptions = ['All Blood Groups', ...apBloodGroups];
  const districtOptions = ['All Districts', ...apDistricts];

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
            <Feather name="plus" size={15} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.postReqBtnText}>Post Request</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Dropdowns Row */}
      <View style={styles.filtersRow}>
        <View style={styles.flex1}>
          <NativePicker
            selectedValue={selectedBloodGroup}
            onValueChange={setSelectedBloodGroup}
            items={bloodGroupOptions}
          />
        </View>

        <View style={styles.flex1}>
          <NativePicker
            selectedValue={selectedDistrict}
            onValueChange={setSelectedDistrict}
            items={districtOptions}
          />
        </View>
      </View>

      {/* Requests List */}
      <View style={styles.requestsList}>
        {loading && (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color="#D32F2F" />
            <Text style={styles.stateTitle}>Loading emergency requests…</Text>
          </View>
        )}

        {!loading && error && (
          <View style={[styles.stateBox, styles.errorBox]}>
            <Feather name="wifi-off" size={32} color="#D32F2F" />
            <Text style={styles.errorTitle}>Could not load requests</Text>
            <Text style={styles.stateSub}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={fetchRequests}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <Feather name="refresh-cw" size={14} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && requests.length === 0 && (
          <View style={styles.stateBox}>
            <Feather name="inbox" size={32} color="#94a3b8" />
            <Text style={styles.stateTitle}>No active requests</Text>
            <Text style={styles.stateSub}>
              There are no open blood requests matching these filters right now.
            </Text>
          </View>
        )}

        {!loading && !error && requests.map((item) => (
          <View key={item.id} style={[styles.requestCard, item.fulfilled && styles.fulfilledCard]}>
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
                  <Feather name="briefcase" size={12} color="#64748B" style={{ marginRight: 4 }} />
                  <Text style={styles.metaText}>{item.hospitalName}</Text>
                </View>

                <View style={styles.metaIconRow}>
                  <Feather name="calendar" size={12} color="#64748B" style={{ marginRight: 4 }} />
                  <Text style={styles.metaText}>{item.dateNeeded}</Text>
                </View>
              </View>

              <View style={styles.unitsPill}>
                <Text style={styles.unitsText}>{item.units} Units</Text>
              </View>
            </View>

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

            {!item.fulfilled ? (
              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.donateBtn}
                  onPress={() => handleIDonate(item)}
                  activeOpacity={0.85}
                >
                  <Feather name="heart" size={15} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.donateBtnText}>I Can Donate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.fulfillBtn}
                  onPress={() => handleMarkFulfilled(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.fulfillBtnText}>Mark Fulfilled</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.reportFooter}
              onPress={() => handleReportRequest(item)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Report the request for ${item.patientName}`}
            >
              <Feather name="flag" size={11} color="#94a3b8" style={{ marginRight: 4 }} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  emergencyCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  boardHeaderRow: {
    marginBottom: 6,
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
  },
  boardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  boardTextCol: {
    flex: 1,
  },
  boardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  boardSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 15,
  },
  postReqBtn: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  postReqBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  flex1: {
    flex: 1,
  },
  stateBox: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  errorBox: {
    borderColor: '#fee2e2',
  },
  stateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991b1b',
    marginTop: 8,
  },
  stateSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D32F2F',
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 8,
    marginTop: 14,
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  requestsList: {
    gap: 14,
    paddingBottom: 24,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  fulfilledCard: {
    opacity: 0.7,
    backgroundColor: '#f1f5f9',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bloodReqCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  bloodReqCircleText: {
    color: '#ffffff',
    fontSize: 14,
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
    gap: 6,
    marginBottom: 3,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  urgentBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgentBadgeText: {
    color: '#D32F2F',
    fontSize: 9,
    fontWeight: '800',
  },
  fulfilledBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fulfilledBadgeText: {
    color: '#16a34a',
    fontSize: 9,
    fontWeight: '800',
  },
  metaIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
  },
  unitsPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  unitsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  detailBox: {
    backgroundColor: '#fff5f5',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#fee2e2',
    marginBottom: 12,
    gap: 4,
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
    gap: 6,
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  detailValueBold: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991b1b',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  donateBtn: {
    flex: 1,
    backgroundColor: '#D32F2F',
    height: 42,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donateBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  fulfillBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fulfillBtnText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  reportFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  reportText: {
    fontSize: 10,
    color: '#94a3b8',
  },
});
