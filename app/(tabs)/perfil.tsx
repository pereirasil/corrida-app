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
// import { LinearGradient } from 'expo-linear-gradient';
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
      {/* Header com foto e informações básicas */}
      <View
        style={[styles.header, { backgroundColor: colors.tint }]}
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
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estatísticas do mês */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Estatísticas do Mês</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{monthlyStats.totalDistance}</Text>
              <Text style={styles.statLabel}>km</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{monthlyStats.totalRuns}</Text>
              <Text style={styles.statLabel}>Corridas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{monthlyStats.averagePace}</Text>
              <Text style={styles.statLabel}>min/km</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{monthlyStats.caloriesBurned}</Text>
              <Text style={styles.statLabel}>Calorias</Text>
            </View>
          </View>
        </View>

        {/* Gráfico semanal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Progresso Semanal</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={weeklyStats}
              width={350}
              height={200}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#3498db',
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Recordes pessoais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏅 Recordes Pessoais</Text>
          {Object.entries(monthlyStats.personalBests).map(([distance, time]) => (
            <View key={distance} style={styles.recordCard}>
              <Text style={styles.recordDistance}>{distance}</Text>
              <Text style={styles.recordTime}>{time}</Text>
            </View>
          ))}
        </View>

        {/* Conquistas recentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Conquistas Recentes</Text>
          {recentAchievements.map(achievement => (
            <View key={achievement.id} style={styles.achievementCard}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Configurações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Configurações</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Notificações</Text>
              <Text style={styles.settingDescription}>Receber lembretes de corrida</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#bdc3c7', true: colors.tint }}
              thumbColor={notificationsEnabled ? colors.tint : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Localização</Text>
              <Text style={styles.settingDescription}>Compartilhar localização com amigos</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: '#bdc3c7', true: colors.tint }}
              thumbColor={locationEnabled ? colors.tint : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Sincronização de Música</Text>
              <Text style={styles.settingDescription}>Sincronizar música com amigos</Text>
            </View>
            <Switch
              value={musicSyncEnabled}
              onValueChange={setMusicSyncEnabled}
              trackColor={{ false: '#bdc3c7', true: colors.tint }}
              thumbColor={musicSyncEnabled ? colors.tint : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Botões de ação */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton} onPress={editProfile}>
            <Text style={styles.actionButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Ajuda', 'Central de ajuda e suporte')}>
            <Text style={styles.actionButtonText}>Ajuda e Suporte</Text>
          </TouchableOpacity>
          
                      <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
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
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    backgroundColor: 'white',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
                borderColor: '#16a34a',
  },
  editAvatarText: {
    fontSize: 14,
  },
  profileDetails: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  profileLevel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    borderRadius: 12,
  },
  recordCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordDistance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  recordTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  achievementCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  settingItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  actionButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    marginTop: 10,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
}); 