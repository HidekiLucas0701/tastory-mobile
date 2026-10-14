import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../services/firebaseConfig';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Recipe } from '../types/types';

export default function Home() {
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [communityRecipes, setCommunityRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<any>();

  // Dados do usuário logado atual
  const currentUser = auth.currentUser;
  const userName = currentUser?.displayName || 'Chef';

  const logout = async () => {
    try {
      await auth.signOut();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza de que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ],
      { cancelable: true }
    );
  };

  // useFocusEffect substitui o useEffect para atualizar os dados sempre que a Home ganha foco
  useFocusEffect(
    useCallback(() => {
      fetchRecipes();
    }, [])
  );

  const fetchRecipes = async () => {
    try {
      setLoading(true);

      if (currentUser) {
        // 1. Busca receitas criadas pelo usuário logado (filtra pelo uid)
        const userQuery = query(
          collection(db, 'recipes'),
          where('userId', '==', currentUser.uid)
        );
        const userSnapshot = await getDocs(userQuery);
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Recipe[];
        setUserRecipes(userList);
      }

      // 2. Busca receitas da comunidade
      const communityQuery = query(
        collection(db, 'recipes'),
        limit(10)
      );
      const communitySnapshot = await getDocs(communityQuery);
      const communityList = communitySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Recipe[];
      setCommunityRecipes(communityList);

    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* 1. Header com saudação ao usuário logado */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Boas vindas,</Text>
          <Text style={styles.userName}>{userName} 👨‍🍳</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={36} color="#C85A32" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#C85A32" />
          <Text style={styles.loaderText}>Buscando os melhores sabores...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* 2. Lista de rolagem vertical com as receitas criadas pelo usuário */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Suas Receitas</Text>
              <Text style={styles.sectionCount}>{userRecipes.length} cadastradas</Text>
            </View>

            {userRecipes.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="book-outline" size={28} color="#A09890" />
                <Text style={styles.emptyText}>Você ainda não criou nenhuma receita.</Text>
                <TouchableOpacity
                  style={styles.inlineButton}
                  onPress={() => navigation.navigate('RecipeForms')}
                >
                  <Text style={styles.inlineButtonText}>Criar primeira receita</Text>
                </TouchableOpacity>
              </View>
            ) : (
              userRecipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.recipeCard}
                  onPress={() => navigation.navigate('RecipeForms', { recipe, recipeId: recipe.id })}
                >
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeTitle}>{recipe.title}</Text>
                    <Text style={styles.recipeCategory} numberOfLines={1}>
                      {recipe.category || 'Culinária Caseira'} • ⏱️ {recipe.prepTime || '30'} min
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#C85A32" />
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* 3. Receitas criadas pela Comunidade */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Receitas da Comunidade</Text>
              <Text style={styles.sectionSubtitle}>Inspire-se</Text>
            </View>

            {communityRecipes.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma receita da comunidade encontrada no momento.</Text>
            ) : (
              <FlatList
                data={communityRecipes}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.communityCard}
                    onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
                  >
                    <View style={styles.communityCardImagePlaceholder}>
                      {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.communityCardImage} />
                      ) : (
                        <Ionicons name="restaurant" size={24} color="#C85A32" />
                      )}
                    </View>
                    <Text style={styles.communityRecipeTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.communityChef}>Por: {item.authorName || 'Chef da Comunidade'}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>

        </ScrollView>
      )}

      {/* 4. Botão flutuante (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('RecipeForms')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6DFD5',
  },
  welcomeText: {
    fontSize: 13,
    color: '#A09890',
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D2420',
  },
  profileButton: {
    padding: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    color: '#A09890',
    fontSize: 14,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
    gap: 28,
  },
  sectionContainer: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D2420',
  },
  sectionCount: {
    fontSize: 12,
    color: '#C85A32',
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#A09890',
  },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E6DFD5',
    shadowColor: '#2D2420',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeInfo: {
    flex: 1,
    gap: 4,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2420',
  },
  recipeCategory: {
    fontSize: 13,
    color: '#A09890',
  },
  emptyCard: {
    backgroundColor: '#F4EFE6',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E6DFD5',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 13,
    color: '#A09890',
    textAlign: 'center',
  },
  inlineButton: {
    marginTop: 4,
    backgroundColor: '#C85A32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inlineButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  communityCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E6DFD5',
    gap: 8,
    shadowColor: '#2D2420',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  communityCardImagePlaceholder: {
    height: 90,
    backgroundColor: '#FDF0ED',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityCardImage: {
    width: '100%',
    height: '100%',
  },
  communityRecipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2420',
  },
  communityChef: {
    fontSize: 11,
    color: '#A09890',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#C85A32',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C85A32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});