import { buildApiUrl, getBasicHeaders } from '@/constants/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  avatar_url?: string;
  created_at: string;
  level?: number;
  stats?: {
    total_runs: number;
    total_distance: string;
    average_pace: string;
    calories_burned: number;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<{ success: boolean; data?: User; error?: string }>;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  console.log('🔧 AuthContext - Estado atual:', authState);

  const setAuthStateWithLog = (newState: AuthState) => {
    console.log('🔄 AuthContext - Mudando estado:', { from: authState, to: newState });
    setAuthState(newState);
  };

  const checkAuthState = async () => {
    try {
      console.log('🔍 AuthContext - Verificando estado de autenticação...');
      
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      console.log('🔍 Token encontrado:', !!token);
      console.log('🔍 User data encontrado:', !!userData);
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          console.log('✅ Usuário autenticado encontrado:', user.name);
          setAuthStateWithLog({
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch (parseError) {
          console.error('❌ Erro ao fazer parse dos dados do usuário:', parseError);
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user_data');
          setAuthStateWithLog({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        console.log('❌ Nenhum usuário autenticado encontrado');
        setAuthStateWithLog({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('❌ Erro ao verificar estado de autenticação:', error);
      setAuthStateWithLog({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext - Iniciando login para:', email);
      
      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: getBasicHeaders(),
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Login bem-sucedido:', data);
        
        // Salvar dados no AsyncStorage
        await AsyncStorage.setItem('auth_token', data.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
        console.log('💾 Dados salvos no AsyncStorage');
        
        // Atualizar estado
        setAuthStateWithLog({
          user: data.user,
          token: data.token,
          isLoading: false,
          isAuthenticated: true,
        });
        console.log('🔄 Estado de autenticação atualizado');

        return { success: true, data };
      } else {
        const error = await response.json();
        console.log('❌ Erro no login:', error);
        return { success: false, error: error.message || 'Erro no login' };
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await fetch(buildApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: getBasicHeaders(),
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Erro no cadastro' };
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 AuthContext - Iniciando logout...');
      
      // Limpar dados do AsyncStorage
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      console.log('🧹 AsyncStorage limpo');
      
      // Atualizar estado
      setAuthStateWithLog({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
      console.log('🔄 Estado de autenticação atualizado para false');
      console.log('✅ Logout realizado, aguardando redirecionamento automático...');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await fetch(buildApiUrl('/api/users/profile'), {
        method: 'PUT',
        headers: getAuthHeaders(authState.token!),
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
        
        setAuthStateWithLog({
          ...authState,
          user: updatedUser,
        });

        return { success: true, data: updatedUser };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Erro ao atualizar perfil' };
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  };

  const getAuthHeaders = () => {
    return getAuthHeaders(authState.token!);
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    getAuthHeaders,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
