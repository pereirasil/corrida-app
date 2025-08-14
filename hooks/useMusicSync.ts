import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useResourceManager, RESOURCE_PRIORITIES } from './useResourceManager';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url?: string;
}

export interface MusicSession {
  id: string;
  hostId: string;
  participants: string[];
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  currentTime: number;
  playlist: MusicTrack[];
  createdAt: Date;
}

export interface MusicControl {
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
}

export const useMusicSync = (sessionId?: string) => {
  const [currentSession, setCurrentSession] = useState<MusicSession | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const musicControlsRef = useRef<MusicControl | null>(null);
  
  // Gerenciador de recursos para evitar conflitos
  const resourceManager = useResourceManager();
  const musicResourceId = useRef<string>('music-session-' + Date.now());

  // Simulação de sincronização em tempo real
  useEffect(() => {
    if (sessionId && isConnected) {
      // Simular sincronização a cada segundo
      syncIntervalRef.current = setInterval(() => {
        syncMusicState();
      }, 1000);
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [sessionId, isConnected]);

  const createMusicSession = async (playlist: MusicTrack[]): Promise<string> => {
    try {
      // Verificar se podemos ativar a música sem conflitos
      if (!resourceManager.canActivateResource('music', RESOURCE_PRIORITIES.MUSIC_PLAYBACK)) {
        Alert.alert(
          'Recurso em Uso',
          'O GPS está ativo para corrida. Pare a corrida primeiro para usar a música.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Parar Corrida', onPress: () => {
              console.log('Solicitando parada da corrida para liberar recursos de áudio');
            }}
          ]
        );
        return '';
      }

      // Registrar o recurso de música
      if (!resourceManager.registerResource(musicResourceId.current, 'music', RESOURCE_PRIORITIES.MUSIC_PLAYBACK)) {
        Alert.alert('Erro', 'Não foi possível ativar a música devido a conflitos de recursos');
        return '';
      }

      const sessionId = Date.now().toString();
      const newSession: MusicSession = {
        id: sessionId,
        hostId: 'current-user-id', // ID do usuário atual
        participants: ['current-user-id'],
        currentTrack: playlist[0] || null,
        isPlaying: false,
        currentTime: 0,
        playlist,
        createdAt: new Date(),
      };

      setCurrentSession(newSession);
      setIsHost(true);
      setIsConnected(true);
      setParticipants(['current-user-id']);
      setCurrentTrack(playlist[0] || null);

      // Simular notificação para outros usuários
      Alert.alert('Sessão de Música Criada', 'Compartilhe o código da sessão com seus amigos!');

      return sessionId;
    } catch (error) {
      console.error('Erro ao criar sessão de música:', error);
      Alert.alert('Erro', 'Não foi possível criar a sessão de música');
      
      // Limpar recursos em caso de erro
      resourceManager.deactivateResource(musicResourceId.current);
      return '';
    }
  };

  const joinMusicSession = async (sessionId: string): Promise<boolean> => {
    try {
      // Simular busca da sessão
      const mockSession: MusicSession = {
        id: sessionId,
        hostId: 'friend-user-id',
        participants: ['friend-user-id', 'current-user-id'],
        currentTrack: {
          id: '1',
          title: 'Running Song',
          artist: 'Fitness Artist',
          duration: 180,
        },
        isPlaying: true,
        currentTime: 45,
        playlist: [
          { id: '1', title: 'Running Song', artist: 'Fitness Artist', duration: 180 },
          { id: '2', title: 'Motivation', artist: 'Energy Band', duration: 200 },
        ],
        createdAt: new Date(),
      };

      setCurrentSession(mockSession);
      setIsHost(false);
      setIsConnected(true);
      setParticipants(['friend-user-id', 'current-user-id']);
      setCurrentTrack(mockSession.currentTrack);
      setIsPlaying(mockSession.isPlaying);
      setCurrentTime(mockSession.currentTime);

      Alert.alert('Conectado!', 'Você está sincronizado com a música do grupo');
      return true;
    } catch (error) {
      console.error('Erro ao entrar na sessão:', error);
      Alert.alert('Erro', 'Não foi possível conectar à sessão de música');
      return false;
    }
  };

  const leaveMusicSession = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    // Desativar o recurso de música
    resourceManager.deactivateResource(musicResourceId.current);

    setCurrentSession(null);
    setIsHost(false);
    setIsConnected(false);
    setParticipants([]);
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);

    Alert.alert('Desconectado', 'Você saiu da sessão de música');
  };

  const playMusic = () => {
    if (!currentSession) return;

    setIsPlaying(true);
    if (isHost) {
      // Como host, controla a reprodução para todos
      broadcastMusicState({ isPlaying: true, currentTime });
    }
  };

  const pauseMusic = () => {
    if (!currentSession) return;

    setIsPlaying(false);
    if (isHost) {
      // Como host, pausa para todos
      broadcastMusicState({ isPlaying: false, currentTime });
    }
  };

  const nextTrack = () => {
    if (!currentSession || !isHost) return;

    const currentIndex = currentSession.playlist.findIndex(track => track.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % currentSession.playlist.length;
    const nextTrack = currentSession.playlist[nextIndex];

    setCurrentTrack(nextTrack);
    setCurrentTime(0);
    setIsPlaying(true);

    broadcastMusicState({ 
      currentTrack: nextTrack, 
      currentTime: 0, 
      isPlaying: true 
    });
  };

  const previousTrack = () => {
    if (!currentSession || !isHost) return;

    const currentIndex = currentSession.playlist.findIndex(track => track.id === currentTrack?.id);
    const prevIndex = currentIndex === 0 ? currentSession.playlist.length - 1 : currentIndex - 1;
    const prevTrack = currentSession.playlist[prevIndex];

    setCurrentTrack(prevTrack);
    setCurrentTime(0);
    setIsPlaying(true);

    broadcastMusicState({ 
      currentTrack: prevTrack, 
      currentTime: 0, 
      isPlaying: true 
    });
  };

  const setMusicVolume = (newVolume: number) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
    if (isHost) {
      broadcastMusicState({ volume: newVolume });
    }
  };

  const seekToTime = (time: number) => {
    if (!currentSession || !isHost) return;

    setCurrentTime(time);
    broadcastMusicState({ currentTime: time });
  };

  const addTrackToPlaylist = (track: MusicTrack) => {
    if (!currentSession || !isHost) return;

    const updatedPlaylist = [...currentSession.playlist, track];
    setCurrentSession(prev => prev ? { ...prev, playlist: updatedPlaylist } : null);
    
    broadcastMusicState({ playlist: updatedPlaylist });
  };

  const removeTrackFromPlaylist = (trackId: string) => {
    if (!currentSession || !isHost) return;

    const updatedPlaylist = currentSession.playlist.filter(track => track.id !== trackId);
    setCurrentSession(prev => prev ? { ...prev, playlist: updatedPlaylist } : null);
    
    broadcastMusicState({ playlist: updatedPlaylist });
  };

  const inviteFriendToSession = (friendId: string) => {
    if (!currentSession) return;

    // Simular envio de convite
    Alert.alert('Convite Enviado', `Convite enviado para participar da sessão de música`);
    
    // Adicionar à lista de participantes
    const updatedParticipants = [...participants, friendId];
    setParticipants(updatedParticipants);
    setCurrentSession(prev => prev ? { ...prev, participants: updatedParticipants } : null);
  };

  const broadcastMusicState = (updates: Partial<MusicSession>) => {
    // Em uma implementação real, isso enviaria as atualizações para o servidor
    // para sincronizar com outros participantes
    console.log('Broadcasting music state:', updates);
  };

  const syncMusicState = () => {
    // Simular sincronização com outros participantes
    if (currentSession && !isHost) {
      // Como participante, recebe atualizações do host
      // Em uma implementação real, isso viria do servidor
      setCurrentTime(prev => prev + 1);
    }
  };

  const getSessionCode = (): string => {
    return currentSession?.id || '';
  };

  const getPlaylistDuration = (): number => {
    if (!currentSession) return 0;
    return currentSession.playlist.reduce((total, track) => total + track.duration, 0);
  };

  const getCurrentTrackProgress = (): number => {
    if (!currentTrack) return 0;
    return (currentTime / currentTrack.duration) * 100;
  };

  return {
    // Estado
    currentSession,
    isHost,
    isConnected,
    participants,
    currentTrack,
    isPlaying,
    currentTime,
    volume,
    playlist: currentSession?.playlist || [],

    // Ações principais
    createMusicSession,
    joinMusicSession,
    leaveMusicSession,
    
    // Controles de música
    playMusic,
    pauseMusic,
    nextTrack,
    previousTrack,
    setMusicVolume,
    seekToTime,
    
    // Gerenciamento de playlist
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    
    // Social
    inviteFriendToSession,
    
    // Utilitários
    getSessionCode,
    getPlaylistDuration,
    getCurrentTrackProgress,
  };
}; 