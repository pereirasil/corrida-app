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

interface User {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  level: number;
  total_distance: number;
  total_runs: number;
  last_login?: string;
  friendship_status: 'none' | 'friend' | 'invite_sent' | 'invite_received' | 'blocked';
  friendship_id?: string;
}

export default function AmigosScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [activeTab, setActiveTab] = useState<'friends' | 'invites'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para o modal de adicionar amigos
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchUsersQuery, setSearchUsersQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

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

  // Mock de usuários para adicionar como amigos
  const loadUsers = async (searchTerm = '') => {
    setLoadingUsers(true);
    
    // Simular delay da API
    setTimeout(() => {
      const mockUsers: User[] = [
        {
          id: '4',
          name: 'Ana Oliveira',
          username: 'anaoliveira',
          level: 18,
          total_distance: 1800.0,
          total_runs: 120,
          last_login: '2024-01-15T08:00:00Z',
          friendship_status: 'none',
        },
        {
          id: '5',
          name: 'Carlos Lima',
          username: 'carloslima',
          level: 12,
          total_distance: 890.5,
          total_runs: 67,
          last_login: '2024-01-14T20:30:00Z',
          friendship_status: 'invite_sent',
        },
        {
          id: '6',
          name: 'Lucia Ferreira',
          username: 'luciaferreira',
          level: 25,
          total_distance: 3200.0,
          total_runs: 200,
          last_login: '2024-01-15T12:00:00Z',
          friendship_status: 'none',
        },
        {
          id: '7',
          name: 'Roberto Alves',
          username: 'robertoalves',
          level: 10,
          total_distance: 650.0,
          total_runs: 45,
          last_login: '2024-01-13T15:30:00Z',
          friendship_status: 'none',
        },
        {
          id: '8',
          name: 'Fernanda Costa',
          username: 'fernandacosta',
          level: 19,
          total_distance: 1950.0,
          total_runs: 130,
          last_login: '2024-01-15T10:00:00Z',
          friendship_status: 'invite_received',
        },
      ];

      // Filtrar por termo de busca se fornecido
      const filteredUsers = searchTerm 
        ? mockUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : mockUsers;

      setUsers(filteredUsers);
      setLoadingUsers(false);
    }, 500);
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

  const handleAddFriend = (user: User) => {
    if (user.friendship_status === 'friend') {
      Alert.alert('Já são amigos', `${user.name} já é seu amigo!`);
      return;
    }

    if (user.friendship_status === 'invite_sent') {
      Alert.alert('Convite já enviado', `Você já enviou um convite para ${user.name}`);
      return;
    }

    if (user.friendship_status === 'invite_received') {
      Alert.alert('Convite pendente', `${user.name} já te enviou um convite. Verifique na aba "Convites"!`);
      return;
    }

    Alert.alert(
      'Adicionar Amigo',
      `Enviar solicitação de amizade para ${user.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar', onPress: () => {
          // Aqui você faria a chamada real para a API
          Alert.alert('Solicitação Enviada!', `${user.name} receberá uma notificação.`);
          
          // Atualizar status local
          setUsers(prev => prev.map(u => 
            u.id === user.id 
              ? { ...u, friendship_status: 'invite_sent' as const }
              : u
          ));
        }},
      ]
    );
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

  const getFriendshipStatusText = (status: string) => {
    switch (status) {
      case 'friend': return 'Amigo';
      case 'invite_sent': return 'Convite Enviado';
      case 'invite_received': return 'Convite Recebido';
      case 'blocked': return 'Bloqueado';
      default: return 'Adicionar';
    }
  };

  const getFriendshipStatusColor = (status: string) => {
    switch (status) {
      case 'friend': return colors.success;
      case 'invite_sent': return colors.primary;
      case 'invite_received': return colors.warning;
      case 'blocked': return colors.error;
      default: return colors.primary;
    }
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

  const openAddFriendModal = () => {
    setShowAddFriendModal(true);
    setSearchUsersQuery('');
    loadUsers();
  };

  const searchUsers = (query: string) => {
    setSearchUsersQuery(query);
    if (query.trim().length >= 2) {
      loadUsers(query);
    } else if (query.trim().length === 0) {
      loadUsers();
    }
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
            
            {/* Botão para adicionar mais amigos */}
            <TouchableOpacity
              style={[styles.addFriendButton, { borderColor: colors.primary }]}
              onPress={openAddFriendModal}
            >
              <Ionicons name="person-add" size={24} color={colors.primary} />
              <Text style={[styles.addFriendButtonText, { color: colors.primary }]}>
                Adicionar Mais Amigos
              </Text>
            </TouchableOpacity>
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

      {/* Modal para Adicionar Amigos */}
      {showAddFriendModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Adicionar Amigos
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddFriendModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Barra de pesquisa */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { 
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.backgroundLight
                }]}
                placeholder="Buscar usuários por nome ou username..."
                placeholderTextColor={colors.textLight}
                value={searchUsersQuery}
                onChangeText={searchUsers}
              />
            </View>

            {/* Lista de usuários */}
            <ScrollView style={styles.modalBody}>
              {loadingUsers ? (
                <View style={styles.loadingContainer}>
                  <Text style={[styles.loadingText, { color: colors.textLight }]}>
                    Carregando usuários...
                  </Text>
                </View>
              ) : users.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="people" size={48} color={colors.textLight} />
                  <Text style={[styles.emptyStateText, { color: colors.textLight }]}>
                    {searchUsersQuery ? 'Nenhum usuário encontrado' : 'Nenhum usuário disponível'}
                  </Text>
                </View>
              ) : (
                <View style={styles.usersList}>
                  {users.map((user) => (
                    <View key={user.id} style={[styles.userCard, { borderColor: colors.border }]}>
                      <View style={styles.userInfo}>
                        <View style={styles.avatarContainer}>
                          <Text style={styles.avatarText}>
                            {user.name.charAt(0).toUpperCase()}
                          </Text>
      </View>

                        <View style={styles.userDetails}>
                          <Text style={[styles.userName, { color: colors.text }]}>
                            {user.name}
                          </Text>
                          <Text style={styles.userUsername}>@{user.username}</Text>
                          
                          <View style={styles.userStats}>
                            <Text style={styles.userStat}>
                              Nível {user.level} • {formatDistance(user.total_distance)}
                            </Text>
                            <Text style={styles.userStat}>
                              {user.total_runs} corridas • {getStatusText(user.last_login || '')}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.addFriendActionButton,
                          { backgroundColor: getFriendshipStatusColor(user.friendship_status) }
                        ]}
                        onPress={() => handleAddFriend(user)}
                        disabled={user.friendship_status !== 'none'}
                      >
                        <Text style={styles.addFriendActionButtonText}>
                          {getFriendshipStatusText(user.friendship_status)}
                        </Text>
      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}
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
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    gap: 10,
  },
  addFriendButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  usersList: {
    gap: 15,
  },
  userCard: {
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
  userInfo: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userStats: {
    gap: 2,
  },
  userStat: {
    fontSize: 12,
    color: '#888',
  },
  addFriendActionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  addFriendActionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 