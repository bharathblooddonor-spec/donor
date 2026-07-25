import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';

export const AboutAPScreen = () => {
  const helplines = [
    { title: 'AP Emergency Blood Helpline', number: '108' },
    { title: 'Indian Red Cross Society AP', number: '0866-2575225' },
    { title: 'Vijayawada Blood Bank Network', number: '+918662471234' },
    { title: 'GGH Guntur Blood Helpline', number: '+918632220141' },
    { title: 'KGH Visakhapatnam Emergency', number: '+918912564891' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <View style={styles.logoCircle}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
        </View>
        <Text style={styles.heroTitle}>BHARATH BLOOD DONOR</Text>
        <Text style={styles.heroSubtitle}>Andhra Pradesh State Emergency Blood Network</Text>
        <Text style={styles.heroDesc}>
          Connecting verified blood donors across 26 districts of Andhra Pradesh with emergency patients, trauma units, and hospitals in real-time.
        </Text>
      </View>

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

      <View style={styles.helplinesCard}>
        <Text style={styles.cardHeader}>24/7 AP BLOOD HELPLINES</Text>

        <View style={styles.helplinesList}>
          {helplines.map((h, i) => (
            <View key={i} style={styles.helplineItem}>
              <View style={styles.helplineLeft}>
                <Feather name="phone-call" size={15} color="#D32F2F" style={{ marginRight: 8 }} />
                <Text style={styles.helplineTitle}>{h.title}</Text>
              </View>
              <TouchableOpacity
                style={styles.callCallBtn}
                onPress={() => Linking.openURL(`tel:${h.number}`)}
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
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#fee2e2',
  },
  logoImg: {
    width: 54,
    height: 54,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#D32F2F',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  statsCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  statNum: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  helplinesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  helplinesList: {
    gap: 8,
  },
  helplineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  helplineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  helplineTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  callCallBtn: {
    backgroundColor: '#fff5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  callCallText: {
    color: '#D32F2F',
    fontSize: 11,
    fontWeight: '700',
  },
});
