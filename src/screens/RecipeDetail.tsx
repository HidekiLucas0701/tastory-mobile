import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth } from '../services/firebaseConfig';

export default function RecipeDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Recebe os dados da receita passados via parâmetro de navegação
  const { recipe } = route.params || {};

  const currentUser = auth.currentUser;
  
  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#C85A32" />
          <Text style={styles.errorText}>Receita não encontrada.</Text>
          <TouchableOpacity style={styles.backButtonInline} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonInlineText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header com Voltar e Botão de Editar (se for o dono) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2D2420" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {recipe.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Imagem ou Placeholder da Receita */}
        <View style={styles.imageContainer}>
          {recipe.imageUrl ? (
            <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="restaurant" size={48} color="#C85A32" />
            </View>
          )}
        </View>

        {/* Informações Principais da Receita */}
        <View style={styles.mainInfo}>
          <Text style={styles.title}>{recipe.title}</Text>
          
          <View style={styles.authorBadge}>
            <Ionicons name="person-circle-outline" size={18} color="#A09890" />
            <Text style={styles.authorText}>
              Por <Text style={styles.authorName}>{recipe.authorName || 'Chef da Comunidade'}</Text>
            </Text>
          </View>

          {/* Cards de Atributos (Tempo, Rendimento, Categoria) */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={20} color="#C85A32" />
              <Text style={styles.statValue}>{recipe.prepTime || '30'} min</Text>
              <Text style={styles.statLabel}>Preparo</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCard}>
              <Ionicons name="restaurant-outline" size={20} color="#C85A32" />
              <Text style={styles.statValue}>{recipe.servings || '1'} porções</Text>
              <Text style={styles.statLabel}>Rendimento</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCard}>
              <Ionicons name="pricetag-outline" size={20} color="#C85A32" />
              <Text style={styles.statValue} numberOfLines={1}>{recipe.category || 'Geral'}</Text>
              <Text style={styles.statLabel}>Categoria</Text>
            </View>
          </View>
        </View>

        {/* Seção de Ingredientes */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="list-outline" size={22} color="#C85A32" />
            <Text style={styles.sectionTitle}>Ingredientes</Text>
          </View>
          
          <View style={styles.cardBox}>
            <Text style={styles.bodyText}>{recipe.ingredients}</Text>
          </View>
        </View>

        {/* Seção do Modo de Preparo */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="flame-outline" size={22} color="#C85A32" />
            <Text style={styles.sectionTitle}>Modo de Preparo</Text>
          </View>

          <View style={styles.cardBox}>
            <Text style={styles.bodyText}>{recipe.instructions}</Text>
          </View>
        </View>

      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E6DFD5',
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D2420',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editButtonText: {
    color: '#C85A32',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 24,
    gap: 24,
  },
  imageContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6DFD5',
    backgroundColor: '#FFFFFF',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#F4EFE6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainInfo: {
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D2420',
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorText: {
    fontSize: 13,
    color: '#A09890',
  },
  authorName: {
    color: '#2D2420',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E6DFD5',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 8,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D2420',
  },
  statLabel: {
    fontSize: 11,
    color: '#A09890',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E6DFD5',
  },
  section: {
    gap: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D2420',
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6DFD5',
  },
  bodyText: {
    fontSize: 14,
    color: '#2D2420',
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#A09890',
  },
  backButtonInline: {
    backgroundColor: '#C85A32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonInlineText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});