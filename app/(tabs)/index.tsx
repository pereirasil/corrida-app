import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header com gradiente laranja */}
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Bom dia, Corredor! 🏃‍♂️</Text>
          <Text style={styles.subtitle}>Pronto para mais uma corrida?</Text>
        </View>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.headerImage}
        />
      </LinearGradient>

      {/* Estatísticas rápidas */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>12.5</Text>
          <Text style={styles.statLabel}>km esta semana</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.accent }]}>
          <Text style={[styles.statNumber, { color: colors.accent }]}>3</Text>
          <Text style={styles.statLabel}>corridas</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.success }]}>
          <Text style={[styles.statNumber, { color: colors.success }]}>5:23</Text>
          <Text style={styles.statLabel}>min/km</Text>
        </View>
      </View>

      {/* Próxima corrida */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Próxima Corrida</Text>
        <TouchableOpacity style={[styles.nextRunCard, { borderColor: colors.border }]}>
          <View style={styles.nextRunInfo}>
            <Text style={[styles.nextRunTitle, { color: colors.text }]}>Corrida com João</Text>
            <Text style={styles.nextRunTime}>Hoje às 18:00</Text>
            <Text style={styles.nextRunDistance}>5km • Parque da Cidade</Text>
          </View>
          <View style={[styles.nextRunStatus, { backgroundColor: colors.success }]}>
            <Text style={styles.statusText}>Confirmado</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Convites pendentes */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Convites Pendentes</Text>
        <TouchableOpacity style={[styles.inviteCard, { borderColor: colors.border }]}>
          <View style={styles.inviteInfo}>
            <Text style={[styles.inviteTitle, { color: colors.text }]}>Maria convidou você</Text>
            <Text style={styles.inviteDetails}>Corrida amanhã às 7:00 • 8km</Text>
          </View>
          <View style={styles.inviteActions}>
            <TouchableOpacity style={[styles.inviteButton, styles.acceptButton, { backgroundColor: colors.success }]}>
              <Text style={styles.acceptButtonText}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.inviteButton, styles.declineButton, { backgroundColor: colors.error }]}>
              <Text style={styles.declineButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      {/* Atividade recente */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Atividade Recente</Text>
        <View style={[styles.activityCard, { borderColor: colors.border }]}>
          <View style={styles.activityHeader}>
            <Text style={[styles.activityTitle, { color: colors.text }]}>Corrida de ontem</Text>
            <Text style={styles.activityTime}>Ontem às 17:30</Text>
          </View>
          <View style={styles.activityStats}>
            <Text style={styles.activityStat}>6.2km • 32:15 • 5:12 min/km</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 200,
    paddingHorizontal: 24,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  headerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: -30,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  nextRunCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextRunInfo: {
    flex: 1,
  },
  nextRunTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nextRunTime: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  nextRunDistance: {
    fontSize: 14,
    color: '#6B7280',
  },
  nextRunStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  inviteCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inviteInfo: {
    flex: 1,
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  inviteDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  inviteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  declineButton: {
    backgroundColor: '#EF4444',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  declineButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  activityStats: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  activityStat: {
    fontSize: 14,
    color: '#6B7280',
  },
});
