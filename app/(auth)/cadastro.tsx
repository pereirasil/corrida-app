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
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function CadastroScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { register } = useAuth();

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu nome completo');
      return false;
    }
    if (!formData.username.trim()) {
      Alert.alert('Erro', 'Por favor, digite um nome de usuário');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu número de celular');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu email');
      return false;
    }
    if (!formData.password) {
      Alert.alert('Erro', 'Por favor, digite uma senha');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleCadastro = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const result = await register({
        name: formData.fullName,
        username: formData.username,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        Alert.alert(
          'Sucesso!', 
          'Conta criada com sucesso! Faça login para continuar.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/login')
            }
          ]
        );
      } else {
        Alert.alert('Erro', result.error || 'Erro ao criar conta');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      Alert.alert('Erro', 'Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    router.back();
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

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header inspirado no site */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={goToLogin}
              >
                <Ionicons 
                  name="arrow-back" 
                  size={24} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
              
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryLight]}
                  style={styles.logoGradient}
                >
                  <Ionicons 
                    name="person-add" 
                    size={40} 
                    color="#FFFFFF" 
                  />
                </LinearGradient>
              </View>
              <ThemedText style={[styles.title, { color: colors.primary }]}>
                Revolucione Sua Corrida
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Junte-se a milhares de corredores conectados
              </ThemedText>
            </View>

            {/* Form com design renovado */}
            <View style={styles.form}>
              {/* Nome Completo */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Nome Completo</ThemedText>
                <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={colors.primary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Digite seu nome completo"
                    placeholderTextColor={colors.textLight}
                    value={formData.fullName}
                    onChangeText={(value) => updateFormData('fullName', value)}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Nome de Usuário */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Nome de Usuário</ThemedText>
                <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                  <Ionicons 
                    name="at-outline" 
                    size={20} 
                    color={colors.primary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Digite um nome de usuário"
                    placeholderTextColor={colors.textLight}
                    value={formData.username}
                    onChangeText={(value) => updateFormData('username', value)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Celular */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Celular</ThemedText>
                <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                  <Ionicons 
                    name="call-outline" 
                    size={20} 
                    color={colors.primary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Digite seu número de celular"
                    placeholderTextColor={colors.textLight}
                    value={formData.phone}
                    onChangeText={(value) => updateFormData('phone', value)}
                    keyboardType="phone-pad"
                    autoCorrect={false}
                  />
                </View>
              </View>

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
                    value={formData.email}
                    onChangeText={(value) => updateFormData('email', value)}
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
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
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

              {/* Confirmar Senha */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Confirmar Senha</ThemedText>
                <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={colors.primary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Confirme sua senha"
                    placeholderTextColor={colors.textLight}
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateFormData('confirmPassword', value)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color={colors.primary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Botão de Cadastro inspirado no site */}
              <TouchableOpacity
                style={[
                  styles.cadastroButton,
                  { backgroundColor: colors.primary },
                  isLoading && styles.cadastroButtonDisabled
                ]}
                onPress={handleCadastro}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ThemedText style={styles.cadastroButtonText}>Criando conta...</ThemedText>
                ) : (
                  <>
                    <Ionicons name="download" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    <ThemedText style={styles.cadastroButtonText}>Baixar Agora</ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>
                Já tem uma conta?{' '}
              </ThemedText>
              <TouchableOpacity onPress={goToLogin}>
                <ThemedText style={[styles.signInText, { color: colors.primary }]}>
                  Entrar
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
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 8,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
    color: '#2C3E50',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
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
  cadastroButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#F26522',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cadastroButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonIcon: {
    marginRight: 8,
  },
  cadastroButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
    color: '#2C3E50',
  },
  signInText: {
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.7,
    color: '#2C3E50',
    textAlign: 'center',
  },
}); 