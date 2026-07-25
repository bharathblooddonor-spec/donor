import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ShieldCheck, PhoneCall, MapPin, Building, HeartHandshake, Info } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export const AboutAPScreen = () => {
  const helplines = [
    { title: 'AP Emergency Blood Helpline', number: '108' },
    { title: 'Indian Red Cross Society AP', number: '0866-2575225' },
    { title: 'Vijayawada Blood Bank Network', number: '+91 866 2471234' },
    { title: 'GGH Guntur Blood Helpline', number: '+91 863 2220141' },
    { title: 'KGH Visakhapatnam Emergency', number: '+91 891 2564891' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Brand Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.logoCircle}>
          <Image source={{ uri: logoImg }} style={styles.logoImg} resizeMode="contain" />
        </View>
        <Text style={styles.heroTitle}>BHARATH BLOOD DONOR</Text>
        <Text style={styles.heroSubtitle}>Andhra Pradesh State Emergency Blood Network</Text>
        <Text style={styles.heroDesc}>
          Connecting verified blood donors across 26 districts of Andhra Pradesh with emergency patients, trauma units, and hospitals in real-time.
        </Text>
      </View>

      {/* AP Network Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.cardHeader}>NETWORK IMPACT IN AP</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>26</Text>
            <Text style={styles.statLabel}>AP Districts</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNum}>48,500+</Text>
            <Text style={styles.statLabel}>Verified Donors</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNum}>100%</Text>
            <Text style={styles.statLabel}>Free Voluntary</Text>
          </View>
        </View>
      </View>

      {/* Helplines Card */}
      <View style={styles.helplinesCard}>
        <Text style={styles.cardHeader}>24/7 AP BLOOD HELPLINES</Text>

        <View style={styles.helplinesList}>
          {helplines.map((h, i) => (
            <View key={i} style={styles.helplineItem}>
              <View style={styles.helplineLeft}>
                <PhoneCall size={16} color="#D32F2F" style={{ marginRight: 10 }} />
                <Text style={styles.helplineTitle}>{h.title}</Text>
              </View>
              <TouchableOpacity
                style={styles.callCallBtn}
                onPress={() => window.open(`tel:${h.number}`, '_self')}
                activeOpacity={0.7}
              >
                <Text style={styles.callCallText}>{h.number}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#fee2e2',
  },
  logoImg: {
    width: 60,
    height: 60,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D32F2F',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
    marginBottom: 10,
  },
  heroDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  statsCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  statNum: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  helplinesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  helplinesList: {
    gap: 10,
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
  },
  helplineTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  callCallBtn: {
    backgroundColor: '#fff5f5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  callCallText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '700',
  },
});
