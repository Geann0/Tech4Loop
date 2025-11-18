# 🖼️ Guia de Diagnóstico - Upload de Imagens

## Problema

"Falha ao fazer upload das imagens" ao adicionar produtos.

---

## ✅ Passo 1: Verificar se o Bucket Existe

1. Acesse [supabase.com](https://supabase.com)
2. Entre no projeto **Tech4Loop**
3. Vá em **Storage** (menu lateral)
4. **Você vê um bucket chamado `product_images`?**
   - ✅ **SIM** → Vá para Passo 2
   - ❌ **NÃO** → Vá para Passo 1.1

### Passo 1.1: Criar o Bucket

1. Clique em **"New bucket"**
2. Preencha:
   - **Name**: `product_images`
   - **Public bucket**: ✅ **MARQUE ESTA OPÇÃO** (importante!)
3. Clique em **"Create bucket"**
4. Vá para Passo 2

---

## ✅ Passo 2: Verificar Permissões do Bucket

1. No Storage, clique no bucket **`product_images`**
2. Clique nos **três pontos (⋮)** → **"Policies"**
3. **Você vê políticas de RLS?**
   - Se NÃO houver políticas, vá para Passo 2.1
   - Se houver políticas com erros, vá para Passo 2.1

### Passo 2.1: Criar Políticas Corretas

1. Vá em **SQL Editor**
2. Clique em **"+ New query"**
3. Abra o arquivo: `database_migrations/fix_storage_permissions.sql`
4. **COPIE TODO O CONTEÚDO**
5. **COLE** no SQL Editor
6. Clique em **"RUN"**
7. Aguarde a execução (pode demorar alguns segundos)

---

## ✅ Passo 3: Verificar Service Role Key

O upload usa o Service Role Key no servidor. Verifique se está correto:

1. No Supabase, vá em **Settings** → **API**
2. Role até **Project API keys**
3. Copie o **`service_role`** (secret)
4. Abra o arquivo `.env.local` no projeto
5. Compare:

```env
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

6. Se estiver diferente, **atualize** e **reinicie o servidor**:

```bash
# Pare o servidor (Ctrl+C no terminal)
npm run dev
```

---

## ✅ Passo 4: Testar Upload Novamente

1. Acesse `http://localhost:3000/admin/login`
2. Faça login como admin
3. Vá em **Adicionar Produto**
4. Preencha todos os campos
5. **Selecione APENAS 1 IMAGEM** (para testar)
6. Clique em **Salvar Produto**
7. Abra o **Console do Navegador** (F12 → Console)
8. Veja os logs:
   - `📤 Fazendo upload: ...` → Mostra o caminho do arquivo
   - Se houver erro, copie a mensagem completa

---

## ✅ Passo 5: Verificar Logs de Erro

Se ainda falhar, veja a mensagem de erro no console:

### Erro: "Row Level Security policy violation"

- **Solução**: Execute novamente o SQL do Passo 2.1
- Verifique se o bucket está marcado como **Public**

### Erro: "Bucket not found"

- **Solução**: O bucket não foi criado. Volte ao Passo 1

### Erro: "Invalid file type"

- **Solução**: Use apenas imagens (JPG, PNG, WebP)
- Tamanho máximo: 5MB por imagem

### Erro: "The resource already exists"

- **Solução**: O arquivo já existe. Tente com outra imagem

---

## ✅ Passo 6: Verificar Formato do Arquivo

As imagens devem ser:

- ✅ Formato: JPG, JPEG, PNG, WebP
- ✅ Tamanho: Máximo 5MB
- ✅ Resolução: Recomendado 800x800px ou maior
- ❌ NÃO: GIF, BMP, SVG, TIFF

---

## ✅ Passo 7: Testar Upload Manual no Supabase

Para confirmar que o Storage está funcionando:

1. Vá em **Storage** → **product_images**
2. Clique em **"Upload"**
3. Selecione uma imagem do seu computador
4. Clique em **"Upload"**
5. **Funcionou?**
   - ✅ **SIM** → O problema é nas permissões RLS ou Service Role Key
   - ❌ **NÃO** → O bucket pode estar com problemas

---

## 📊 Estrutura de Pastas Esperada

```
product_images/
├── tech4loop-admin/          ← Produtos da loja (sem parceiro)
│   ├── 1234567890-produto1.jpg
│   └── 1234567891-produto2.jpg
├── {partner-uuid-1}/          ← Produtos do parceiro 1
│   ├── 1234567892-produto3.jpg
│   └── 1234567893-produto4.jpg
└── {partner-uuid-2}/          ← Produtos do parceiro 2
    └── 1234567894-produto5.jpg
```

---

## 🆘 Ainda não funciona?

Me envie:

1. ✅ Screenshot do bucket `product_images` (mostrando se é público)
2. ✅ Screenshot das políticas de RLS do Storage
3. ✅ Logs do console do navegador (F12) quando tenta fazer upload
4. ✅ Confirme que executou o SQL `fix_storage_permissions.sql`
5. ✅ Confirme que o SUPABASE_SERVICE_ROLE_KEY está correto no `.env.local`

---

## 🔑 Checklist Rápido

- [ ] Bucket `product_images` existe?
- [ ] Bucket está marcado como **Public**?
- [ ] Executou o SQL `fix_storage_permissions.sql`?
- [ ] `SUPABASE_SERVICE_ROLE_KEY` está correto no `.env.local`?
- [ ] Reiniciou o servidor após alterar `.env.local`?
- [ ] Imagem tem menos de 5MB?
- [ ] Imagem é JPG/PNG/WebP?
- [ ] Selecionou pelo menos 1 imagem no formulário?
