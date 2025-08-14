import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    console.log('🚀 Iniciando processo de login...');
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      console.log('📱 Resultado do login:', result);
      
      if (result.success) {
        console.log('✅ Login realizado com sucesso:', result.data);
        console.log('✅ Login bem-sucedido, aguardando redirecionamento automático...');
        // O layout principal vai cuidar do redirecionamento automaticamente
      } else {
        console.log('❌ Login falhou:', result.error);
        Alert.alert('Erro', result.error || 'Email ou senha incorretos');
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      Alert.alert('Erro', 'Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToCadastro = () => {
    router.push('/(auth)/cadastro');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ThemedView style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons 
                name="footsteps" 
                size={60} 
                color={colorScheme === 'dark' ? '#4ade80' : '#16a34a'} 
              />
            </View>
            <ThemedText style={styles.title}>Corrida App</ThemedText>
            <ThemedText style={styles.subtitle}>Entre na sua conta</ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    { color: colorScheme === 'dark' ? '#f9fafb' : '#111827' }
                  ]}
                  placeholder="Digite seu email"
                  placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Senha */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Senha</ThemedText>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    { color: colorScheme === 'dark' ? '#f9fafb' : '#111827' }
                  ]}
                  placeholder="Digite sua senha"
                  placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão de Login */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ThemedText style={styles.loginButtonText}>Entrando...</ThemedText>
              ) : (
                <ThemedText style={styles.loginButtonText}>Entrar</ThemedText>
              )}
            </TouchableOpacity>

            {/* Esqueci a senha */}
            <TouchableOpacity style={styles.forgotPassword}>
              <ThemedText style={styles.forgotPasswordText}>
                Esqueceu sua senha?
              </ThemedText>
            </TouchableOpacity>


          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Não tem uma conta?{' '}
            </ThemedText>
            <TouchableOpacity onPress={goToCadastro}>
              <ThemedText style={styles.signUpText}>Cadastre-se</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#16a34a',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  signUpText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
  },
}); 