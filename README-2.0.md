# ReUse 2.0 - Documentação

## 📱 Visão Geral

ReUse é uma aplicação de marketplace para produtos usados, permitindo que usuários listem, pesquisem e troquem itens. Esta documentação detalha as modificações e melhorias implementadas na versão 2.0 do projeto.

## 🔄 Principais Modificações

### 1. Integração com APIs
- **Implementação de múltiplas fontes de dados**
  - API principal: `http://89.117.33.17:3000`
  - API alternativa: `https://fakestoreapi.com` (implementada como fallback)
  - Dados mockados locais (último recurso)

### 2. Melhorias na Interface de Usuário
- **Sistema de Filtros Aprimorado**
  - Filtros ocultos por padrão
  - Botão dedicado para mostrar/ocultar filtros
  - Botão para limpar todos os filtros de uma vez
  - Pesquisa em tempo real durante digitação

- **Correções de Layout**
  - Ajuste na posição de elementos para evitar sobreposição
  - Melhor hierarquia visual com z-index e elevation
  - Espaçamento adequado entre componentes

### 3. Tratamento de Erros
- **Sistema robusto de fallback**
  - Tentativa automática de APIs alternativas
  - Uso de dados mockados quando nenhuma API está disponível
  - Mensagens de erro mais informativas

## 📁 Arquivos Modificados

### `services/homeServices.ts`
- **Modificações:**
  - Implementação de conexão com a API FakeStore
  - Função `convertFakeStoreProducts` para adaptar dados externos
  - Sistema de fallback entre APIs
  - Tratamento de erros aprimorado
  - Manutenção da autenticação JWT

```typescript
// Exemplo de código implementado
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
    // ... outros campos
  }));
}
```

### `services/productServices.ts`
- **Modificações:**
  - Integração com API FakeStore
  - Correção de referências a API_BASE_URL
  - Manutenção da compatibilidade com a API original

```typescript
// Exemplo de código implementado
// URLs das APIs
const ORIGINAL_API_URL = API_URL;
const FAKESTORE_API_URL = 'https://fakestoreapi.com';

// API atual em uso
let CURRENT_API_URL = FAKESTORE_API_URL;
```

### `pages/homeScreen.tsx`
- **Modificações:**
  - Sistema de filtros que não fica sempre aberto
  - Implementação de pesquisa automática com debounce
  - Botão para limpar filtros
  - Correção de sobreposição de elementos
  - Ajustes de layout

```typescript
// Exemplo de código implementado
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
}, [search]);
```

## 🚀 Como Executar o Projeto

1. **Instalar dependências:**
```bash
npm install
```

2. **Iniciar o Metro Bundler:**
```bash
npm start
```

3. **Executar no Android:**
```bash
npm run android
```

4. **Executar no iOS:**
```bash
npm run ios
```

## 🔧 Configurações Importantes

### APIs Disponíveis
- API Original: `http://89.117.33.17:3000`
- FakeStore API: `https://fakestoreapi.com`

Para alternar entre as APIs, modifique a variável `CURRENT_API_URL` em `homeServices.ts`.

### Autenticação
O sistema utiliza autenticação JWT. Os tokens são armazenados no AsyncStorage com a chave `userToken`.

## 📈 Próximos Passos

1. **Implementar testes automatizados**
2. **Melhorar a performance de carregamento de imagens**
3. **Adicionar suporte para notificações push**
4. **Implementar sistema de avaliação de usuários**

## 👨‍💻 Contribuidores

- Juliana - Desenvolvedora Principal

---

*Documentação criada em 03/05/2025*
