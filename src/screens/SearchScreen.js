import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking, Share } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { apDistricts, apCitiesByDistrict, apBloodGroups } from '../data/apData';
import { apiService } from '../api/apiService';
import { NativePicker } from '../components/NativePicker';

export const SearchScreen = () => {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('O+');
  const [district, setDistrict] = useState('NTR');
  const [city, setCity] = useState('Vijayawada');
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await apiService.getDonors({
        district,
        city,
        bloodGroup: selectedBloodGroup
      });
      setDonors(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleFastTrack = (bg) => {
    setSelectedBloodGroup(bg);
    setDistrict('NTR');
    setCity('Vijayawada');
    handleSearch();
  };

  const handleUseLocation = () => {
    setGpsStatus('GPS Location Detected: Vijayawada, NTR District');
    setDistrict('NTR');
    setCity('Vijayawada');
  };

  const handleActionCall = (phone) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Phone Call', `Dialing ${phone}`);
    });
  };

  const handleActionWhatsApp = (phone, name, bg) => {
    const text = encodeURIComponent(`Hello ${name}, I found your blood donor listing on Bharath Blood Donor AP. We urgently need ${bg} blood in AP.`);
    const url = `whatsapp://send?phone=${phone.replace(/[^0-9]/g, '')}&text=${text}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`).catch(() => {});
    });
  };

  const handleActionShare = async (donor) => {
    try {
      await Share.share({
        message: `Urgent Blood Donor Contact:\nName: ${donor.name}\nBlood Group: ${donor.bloodGroup}\nLocation: ${donor.city}, ${donor.district}, AP\nPhone: ${donor.phone}`
      });
    } catch (error) {
      console.log(error);
    }
  };

  const availableCities = apCitiesByDistrict[district] || ["Vijayawada", "Guntur", "Visakhapatnam", "Tirupati"];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Voluntary Notice Banner */}
      <View style={styles.noticeBanner}>
        <Feather name="alert-circle" size={18} color="#D32F2F" style={styles.noticeIcon} />
        <Text style={styles.noticeText}>
          <Text style={styles.boldText}>Voluntary Donation: </Text>
          This is a free platform representing verified donors of Andhra Pradesh. Never pay anyone for blood!
        </Text>
      </View>

      {/* Vijayawada Fast-Track Card */}
      <View style={styles.fastTrackCard}>
        <View style={styles.fastTrackHeaderRow}>
          <View style={styles.fastTrackBadge}>
            <Text style={styles.fastTrackBadgeText}>⚡ VIJAYAWADA FAST-TRACK</Text>
          </View>
          <Text style={styles.regionText}>Krishna / NTR region</Text>
        </View>

        <Text style={styles.fastTrackTitle}>Find Instant Donors in Vijayawada</Text>
        <Text style={styles.fastTrackSub}>Click on a blood group below to search directly in Vijayawada city.</Text>

        <View style={styles.fastTrackGrid}>
          {['O+', 'B+', 'A+', 'AB+'].map((bg) => (
            <TouchableOpacity
              key={bg}
              style={[styles.fastPill, selectedBloodGroup === bg && styles.fastPillSelected]}
              onPress={() => handleFastTrack(bg)}
              activeOpacity={0.8}
            >
              <Text style={[styles.fastPillText, selectedBloodGroup === bg && styles.fastPillTextSelected]}>
                {bg}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Custom Search Filters Container */}
      <View style={styles.searchFilterCard}>
        <View style={styles.filterTitleRow}>
          <Feather name="search" size={15} color="#D32F2F" />
          <Text style={styles.filterCardTitle}>CUSTOM SEARCH FILTERS</Text>
        </View>

        <Text style={styles.groupSelectTitle}>Select Blood Group Required:</Text>

        {/* 19 Blood Groups Grid */}
        <View style={styles.bloodGrid}>
          {apBloodGroups.map((bg) => {
            const isSelected = selectedBloodGroup === bg;
            const isRare = bg.includes('Bombay') || bg.includes('Rh-null');
            return (
              <TouchableOpacity
                key={bg}
                style={[
                  styles.bgChip,
                  isSelected && styles.bgChipSelected,
                  isRare && styles.bgChipRare
                ]}
                onPress={() => setSelectedBloodGroup(bg)}
                activeOpacity={0.7}
              >
                <Text style={[styles.bgChipText, isSelected && styles.bgChipTextSelected]}>
                  {bg}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* District & City Selectors */}
        <NativePicker
          label="District in AP *"
          selectedValue={district}
          onValueChange={(val) => {
            setDistrict(val);
            const cities = apCitiesByDistrict[val];
            if (cities && cities.length > 0) setCity(cities[0]);
          }}
          items={apDistricts}
        />

        <NativePicker
          label="City / Area *"
          selectedValue={city}
          onValueChange={setCity}
          items={availableCities}
        />

        {/* GPS Location Button */}
        <TouchableOpacity style={styles.locationBtn} onPress={handleUseLocation} activeOpacity={0.8}>
          <Feather name="target" size={15} color="#D32F2F" style={{ marginRight: 6 }} />
          <Text style={styles.locationBtnText}>Use My Current Location</Text>
        </TouchableOpacity>
        {gpsStatus ? <Text style={styles.gpsStatusText}>{gpsStatus}</Text> : null}

        {/* Search Donors Submit Button */}
        <TouchableOpacity style={styles.searchSubmitBtn} onPress={handleSearch} activeOpacity={0.85}>
          <Feather name="search" size={17} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.searchSubmitText}>Search Blood Donors</Text>
        </TouchableOpacity>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          {selectedBloodGroup} DONORS IN {city.toUpperCase()}
        </Text>
        <View style={styles.foundBadge}>
          <Text style={styles.foundBadgeText}>{donors.length} Found</Text>
        </View>
      </View>

      {/* Donors List */}
      <View style={styles.donorList}>
        {donors.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="alert-circle" size={32} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No matching donors found</Text>
            <Text style={styles.emptySub}>Try selecting another district or posting an emergency blood request.</Text>
          </View>
        ) : (
          donors.map((donor) => (
            <View key={donor.id} style={styles.donorCard}>
              <View style={styles.donorHeader}>
                <View style={styles.bloodCircle}>
                  <Text style={styles.bloodCircleText}>{donor.bloodGroup}</Text>
                  <Text style={styles.bloodCircleSub}>GROUP</Text>
                </View>

                <View style={styles.donorMetaColumn}>
                  <View style={styles.donorNameRow}>
                    <Text style={styles.donorName}>{donor.name}</Text>
                    {donor.isVerified && <View style={styles.onlineDot} />}
                  </View>

                  <View style={styles.locationRow}>
                    <Feather name="map-pin" size={12} color="#64748B" style={{ marginRight: 3 }} />
                    <Text style={styles.locationText}>{donor.city}, {donor.district}</Text>
                  </View>

                  <Text style={styles.donorDetailsText}>
                    {donor.age} yrs • {donor.gender}
                  </Text>
                </View>

                <View style={styles.availableBadge}>
                  <Text style={styles.availableText}>{donor.status}</Text>
                </View>
              </View>

              <View style={styles.statsRowBox}>
                <View style={styles.statItem}>
                  <Feather name="award" size={13} color="#d97706" style={{ marginRight: 4 }} />
                  <Text style={styles.statText}>
                    <Text style={styles.boldText}>{donor.donationsTotal}</Text> donations total
                  </Text>
                </View>

                <Text style={styles.statText}>
                  Last Donated: <Text style={styles.boldText}>{donor.lastDonated}</Text>
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsGrid}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleActionCall(donor.phone)}
                  activeOpacity={0.7}
                >
                  <Feather name="phone" size={15} color="#475569" />
                  <Text style={styles.actionLabel}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleActionCall(donor.phone)}
                  activeOpacity={0.7}
                >
                  <Feather name="message-square" size={15} color="#475569" />
                  <Text style={styles.actionLabel}>SMS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleActionWhatsApp(donor.phone, donor.name, donor.bloodGroup)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                  <Text style={styles.actionLabel}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleActionShare(donor)}
                  activeOpacity={0.7}
                >
                  <Feather name="share-2" size={15} color="#475569" />
                  <Text style={styles.actionLabel}>Share</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.reportFooter} activeOpacity={0.7}>
                <Feather name="flag" size={11} color="#94a3b8" style={{ marginRight: 4 }} />
                <Text style={styles.reportText}>Report listing</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
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
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  noticeIcon: {
    marginRight: 8,
  },
  noticeText: {
    fontSize: 11,
    color: '#991b1b',
    flex: 1,
    lineHeight: 16,
  },
  boldText: {
    fontWeight: '700',
  },
  fastTrackCard: {
    backgroundColor: '#D32F2F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
  },
  fastTrackHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fastTrackBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  fastTrackBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  regionText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  fastTrackTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 3,
  },
  fastTrackSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    marginBottom: 12,
  },
  fastTrackGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  fastPill: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  fastPillSelected: {
    backgroundColor: '#ffffff',
  },
  fastPillText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  fastPillTextSelected: {
    color: '#D32F2F',
  },
  searchFilterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  filterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  filterCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  groupSelectTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  bgChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    minWidth: '22%',
    alignItems: 'center',
  },
  bgChipSelected: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
  },
  bgChipRare: {
    minWidth: '47%',
  },
  bgChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  bgChipTextSelected: {
    color: '#ffffff',
  },
  locationBtn: {
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
  locationBtnText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '700',
  },
  gpsStatusText: {
    fontSize: 11,
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  searchSubmitBtn: {
    backgroundColor: '#0F172A',
    height: 46,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSubmitText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
  },
  foundBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  foundBadgeText: {
    color: '#D32F2F',
    fontSize: 10,
    fontWeight: '800',
  },
  donorList: {
    gap: 12,
    paddingBottom: 24,
  },
  donorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  donorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bloodCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  bloodCircleText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '800',
  },
  bloodCircleSub: {
    color: '#D32F2F',
    fontSize: 8,
    fontWeight: '700',
  },
  donorMetaColumn: {
    flex: 1,
  },
  donorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  donorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  locationText: {
    fontSize: 11,
    color: '#64748B',
  },
  donorDetailsText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  availableBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  availableText: {
    color: '#16a34a',
    fontSize: 10,
    fontWeight: '700',
  },
  statsRowBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 11,
    color: '#475569',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
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
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 6,
  },
  emptySub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 3,
  },
});
