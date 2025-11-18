# 📋 Sistema de Gerenciamento de Perfil - Tech4Loop

## 📚 Índice

- [Visão Geral](#visão-geral)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Recursos Implementados](#recursos-implementados)
- [Guia de Uso](#guia-de-uso)
- [Database Schema](#database-schema)
- [API Actions](#api-actions)
- [Componentes](#componentes)
- [Segurança](#segurança)
- [Customização](#customização)

---

## 🎯 Visão Geral

Sistema completo de gerenciamento de perfil de usuário inspirado no Mercado Livre, incluindo:

✅ **Visão Geral** - Dashboard com estatísticas de pedidos e ações rápidas  
✅ **Dados Pessoais** - Edição de nome, email e WhatsApp  
✅ **Segurança** - Alteração de senha com validação forte  
✅ **Endereços** - CRUD completo com CEP auto-fill via ViaCEP  
✅ **Compras** - Histórico de pedidos com filtros por status  
✅ **Favoritos** - Wishlist de produtos salvos  
✅ **Avaliações** - Sistema de reviews com estrelas (1-5)

---

## 📁 Estrutura de Arquivos

```
src/
├── app/
│   └── conta/
│       ├── page.tsx                    # Overview principal
│       ├── dados/
│       │   ├── page.tsx                # Edição de dados pessoais
│       │   └── actions.ts              # updatePersonalData, updatePassword
│       ├── seguranca/
│       │   └── page.tsx                # Alteração de senha
│       ├── enderecos/
│       │   ├── page.tsx                # Gerenciamento de endereços
│       │   └── actions.ts              # CRUD de endereços
│       ├── compras/
│       │   └── page.tsx                # Histórico de pedidos
│       ├── favoritos/
│       │   ├── page.tsx                # Lista de favoritos
│       │   └── actions.ts              # toggleFavorite, checkIsFavorite
│       └── avaliacoes/
│           ├── page.tsx                # Gerenciamento de reviews
│           └── actions.ts              # createReview, updateReview, deleteReview
│
├── components/
│   ├── profile/
│   │   ├── ProfileSidebar.tsx          # Menu lateral de navegação
│   │   ├── ProfileOverview.tsx         # Dashboard com cards
│   │   ├── PersonalDataForm.tsx        # Formulário de dados pessoais
│   │   ├── SecuritySettings.tsx        # Formulário de senha
│   │   ├── AddressManager.tsx          # Gerenciador de endereços
│   │   ├── OrdersHistory.tsx           # Lista de pedidos
│   │   ├── FavoritesList.tsx           # Grid de favoritos
│   │   └── ReviewsList.tsx             # Lista de avaliações
│   └── FavoriteButton.tsx              # Botão de favoritar (reutilizável)
│
└── database_migrations/
    └── profile_management_system.sql   # Schema completo do DB
```

---

## ✨ Recursos Implementados

### 1️⃣ **Visão Geral do Perfil**

**Arquivo:** `src/app/conta/page.tsx`  
**Componente:** `ProfileOverview.tsx`

**Funcionalidades:**

- 📊 Estatísticas de pedidos (total, pendentes, concluídos)
- ℹ️ Informações da conta (nome, email, WhatsApp, data de cadastro)
- ⚡ Ações rápidas com links diretos
- 💡 Dicas de segurança

**Cards de Estatísticas:**

```tsx
- Total de Pedidos (ícone: ☐, cor: azul)
- Pedidos Pendentes (ícone: ◌, cor: laranja)
- Pedidos Concluídos (ícone: ✓, cor: verde)
```

**Ações Rápidas:**

```tsx
- Editar Dados (gradiente: azul → ciano)
- Meus Endereços (gradiente: roxo → rosa)
- Segurança (gradiente: verde → esmeralda)
- Minhas Compras (gradiente: laranja → vermelho)
```

---

### 2️⃣ **Dados Pessoais**

**Arquivos:**

- `src/app/conta/dados/page.tsx`
- `src/components/profile/PersonalDataForm.tsx`
- `src/app/conta/dados/actions.ts`

**Funcionalidades:**

- ✏️ Edição de nome (mínimo 3 caracteres)
- 📧 Email somente leitura (verificado)
- 📱 WhatsApp com formatação automática
- ✅ Validação em tempo real

**Server Action:**

```typescript
updatePersonalData(formData: FormData) → { error, success }
```

**Validações:**

- Nome: mínimo 3 caracteres
- WhatsApp: 10-11 dígitos numéricos
- Email: não editável (verificado via Supabase Auth)

---

### 3️⃣ **Segurança**

**Arquivos:**

- `src/app/conta/seguranca/page.tsx`
- `src/components/profile/SecuritySettings.tsx`
- `src/app/conta/dados/actions.ts`

**Funcionalidades:**

- 🔒 Alteração de senha
- 👁 Mostrar/ocultar senha (toggle)
- 🔐 Validação de senha forte
- ✅ Re-autenticação obrigatória

**Server Action:**

```typescript
updatePassword(formData: FormData) → { error, success }
```

**Validação de Senha Forte:**

- Mínimo 8 caracteres
- Letra maiúscula e minúscula
- Pelo menos 1 número
- Caractere especial (!@#$%^&\*\_-)

---

### 4️⃣ **Endereços**

**Arquivos:**

- `src/app/conta/enderecos/page.tsx`
- `src/components/profile/AddressManager.tsx`
- `src/app/conta/enderecos/actions.ts`

**Funcionalidades:**

- ➕ Adicionar endereço
- ✏️ Editar endereço
- 🗑️ Excluir endereço
- ⭐ Definir endereço padrão
- 🔍 Auto-fill via CEP (ViaCEP API)

**Server Actions:**

```typescript
createAddress(formData: FormData) → { error, success }
updateAddress(addressId, formData) → { error, success }
deleteAddress(addressId) → { error, success }
setDefaultAddress(addressId) → { error, success }
```

**Campos do Formulário:**

```typescript
{
  label: string            // Ex: "Casa", "Trabalho"
  recipientName: string    // Quem receberá
  zipCode: string          // CEP (auto-fill)
  street: string           // Preenchido automaticamente
  number: string
  complement?: string      // Opcional
  neighborhood: string     // Preenchido automaticamente
  city: string             // Preenchido automaticamente
  state: string            // UF (preenchido automaticamente)
  isDefault: boolean       // Checkbox
}
```

**Integração ViaCEP:**

```typescript
// Busca automática ao digitar CEP completo (8 dígitos)
handleCEPChange() → fetchAddressByCEP() → preenche rua, bairro, cidade, estado
```

---

### 5️⃣ **Compras**

**Arquivos:**

- `src/app/conta/compras/page.tsx`
- `src/components/profile/OrdersHistory.tsx`

**Funcionalidades:**

- 📦 Lista de todos os pedidos
- 🔍 Filtros por status
- 📊 Informações de pagamento
- 🖼️ Imagens dos produtos

**Filtros Disponíveis:**

```typescript
-Todos(azul) -
  Pendente(amarelo) -
  Processando(azul) -
  Enviado(roxo) -
  Entregue(verde) -
  Cancelado(vermelho);
```

**Status de Pedidos:**

```typescript
type OrderStatus =
  | "pending" // ◌ amarelo
  | "processing" // ◌ azul
  | "shipped" // → roxo
  | "delivered" // ✓ verde
  | "cancelled"; // ✕︎ vermelho
```

**Query Supabase:**

```sql
SELECT orders.*, order_items.*, products.*
FROM orders
LEFT JOIN order_items ON orders.id = order_items.order_id
LEFT JOIN products ON order_items.product_id = products.id
WHERE orders.customer_email = user.email
ORDER BY orders.created_at DESC
```

---

### 6️⃣ **Favoritos (Wishlist)**

**Arquivos:**

- `src/app/conta/favoritos/page.tsx`
- `src/components/profile/FavoritesList.tsx`
- `src/app/conta/favoritos/actions.ts`
- `src/components/FavoriteButton.tsx`

**Funcionalidades:**

- ❤️ Adicionar/remover produtos dos favoritos
- 📋 Ver lista de favoritos
- 🖼️ Grid responsivo de produtos
- 🔗 Links diretos para produtos

**Server Actions:**

```typescript
toggleFavorite(productId: string) → { error, success, isFavorited }
checkIsFavorite(productId: string) → boolean
```

**Componente Reutilizável:**

```tsx
<FavoriteButton
  productId={product.id}
  size="md" // "sm" | "md" | "lg"
  showLabel={false} // Mostrar texto
  className="..." // Classes CSS extras
/>
```

**Estados:**

- ♡ (vazio) - Não favoritado
- ♥ (cheio) - Favoritado
- ◌ (spin) - Carregando

---

### 7️⃣ **Avaliações**

**Arquivos:**

- `src/app/conta/avaliacoes/page.tsx`
- `src/components/profile/ReviewsList.tsx`
- `src/app/conta/avaliacoes/actions.ts`

**Funcionalidades:**

- ⭐ Avaliar produtos (1-5 estrelas)
- ✏️ Editar avaliações
- 🗑️ Excluir avaliações
- 📝 Título + comentário
- 🖼️ Thumbnail do produto

**Server Actions:**

```typescript
createReview(formData: FormData) → { error, success }
updateReview(reviewId, formData) → { error, success }
deleteReview(reviewId) → { error, success }
```

**Campos da Avaliação:**

```typescript
{
  productId: UUID;
  orderId: UUID; // Pedido relacionado
  rating: 1 - 5; // Estrelas
  title: string; // Min 3 caracteres
  comment: string; // Min 10 caracteres
}
```

**Validações:**

- ✅ Um usuário só pode avaliar um produto uma vez
- ✅ Rating entre 1 e 5
- ✅ Título mínimo 3 caracteres
- ✅ Comentário mínimo 10 caracteres

---

## 🗄️ Database Schema

### **Tabela: user_addresses**

```sql
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  label VARCHAR(50),
  recipient_name VARCHAR(255),
  zip_code VARCHAR(8),
  street VARCHAR(255),
  number VARCHAR(20),
  complement VARCHAR(100),
  neighborhood VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(2),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### **Tabela: favorites**

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  created_at TIMESTAMP,
  UNIQUE(user_id, product_id)
);
```

### **Tabela: product_reviews**

```sql
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES orders(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, product_id)
);
```

### **View: product_stats**

```sql
CREATE VIEW product_stats AS
SELECT
  product_id,
  COUNT(DISTINCT favorites.id) AS favorites_count,
  COUNT(DISTINCT reviews.id) AS reviews_count,
  AVG(reviews.rating) AS average_rating
FROM products
LEFT JOIN favorites USING (product_id)
LEFT JOIN product_reviews reviews USING (product_id)
GROUP BY product_id;
```

---

## 🔒 Segurança (RLS Policies)

Todas as tabelas têm **Row Level Security (RLS)** ativado:

### **user_addresses**

```sql
✅ Users can view own addresses
✅ Users can insert own addresses
✅ Users can update own addresses
✅ Users can delete own addresses
```

### **favorites**

```sql
✅ Users can view own favorites
✅ Users can insert own favorites
✅ Users can delete own favorites
✅ Anyone can count favorites (analytics)
```

### **product_reviews**

```sql
✅ Anyone can view reviews (público)
✅ Users can insert own reviews
✅ Users can update own reviews
✅ Users can delete own reviews
```

---

## 🎨 Customização

### **Cores do Tema**

```css
/* tailwind.config.ts */
colors: {
  'neon-blue': '#00d4ff',
  'electric-purple': '#9945ff',
  'dark-card': '#111827',
}
```

### **Ícones Usados**

```
◉ - Visão Geral
◈ - Dados Pessoais
$ - Segurança
☐ - Endereços / Pedidos
♡/♥ - Favoritos
★ - Avaliações
⏻ - Logout
✓ - Sucesso
✕︎ - Erro/Excluir
◌ - Loading/Pendente
→ - Enviado
```

---

## 🚀 Como Usar

### **1. Instalar Dependências**

```bash
npm install
```

### **2. Configurar Banco de Dados**

```bash
# Acesse Supabase Dashboard → SQL Editor
# Cole o conteúdo de: database_migrations/profile_management_system.sql
# Execute (Run)
```

### **3. Configurar Variáveis de Ambiente**

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-key
```

### **4. Rodar o Projeto**

```bash
npm run dev
```

### **5. Acessar Perfil**

```
http://localhost:3000/conta
```

---

## 📝 Exemplo de Fluxo de Uso

### **Adicionar Endereço:**

1. Usuário acessa `/conta/enderecos`
2. Clica em "+ Novo Endereço"
3. Digita CEP → Auto-fill preenche rua, bairro, cidade, estado
4. Preenche número e nome do destinatário
5. Marca "Definir como padrão" (opcional)
6. Clica em "Salvar"
7. Endereço aparece na lista

### **Favoritar Produto:**

1. Usuário está na página do produto
2. Clica no botão ♡
3. Ícone muda para ♥ (vermelho)
4. Produto aparece em `/conta/favoritos`

### **Avaliar Produto:**

1. Usuário compra um produto
2. Acessa `/conta/avaliacoes`
3. Clica em "Avaliar" no pedido
4. Seleciona estrelas (1-5)
5. Escreve título e comentário
6. Clica em "Salvar"
7. Avaliação fica pública no produto

---

## 🛠️ Troubleshooting

### **Erro: "Usuário não autenticado"**

- Verifique se o usuário está logado
- Cheque cookies/session no navegador
- Confirme RLS policies no Supabase

### **Erro ao buscar CEP**

- Verifique conexão com ViaCEP API
- Confirme que CEP tem 8 dígitos
- Teste manualmente: `viacep.com.br/ws/76801000/json/`

### **Avaliações não aparecem**

- Verifique se tabela `product_reviews` existe
- Confirme que RLS permite leitura pública
- Cheque se `product_id` está correto

---

## 📊 Estatísticas Automáticas

O sistema atualiza automaticamente:

✅ **Média de avaliações** do produto (triggers)  
✅ **Total de avaliações** (contador)  
✅ **Total de favoritos** (contador)

Essas informações podem ser usadas em cards de produtos!

---

## 🎯 Próximos Passos

- [ ] Upload de foto de perfil
- [ ] Notificações de pedidos
- [ ] Integração com checkout (endereços salvos)
- [ ] Sistema de cupons/vouchers
- [ ] Histórico de visualizações

---

## 📞 Suporte

Para dúvidas ou problemas:

- Verifique os logs no console do navegador
- Confira erros no Supabase Dashboard
- Revise as policies RLS

---

**Tech4Loop** © 2025 - Sistema de Perfil v1.0
