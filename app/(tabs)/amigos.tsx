import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  level: number;
  total_distance: number;
  total_runs: number;
  last_login?: string;
  friendship_date: string;
}

interface Invite {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  level: number;
  total_distance: number;
  total_runs: number;
  message?: string;
  created_at: string;
}

export default function AmigosScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [activeTab, setActiveTab] = useState<'friends' | 'invites'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - substituir por chamadas reais da API
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock de amigos
    setFriends([
      {
        id: '1',
        name: 'João Silva',
        username: 'joaosilva',
        level: 15,
        total_distance: 1250.5,
        total_runs: 89,
        last_login: '2024-01-15T10:30:00Z',
        friendship_date: '2023-06-15T14:20:00Z',
      },
      {
        id: '2',
        name: 'Maria Santos',
        username: 'mariasantos',
        level: 22,
        total_distance: 2100.0,
        total_runs: 156,
        last_login: '2024-01-15T09:15:00Z',
        friendship_date: '2023-08-22T16:45:00Z',
      },
      {
        id: '3',
        name: 'Pedro Costa',
        username: 'pedrocosta',
        level: 8,
        total_distance: 450.2,
        total_runs: 34,
        last_login: '2024-01-14T18:20:00Z',
        friendship_date: '2023-11-10T11:30:00Z',
      },
    ]);

    // Mock de convites pendentes
    setPendingInvites([
      {
        id: '1',
        name: 'Ana Oliveira',
        username: 'anaoliveira',
        level: 18,
        total_distance: 1800.0,
        total_runs: 120,
        message: 'Vamos correr juntos no parque?',
        created_at: '2024-01-15T08:00:00Z',
      },
      {
        id: '2',
        name: 'Carlos Lima',
        username: 'carloslima',
        level: 12,
        total_distance: 890.5,
        total_runs: 67,
        message: 'Quer participar da minha corrida matinal?',
        created_at: '2024-01-14T20:30:00Z',
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Aqui você faria a chamada real para a API
    setTimeout(() => {
      loadMockData();
      setRefreshing(false);
    }, 1000);
  };

  const handleInviteFriend = (friend: Friend) => {
    Alert.alert(
      'Convidar para Corrida',
      `Convidar ${friend.name} para correr?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Convidar', onPress: () => {
          // Aqui você faria a chamada real para a API
          Alert.alert('Convite Enviado!', `${friend.name} receberá uma notificação.`);
        }},
      ]
    );
  };

  const handleInviteResponse = (invite: Invite, action: 'accept' | 'decline') => {
    if (action === 'accept') {
      Alert.alert('Convite Aceito!', `Você aceitou o convite de ${invite.name}`);
      // Aqui você faria a chamada real para a API
      setPendingInvites(prev => prev.filter(inv => inv.id !== invite.id));
    } else {
      Alert.alert('Convite Recusado', `Você recusou o convite de ${invite.name}`);
      // Aqui você faria a chamada real para a API
      setPendingInvites(prev => prev.filter(inv => inv.id !== invite.id));
    }
  };

  const getStatusColor = (lastLogin: string) => {
    const lastLoginDate = new Date(lastLogin);
    const now = new Date();
    const diffHours = (now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return colors.success; // Online
    if (diffHours < 24) return colors.primary; // Hoje
    return colors.textLight; // Offline
  };

  const getStatusText = (lastLogin: string) => {
    const lastLoginDate = new Date(lastLogin);
    const now = new Date();
    const diffHours = (now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'Online';
    if (diffHours < 24) return 'Hoje';
    if (diffHours < 168) return `${Math.floor(diffHours / 24)} dias atrás`;
    return 'Offline';
  };

  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)}k km`;
    }
    return `${distance.toFixed(1)} km`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Amigos</Text>
        <Text style={styles.headerSubtitle}>Conecte-se e corra junto</Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { 
            borderColor: colors.border,
            color: colors.text,
            backgroundColor: colors.backgroundLight
          }]}
          placeholder="Buscar amigos..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'friends' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'friends' && { color: '#FFFFFF' }
          ]}>
            Amigos ({friends.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'invites' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('invites')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'invites' && { color: '#FFFFFF' }
          ]}>
            Convites ({pendingInvites.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'friends' ? (
          // Lista de Amigos
          <View style={styles.friendsList}>
            {friends.map((friend) => (
              <View key={friend.id} style={[styles.friendCard, { borderColor: colors.border }]}>
                <View style={styles.friendInfo}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {friend.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  
                  <View style={styles.friendDetails}>
                    <Text style={[styles.friendName, { color: colors.text }]}>
                      {friend.name}
                    </Text>
                    <Text style={styles.friendUsername}>@{friend.username}</Text>
                    
                    <View style={styles.friendStats}>
                      <Text style={styles.friendStat}>
                        Nível {friend.level} • {formatDistance(friend.total_distance)}
                      </Text>
                      <Text style={styles.friendStat}>
                        {friend.total_runs} corridas • {getStatusText(friend.last_login || '')}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.friendActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleInviteFriend(friend)}
                  >
                    <Ionicons name="footsteps" size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Convidar para Correr</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.secondary }]}
                    onPress={() => Alert.alert('Perfil', `Ver perfil de ${friend.name}`)}
                  >
                    <Ionicons name="person" size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Ver Perfil</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          // Lista de Convites Pendentes
          <View style={styles.invitesList}>
            {pendingInvites.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="mail-open" size={48} color={colors.textLight} />
                <Text style={[styles.emptyStateText, { color: colors.textLight }]}>
                  Nenhum convite pendente
                </Text>
              </View>
            ) : (
              pendingInvites.map((invite) => (
                <View key={invite.id} style={[styles.inviteCard, { borderColor: colors.border }]}>
                  <View style={styles.inviteInfo}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>
                        {invite.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    
                    <View style={styles.inviteDetails}>
                      <Text style={[styles.inviteName, { color: colors.text }]}>
                        {invite.name}
                      </Text>
                      <Text style={styles.inviteUsername}>@{invite.username}</Text>
                      
                      {invite.message && (
                        <Text style={styles.inviteMessage}>{invite.message}</Text>
                      )}
                      
                      <View style={styles.inviteStats}>
                        <Text style={styles.inviteStat}>
                          Nível {invite.level} • {formatDistance(invite.total_distance)}
                        </Text>
                        <Text style={styles.inviteStat}>
                          {invite.total_runs} corridas • {formatDate(invite.created_at)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.inviteActions}>
                    <TouchableOpacity
                      style={[styles.inviteActionButton, { backgroundColor: colors.success }]}
                      onPress={() => handleInviteResponse(invite, 'accept')}
                    >
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      <Text style={styles.inviteActionButtonText}>Aceitar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.inviteActionButton, { backgroundColor: colors.error }]}
                      onPress={() => handleInviteResponse(invite, 'decline')}
                    >
                      <Ionicons name="close" size={16} color="#FFFFFF" />
                      <Text style={styles.inviteActionButtonText}>Recusar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  friendsList: {
    gap: 15,
  },
  friendCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  friendInfo: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F26522',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  friendStats: {
    gap: 2,
  },
  friendStat: {
    fontSize: 12,
    color: '#888',
  },
  friendActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  invitesList: {
    gap: 15,
  },
  inviteCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inviteInfo: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  inviteDetails: {
    flex: 1,
  },
  inviteName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  inviteUsername: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  inviteMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  inviteStats: {
    gap: 2,
  },
  inviteStat: {
    fontSize: 12,
    color: '#888',
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 10,
  },
  inviteActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  inviteActionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 15,
  },
}); 