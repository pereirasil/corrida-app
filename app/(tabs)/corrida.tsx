import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { LeafletMap } from '../../components/LeafletMap';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useMusicSync } from '../../hooks/useMusicSync';
import { useRunningTracker } from '../../hooks/useRunningTracker';

const { width } = Dimensions.get('window');

export default function CorridaScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const {
    isRunning,
    currentSession,
    locationPermission,
    currentLocation,
    gpsStatus,
    gpsError,
    startRunning,
    pauseRunning,
    resumeRunning,
    stopRunning,
    getCurrentMetrics,
    getCurrentRoute,
    getGpsStats,
    getGpsQuality,
    retryGps,
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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteDistance, setInviteDistance] = useState('');
  const [inviteLocation, setInviteLocation] = useState('');

  // Mock de amigos para convites
  const availableFriends = [
    { id: '1', name: 'João Silva', username: 'joaosilva' },
    { id: '2', name: 'Maria Santos', username: 'mariasantos' },
    { id: '3', name: 'Pedro Costa', username: 'pedrocosta' },
    { id: '4', name: 'Ana Oliveira', username: 'anaoliveira' },
  ];

  const currentMetrics = getCurrentMetrics();
  const routeCoordinates = getCurrentRoute().map(point => ({
    latitude: point.latitude,
    longitude: point.longitude,
  }));
  const gpsStats = getGpsStats();

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

  const toggleMusicControls = () => {
    setShowMusicControls(!showMusicControls);
  };

  const handleMusicControl = (action: string) => {
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
      'Entrar na Sessão',
      'Digite o código da sessão:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Entrar', onPress: (sessionId) => {
          if (sessionId) {
            joinMusicSession(sessionId);
          }
        }},
      ],
      'plain-text'
    );
  };

  const handleInviteFriends = () => {
    if (selectedFriends.length === 0) {
      Alert.alert('Selecionar Amigos', 'Selecione pelo menos um amigo para convidar');
      return;
    }

    const selectedNames = availableFriends
      .filter(friend => selectedFriends.includes(friend.id))
      .map(friend => friend.name)
      .join(', ');

    Alert.alert(
      'Convites Enviados!',
      `Convites enviados para: ${selectedNames}`,
      [
        { text: 'OK', onPress: () => {
          setShowInviteModal(false);
          setSelectedFriends([]);
          setInviteMessage('');
          setInviteDistance('');
          setInviteLocation('');
        }},
      ]
    );
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const getGpsStatusColor = () => {
    switch (gpsStatus) {
      case 'acquired': return colors.success;
      case 'searching': return colors.warning;
      case 'lost': return colors.error;
      default: return colors.textLight;
    }
  };

  const getGpsStatusText = () => {
    switch (gpsStatus) {
      case 'acquired': return 'GPS Ativo';
      case 'searching': return 'Buscando GPS...';
      case 'lost': return 'GPS Perdido';
      default: return 'GPS Desconhecido';
    }
  };

  const getGpsQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return colors.success;
      case 'good': return colors.primary;
      case 'fair': return colors.warning;
      case 'poor': return colors.error;
      default: return colors.textLight;
    }
  };

  const getGpsQualityText = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Bom';
      case 'fair': return 'Razoável';
      case 'poor': return 'Ruim';
      default: return 'Desconhecido';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Corrida</Text>
        <Text style={styles.headerSubtitle}>Rastreie sua performance</Text>
      </LinearGradient>

      {/* GPS Status */}
      <View style={styles.gpsStatusContainer}>
        <View style={styles.gpsStatusIndicator}>
          <View style={[
            styles.gpsStatusDot,
            { backgroundColor: getGpsStatusColor() }
          ]} />
          <Text style={[styles.gpsStatusText, { color: colors.text }]}>
            {getGpsStatusText()}
          </Text>
        </View>
        
        {gpsError && (
          <View style={styles.gpsErrorContainer}>
            <Text style={[styles.gpsErrorText, { color: colors.error }]}>
              ⚠️ {gpsError}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={retryGps}
            >
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
          </View>
        )}
        
        {gpsStats && (
          <View style={styles.gpsStats}>
            <Text style={[styles.gpsStat, { color: colors.textLight }]}>
              Precisão: {gpsStats.averageAccuracy}m
            </Text>
            <Text style={[styles.gpsStat, { color: colors.textLight }]}>
              Pontos: {gpsStats.totalPoints} ({gpsStats.accuratePoints} precisos)
            </Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Mapa */}
        <View style={styles.mapContainer}>
                     <LeafletMap
             currentLocation={currentLocation ? {
               latitude: currentLocation.coords.latitude,
               longitude: currentLocation.coords.longitude,
               accuracy: currentLocation.coords.accuracy || 100,
               quality: getGpsQuality(currentLocation.coords.accuracy || 100),
               speed: currentMetrics ? currentMetrics.speed : 0,
             } : null}
             route={getCurrentRoute().map(point => ({
               latitude: point.latitude,
               longitude: point.longitude,
               accuracy: point.accuracy,
               quality: point.quality,
               speed: point.speed || 0,
             }))}
             isRunning={isRunning}
             onMapReady={() => console.log('Mapa Leaflet Inteligente carregado!')}
           />
        </View>

        {/* Métricas principais */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <View style={[styles.metricCard, { borderLeftColor: colors.primary }]}>
              <Text style={[styles.metricValue, { color: colors.primary }]}>
                {currentMetrics ? formatTime(currentMetrics.elapsedTime) : '00:00:00'}
              </Text>
              <Text style={styles.metricLabel}>Tempo</Text>
            </View>
            <View style={[styles.metricCard, { borderLeftColor: colors.accent }]}>
              <Text style={[styles.metricValue, { color: colors.accent }]}>
                {currentMetrics ? (currentMetrics.distance / 1000).toFixed(2) : '0.00'}
              </Text>
              <Text style={styles.metricLabel}>km</Text>
            </View>
            <View style={[styles.metricCard, { borderLeftColor: colors.success }]}>
              <Text style={[styles.metricValue, { color: colors.success }]}>
                {currentMetrics && currentMetrics.pace > 0 ? formatPace(currentMetrics.pace) : '0:00'}
              </Text>
              <Text style={styles.metricLabel}>min/km</Text>
            </View>
          </View>
          
          <View style={styles.metricRow}>
            <View style={[styles.metricCard, { borderLeftColor: colors.warning }]}>
              <Text style={[styles.metricValue, { color: colors.warning }]}>
                {currentMetrics ? currentMetrics.speed.toFixed(1) : '0.0'}
              </Text>
              <Text style={styles.metricLabel}>km/h</Text>
            </View>
            <View style={[styles.metricCard, { borderLeftColor: colors.error }]}>
              <Text style={[styles.metricValue, { color: colors.error }]}>
                {currentMetrics ? currentMetrics.calories : '0'}
              </Text>
              <Text style={styles.metricLabel}>Calorias</Text>
            </View>
            <View style={[styles.metricCard, { borderLeftColor: colors.secondary }]}>
              <Text style={[styles.metricValue, { color: colors.secondary }]}>
                {currentMetrics ? currentMetrics.steps : '0'}
              </Text>
              <Text style={styles.metricLabel}>Passos</Text>
            </View>
          </View>

          {/* Métricas de elevação e GPS */}
          {currentMetrics && (currentMetrics.elevationGain > 0 || currentMetrics.accuracy > 0) && (
            <View style={styles.metricRow}>
              <View style={[styles.metricCard, { borderLeftColor: colors.accent }]}>
                <Text style={[styles.metricValue, { color: colors.accent }]}>
                  {currentMetrics.elevationGain}m
                </Text>
                <Text style={styles.metricLabel}>Subida</Text>
              </View>
              <View style={[styles.metricCard, { borderLeftColor: colors.warning }]}>
                <Text style={[styles.metricValue, { color: colors.warning }]}>
                  {currentMetrics.elevationLoss}m
                </Text>
                <Text style={styles.metricLabel}>Descida</Text>
              </View>
              <View style={[styles.metricCard, { borderLeftColor: getGpsQualityColor(currentMetrics.gpsQuality) }]}>
                <Text style={[styles.metricValue, { color: getGpsQualityColor(currentMetrics.gpsQuality) }]}>
                  {currentMetrics.accuracy}m
                </Text>
                <Text style={styles.metricLabel}>Precisão</Text>
              </View>
            </View>
          )}
        </View>

        {/* Controles de corrida */}
        <View style={styles.controlsContainer}>
          {!isRunning ? (
            <TouchableOpacity 
              style={[
                styles.startButton, 
                { backgroundColor: colors.primary },
                gpsStatus !== 'acquired' && styles.disabledButton
              ]} 
              onPress={startRun}
              disabled={gpsStatus !== 'acquired'}
            >
              <Text style={styles.startButtonText}>
                {gpsStatus === 'acquired' ? 'Iniciar Corrida' : 'Aguardando GPS...'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.runningControls}>
              <TouchableOpacity 
                style={[styles.pauseButton, { backgroundColor: colors.warning }]} 
                onPress={currentSession?.isActive ? pauseRun : resumeRun}
              >
                <Text style={styles.pauseButtonText}>
                  {currentSession?.isActive ? 'Pausar' : 'Retomar'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.stopButton, { backgroundColor: colors.error }]} onPress={stopRun}>
                <Text style={styles.stopButtonText}>Parar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Controles de música */}
        <View style={styles.musicContainer}>
          <View style={styles.musicHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🎵 Música Sincronizada</Text>
            <TouchableOpacity onPress={toggleMusicControls}>
              <Text style={[styles.toggleButton, { color: colors.primary }]}>
                {showMusicControls ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
          </View>

          {isMusicConnected ? (
            <>
              {currentTrack && (
                <View style={[styles.currentTrackInfo, { borderColor: colors.border }]}>
                  <Text style={[styles.trackTitle, { color: colors.text }]}>{currentTrack.title}</Text>
                  <Text style={styles.trackArtist}>{currentTrack.artist}</Text>
                  <Text style={[styles.trackStatus, { color: colors.success }]}>
                    {isMusicPlaying ? '▶ Tocando' : '⏸ Pausado'}
                  </Text>
                </View>
              )}

              {showMusicControls && (
                <View style={[styles.musicControls, { borderColor: colors.border }]}>
                  <TouchableOpacity 
                    style={[styles.musicButton, { backgroundColor: colors.backgroundLight }]}
                    onPress={() => handleMusicControl('previous')}
                  >
                    <Text style={[styles.musicButtonText, { color: colors.primary }]}>⏮</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.musicButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleMusicControl(isMusicPlaying ? 'pause' : 'play')}
                  >
                    <Text style={[styles.musicButtonText, { color: '#FFFFFF' }]}>
                      {isMusicPlaying ? '⏸' : '▶'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.musicButton, { backgroundColor: colors.backgroundLight }]}
                    onPress={() => handleMusicControl('next')}
                  >
                    <Text style={[styles.musicButtonText, { color: colors.primary }]}>⏭</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={[styles.musicSessionInfo, { borderColor: colors.border }]}>
                <Text style={[styles.sessionInfo, { color: colors.text }]}>
                  {isMusicHost ? '🎵 Você é o DJ' : '🎵 Conectado ao grupo'}
                </Text>
                <TouchableOpacity 
                  style={[styles.leaveSessionButton, { backgroundColor: colors.error }]}
                  onPress={leaveMusicSession}
                >
                  <Text style={styles.leaveSessionButtonText}>Sair da Sessão</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={[styles.musicSetup, { borderColor: colors.border }]}>
              <Text style={styles.musicInfo}>Nenhuma sessão de música ativa</Text>
              <View style={styles.musicSetupButtons}>
                <TouchableOpacity 
                  style={[styles.setupButton, { backgroundColor: colors.primary }]}
                  onPress={() => createMusicSession([])}
                >
                  <Text style={styles.setupButtonText}>Criar Sessão</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.setupButton, { backgroundColor: colors.accent }]}
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>👥 Corrida em Grupo</Text>
          <View style={[styles.groupMember, { borderColor: colors.border }]}>
            <View style={[styles.memberAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.memberInitial}>V</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={[styles.memberName, { color: colors.text }]}>Você</Text>
              <Text style={styles.memberStatus}>
                {isRunning ? 'Correndo' : 'Parado'} • {currentMetrics ? formatTime(currentMetrics.elapsedTime) : '00:00:00'}
              </Text>
            </View>
            <View style={styles.memberDistance}>
              <Text style={[styles.memberDistanceText, { color: colors.success }]}>
                {currentMetrics ? (currentMetrics.distance / 1000).toFixed(2) : '0.00'} km
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={[styles.addMemberButton, { borderColor: colors.primary }]}>
            <Text style={[styles.addMemberButtonText, { color: colors.primary }]}>+ Adicionar Amigo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.inviteButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowInviteModal(true)}
          >
            <Ionicons name="people" size={20} color="#FFFFFF" />
            <Text style={styles.inviteButtonText}>Convidar Amigos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Invite Friends Modal */}
      {showInviteModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Convidar Amigos para Correr
              </Text>
              <TouchableOpacity
                onPress={() => setShowInviteModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Message Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Mensagem (opcional)
                </Text>
                <TextInput
                  style={[styles.textInput, { 
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.backgroundLight
                  }]}
                  placeholder="Ex: Vamos correr juntos no parque?"
                  placeholderTextColor={colors.textLight}
                  value={inviteMessage}
                  onChangeText={setInviteMessage}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Distance Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Distância sugerida (km)
                </Text>
                <TextInput
                  style={[styles.textInput, { 
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.backgroundLight
                  }]}
                  placeholder="Ex: 5.0"
                  placeholderTextColor={colors.textLight}
                  value={inviteDistance}
                  onChangeText={setInviteDistance}
                  keyboardType="numeric"
                />
              </View>

              {/* Location Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Local sugerido
                </Text>
                <TextInput
                  style={[styles.textInput, { 
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.backgroundLight
                  }]}
                  placeholder="Ex: Parque da Cidade"
                  placeholderTextColor={colors.textLight}
                  value={inviteLocation}
                  onChangeText={setInviteLocation}
                />
              </View>

              {/* Friends List */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Selecionar Amigos
                </Text>
                <View style={styles.friendsList}>
                  {availableFriends.map((friend) => (
                    <TouchableOpacity
                      key={friend.id}
                      style={[
                        styles.friendItem,
                        { borderColor: colors.border },
                        selectedFriends.includes(friend.id) && { 
                          borderColor: colors.primary,
                          backgroundColor: colors.primaryLight + '20'
                        }
                      ]}
                      onPress={() => toggleFriendSelection(friend.id)}
                    >
                      <View style={styles.friendItemInfo}>
                        <View style={[styles.friendAvatar, { backgroundColor: colors.primary }]}>
                          <Text style={styles.friendAvatarText}>
                            {friend.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View>
                          <Text style={[styles.friendName, { color: colors.text }]}>
                            {friend.name}
                          </Text>
                          <Text style={[styles.friendUsername, { color: colors.textLight }]}>
                            @{friend.username}
                          </Text>
                        </View>
                      </View>
                      
                      {selectedFriends.includes(friend.id) && (
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={() => setShowInviteModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleInviteFriends}
              >
                <Text style={styles.modalButtonText}>Enviar Convites</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  inviteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  inviteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  gpsStatusContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gpsStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  gpsStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  gpsStatusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  gpsStats: {
    gap: 5,
  },
  gpsStat: {
    fontSize: 14,
    fontWeight: '500',
  },
  mapContainer: {
    height: 300,
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB', // Changed from colors.border to a neutral color for LeafletMap
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
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
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
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  controlsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  startButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#F26522',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
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
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pauseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stopButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
  },
  toggleButton: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  currentTrackInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5,
  },
  trackStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  musicControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  musicButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  musicSessionInfo: {
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
  sessionInfo: {
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
    fontWeight: '500',
  },
  leaveSessionButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leaveSessionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  musicSetup: {
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
  musicInfo: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#6B7280',
    fontSize: 14,
  },
  musicSetupButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  setupButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
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
    marginBottom: 2,
  },
  memberStatus: {
    fontSize: 14,
    color: '#6B7280',
  },
  memberDistance: {
    alignItems: 'flex-end',
  },
  memberDistanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addMemberButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  addMemberButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  friendsList: {
    gap: 10,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  friendItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: '#666',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 15,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  gpsErrorContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  gpsErrorText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
}); 