import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../services/firebaseConfig';

const storage = getStorage();

export default function RecipeFormsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const recipeId = route.params?.recipeId;
  const isEditing = Boolean(recipeId);

  // Estados dos campos da receita
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [servings, setServings] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // Guarda a URL final (digitada ou do upload)
  const [imageUri, setImageUri] = useState<string | null>(null); // Guarda a URI local do arquivo selecionado
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditing);

  useEffect(() => {
    if (isEditing && recipeId) {
      const fetchRecipeData = async () => {
        try {
          const docRef = doc(db, 'recipes', recipeId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const currentUser = auth.currentUser;

            if (!currentUser || data.userId !== currentUser.uid) {
              Alert.alert(
                'Acesso Negado',
                'Você não tem permissão para editar receitas de outros usuários.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
              return;
            }

            setTitle(data.title || '');
            setCategory(data.category || '');
            setPrepTime(data.prepTime ? String(data.prepTime) : '');
            setServings(data.servings ? String(data.servings) : '');
            setImageUrl(data.imageUrl || '');
          } else {
            Alert.alert('Erro', 'Receita não encontrada.', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          }
        } catch (error) {
          console.error('Erro ao carregar receita para edição:', error);
          Alert.alert('Erro', 'Não foi possível carregar os dados da receita.');
          navigation.goBack();
        } finally {
          setFetchingData(false);
        }
      };

      fetchRecipeData();
    }
  }, [isEditing, recipeId]);

  // Função para abrir a galeria e selecionar uma foto
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua galeria de fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setImageUrl(''); // Limpa a URL digitada se escolher um arquivo local
    }
  };

  // Função para fazer upload da imagem local para o Firebase Storage
  const uploadImageToStorage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const filename = `recipes/${auth.currentUser?.uid}_${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  };

  const handleSaveRecipe = async () => {
    if (!title.trim() || !ingredients.trim() || !instructions.trim()) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha pelo menos o título, os ingredientes e o modo de preparo.');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Erro de Autenticação', 'Você precisa estar logado para salvar uma receita.');
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = imageUrl.trim();

      // Se o usuário selecionou um arquivo local, faz o upload primeiro
      if (imageUri) {
        finalImageUrl = await uploadImageToStorage(imageUri);
      }

      const recipeData = {
        title: title.trim(),
        category: category.trim() || 'Culinária Caseira',
        prepTime: prepTime.trim() || '30',
        servings: servings.trim() || '1',
        imageUrl: finalImageUrl,
        ingredients: ingredients.trim(),
        instructions: instructions.trim(),
      };

      if (isEditing && recipeId) {
        const docRef = doc(db, 'recipes', recipeId);
        await updateDoc(docRef, {
          ...recipeData,
          updatedAt: serverTimestamp(),
        });

        Alert.alert('Sucesso! 🎉', 'Sua receita foi atualizada com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await addDoc(collection(db, 'recipes'), {
          ...recipeData,
          userId: currentUser.uid,
          authorName: currentUser.displayName || 'Chef',
          createdAt: serverTimestamp(),
        });

        Alert.alert('Sucesso! 🎉', 'Sua receita foi cadastrada com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      Alert.alert('Erro', 'Não foi possível salvar a receita. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#C85A32" />
        <Text style={styles.loadingText}>Carregando receita...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2D2420" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Editar Receita' : 'Nova Receita'}</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.banner}>
            <Ionicons name={isEditing ? "create-outline" : "restaurant-outline"} size={36} color="#C85A32" />
            <Text style={styles.bannerTitle}>{isEditing ? 'Atualize sua Receita' : 'Compartilhe seu Sabor'}</Text>
            <Text style={styles.bannerSubtitle}>
              {isEditing ? 'Modifique os detalhes da sua criação culinária.' : 'Preencha os detalhes da sua criação culinária.'}
            </Text>
          </View>

          <View style={styles.form}>
            {/* Título */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome da Receita *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Strogonoff de Frango Especial"
                placeholderTextColor="#A09890"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Categoria */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoria</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Almoço, Sobremesa, Massas"
                placeholderTextColor="#A09890"
                value={category}
                onChangeText={setCategory}
              />
            </View>

            {/* Tempo e Rendimento */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Tempo (minutos)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 45"
                  placeholderTextColor="#A09890"
                  keyboardType="numeric"
                  value={prepTime}
                  onChangeText={setPrepTime}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Rendimento (porções)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 4"
                  placeholderTextColor="#A09890"
                  keyboardType="numeric"
                  value={servings}
                  onChangeText={setServings}
                />
              </View>
            </View>

            {/* Seção de Imagem (Upload ou URL) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Foto da Receita</Text>
              
              <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
                <Ionicons name="image-outline" size={20} color="#C85A32" />
                <Text style={styles.uploadButtonText}>
                  {imageUri ? 'Trocar foto do dispositivo' : 'Selecionar foto do dispositivo'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.orText}>ou informe uma URL de imagem:</Text>

              <TextInput
                style={styles.input}
                placeholder="https://exemplo.com/foto.jpg"
                placeholderTextColor="#A09890"
                autoCapitalize="none"
                value={imageUrl}
                onChangeText={(text) => {
                  setImageUrl(text);
                  if (text) setImageUri(null); // Limpa o arquivo local se digitar URL
                }}
              />
            </View>

            {/* Pré-visualização da Imagem */}
            {(imageUri || imageUrl) ? (
              <View style={styles.previewContainer}>
                <Image 
                  source={{ uri: imageUri || imageUrl }} 
                  style={styles.previewImage} 
                  resizeMode="cover"
                />
              </View>
            ) : null}

            {/* Ingredientes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ingredientes *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={`• 500g de peito de frango\n• 1 caixa de creme de leite`}
                placeholderTextColor="#A09890"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={ingredients}
                onChangeText={setIngredients}
              />
            </View>

            {/* Modo de Preparo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Modo de Preparo *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={`1. Em uma panela, doure o frango...\n2. Adicione o molho...`}
                placeholderTextColor="#A09890"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={instructions}
                onChangeText={setInstructions}
              />
            </View>

            {/* Botão Salvar */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveRecipe}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>{isEditing ? 'Salvar Alterações' : 'Publicar Receita'}</Text>
                </>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  centered: { justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#A09890' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E6DFD5',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D2420' },
  scrollContent: { padding: 24, paddingBottom: 40, gap: 20 },
  banner: {
    backgroundColor: '#F4EFE6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6DFD5',
    gap: 6,
  },
  bannerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D2420' },
  bannerSubtitle: { fontSize: 13, color: '#A09890', textAlign: 'center' },
  form: { gap: 16 },
  row: { flexDirection: 'row', gap: 12 },
  inputGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#2D2420' },
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
  textArea: { minHeight: 100, paddingTop: 12 },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF0ED',
    borderWidth: 1,
    borderColor: '#C85A32',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  uploadButtonText: { color: '#C85A32', fontSize: 14, fontWeight: '600' },
  orText: { fontSize: 12, color: '#A09890', textAlign: 'center', marginVertical: 2 },
  previewContainer: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6DFD5',
    backgroundColor: '#FFFFFF',
  },
  previewImage: { width: '100%', height: '100%' },
  saveButton: {
    backgroundColor: '#C85A32',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    shadowColor: '#C85A32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});