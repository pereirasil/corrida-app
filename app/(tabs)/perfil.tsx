import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LineChart } from 'react-native-chart-kit';

export default function PerfilScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [musicSyncEnabled, setMusicSyncEnabled] = useState(true);

  // Dados mockados para demonstração
  const weeklyStats = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [{
      data: [5.2, 0, 8.1, 6.5, 0, 12.3, 7.8]
    }]
  };

  const monthlyStats = {
    totalDistance: 156.7,
    totalTime: '18:45:30',
    averagePace: '5:23',
    totalRuns: 23,
    caloriesBurned: 12450,
    personalBests: {
      '5km': '24:15',
      '10km': '52:30',
      'Meia Maratona': '1:58:45'
    }
  };

  const recentAchievements = [
    { id: '1', title: 'Primeira Semana', description: 'Correu 7 dias seguidos', icon: '🏆' },
    { id: '2', title: 'Velocidade', description: 'Quebrou recorde de 5km', icon: '⚡' },
    { id: '3', title: 'Distância', description: 'Primeira corrida de 15km', icon: '🎯' },
  ];

  const handleLogout = () => {
    console.log('🔘 Botão de logout pressionado');
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => {
          console.log('✅ Usuário confirmou logout');
          logout();
        }},
      ]
    );
  };

  const editProfile = () => {
    Alert.alert('Editar Perfil', 'Funcionalidade de edição de perfil');
  };

  return (
    <View style={styles.container}>
      {/* Header com gradiente laranja */}
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={styles.header}
      >
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>A</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton} onPress={editProfile}>
              <Text style={styles.editAvatarText}>✏️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{user?.name || 'Usuário'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'email@exemplo.com'}</Text>
            <Text style={styles.profileLevel}>Corredor Nível 3</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estatísticas do mês */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Estatísticas do Mês</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { borderLeftColor: colors.primary }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{monthlyStats.totalDistance}</Text>
              <Text style={styles.statLabel}>km</Text>
            </View>
            <View style={[styles.statItem, { borderLeftColor: colors.accent }]}>
              <Text style={[styles.statValue, { color: colors.accent }]}>{monthlyStats.totalRuns}</Text>
              <Text style={styles.statLabel}>corridas</Text>
            </View>
            <View style={[styles.statItem, { borderLeftColor: colors.success }]}>
              <Text style={[styles.statValue, { color: colors.success }]}>{monthlyStats.averagePace}</Text>
              <Text style={styles.statLabel}>min/km</Text>
            </View>
            <View style={[styles.statItem, { borderLeftColor: colors.warning }]}>
              <Text style={[styles.statValue, { color: colors.warning }]}>{monthlyStats.caloriesBurned}</Text>
              <Text style={styles.statLabel}>calorias</Text>
            </View>
          </View>
        </View>

        {/* Gráfico semanal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📈 Progresso Semanal</Text>
          <View style={[styles.chartContainer, { borderColor: colors.border }]}>
            <LineChart
              data={weeklyStats}
              width={300}
              height={180}
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(242, 101, 34, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: colors.primary,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Recordes pessoais */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🏆 Recordes Pessoais</Text>
          <View style={styles.personalBestsContainer}>
            {Object.entries(monthlyStats.personalBests).map(([distance, time]) => (
              <View key={distance} style={[styles.personalBestItem, { borderColor: colors.border }]}>
                <Text style={[styles.personalBestDistance, { color: colors.text }]}>{distance}</Text>
                <Text style={[styles.personalBestTime, { color: colors.primary }]}>{time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Conquistas recentes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🎖️ Conquistas Recentes</Text>
          {recentAchievements.map((achievement) => (
            <View key={achievement.id} style={[styles.achievementItem, { borderColor: colors.border }]}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <View style={styles.achievementInfo}>
                <Text style={[styles.achievementTitle, { color: colors.text }]}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Configurações */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>⚙️ Configurações</Text>
          <View style={[styles.settingsContainer, { borderColor: colors.border }]}>
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Notificações</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={notificationsEnabled ? colors.primary : '#f4f3f4'}
              />
            </View>
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Localização</Text>
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={locationEnabled ? colors.primary : '#f4f3f4'}
              />
            </View>
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Sincronização de Música</Text>
              <Switch
                value={musicSyncEnabled}
                onValueChange={setMusicSyncEnabled}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={musicSyncEnabled ? colors.primary : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Botão de logout */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: colors.error }]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarText: {
    fontSize: 16,
  },
  profileDetails: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  profileLevel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    borderRadius: 16,
  },
  personalBestsContainer: {
    gap: 12,
  },
  personalBestItem: {
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
  personalBestDistance: {
    fontSize: 16,
    fontWeight: '600',
  },
  personalBestTime: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  achievementItem: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingsContainer: {
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
}); 