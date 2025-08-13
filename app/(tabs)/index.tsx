import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
// import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header com cor sólida */}
      <View
        style={[styles.header, { backgroundColor: colors.tint }]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Bom dia, Corredor! 🏃‍♂️</Text>
          <Text style={styles.subtitle}>Pronto para mais uma corrida?</Text>
        </View>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.headerImage}
        />
      </View>

      {/* Estatísticas rápidas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>12.5</Text>
          <Text style={styles.statLabel}>km esta semana</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>corridas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>5:23</Text>
          <Text style={styles.statLabel}>min/km</Text>
        </View>
      </View>

      {/* Próxima corrida */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próxima Corrida</Text>
        <TouchableOpacity style={styles.nextRunCard}>
          <View style={styles.nextRunInfo}>
            <Text style={styles.nextRunTitle}>Corrida com João</Text>
            <Text style={styles.nextRunTime}>Hoje às 18:00</Text>
            <Text style={styles.nextRunDistance}>5km • Parque da Cidade</Text>
          </View>
          <View style={styles.nextRunStatus}>
            <Text style={styles.statusText}>Confirmado</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Convites pendentes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Convites Pendentes</Text>
        <TouchableOpacity style={styles.inviteCard}>
          <View style={styles.inviteInfo}>
            <Text style={styles.inviteTitle}>Maria convidou você</Text>
            <Text style={styles.inviteDetails}>Corrida amanhã às 7:00 • 8km</Text>
          </View>
          <View style={styles.inviteActions}>
            <TouchableOpacity style={[styles.inviteButton, styles.acceptButton]}>
              <Text style={styles.acceptButtonText}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.inviteButton, styles.declineButton]}>
              <Text style={styles.declineButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      {/* Atividade recente */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Atividade Recente</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Corrida de ontem</Text>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  nextRunCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
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
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  nextRunTime: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '500',
    marginBottom: 4,
  },
  nextRunDistance: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  nextRunStatus: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  inviteCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
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
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  inviteDetails: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 10,
  },
  inviteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#27ae60',
  },
  declineButton: {
    backgroundColor: '#e74c3c',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  declineButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activityCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
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
    marginBottom: 10,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  activityTime: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  activityStats: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  activityStat: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
  },
});
