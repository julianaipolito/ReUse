import AsyncStorage from '@react-native-async-storage/async-storage';

// URLs das APIs
const ORIGINAL_API_URL = 'http://89.117.33.17:3000';
const FAKESTORE_API_URL = 'https://fakestoreapi.com';
const PRODUCTS_ENDPOINT = '/api/products';
const FAKESTORE_PRODUCTS_ENDPOINT = '/products';

// API atual em uso
let CURRENT_API_URL = FAKESTORE_API_URL;
let CURRENT_PRODUCTS_ENDPOINT = FAKESTORE_PRODUCTS_ENDPOINT;

// Flag para indicar se devemos usar dados mockados
let USE_MOCK_DATA = false; // Usar a API FakeStore por padrão

// Interface para os produtos
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  location: {
    state: string;
    city: string;
  };
  category: string;
  condition: string;
  images: string[];
  ownerId: string;
  ownerName: string;
  ownerProfilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

// Dados mockados para produtos
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Smartphone Samsung Galaxy',
    description: 'Smartphone Samsung Galaxy em ótimo estado, apenas 1 ano de uso',
    price: 800,
    location: {
      state: 'SP',
      city: 'São Paulo'
    },
    category: 'Eletrônicos',
    condition: 'Usado',
    images: ['/mock/smartphone.jpg'],
    ownerId: 'user1',
    ownerName: 'João Silva',
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Bicicleta Mountain Bike',
    description: 'Bicicleta Mountain Bike aro 29, freios a disco, 21 marchas',
    price: 1200,
    location: {
      state: 'RJ',
      city: 'Rio de Janeiro'
    },
    category: 'Esportes',
    condition: 'Usado',
    images: ['/mock/bike.jpg'],
    ownerId: 'user2',
    ownerName: 'Maria Oliveira',
    createdAt: '2025-02-10T14:45:00Z',
    updatedAt: '2025-02-10T14:45:00Z'
  },
  {
    id: '3',
    name: 'Livro - Dom Casmurro',
    description: 'Livro em bom estado, edição de colecionador',
    price: 45,
    location: {
      state: 'MG',
      city: 'Belo Horizonte'
    },
    category: 'Livros',
    condition: 'Usado',
    images: ['/mock/book.jpg'],
    ownerId: 'user3',
    ownerName: 'Carlos Mendes',
    createdAt: '2025-03-05T09:15:00Z',
    updatedAt: '2025-03-05T09:15:00Z'
  }
];

const TOKEN_KEY = 'userToken';

/**
 * Função auxiliar para obter o token e headers para requisições autenticadas
 */
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Interface para os parâmetros de filtro
export interface ProductFilters {
  search?: string;
  state?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  condition?: string;
  page?: number;
  limit?: number;
}

/**
 * Testa a conexão com a API
 * @returns Status da conexão
 */
export const testApiConnection = async (): Promise<{ success: boolean, message: string }> => {
  try {
    console.log('Testando conexão com a API FakeStore:', FAKESTORE_API_URL);
    
    // Tentar acessar a API FakeStore
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
    
    try {
      const response = await fetch(`${FAKESTORE_API_URL}/products`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('Conexão com a API FakeStore estabelecida com sucesso');
        CURRENT_API_URL = FAKESTORE_API_URL;
        CURRENT_PRODUCTS_ENDPOINT = FAKESTORE_PRODUCTS_ENDPOINT;
        USE_MOCK_DATA = false;
        return { success: true, message: 'Conexão com a API FakeStore estabelecida com sucesso' };
      } else {
        console.warn(`API FakeStore retornou status ${response.status}. Tentando API original.`);
        // Se a FakeStore falhar, tenta a API original
        return await testOriginalApi();
      }
    } catch (innerError) {
      clearTimeout(timeoutId);
      console.warn('Erro ao conectar com a API FakeStore. Tentando API original:', innerError);
      return await testOriginalApi();
    }
  } catch (error) {
    console.error('Erro ao testar conexão com todas as APIs:', error);
    console.warn('Usando dados mockados devido a erro de conexão.');
    USE_MOCK_DATA = true;
    return { 
      success: false, 
      message: `Erro ao conectar com as APIs: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Testa a conexão com a API original
 * @returns Status da conexão
 */
const testOriginalApi = async (): Promise<{ success: boolean, message: string }> => {
  try {
    console.log('Testando conexão com a API original:', ORIGINAL_API_URL);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
    
    const response = await fetch(ORIGINAL_API_URL, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log('Conexão com a API original estabelecida com sucesso');
      CURRENT_API_URL = ORIGINAL_API_URL;
      CURRENT_PRODUCTS_ENDPOINT = PRODUCTS_ENDPOINT;
      USE_MOCK_DATA = false;
      return { success: true, message: 'Conexão com a API original estabelecida com sucesso' };
    } else {
      console.warn(`API original retornou status ${response.status}. Usando dados mockados.`);
      USE_MOCK_DATA = true;
      return { 
        success: false, 
        message: `Erro ao conectar com a API original: ${response.status} ${response.statusText}` 
      };
    }
  } catch (error) {
    console.error('Erro ao testar conexão com a API original:', error);
    console.warn('Usando dados mockados devido a erro de conexão.');
    USE_MOCK_DATA = true;
    return { 
      success: false, 
      message: `Erro ao conectar com a API original: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Converte produtos da API FakeStore para o formato do ReUse
 */
const convertFakeStoreProducts = (products: any[]): Product[] => {
  return products.map((product, index) => ({
    id: product.id?.toString() || (index + 1).toString(),
    name: product.title || 'Produto sem nome',
    description: product.description || 'Sem descrição disponível',
    price: product.price || 0,
    location: {
      state: ['SP', 'RJ', 'MG', 'RS', 'PR'][Math.floor(Math.random() * 5)],
      city: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Porto Alegre', 'Curitiba'][Math.floor(Math.random() * 5)]
    },
    category: product.category || 'Diversos',
    condition: ['Novo', 'Usado - Como novo', 'Usado - Bom estado', 'Usado - Com marcas de uso'][Math.floor(Math.random() * 4)],
    images: [product.image || '/mock/default.jpg'],
    ownerId: `user${Math.floor(Math.random() * 10) + 1}`,
    ownerName: ['João Silva', 'Maria Oliveira', 'Carlos Mendes', 'Ana Santos', 'Pedro Alves'][Math.floor(Math.random() * 5)],
    ownerProfilePicture: '/mock/profile.jpg',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }));
}

/**
 * Lista produtos disponíveis para troca
 * @param filters Filtros opcionais para a busca de produtos
 * @returns Lista de produtos
 */
export const listProducts = async (filters: ProductFilters = {}): Promise<{ products: Product[], total: number, pages: number }> => {
  try {
    // Testar a conexão com a API primeiro
    await testApiConnection();
    
    if (USE_MOCK_DATA) {
      console.log('Usando dados mockados para listagem de produtos');
      
      // Aplicar filtros aos dados mockados
      let filteredProducts = [...MOCK_PRODUCTS];
      
      // Aplicar filtro de busca por nome
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          p.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Aplicar filtro de estado
      if (filters.state) {
        filteredProducts = filteredProducts.filter(p => 
          p.location.state.toLowerCase() === filters.state?.toLowerCase()
        );
      }
      
      // Aplicar filtro de cidade
      if (filters.city) {
        filteredProducts = filteredProducts.filter(p => 
          p.location.city.toLowerCase().includes(filters.city?.toLowerCase() ?? '')
        );
      }
      
      // Aplicar filtro de preço mínimo
      if (filters.minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= (filters.minPrice ?? 0));
      }
      
      // Aplicar filtro de preço máximo
      if (filters.maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= (filters.maxPrice ?? Infinity));
      }
      
      // Paginação
      const page = filters.page ?? 1;
      const limit = filters.limit ?? 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      return {
        products: paginatedProducts,
        total: filteredProducts.length,
        pages: Math.ceil(filteredProducts.length / limit)
      };
    } else {
      // Usar a API atual (FakeStore ou original)
      console.log(`Buscando produtos da API: ${CURRENT_API_URL}`);
      
      // Construir a URL com os filtros
      let url = `${CURRENT_API_URL}${CURRENT_PRODUCTS_ENDPOINT}`;
      
      // Para a FakeStore API, podemos limitar os resultados
      if (CURRENT_API_URL === FAKESTORE_API_URL) {
        const limit = filters.limit ?? 20; // Limite padrão de 20 produtos
        url = `${url}?limit=${limit}`;
      }
      
      // Obter os headers de autenticação (para a API original)
      const headers = CURRENT_API_URL === ORIGINAL_API_URL ? await getAuthHeaders() : {};
      
      // Fazer a requisição
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar produtos: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Converter os produtos para o formato do ReUse
      let products: Product[];
      
      if (CURRENT_API_URL === FAKESTORE_API_URL) {
        products = convertFakeStoreProducts(data);
      } else {
        // Assumindo que a API original já retorna no formato correto
        products = data.products || data;
      }
      
      // Aplicar filtros aos produtos da API
      let filteredProducts = [...products];
      
      // Aplicar filtro de busca por nome
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          p.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Aplicar filtro de estado
      if (filters.state) {
        filteredProducts = filteredProducts.filter(p => 
          p.location.state.toLowerCase() === filters.state?.toLowerCase()
        );
      }
      
      // Aplicar filtro de cidade
      if (filters.city) {
        filteredProducts = filteredProducts.filter(p => 
          p.location.city.toLowerCase().includes(filters.city?.toLowerCase() ?? '')
        );
      }
      
      // Aplicar filtro de preço mínimo
      if (filters.minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= (filters.minPrice ?? 0));
      }
      
      // Aplicar filtro de preço máximo
      if (filters.maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= (filters.maxPrice ?? Infinity));
      }
      
      // Paginação
      const page = filters.page ?? 1;
      const limit = filters.limit ?? 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      return {
        products: paginatedProducts,
        total: filteredProducts.length,
        pages: Math.ceil(filteredProducts.length / limit)
      };
    }
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    
    // Se ocorrer um erro, usar dados mockados como fallback
    console.warn('Usando dados mockados como fallback devido a erro na requisição.');
    USE_MOCK_DATA = true;
    
    // Chamar a função novamente para usar dados mockados
    return listProducts(filters);
  }
};

/**
 * Obtém detalhes de um produto específico
 * @param productId ID do produto
 * @returns Detalhes do produto
 */
export const getProductDetails = async (productId: string): Promise<Product> => {
  try {
    // Testar a conexão com a API primeiro
    await testApiConnection();
    
    if (USE_MOCK_DATA) {
      console.log('Usando dados mockados para detalhes do produto:', productId);
      
      // Encontrar o produto pelo ID nos dados mockados
      const mockProduct = MOCK_PRODUCTS.find(p => p.id === productId);
      
      if (mockProduct) {
        return mockProduct;
      } else {
        throw new Error(`Produto não encontrado nos dados mockados: ${productId}`);
      }
    } else {
      // Usar a API atual (FakeStore ou original)
      console.log(`Buscando detalhes do produto ${productId} da API: ${CURRENT_API_URL}`);
      
      // Construir a URL
      const url = `${CURRENT_API_URL}${CURRENT_PRODUCTS_ENDPOINT}/${productId}`;
      
      // Obter os headers de autenticação (para a API original)
      const headers = CURRENT_API_URL === ORIGINAL_API_URL ? await getAuthHeaders() : {};
      
      // Fazer a requisição
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar detalhes do produto: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Converter o produto para o formato do ReUse
      if (CURRENT_API_URL === FAKESTORE_API_URL) {
        const convertedProducts = convertFakeStoreProducts([data]);
        return convertedProducts[0];
      } else {
        // Assumindo que a API original já retorna no formato correto
        return data;
      }
    }
  } catch (error) {
    console.error(`Erro ao obter detalhes do produto ${productId}:`, error);
    console.warn('Usando dados mockados como fallback devido a erro na requisição.');
    
    // Se ocorrer um erro, usar dados mockados como fallback
    USE_MOCK_DATA = true;
    
    // Chamar a função novamente para usar dados mockados
    return getProductDetails(productId);
  }
};
