# Manual de Gerenciamento - Site Tech4Loop

Olá! Este manual explica como gerenciar o conteúdo do seu site através dos painéis administrativos.

---

## 1. Acesso aos Painéis

Todo o gerenciamento é feito através de uma área de login segura.

- **URL de Acesso:** Acesse `www.seusite.com/admin/login` para entrar.

Existem dois níveis de acesso:

- **Super Admin:** Tem controle total sobre produtos, parceiros e usuários.
- **Parceiro:** Tem acesso limitado para gerenciar apenas os produtos de sua própria loja.

O sistema redirecionará você para o painel correto com base no seu login.

---

## 2. Painel do Super Admin (`/admin/dashboard`)

Como Super Admin, você tem as seguintes capacidades:

### Gerenciar Parceiros

- **Adicionar Parceiro:** No painel, clique em "Adicionar Parceiro". Preencha o nome da loja, o e-mail de login e uma senha provisória para criar uma nova conta de parceiro.
- **Listar e Banir/Desbanir Parceiros:** Você pode visualizar todos os parceiros cadastrados e desativar (banir) ou reativar (desbanir) suas contas. Um parceiro banido não consegue fazer login.

### Gerenciar Produtos

- Você tem a capacidade de visualizar, editar ou excluir **qualquer produto** de **qualquer parceiro** no sistema.

---

## 3. Painel do Parceiro (`/partner/dashboard`)

Como Parceiro, você pode gerenciar os produtos da sua loja:

- **Adicionar Produto:** Clique em "Adicionar Produto", preencha as informações (nome, preço, categoria, descrição) e faça o upload da imagem.
- **Editar Produto:** Na lista de produtos, clique em "Editar" para alterar as informações ou substituir a imagem de um produto existente.
- **Excluir Produto:** Clique em "Excluir" para remover permanentemente um produto da loja. A imagem associada também será apagada.

---

## 4. Instruções de Deploy e Domínio

Para colocar o site no ar (deploy), recomendamos a plataforma **Vercel**, que é dos mesmos criadores do Next.js e oferece um plano gratuito generoso e integração perfeita.

**Passos:**

1.  Crie uma conta na [Vercel](https://vercel.com).
2.  Conecte sua conta do GitHub, GitLab ou Bitbucket.
3.  Importe o repositório do projeto do site.
4.  **Importante:** Na Vercel, vá para as configurações do projeto em "Settings" -> "Environment Variables" e adicione todas as chaves do seu arquivo `.env.local` (Supabase, Mercado Pago, etc.).
5.  Clique em "Deploy".

**Para conectar seu domínio (ex: `www.tech4loop.com`):**

1.  No painel do seu projeto na Vercel, vá para a aba "Settings" -> "Domains".
2.  Adicione seu domínio e siga as instruções para atualizar os registros DNS no seu provedor de domínio.

E pronto! Seu site estará no ar com seu domínio personalizado e com HTTPS ativado.
