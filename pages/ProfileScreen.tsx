import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { API_URL } from '../config.ts';


const API_BASE_URL = API_URL;
const { width } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  interface User {
    id: string;
    name: string;
    email: string;
    profilePicture: string;
    rating: number;
  }
  const [activeTab, setActiveTab] = useState<'trades' | 'available' | 'traded'>('trades');
  const [user, setUser] = useState<User | null>(null);
  //const [trades, setTrades] = useState<Trade[]>([]);
  //const [products, setProducts] = useState<Product[]>([]);
  const navigation = useNavigation();

  // Carregar dados do usuário
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('Dados do usuário:', userData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };

    loadData();
  }, []);

  // Filtros para os diferentes tipos de produtos
  //const availableProducts = products.filter(p => p.status === 'available');
  //const tradedProducts = products.filter(p => p.status === 'traded');

  // Renderizar abas
  const renderTabButton = (title: string, tabName: 'trades' | 'available' | 'traded') => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabName && styles.activeTab]}
      onPress={() => setActiveTab(tabName)}
    >
      <Text style={[styles.tabText, activeTab === tabName && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
/*
  const handleCancelTrade = async (trade: Trade) => {
    Alert.alert(
      'Cancelar Proposta',
      'Tem certeza que deseja cancelar esta proposta?',
      [
        { text: 'Não', style: 'cancel' },
        { 
          text: 'Sim', 
          onPress: async () => {
            const updatedTrades = trades.filter(t =>
              t.id !== trade.id || 
              t.fromProduct.name !== trade.fromProduct.name
            );
            
            await AsyncStorage.setItem('trades', JSON.stringify(updatedTrades));
            setTrades(updatedTrades);
          }
        }
      ]
    );
  };

  // Renderizar item de produto trocado com par
  const renderTradedItem = ({ item }: { item: Trade }) => (
    <View style={styles.tradedPairContainer}>
      <ProductCard product={item.fromProduct} />
      <Image source={{uri: "../assets/trocado.png"}} style={styles.swapIcon} />
      <ProductCard product={item.toProduct} />
    </View>
  );

  // Componente de card de produto reutilizável
  const ProductCard = ({ product }: { product: Product }) => (
    <View style={styles.productCard}>
      {product.images.length > 0 && (
        <Image source={{ uri: product.images[0] }} style={styles.productImage} />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text>R$ {product.value.toFixed(2)}</Text>
        <Text>Qualidade: {product.quality}</Text>
      </View>
    </View>
  );
*/
  return (
    <View style={styles.container}>
      <Image source={ require('../assets/logo.png')} style={styles.logoImage} />
      <View style={styles.voltar} >
        <TouchableOpacity onPress={ () => { navigation.goBack()} }>
          <Image source={require('../assets/arrow-left.png')} style={{ width: 40, height: 40 }} />
        </TouchableOpacity>
      </View>
      {user && (
        <>
          {/* Header do perfil */}
          <View style={styles.profileHeader}>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.rating}>
                Avaliação: {user.rating ? '⭐'.repeat(Math.floor(user.rating || 0)) : 'Sem avaliação'}
              </Text>
            </View>
            <Image
              source={user.profilePicture 
                ? { uri: `${API_BASE_URL}/pictures${user.profilePicture.replace(/\\/g, '/')}` } 
                : require('../assets/profile.png')}
              style={styles.profileImage}
            />
          </View>

          {/* Abas de navegação */}
          <View style={styles.tabContainer}>
            {renderTabButton('Propostas', 'trades')}
            {renderTabButton('Disponíveis', 'available')}
            {renderTabButton('Trocados', 'traded')}
          </View>

          {/* Conteúdo das abas 
          {activeTab === 'trades' && (
            <FlatList
              data={trades}
              renderItem={({ item }) => (
                <View style={styles.tradeItem}>
                  <Text style={styles.tradeStatus}>
                    {item.status === 'pending' ? '⏳ Pendente' : 
                     item.status === 'accepted' ? '✅ Aceita' : 
                     item.status === 'rejected' ? '❌ Recusada' : '🚫 Cancelada'}
                  </Text>
                  <ProductCard product={item.fromProduct} />
                  <Image source={{uri: "../assets/trocado.png"}} style={styles.swapIcon} />
                  <ProductCard product={item.toProduct} />
                  {item.status === 'pending' && (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelTrade(item)}
                    >
                      <Icon name="cancel" size={20} color="red" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              keyExtractor={(item) => item.id}
            />
          )}

          {activeTab === 'available' && (
            <FlatList
              data={availableProducts}
              numColumns={2}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.gridContent}
            />
          )}

          {activeTab === 'traded' && (
            <FlatList
              data={trades.filter(t => t.status === 'accepted')}
              renderItem={renderTradedItem}
              keyExtractor={(item) => item.id}
            />
          )}*/}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#386ea1',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
    elevation: 2,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  rating: {
    fontSize: 14,
    color: '#f39c12',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#386EA1',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#386EA1',
    fontWeight: 'bold',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    margin: 4,
    width: (width / 2) - 24,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 4,
  },
  productInfo: {
    paddingTop: 8,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  tradeItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    elevation: 2,
  },
  voltar: {
    justifyContent: 'flex-end',
    marginTop: 48,
    fontSize: 16,
    alignItems: 'flex-end',
    right: 10,

    marginBottom: 20,

  },
  logoImage: {
    width: 40,
    height: 42,
    
    position: 'absolute',
    top: 45,
    left: 20,
  },
  tradeStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#386EA1',
  },
  tradedPairContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '0',
    borderRadius: 8,
    padding: 3,
    margin: 8,
    elevation: 0,
  },
  swapIcon: {
    width: 40,
    height: 40,
    marginHorizontal: 5,
  },
  cancelButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  gridContent: {
    paddingHorizontal: 16,
  },
});

export default ProfileScreen;