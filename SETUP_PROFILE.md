# 🚀 Setup Rápido - Sistema de Perfil

## ⚡ Instalação em 5 Passos

### 1️⃣ Executar Migration SQL

Acesse o **Supabase Dashboard**:

```
1. Vá em: SQL Editor
2. Clique em: New Query
3. Cole o conteúdo de: database_migrations/profile_management_system.sql
4. Clique em: Run (ou F5)
5. Verifique sucesso: "Success. No rows returned"
```

### 2️⃣ Verificar Tabelas Criadas

No **Table Editor**, confirme que existem:

✅ `user_addresses` - Endereços salvos  
✅ `favorites` - Produtos favoritos  
✅ `product_reviews` - Avaliações  
✅ View: `product_stats` - Estatísticas agregadas

### 3️⃣ Testar o Sistema

```bash
# Rodar em desenvolvimento
npm run dev

# Acessar perfil
http://localhost:3000/conta
```

### 4️⃣ Testar Funcionalidades

**Login necessário** - crie uma conta primeiro:

```
http://localhost:3000/register
```

Depois acesse cada seção:

- `/conta` - Visão geral ✅
- `/conta/dados` - Editar nome e WhatsApp ✅
- `/conta/seguranca` - Alterar senha ✅
- `/conta/enderecos` - Gerenciar endereços ✅
- `/conta/compras` - Ver pedidos ✅
- `/conta/favoritos` - Produtos favoritados ✅
- `/conta/avaliacoes` - Minhas avaliações ✅

### 5️⃣ Integrar com Produtos

**Adicionar botão de favorito nas páginas de produtos:**

```tsx
// Em: src/app/produtos/[slug]/page.tsx
import FavoriteButton from "@/components/FavoriteButton";

// No render:
<FavoriteButton productId={product.id} size="lg" showLabel={true} />;
```

---

## 🔧 Comandos Úteis

### Verificar RLS Policies

```sql
SELECT * FROM pg_policies
WHERE tablename IN ('user_addresses', 'favorites', 'product_reviews');
```

### Ver estatísticas de produtos

```sql
SELECT * FROM product_stats LIMIT 10;
```

### Limpar dados de teste

```sql
-- Cuidado! Isso apaga todos os dados
DELETE FROM user_addresses WHERE user_id = 'seu-user-id';
DELETE FROM favorites WHERE user_id = 'seu-user-id';
DELETE FROM product_reviews WHERE user_id = 'seu-user-id';
```

---

## 🐛 Troubleshooting

### Erro: "relation does not exist"

➜ Execute a migration SQL novamente

### Erro: "permission denied for table"

➜ Verifique RLS policies no Supabase Dashboard

### CEP não preenche automaticamente

➜ Teste a API: `https://viacep.com.br/ws/76801000/json/`

### Avaliações não aparecem no produto

➜ Verifique se a policy "Anyone can view reviews" existe

---

## ✅ Checklist de Implementação

- [x] Criar tabelas no Supabase
- [x] Configurar RLS policies
- [x] Implementar páginas de perfil
- [x] Criar componentes reutilizáveis
- [x] Adicionar server actions
- [x] Testar CRUD de endereços
- [x] Testar favoritos
- [x] Testar avaliações
- [ ] Integrar com checkout (usar endereços salvos)
- [ ] Adicionar botão de favorito nos produtos
- [ ] Permitir avaliar após compra

---

## 📝 Próximos Passos

1. **Integrar endereços no checkout:**
   - Permitir selecionar endereço salvo
   - Botão "Usar endereço padrão"

2. **Adicionar FavoriteButton nos produtos:**
   - ProductCard.tsx
   - ProductDetailsClient.tsx

3. **Sistema de avaliações público:**
   - Mostrar reviews na página do produto
   - Calcular média de estrelas
   - Filtrar por rating

4. **Notificações:**
   - Email quando pedido mudar de status
   - Lembrar de avaliar produto comprado

---

**Pronto! Sistema 100% funcional** 🎉
