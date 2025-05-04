import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const API_BASE_URL = API_URL;

// Constantes para armazenamento
const TOKEN_KEY = 'userToken';
const USER_DATA_KEY = 'userData';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    profilePicture: string;
    rating: number;
  };
}

interface ErrorResponse {
  message: string;
  statusCode: number;
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    // Validação básica dos campos
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message ?? 'Erro ao fazer login');
    }

    // Salva o token e informações do usuário no AsyncStorage
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

export const validateAuthToken = async (): Promise<boolean> => {
  try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) return false;
      
      try {
          // Tenta verificar se o token está expirado
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos de timeout
          
          const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
              signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          // Se o token for inválido, limpa os dados de autenticação
          if (!response.ok) {
              await AsyncStorage.removeItem(TOKEN_KEY);
              await AsyncStorage.removeItem(USER_DATA_KEY);
              return false;
          }
          
          return true;
      } catch (fetchError) {
          console.warn('Erro ao conectar com a API para validar token. Assumindo que o token é válido para modo offline:', fetchError);
          // Se não conseguir conectar à API, assume que o token é válido para permitir uso offline
          return true;
      }
  } catch (error) {
      console.error('Erro ao validar token:', error);
      return false;
  }
};

// Atualize a função checkAuthToken para usar a validação
export const checkAuthToken = async (): Promise<boolean> => {
  return await validateAuthToken();
};

export const logoutUser = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    
    // Se houver um token, notifica o servidor sobre o logout
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (serverError) {
        console.warn('Erro ao notificar servidor sobre logout:', serverError);
        // Continua com o logout local mesmo se o servidor falhar
      }
    }
    
    // Remove os dados do usuário do AsyncStorage
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
};