import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { Product } from './homeServices';

// URLs das APIs
const ORIGINAL_API_URL = API_URL;
const FAKESTORE_API_URL = 'https://fakestoreapi.com';

// API atual em uso
let CURRENT_API_URL = FAKESTORE_API_URL;

const TOKEN_KEY = 'userToken';

// Flag para indicar se devemos usar dados mockados
let USE_MOCK_DATA = false;

/**
 * Função auxiliar para obter o token e headers para requisições autenticadas
 */
const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Interface para criação de produto
export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  state: string;
  city: string;
  category: string;
  condition: string;
  images: string[];
}

/**
 * Cria um novo produto para troca
 * @param productData Dados do produto a ser criado
 * @returns O produto criado
 */
export const createProduct = async (productData: CreateProductData): Promise<Product> => {
  try {
    // Verificar se o usuário está autenticado
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    // Criar FormData para enviar as imagens
    const formData = new FormData();
    
    // Adicionar dados do produto ao FormData
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price.toString());
    formData.append('state', productData.state);
    formData.append('city', productData.city);
    formData.append('category', productData.category);
    formData.append('condition', productData.condition);
    
    // Adicionar imagens ao FormData
    productData.images.forEach((image, index) => {
      // @ts-ignore - O FormData do React Native aceita este formato para arquivos
      formData.append('images', {
        uri: image,
        name: `product_image_${index}_${Date.now()}.jpg`,
        type: 'image/jpeg'
      });
    });
    
    // Fazer a requisição para a API
    const response = await fetch(`${CURRENT_API_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Não incluir Content-Type para FormData
      },
      body: formData,
    });
    
    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message ?? 'Erro ao criar produto');
    }
    
    // Processar a resposta
    const product = await response.json();
    return product;
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
};

/**
 * Atualiza um produto existente
 * @param productId ID do produto a ser atualizado
 * @param productData Dados atualizados do produto
 * @returns O produto atualizado
 */
export const updateProduct = async (productId: string, productData: Partial<CreateProductData>): Promise<Product> => {
  try {
    // Verificar se o usuário está autenticado
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    // Criar FormData para enviar as imagens
    const formData = new FormData();
    
    // Adicionar dados do produto ao FormData (apenas os fornecidos)
    if (productData.name) formData.append('name', productData.name);
    if (productData.description) formData.append('description', productData.description);
    if (productData.price) formData.append('price', productData.price.toString());
    if (productData.state) formData.append('state', productData.state);
    if (productData.city) formData.append('city', productData.city);
    if (productData.category) formData.append('category', productData.category);
    if (productData.condition) formData.append('condition', productData.condition);
    
    // Adicionar imagens ao FormData se fornecidas
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach((image, index) => {
        // @ts-ignore - O FormData do React Native aceita este formato para arquivos
        formData.append('images', {
          uri: image,
          name: `product_image_${index}_${Date.now()}.jpg`,
          type: 'image/jpeg'
        });
      });
    }
    
    // Fazer a requisição para a API
    const response = await fetch(`${CURRENT_API_URL}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Não incluir Content-Type para FormData
      },
      body: formData,
    });
    
    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message ?? 'Erro ao atualizar produto');
    }
    
    // Processar a resposta
    const product = await response.json();
    return product;
  } catch (error) {
    console.error(`Erro ao atualizar produto ${productId}:`, error);
    throw error;
  }
};

/**
 * Exclui um produto
 * @param productId ID do produto a ser excluído
 * @returns Verdadeiro se a exclusão for bem-sucedida
 */
export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    // Obter headers autenticados
    const headers = await getAuthHeaders();
    
    // Fazer a requisição para a API
    const response = await fetch(`${CURRENT_API_URL}/products/${productId}`, {
      method: 'DELETE',
      headers,
    });
    
    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message ?? 'Erro ao excluir produto');
    }
    
    return true;
  } catch (error) {
    console.error(`Erro ao excluir produto ${productId}:`, error);
    throw error;
  }
};

/**
 * Demonstra interesse em um produto
 * @param productId ID do produto de interesse
 * @returns Informações sobre o interesse registrado
 */
export const showInterest = async (productId: string): Promise<{ success: boolean, message: string }> => {
  try {
    // Obter headers autenticados
    const headers = await getAuthHeaders();
    
    // Fazer a requisição para a API
    const response = await fetch(`${CURRENT_API_URL}/products/${productId}/interest`, {
      method: 'POST',
      headers,
    });
    
    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message ?? 'Erro ao demonstrar interesse no produto');
    }
    
    // Processar a resposta
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Erro ao demonstrar interesse no produto ${productId}:`, error);
    throw error;
  }
};

/**
 * Lista produtos do usuário logado
 * @returns Lista de produtos do usuário
 */
export const getMyProducts = async (): Promise<Product[]> => {
  try {
    // Obter headers autenticados
    const headers = await getAuthHeaders();
    
    // Fazer a requisição para a API
    const response = await fetch(`${CURRENT_API_URL}/products/my-products`, {
      method: 'GET',
      headers,
    });
    
    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message ?? 'Erro ao buscar seus produtos');
    }
    
    // Processar a resposta
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Erro ao buscar seus produtos:', error);
    throw error;
  }
};

/**
 * Lista produtos que o usuário demonstrou interesse
 * @returns Lista de produtos de interesse
 */
export const getInterestedProducts = async (): Promise<Product[]> => {
  try {
    // Obter headers autenticados
    const headers = await getAuthHeaders();
    
    // Fazer a requisição para a API
    const response = await fetch(`${CURRENT_API_URL}/products/interested`, {
      method: 'GET',
      headers,
    });
    
    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message ?? 'Erro ao buscar produtos de interesse');
    }
    
    // Processar a resposta
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Erro ao buscar produtos de interesse:', error);
    throw error;
  }
};
