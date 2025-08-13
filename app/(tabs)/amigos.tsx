import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
// import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function AmigosScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' ou 'invites'

  // Dados mockados para demonstração
  const friends = [
    { id: '1', name: 'João Silva', avatar: 'J', status: 'online', lastRun: '2h atrás' },
    { id: '2', name: 'Maria Santos', avatar: 'M', status: 'running', lastRun: 'Correndo agora' },
    { id: '3', name: 'Pedro Costa', avatar: 'P', status: 'offline', lastRun: 'Ontem' },
    { id: '4', name: 'Ana Oliveira', avatar: 'A', status: 'online', lastRun: '1h atrás' },
  ];

  const pendingInvites = [
    { id: '1', name: 'Carlos Lima', avatar: 'C', message: 'Quer correr amanhã às 7h?' },
    { id: '2', name: 'Lucia Ferreira', avatar: 'L', message: 'Corrida de 5km no parque?' },
  ];

  const renderFriend = ({ item }) => (
    <View style={styles.friendCard}>
      <View style={styles.friendInfo}>
        <View style={[styles.avatar, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </View>
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendStatus}>
            {item.status === 'running' ? '🏃‍♂️ Correndo agora' : 
             item.status === 'online' ? '🟢 Online' : '⚫ Offline'}
          </Text>
          <Text style={styles.lastRun}>{item.lastRun}</Text>
        </View>
      </View>
      <View style={styles.friendActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => inviteToRun(item)}
        >
          <Text style={styles.actionButtonText}>🏃‍♂️</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => viewProfile(item)}
        >
          <Text style={styles.actionButtonText}>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderInvite = ({ item }) => (
    <View style={styles.inviteCard}>
      <View style={styles.inviteInfo}>
        <View style={[styles.avatar, { backgroundColor: '#3498db' }]}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </View>
        <View style={styles.inviteDetails}>
          <Text style={styles.inviteName}>{item.name}</Text>
          <Text style={styles.inviteMessage}>{item.message}</Text>
        </View>
      </View>
      <View style={styles.inviteActions}>
        <TouchableOpacity 
          style={[styles.inviteActionButton, styles.acceptButton]}
          onPress={() => acceptInvite(item)}
        >
          <Text style={styles.acceptButtonText}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.inviteActionButton, styles.declineButton]}
          onPress={() => declineInvite(item)}
        >
          <Text style={styles.declineButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#27ae60';
      case 'running': return '#e74c3c';
      case 'offline': return '#95a5a6';
      default: return '#3498db';
    }
  };

  const inviteToRun = (friend) => {
    Alert.alert(
      'Convidar para Corrida',
      `Convidar ${friend.name} para correr?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Convidar', onPress: () => {
          Alert.alert('Convite enviado!', `${friend.name} receberá uma notificação.`);
        }},
      ]
    );
  };

  const viewProfile = (friend) => {
    Alert.alert('Perfil', `Visualizando perfil de ${friend.name}`);
  };

  const acceptInvite = (invite) => {
    Alert.alert('Convite aceito!', `Você agora é amigo de ${invite.name}`);
  };

  const declineInvite = (invite) => {
    Alert.alert('Convite recusado', `Convite de ${invite.name} foi recusado`);
  };

  const addNewFriend = () => {
    Alert.prompt(
      'Adicionar Amigo',
      'Digite o nome de usuário ou email:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Adicionar', onPress: (text) => {
          if (text) {
            Alert.alert('Solicitação enviada!', `Solicitação de amizade enviada para ${text}`);
          }
        }},
      ],
      'plain-text'
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[styles.header, { backgroundColor: colors.tint }]}
      >
        <Text style={styles.headerTitle}>Amigos</Text>
        <TouchableOpacity style={styles.addButton} onPress={addNewFriend}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de pesquisa */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar amigos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#95a5a6"
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Amigos ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'invites' && styles.activeTab]}
          onPress={() => setActiveTab('invites')}
        >
          <Text style={[styles.tabText, activeTab === 'invites' && styles.activeTabText]}>
            Convites ({pendingInvites.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo das tabs */}
      <View style={styles.content}>
        {activeTab === 'friends' ? (
          <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <FlatList
            data={pendingInvites}
            renderItem={renderInvite}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      {/* Botão flutuante para convidar para corrida */}
      <TouchableOpacity style={styles.floatingButton} onPress={() => {
        Alert.alert('Convidar para Corrida', 'Selecione amigos para convidar para uma corrida em grupo');
      }}>
        <Text style={styles.floatingButtonText}>🏃‍♂️</Text>
      </TouchableOpacity>
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
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  friendCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  friendStatus: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  lastRun: {
    fontSize: 12,
    color: '#95a5a6',
  },
  friendActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
  },
  inviteCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inviteInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteDetails: {
    flex: 1,
  },
  inviteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  inviteMessage: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 10,
  },
  inviteActionButton: {
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
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonText: {
    fontSize: 24,
  },
}); 