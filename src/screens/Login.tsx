import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../services/firebaseConfig'; 
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigation = useNavigation<any>();
  
  const getFriendlyErrorMessage = (errorCode : any) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este e-mail já está cadastrado. Tente entrar.';
      case 'auth/invalid-email':
        return 'O e-mail digitado é inválido.';
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'E-mail ou senha incorretos.';
      default:
        return 'Ocorreu um erro. Verifique seus dados e tente novamente.';
    }
  };

  const handleAuthentication = async () => {
    if (!email.trim() || !password.trim() || (!isLogin && !name.trim())) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        
        // Atualiza o perfil do usuário recém-criado adicionando o displayName
        await updateProfile(userCredential.user, {
          displayName: name.trim()
        });

        const token = await userCredential.user.getIdToken();
        console.log('Token:', token);
        console.log('Nome cadastrado com sucesso:', userCredential.user.displayName);
      }
      navigation.navigate('MainTabs', {screen: 'Home'});
    } catch (error : any ) {
      console.log(error);
      setErrorMessage(getFriendlyErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.innerContainer}
      >
        {/* Cabeçalho Culinário */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="restaurant" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Tastory</Text>
          <Text style={styles.slogan}>Taste your story</Text>
        </View>

        {/* Abas Alternativas (Entrar / Cadastrar) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, isLogin && styles.activeTab]} 
            onPress={() => { setIsLogin(true); setErrorMessage(''); }}
          >
            <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, !isLogin && styles.activeTab]} 
            onPress={() => { setIsLogin(false); setErrorMessage(''); }}
          >
            <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Cadastrar</Text>
          </TouchableOpacity>
        </View>

        {/* Caixa de Erro */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#C85A32" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Formulário */}
        <View style={styles.form}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome do Chef</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Ana Maria"
                placeholderTextColor="#A09890"
                value={name}
                onChangeText={setName}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor="#A09890"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Sua senha secreta"
              placeholderTextColor="#A09890"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleAuthentication}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Entrar na Cozinha' : 'Criar minha Conta'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#C85A32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#C85A32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D2420',
  },
  slogan: {
    fontSize: 12,
    color: '#C85A32',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 2,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4EFE6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#2D2420',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#2D2420',
    opacity: 0.6,
    fontWeight: '600',
  },
  activeTabText: {
    opacity: 1,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2D2420',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DFD5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2D2420',
  },
  button: {
    backgroundColor: '#C85A32',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#C85A32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF0ED',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#C85A32',
    fontSize: 12,
    flex: 1,
  },
});