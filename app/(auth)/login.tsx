import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
    Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
        {/* Background com gradiente inspirado no site */}
        <LinearGradient
          colors={['#FFFFFF', '#FFF8F5', '#FFF0E8']}
          style={styles.backgroundGradient}
        />
        
        {/* Elementos decorativos de fundo */}
        <View style={styles.backgroundElements}>
          <View style={[styles.circle1, { backgroundColor: colors.primaryLight + '10' }]} />
          <View style={[styles.circle2, { backgroundColor: colors.primary + '15' }]} />
          <View style={[styles.circle3, { backgroundColor: colors.accent + '10' }]} />
        </View>

        <View style={styles.content}>
          {/* Header inspirado no site */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                style={styles.logoGradient}
              >
                <Ionicons 
                  name="footsteps" 
                  size={50} 
                  color="#FFFFFF" 
                />
              </LinearGradient>
            </View>
            <ThemedText style={[styles.title, { color: colors.primary }]}>
              Corra Junto, Supere Limites
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              O primeiro app que conecta corredores em tempo real
            </ThemedText>
          </View>

          {/* Form com design renovado */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={colors.primary} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Digite seu email"
                  placeholderTextColor={colors.textLight}
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
              <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={colors.primary} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Digite sua senha"
                  placeholderTextColor={colors.textLight}
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
                    color={colors.primary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão de Login inspirado no site */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                { backgroundColor: colors.primary },
                isLoading && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ThemedText style={styles.loginButtonText}>Entrando...</ThemedText>
              ) : (
                <>
                  <Ionicons name="play" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <ThemedText style={styles.loginButtonText}>Entrar</ThemedText>
                </>
              )}
            </TouchableOpacity>

            {/* Esqueci a senha */}
            <TouchableOpacity style={styles.forgotPassword}>
              <ThemedText style={[styles.forgotPasswordText, { color: colors.primary }]}>
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
              <ThemedText style={[styles.signUpText, { color: colors.primary }]}>
                Cadastre-se
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Estatísticas inspiradas no site */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: colors.primary }]}>50k+</ThemedText>
              <ThemedText style={styles.statLabel}>Corredores Conectados</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: colors.primary }]}>1M+</ThemedText>
              <ThemedText style={styles.statLabel}>Quilômetros Percorridos</ThemedText>
            </View>
          </View>
        </View>
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
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle1: {
    position: 'absolute',
    top: height * 0.1,
    right: -width * 0.1,
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
  },
  circle2: {
    position: 'absolute',
    top: height * 0.3,
    left: -width * 0.15,
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
  },
  circle3: {
    position: 'absolute',
    bottom: height * 0.2,
    right: -width * 0.1,
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: width * 0.125,
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
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
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
    color: '#2C3E50',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#F26522',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  forgotPassword: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
    color: '#2C3E50',
  },
  signUpText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    color: '#2C3E50',
    textAlign: 'center',
  },
}); 