# 🔧 Guia de Diagnóstico - Categorias não aparecem

## Problema

As categorias criadas não aparecem no dropdown ao adicionar produtos.

## ✅ Passo 1: Verificar no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Entre no seu projeto **Tech4Loop**
3. Vá em **Table Editor** (menu lateral)
4. Clique na tabela **categories**
5. **Você vê as categorias que criou?**
   - ✅ **SIM** → Vá para Passo 2
   - ❌ **NÃO** → As categorias não foram salvas. Vá para Passo 5

---

## ✅ Passo 2: Testar SQL direto

1. No Supabase, vá em **SQL Editor**
2. Clique em **+ New query**
3. Cole este comando:

```sql
SELECT * FROM public.categories ORDER BY name;
```

4. Clique em **RUN**
5. **As categorias aparecem?**
   - ✅ **SIM** → Problema é de permissão RLS. Vá para Passo 3
   - ❌ **NÃO** → Tabela vazia. Vá para Passo 5

---

## ✅ Passo 3: Corrigir Permissões RLS

1. No **SQL Editor**, crie uma **+ New query**
2. Abra o arquivo: `database_migrations/fix_categories_permissions.sql`
3. **COPIE TODO O CONTEÚDO** do arquivo
4. **COLE** no SQL Editor do Supabase
5. Clique em **RUN**
6. Deve aparecer mensagens de sucesso
7. Role até o final dos resultados e veja se as categorias aparecem

---

## ✅ Passo 4: Testar no App

1. Abra o navegador
2. Vá para `http://localhost:3000/admin/login`
3. Faça login como admin
4. Vá em **Adicionar Produto**
5. No campo **Categoria**, clique em **🔄 Recarregar**
6. Abra o **Console do Navegador** (F12)
7. Veja os logs:
   - `📦 Categorias buscadas:` → Deve mostrar array com categorias
   - `❌ Erro ao buscar categorias:` → Se houver erro, copie a mensagem

**Se ainda não aparecer:**

- Copie os logs do console e me envie
- Verifique se o arquivo `.env.local` tem as credenciais corretas do Supabase

---

## ✅ Passo 5: Criar Categoria Manualmente via SQL

Se as categorias não foram salvas, crie uma manualmente:

```sql
INSERT INTO public.categories (name)
VALUES
  ('Intercomunicadores'),
  ('Capacetes'),
  ('Acessórios'),
  ('Peças');
```

Execute no SQL Editor e depois teste no app.

---

## ✅ Passo 6: Verificar credenciais do Supabase

Abra o arquivo `.env.local` e verifique:

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Conferir no Supabase:**

1. Vá em **Settings** → **API**
2. Compare os valores:
   - **Project URL** = `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** = `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Se estiverem diferentes, atualize o `.env.local` e reinicie o servidor:

```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

---

## 📊 Logs para Debug

Quando você abrir a página de adicionar produto, o console deve mostrar:

```
📦 Categorias buscadas: [{id: "xxx", name: "Intercomunicadores", ...}]
❌ Erro ao buscar categorias: null
```

Se mostrar erro, me envie a mensagem completa.

---

## 🆘 Ainda não funciona?

Me envie:

1. ✅ Screenshot da tabela `categories` no Supabase Table Editor
2. ✅ Resultado do SQL: `SELECT * FROM categories;`
3. ✅ Logs do console do navegador (F12)
4. ✅ Confirme que reiniciou o servidor (`npm run dev`)
