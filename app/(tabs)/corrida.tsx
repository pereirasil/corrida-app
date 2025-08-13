import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useMusicSync } from '@/hooks/useMusicSync';
import { useRunningTracker } from '@/hooks/useRunningTracker';
// import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Polyline } from 'react-native-maps';

const { width } = Dimensions.get('window');

export default function CorridaScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const {
    isRunning,
    currentSession,
    startRunning,
    pauseRunning,
    resumeRunning,
    stopRunning,
    getCurrentMetrics,
    getCurrentRoute,
    formatTime,
    formatPace,
  } = useRunningTracker();

  const {
    currentSession: musicSession,
    isHost: isMusicHost,
    isConnected: isMusicConnected,
    currentTrack,
    isPlaying: isMusicPlaying,
    currentTime: musicTime,
    playMusic,
    pauseMusic,
    nextTrack,
    previousTrack,
    createMusicSession,
    joinMusicSession,
    leaveMusicSession,
  } = useMusicSync();

  const [showMusicControls, setShowMusicControls] = useState(false);

  const currentMetrics = getCurrentMetrics();
  const routeCoordinates = getCurrentRoute().map(point => ({
    latitude: point.latitude,
    longitude: point.longitude,
  }));

  const startRun = async () => {
    const success = await startRunning();
    if (success) {
      // Criar sessão de música se não existir
      if (!musicSession) {
        const mockPlaylist = [
          { id: '1', title: 'Running Song', artist: 'Fitness Artist', duration: 180 },
          { id: '2', title: 'Motivation', artist: 'Energy Band', duration: 200 },
          { id: '3', title: 'Endurance', artist: 'Power Group', duration: 240 },
        ];
        await createMusicSession(mockPlaylist);
      }
    }
  };

  const pauseRun = () => {
    pauseRunning();
    if (isMusicHost) {
      pauseMusic();
    }
  };

  const resumeRun = () => {
    resumeRunning();
    if (isMusicHost) {
      playMusic();
    }
  };

  const stopRun = () => {
    Alert.alert(
      'Finalizar Corrida',
      'Tem certeza que deseja finalizar esta corrida?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Finalizar', style: 'destructive', onPress: () => {
          stopRunning();
          leaveMusicSession();
        }},
      ]
    );
  };

  const inviteFriend = () => {
    Alert.alert(
      'Convidar Amigo',
      'Enviar convite para correr junto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar', onPress: () => {
          Alert.alert('Convite enviado!', 'Seu amigo receberá uma notificação.');
        }},
      ]
    );
  };

  const toggleMusicControls = () => {
    setShowMusicControls(!showMusicControls);
  };

  const handleMusicControl = (action: 'play' | 'pause' | 'next' | 'previous') => {
    if (!isMusicHost) {
      Alert.alert('Controle de Música', 'Apenas o host pode controlar a música');
      return;
    }

    switch (action) {
      case 'play':
        playMusic();
        break;
      case 'pause':
        pauseMusic();
        break;
      case 'next':
        nextTrack();
        break;
      case 'previous':
        previousTrack();
        break;
    }
  };

  const joinMusicSessionPrompt = () => {
    Alert.prompt(
      'Entrar na Sessão de Música',
      'Digite o código da sessão:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Entrar', onPress: async (sessionCode) => {
          if (sessionCode) {
            const success = await joinMusicSession(sessionCode);
            if (!success) {
              Alert.alert('Erro', 'Código de sessão inválido');
            }
          }
        }},
      ],
      'plain-text'
    );
  };

  return (
    <View style={styles.container}>
      {/* Header da corrida */}
      <View
        style={[styles.header, { backgroundColor: colors.tint }]}
      >
        <Text style={styles.headerTitle}>Corrida</Text>
        <TouchableOpacity style={styles.inviteButton} onPress={inviteFriend}>
          <Text style={styles.inviteButtonText}>Convidar Amigo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Mapa */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: -23.5505,
              longitude: -46.6333,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
            showsMyLocationButton
          >
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeWidth={3}
                strokeColor={colors.tint}
              />
            )}
          </MapView>
        </View>

        {/* Métricas principais */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {currentMetrics ? formatTime(currentMetrics.elapsedTime) : '00:00:00'}
              </Text>
              <Text style={styles.metricLabel}>Tempo</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {currentMetrics ? (currentMetrics.distance / 1000).toFixed(2) : '0.00'}
              </Text>
              <Text style={styles.metricLabel}>km</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {currentMetrics && currentMetrics.pace > 0 ? formatPace(currentMetrics.pace) : '0:00'}
              </Text>
              <Text style={styles.metricLabel}>min/km</Text>
            </View>
          </View>
          
          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {currentMetrics ? currentMetrics.speed.toFixed(1) : '0.0'}
              </Text>
              <Text style={styles.metricLabel}>km/h</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {currentMetrics ? currentMetrics.calories : '0'}
              </Text>
              <Text style={styles.metricLabel}>Calorias</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {currentMetrics ? currentMetrics.steps : '0'}
              </Text>
              <Text style={styles.metricLabel}>Passos</Text>
            </View>
          </View>
        </View>

        {/* Controles de corrida */}
        <View style={styles.controlsContainer}>
          {!isRunning ? (
            <TouchableOpacity style={styles.startButton} onPress={startRun}>
              <Text style={styles.startButtonText}>Iniciar Corrida</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.runningControls}>
              <TouchableOpacity 
                style={styles.pauseButton} 
                onPress={currentSession?.isActive ? pauseRun : resumeRun}
              >
                <Text style={styles.pauseButtonText}>
                  {currentSession?.isActive ? 'Pausar' : 'Retomar'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stopButton} onPress={stopRun}>
                <Text style={styles.stopButtonText}>Parar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Controles de música */}
        <View style={styles.musicContainer}>
          <View style={styles.musicHeader}>
            <Text style={styles.sectionTitle}>🎵 Música Sincronizada</Text>
            <TouchableOpacity onPress={toggleMusicControls}>
              <Text style={styles.toggleButton}>
                {showMusicControls ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
          </View>

          {isMusicConnected ? (
            <>
              {currentTrack && (
                <View style={styles.currentTrackInfo}>
                  <Text style={styles.trackTitle}>{currentTrack.title}</Text>
                  <Text style={styles.trackArtist}>{currentTrack.artist}</Text>
                  <Text style={styles.trackStatus}>
                    {isMusicPlaying ? '▶ Tocando' : '⏸ Pausado'}
                  </Text>
                </View>
              )}

              {showMusicControls && (
                <View style={styles.musicControls}>
                  <TouchableOpacity 
                    style={styles.musicButton}
                    onPress={() => handleMusicControl('previous')}
                  >
                    <Text style={styles.musicButtonText}>⏮</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.musicButton}
                    onPress={() => handleMusicControl(isMusicPlaying ? 'pause' : 'play')}
                  >
                    <Text style={styles.musicButtonText}>
                      {isMusicPlaying ? '⏸' : '▶'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.musicButton}
                    onPress={() => handleMusicControl('next')}
                  >
                    <Text style={styles.musicButtonText}>⏭</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.musicSessionInfo}>
                <Text style={styles.sessionInfo}>
                  {isMusicHost ? '🎵 Você é o DJ' : '🎵 Conectado ao grupo'}
                </Text>
                <TouchableOpacity 
                  style={styles.leaveSessionButton}
                  onPress={leaveMusicSession}
                >
                  <Text style={styles.leaveSessionButtonText}>Sair da Sessão</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.musicSetup}>
              <Text style={styles.musicInfo}>Nenhuma sessão de música ativa</Text>
              <View style={styles.musicSetupButtons}>
                <TouchableOpacity 
                  style={styles.setupButton}
                  onPress={() => createMusicSession([])}
                >
                  <Text style={styles.setupButtonText}>Criar Sessão</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.setupButton}
                  onPress={joinMusicSessionPrompt}
                >
                  <Text style={styles.setupButtonText}>Entrar na Sessão</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Status da corrida em grupo */}
        <View style={styles.groupStatusContainer}>
          <Text style={styles.sectionTitle}>👥 Corrida em Grupo</Text>
          <View style={styles.groupMember}>
            <View style={styles.memberAvatar}>
              <Text style={styles.memberInitial}>V</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>Você</Text>
              <Text style={styles.memberStatus}>
                {isRunning ? 'Correndo' : 'Parado'} • {currentMetrics ? formatTime(currentMetrics.elapsedTime) : '00:00:00'}
              </Text>
            </View>
            <View style={styles.memberDistance}>
              <Text style={styles.memberDistanceText}>
                {currentMetrics ? (currentMetrics.distance / 1000).toFixed(2) : '0.00'} km
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.addMemberButton}>
            <Text style={styles.addMemberButtonText}>+ Adicionar Amigo</Text>
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
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  inviteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  inviteButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 250,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  metricRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  metricCard: {
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
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  controlsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  runningControls: {
    flexDirection: 'row',
    gap: 15,
  },
  pauseButton: {
    flex: 1,
    backgroundColor: '#f39c12',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  pauseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  stopButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  musicContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  musicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  toggleButton: {
    fontSize: 20,
    color: '#3498db',
    fontWeight: 'bold',
  },
  currentTrackInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  trackStatus: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '500',
  },
  musicControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  musicButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ecf0f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicButtonText: {
    fontSize: 20,
  },
  musicSessionInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionInfo: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#2c3e50',
    fontSize: 14,
    fontWeight: '500',
  },
  leaveSessionButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveSessionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  musicSetup: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  musicInfo: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#7f8c8d',
    fontSize: 14,
  },
  musicSetupButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  setupButton: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  setupButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  groupStatusContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  groupMember: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  memberInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  memberStatus: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  memberDistance: {
    alignItems: 'flex-end',
  },
  memberDistanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  addMemberButton: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderStyle: 'dashed',
  },
  addMemberButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '500',
  },
}); 