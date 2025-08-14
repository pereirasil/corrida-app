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
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={goToLogin}
              >
                <Ionicons 
                  name="arrow-back" 
                  size={24} 
                  color={colorScheme === 'dark' ? '#f9fafb' : '#111827'} 
                />
              </TouchableOpacity>
              
              <View style={styles.logoContainer}>
                <Ionicons 
                  name="person-add" 
                  size={50} 
                  color={colorScheme === 'dark' ? '#4ade80' : '#16a34a'} 
                />
              </View>
              <ThemedText style={styles.title}>Criar Conta</ThemedText>
              <ThemedText style={styles.subtitle}>
                Preencha os dados para começar
              </ThemedText>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Nome Completo */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Nome Completo</ThemedText>
                <View style={styles.inputWrapper}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { color: colorScheme === 'dark' ? '#f9fafb' : '#111827' }
                    ]}
                    placeholder="Digite seu nome completo"
                    placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
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
                <View style={styles.inputWrapper}>
                  <Ionicons 
                    name="at-outline" 
                    size={20} 
                    color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { color: colorScheme === 'dark' ? '#f9fafb' : '#111827' }
                    ]}
                    placeholder="Digite um nome de usuário"
                    placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
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
                <View style={styles.inputWrapper}>
                  <Ionicons 
                    name="call-outline" 
                    size={20} 
                    color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { color: colorScheme === 'dark' ? '#f9fafb' : '#111827' }
                    ]}
                    placeholder="Digite seu número de celular"
                    placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
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
                      color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirmar Senha */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Confirmar Senha</ThemedText>
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
                    placeholder="Confirme sua senha"
                    placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
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
                      color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Botão de Cadastro */}
              <TouchableOpacity
                style={[
                  styles.cadastroButton,
                  isLoading && styles.cadastroButtonDisabled
                ]}
                onPress={handleCadastro}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ThemedText style={styles.cadastroButtonText}>Criando conta...</ThemedText>
                ) : (
                  <ThemedText style={styles.cadastroButtonText}>Criar Conta</ThemedText>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>
                Já tem uma conta?{' '}
              </ThemedText>
              <TouchableOpacity onPress={goToLogin}>
                <ThemedText style={styles.signInText}>Entrar</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
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
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
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
  cadastroButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cadastroButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  cadastroButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  signInText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
  },
}); 