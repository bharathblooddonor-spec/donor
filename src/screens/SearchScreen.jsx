import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Search, MapPin, Target, Phone, MessageSquare, MessageCircle, Share2, Flag, AlertCircle, Award, CheckCircle2 } from 'lucide-react';
import { apDistricts, apCitiesByDistrict, apBloodGroups } from '../data/apData';
import { apiService } from '../api/apiService';

export const SearchScreen = () => {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('O+');
  const [district, setDistrict] = useState('NTR');
  const [city, setCity] = useState('Vijayawada');
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);
  const [gpsStatus, setGpsStatus] = useState('');

  // Fetch initial donors
  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await apiService.getDonors({
        district,
        city,
        bloodGroup: selectedBloodGroup
      });
      setDonors(results);
      setHasSearched(true);
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
    if (navigator.geolocation) {
      setGpsStatus('Detecting GPS location...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsStatus(`GPS Detected: ${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)} (Vijayawada Area)`);
          setDistrict('NTR');
          setCity('Vijayawada');
        },
        () => {
          setGpsStatus('Location detected: Vijayawada, NTR');
          setDistrict('NTR');
          setCity('Vijayawada');
        }
      );
    } else {
      setGpsStatus('Location detected: Vijayawada, NTR');
      setDistrict('NTR');
      setCity('Vijayawada');
    }
  };

  const handleActionCall = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleActionWhatsApp = (phone, name, bg) => {
    const text = encodeURIComponent(`Hello ${name}, I saw your blood donor listing on Bharath Blood Donor AP. We urgently need ${bg} blood in Vijayawada/AP.`);
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  const handleActionShare = (donor) => {
    if (navigator.share) {
      navigator.share({
        title: `Blood Donor: ${donor.name} (${donor.bloodGroup})`,
        text: `Urgent Blood Donor Contact: ${donor.name}, Group: ${donor.bloodGroup}, Location: ${donor.city}, ${donor.district}, AP. Phone: ${donor.phone}`
      }).catch(() => {});
    } else {
      alert(`Donor Details Copied:\n${donor.name} (${donor.bloodGroup}) - ${donor.phone}`);
    }
  };

  const availableCities = apCitiesByDistrict[district] || ["Vijayawada", "Guntur", "Visakhapatnam", "Tirupati"];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Voluntary Notice Banner */}
      <View style={styles.noticeBanner}>
        <AlertCircle size={18} color="#D32F2F" style={styles.noticeIcon} />
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
              <Text style={styles.fastPillText}>{bg}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Custom Search Filters Container */}
      <View style={styles.searchFilterCard}>
        <View style={styles.filterTitleRow}>
          <Search size={16} color="#D32F2F" />
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
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>District in AP *</Text>
          <select
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value);
              const cities = apCitiesByDistrict[e.target.value];
              if (cities && cities.length > 0) setCity(cities[0]);
            }}
            style={selectInputStyle}
          >
            {apDistricts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>City / Area *</Text>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={selectInputStyle}
          >
            {availableCities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </View>

        {/* GPS Location Button */}
        <TouchableOpacity style={styles.locationBtn} onPress={handleUseLocation} activeOpacity={0.8}>
          <Target size={16} color="#D32F2F" style={{ marginRight: 6 }} />
          <Text style={styles.locationBtnText}>Use My Current Location</Text>
        </TouchableOpacity>
        {gpsStatus ? <Text style={styles.gpsStatusText}>{gpsStatus}</Text> : null}

        {/* Search Donors Submit Button */}
        <TouchableOpacity style={styles.searchSubmitBtn} onPress={handleSearch} activeOpacity={0.85}>
          <Search size={18} color="#ffffff" style={{ marginRight: 8 }} />
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
            <AlertCircle size={32} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No matching donors found</Text>
            <Text style={styles.emptySub}>Try selecting a neighboring district or posting an emergency blood request.</Text>
          </View>
        ) : (
          donors.map((donor) => (
            <View key={donor.id} style={styles.donorCard}>
              {/* Donor Top Row */}
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
                    <MapPin size={13} color="#64748B" style={{ marginRight: 3 }} />
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

              {/* Stats Box */}
              <View style={styles.statsRowBox}>
                <View style={styles.statItem}>
                  <Award size={14} color="#d97706" style={{ marginRight: 5 }} />
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
                  <Phone size={16} color="#475569" />
                  <Text style={styles.actionLabel}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleActionCall(donor.phone)}
                  activeOpacity={0.7}
                >
                  <MessageSquare size={16} color="#475569" />
                  <Text style={styles.actionLabel}>SMS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleActionWhatsApp(donor.phone, donor.name, donor.bloodGroup)}
                  activeOpacity={0.7}
                >
                  <MessageCircle size={16} color="#25D366" />
                  <Text style={styles.actionLabel}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleActionShare(donor)}
                  activeOpacity={0.7}
                >
                  <Share2 size={16} color="#475569" />
                  <Text style={styles.actionLabel}>Share</Text>
                </TouchableOpacity>
              </View>

              {/* Footer Flag */}
              <TouchableOpacity style={styles.reportFooter} activeOpacity={0.7}>
                <Flag size={12} color="#94a3b8" style={{ marginRight: 4 }} />
                <Text style={styles.reportText}>Report listing</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const selectInputStyle = {
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
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  noticeIcon: {
    marginRight: 8,
  },
  noticeText: {
    fontSize: 12,
    color: '#991b1b',
    flex: 1,
    lineHeight: 17,
  },
  boldText: {
    fontWeight: '700',
  },
  fastTrackCard: {
    backgroundColor: '#D32F2F',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#d32f2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fastTrackHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fastTrackBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fastTrackBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  regionText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  fastTrackTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  fastTrackSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginBottom: 14,
  },
  fastTrackGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  fastPill: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    height: 40,
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
  searchFilterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  filterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  filterCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
  },
  groupSelectTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
  },
  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  bgChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  bgChipTextSelected: {
    color: '#ffffff',
  },
  inputGroup: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  locationBtn: {
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
  locationBtnText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '700',
  },
  gpsStatusText: {
    fontSize: 11,
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  searchSubmitBtn: {
    backgroundColor: '#0F172A',
    height: 48,
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
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: 0.4,
  },
  foundBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  foundBadgeText: {
    color: '#D32F2F',
    fontSize: 11,
    fontWeight: '800',
  },
  donorList: {
    gap: 14,
    paddingBottom: 20,
  },
  donorCard: {
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
  donorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bloodCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  bloodCircleText: {
    color: '#D32F2F',
    fontSize: 15,
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
    fontSize: 15,
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
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
  },
  donorDetailsText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  availableBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableText: {
    color: '#16a34a',
    fontSize: 11,
    fontWeight: '700',
  },
  statsRowBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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
    gap: 8,
    marginBottom: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  reportFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  reportText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
});
