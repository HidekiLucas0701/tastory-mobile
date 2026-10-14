import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Home from '../screens/Home';
import RecipeFormsScreen from '../screens/RecipeForms';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E6DFD5',
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#C85A32',
        tabBarInactiveTintColor: '#A09890',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap | undefined;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'RecipeForms') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={Home} 
        options={{ title: 'Início' }}
      />
      <Tab.Screen 
        name="RecipeForms" 
        component={RecipeFormsScreen} 
        options={{ title: 'Formulário de Receita' }}
      />
    </Tab.Navigator>
  );
}
