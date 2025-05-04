import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FloatingAction } from 'react-native-floating-action';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { logoutUser } from '../services/loginServices';
import { API_URL } from '../config';
import { listProducts, Product, ProductFilters, testApiConnection } from '../services/homeServices';


const API_BASE_URL = API_URL;

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface Filter {
  state: string;
  city: string;
  tags: string;
  minValue: string;
  maxValue: string;
}

interface ProductItem extends Product {
  key: string;
}

const colors = {
  primary: '#2f95dc',
  text: '#FFFF',
  border: '#0',
  background: '#386ea1',
};

const actions = [
  {
    text: 'Adicionar Produto',
    icon: require('../assets/plus.png'),
    name: 'bt_add',
    position: 1,
  },
  {
    text: 'Trocas Pendentes',
    icon: require('../assets/logo.png'),
    name: 'bt_trades',
    position: 2,
  },
  {
    text: 'Meu perfil',
    icon: require('../assets/profile.png'),
    name: 'bt_profile',
    position: 3,
  },
  {
    text: 'Deslogar',
    icon: require('../assets/logout.png'),
    name: 'bt_logoff',
    position: 4,
  },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  interface User {
    id: string;
    name: string;
    email: string;
    profilePicture: string;
    rating: number;
  }
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<Filter>({
    state: '',
    city: '',
    tags: '',
    minValue: '',
    maxValue: '',
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Estado para armazenar os produtos
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Atualize o state
  const [user, setUser] = useState<User | null>(null);

  // Valor animado para exibir os filtros extras
  const filtersAnim = useRef(new Animated.Value(0)).current;

  // Função para buscar produtos da API
  const fetchProducts = async (page: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (!refresh && page === 1) {
        setLoading(true);
      }
      
      // Testar a conexão com a API primeiro
      await testApiConnection();
      console.log('Teste de conexão com a API realizado');
      
      // Mesmo se a conexão falhar, continuamos com os dados mockados
      // que serão fornecidos pela função listProducts

      // Preparar os filtros para a API ou para filtrar os dados mockados
      const apiFilters: ProductFilters = {
        search: search,
        state: filter.state,
        city: filter.city,
        minPrice: filter.minValue ? parseFloat(filter.minValue) : undefined,
        maxPrice: filter.maxValue ? parseFloat(filter.maxValue) : undefined,
        page: page,
        limit: 10, // Número de itens por página
      };
      
      console.log('Buscando produtos com filtros:', apiFilters);

      // Chamar o serviço de listagem de produtos (que usará dados mockados se a API falhar)
      const result = await listProducts(apiFilters);
      console.log('Resultado da busca de produtos:', result);

      // Processar os resultados
      const formattedProducts = result.products.map(product => ({
        ...product,
        key: product.id, // Adicionar uma chave única para o FlatList
      }));

      if (page === 1 || refresh) {
        setProducts(formattedProducts);
      } else {
        setProducts(prev => [...prev, ...formattedProducts]);
      }

      setTotalProducts(result.total);
      setTotalPages(result.pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      // Mostrar mensagem de erro mais detalhada no console
      console.warn(`Erro ao buscar produtos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Função para carregar mais produtos ao rolar a lista
  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      fetchProducts(currentPage + 1);
    }
  };

  // Função para atualizar a lista (pull to refresh)
  const handleRefresh = () => {
    fetchProducts(1, true);
  };

  // Efeito para carregar dados do usuário e produtos iniciais
  useEffect(() => {
    const loadUserData = async () => {
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

    loadUserData();
    fetchProducts();
  }, []);

  // Efeito para buscar produtos quando o texto de busca muda
  useEffect(() => {
    // Cancelar o timeout anterior se existir
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Definir um novo timeout para evitar muitas requisições
    const timeout = setTimeout(() => {
      // Apenas buscar se o texto de busca tiver pelo menos 2 caracteres ou estiver vazio
      if (search.length === 0 || search.length >= 2) {
        setCurrentPage(1);
        fetchProducts(1, false);
      }
    }, 500); // Aguardar 500ms após o usuário parar de digitar
    
    setSearchTimeout(timeout);
    
    // Limpar o timeout quando o componente for desmontado
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [search]);

  // Ao focar o campo de busca, expande os filtros (opcional)
  const handleFocusSearch = () => {
    // Não abre os filtros automaticamente ao focar na busca
    // O usuário pode clicar no botão de filtro se quiser
  };

  // Função para alternar a exibição dos filtros
  const toggleFilters = () => {
    setShowFilters(!showFilters);
    
    // Animar a exibição/ocultação dos filtros
    Animated.timing(filtersAnim, {
      toValue: showFilters ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Função para aplicar os filtros
  const applyFilters = () => {
    setCurrentPage(1);
    fetchProducts(1, false);
    // Fechar os filtros após aplicar
    setShowFilters(false);
  };

  // Função para limpar os filtros
  const clearFilters = () => {
    setFilter({
      state: '',
      city: '',
      tags: '',
      minValue: '',
      maxValue: '',
    });
    setCurrentPage(1);
    fetchProducts(1, false);
    // Fechar os filtros após limpar
    setShowFilters(false);
  };

  // Renderiza cada item da lista de produtos
  const renderItem = ({ item }: { item: ProductItem }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        // Implementação futura: navegação para detalhes do produto
        // navigation.navigate('ProductDetail', { productId: item.id });
        console.log('Produto selecionado:', item.id);
      }}
    >
      <Image
        source={{
          uri: item.images && item.images.length > 0
            ? `${API_BASE_URL}/pictures${item.images[0].replace(/\\/g, '/')}`
            : 'https://via.placeholder.com/150',
        }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.textOverlay}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemPrice}>R$ {item.price.toFixed(2)}</Text>
        <Text style={styles.itemLocation}>{item.location.city}, {item.location.state}</Text>
      </View>
    </TouchableOpacity>
  );

  // Renderiza o footer da lista (indicador de carregamento)
  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#FFFFFF" />
        <Text style={styles.footerText}>Carregando mais produtos...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Text>{'\n'}{'\n'}</Text>
      <View style={{ marginTop: 30 }}></View>
      <TouchableOpacity
        style={styles.userInfoContainer}
        onPress={() => navigation.navigate('Profile')}
      >
        {user && (
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Image
              style={styles.logoImage}
              source={require('../assets/logo_v2.png')}
            />
            <View style={styles.userInfoContainer}>
              <Image
                style={styles.userImage}
                source={user.profilePicture ? { uri: user.profilePicture } : require('../assets/profile.png')}
              />
              <View style={{ marginLeft: 10 }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{user.name || 'Juu'}</Text>
              </View>
            </View>
          </SafeAreaView>
        )}
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
            onFocus={handleFocusSearch}
          />
          <TouchableOpacity style={styles.filterToggleButton} onPress={toggleFilters}>
            <Text style={styles.filterToggleText}>{showFilters ? 'Ocultar' : 'Filtros'}</Text>
          </TouchableOpacity>
        </View>
        
        {showFilters && (
          <Animated.View
            style={[styles.filtersContainer, {
              maxHeight: filtersAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1000]
              }),
              opacity: filtersAnim
            }]}
          >
            <TextInput
              style={styles.filterInput}
              placeholder="Estado"
              placeholderTextColor="#999"
              value={filter.state}
              onChangeText={(text) => setFilter({ ...filter, state: text })}
            />
            <TextInput
              style={styles.filterInput}
              placeholder="Cidade"
              placeholderTextColor="#999"
              value={filter.city}
              onChangeText={(text) => setFilter({ ...filter, city: text })}
            />
            <TextInput
              style={styles.filterInput}
              placeholder="Valor Min"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={filter.minValue}
              onChangeText={(text) => setFilter({ ...filter, minValue: text })}
            />
            <TextInput
              style={styles.filterInput}
              placeholder="Valor Max"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={filter.maxValue}
              onChangeText={(text) => setFilter({ ...filter, maxValue: text })}
            />
            <View style={styles.filterButtonsRow}>
              <TouchableOpacity style={styles.filterButton} onPress={applyFilters}>
                <Text style={styles.filterButtonText}>Aplicar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.clearFilterButton} onPress={clearFilters}>
                <Text style={styles.filterButtonText}>Limpar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>

      <Text style={styles.text}>Conheça os itens que estão disponíveis para troca</Text>

      {loading && products.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loaderText}>Carregando produtos...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={() => fetchProducts(1, true)}>
            <Text style={styles.refreshButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#FFFFFF']}
              tintColor="#FFFFFF"
              titleColor="#FFFFFF"
              title="Atualizando produtos..."
            />
          }
        />
      )}

      <FloatingAction
        actions={actions}
        floatingIcon={Image.resolveAssetSource(require('../assets/menu.png')).uri}
        onPressItem={async (name) => {
          if (name === 'bt_add') {
            // navigation.navigate('Product');
          }
          if (name === 'bt_trades') {
            // navigation.navigate('ReceivedProposals');
          }
          if (name === 'bt_profile') {
            navigation.navigate('Profile');
          }
          if (name === 'bt_logoff') {
            await logoutUser();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  userName: {
    fontSize: 18,
    marginRight: 10,
    fontWeight: '600',
    color: colors.text,
  },
  viewProfile: {
    color: colors.primary,
    fontSize: 14,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    backgroundColor: colors.background,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  regionContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  regionButton: {
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  regionText: {
    color: colors.text,
    fontWeight: '500',
  },
  item: {
    marginTop: 16,
    backgroundColor: 'white',
    padding: 16,
    borderWidth: .1,
    borderRadius: 12,
    borderColor: colors.border,

  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  itemContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    flex: 1,
    width: '100%',
  },
  text: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 16,
    marginHorizontal: 16,
    textAlign: 'center',
    
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    padding: 16,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  itemLocation: {
    fontSize: 14,
    color: 'white',
    fontStyle: 'italic',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loaderText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerLoader: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 10,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  filterButtonText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  viewButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  viewButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  searchContainer: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: 'transparent',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  filterToggleButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterToggleText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
  filterButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    gap: 8,
  },
  clearFilterButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  userInfoContainer: {
    backgroundColor: colors.background,
    position: 'absolute',
    top: 40,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 0,
    elevation: 5,
    zIndex: 10,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  logoImage: {
    width: 40,
    height: 42,
    
    position: 'absolute',
    top: 45,
    left: 20,
  },
  
  userRating: {
    fontSize: 12,
    color: 'gray',
  },
  itemDescription: { color: 'black', marginBottom: 5 },
  filtersContainer: {
    backgroundColor: colors.background,
    overflow: 'hidden',
    borderRadius: 5,
    padding: 8,
    marginTop: 5,
  },
  filterInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    marginBottom: 5,
    padding: 6,
    color: 'black',
  },
});

export default HomeScreen;
