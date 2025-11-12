# Guia de Testes: Painéis Administrativos

Este guia detalha os passos para testar os dois níveis de acesso administrativo: **Super Admin** e **Parceiro**.

## Pré-requisitos

- O projeto deve estar rodando localmente (`npm run dev`).
- O banco de dados do Supabase deve estar configurado. Se ainda não o fez, siga as instruções no arquivo `DATABASE_SETUP.md`.

---

## 1. Testando como Super Admin

O Super Admin tem controle total sobre todos os usuários, parceiros e produtos do site.

### 1.1. Criando o Usuário Super Admin

Primeiro, precisamos criar um usuário e atribuir a ele o papel de `admin`.

1.  **Acesse o Supabase:** Vá para o seu projeto no Supabase.
2.  **Crie um Novo Usuário:**
    - No menu lateral, navegue até **Authentication**.
    - Clique em **"Add user"**.
    - Preencha com o e-mail e a senha que você usará para o login de admin.
    - **Importante:** Ative a opção **"Auto Confirm User"**. Isso fará com que o usuário seja criado e ativado imediatamente, sem precisar confirmar o e-mail.
    - Clique em **"Create user"**.
3.  **Sincronize o Perfil do Novo Usuário (Passo Manual Crucial):**
    - Como o usuário foi criado manualmente no painel, o gatilho para criar seu perfil não foi disparado. Precisamos fazer isso agora.
    - No menu lateral, vá para o **SQL Editor** (ícone de página com `<>`).
    - Clique em **"+ New query"**.
    - Copie e cole o seguinte comando e clique em **"RUN"**. Ele irá criar perfis para quaisquer usuários que ainda não os tenham:
    ```sql
    INSERT INTO public.profiles (id, email, partner_name, role)
    SELECT u.id, u.email, u.email, 'partner'
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE p.id IS NULL;
    ```
4.  **Promova o Usuário para Admin:**
    - Agora, no menu lateral, vá para o **Table Editor** (ícone de tabela).
    - Selecione a tabela `profiles`. O usuário que você criou agora deve estar visível aqui.
    - Encontre a linha correspondente ao usuário.
    - Na coluna `role`, dê um duplo clique na célula `partner` para poder editar.
    - Altere o texto para `admin`.
    - Clique no botão verde **"Save"** para confirmar a alteração.

### 1.2. Realizando o Login

1.  **Acesse a Página de Login:** Abra [http://localhost:3000/admin/login](http://localhost:3000/admin/login) no seu navegador.
2.  **Faça Login:** Utilize o e-mail e a senha do usuário `admin` que você criou.
3.  **Verifique o Redirecionamento:** Após o login bem-sucedido, você deve ser redirecionado para o painel principal do Super Admin em `/admin/dashboard`.

### 1.3. Funcionalidades para Testar

No painel de Super Admin, verifique as seguintes funcionalidades:

- **Dashboard:**
  - Confira se os cards "Total de Produtos" e "Total de Parceiros" exibem a contagem correta de registros do banco de dados.
- **Gerenciamento de Parceiros:**
  - **Criar Parceiro:** Use o botão "Adicionar Parceiro" para criar uma nova conta de parceiro. Verifique se o novo usuário aparece na tabela `auth.users` e na tabela `profiles` do Supabase com o `role` de `partner`.
  - **Listar Parceiros:** Vá para "Gerenciar Parceiros". A tabela deve listar todos os usuários com a role `partner`.
  - **Banir/Desbanir:** Teste os botões "Banir" e "Desbanir". Verifique se o status do parceiro é atualizado corretamente no banco de dados (a coluna `is_banned` na tabela `profiles` deve mudar entre `true` e `false`).
  - **Editar e Excluir:** Teste as funcionalidades de edição e exclusão de parceiros.
- **Gerenciamento de Produtos:**
  - Vá para "Gerenciar Produtos".
  - Verifique se a lista exibe **todos os produtos de todos os parceiros**.
  - Teste as funcionalidades de "Editar" e "Excluir" em produtos de diferentes parceiros.

---

## 2. Testando como Parceiro

O Parceiro tem acesso limitado e só pode gerenciar os próprios produtos.

### 2.1. Acessando como Parceiro

1.  **Crie um Parceiro (se necessário):** Se você ainda não tiver um, use sua conta de Super Admin para criar um novo usuário parceiro.
2.  **Faça Logout:** Se estiver logado como Admin, clique em "Sair" no cabeçalho.
3.  **Acesse a Página de Login:** Vá para [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
4.  **Faça Login:** Utilize as credenciais da conta de parceiro.
5.  **Verifique o Redirecionamento:** Após o login, você deve ser redirecionado para o painel do parceiro em `/partner/dashboard`.

### 2.2. Funcionalidades para Testar

No painel do Parceiro, verifique as seguintes funcionalidades:

- **Dashboard:**
  - A página deve exibir apenas os produtos cadastrados por este parceiro.
- **Adicionar Produto:**
  - Use o botão "Adicionar Produto" para criar um novo item.
  - Preencha todos os campos e envie uma imagem.
  - Verifique se o produto aparece na lista do dashboard e se foi salvo corretamente no banco de dados na tabela `products`. O `partner_id` do produto deve corresponder ao ID do parceiro logado.
- **Editar Produto:**
  - Clique em "Editar" em um produto existente.
  - Altere algumas informações e salve. Verifique se os dados foram atualizados.
  - Tente editar a imagem. A imagem antiga deve ser removida do Supabase Storage e a nova deve ser enviada.
- **Excluir Produto:**
  - Teste o botão "Excluir". O produto deve ser removido da lista e do banco de dados. A imagem associada também deve ser removida do Supabase Storage.
