# Guia de Configuração do Painel Administrativo com Supabase

Para que os painéis de Super Admin e de Parceiro funcionem, precisamos de um backend para armazenar produtos, usuários e imagens. Usaremos o Supabase para isso.

## O que é o Supabase?

É uma plataforma que oferece um backend completo como serviço, incluindo:

1.  **Banco de Dados (PostgreSQL)**: Para salvar produtos, parceiros e usuários.
2.  **Autenticação**: Para gerenciar o login e as permissões de acesso.
3.  **Armazenamento (Storage)**: Para fazer o upload das imagens dos produtos.

## Passo 1: Criar um Projeto no Supabase

1.  Crie uma conta gratuita no [site do Supabase](https://supabase.com/).
2.  Crie um novo projeto. Guarde a **senha** que você definir, pois ela será necessária.
3.  Após a criação do projeto, vá para **Project Settings > API**.

## Passo 2: Obter as Chaves de API

Na página de API do seu projeto, você encontrará três chaves essenciais:

1.  **Project URL**: A URL única do seu projeto.
2.  **API Key (public `anon` key)**: A chave pública que pode ser usada no navegador com segurança.
3.  **API Key (`service_role` secret)**: Esta é uma chave secreta que tem acesso total ao seu banco de dados. **Nunca a exponha no navegador**. Copie esta chave.

## Passo 3: Adicionar as Chaves ao Projeto

Abra o arquivo `.env.local` e adicione as chaves que você copiou:

```
# ... outras chaves ...

# Credenciais do Supabase
NEXT_PUBLIC_SUPABASE_URL="SUA_PROJECT_URL_AQUI"
NEXT_PUBLIC_SUPABASE_ANON_KEY="SUA_API_KEY_ANON_AQUI"
SUPABASE_SERVICE_ROLE_KEY="SUA_SERVICE_ROLE_KEY_SECRETA_AQUI"
```

## Passo 4: Reinicie o Servidor (MUITO IMPORTANTE)

Sempre que você alterar o arquivo `.env.local`, o servidor de desenvolvimento precisa ser reiniciado para carregar as novas variáveis.

1.  Vá para o terminal onde o site está rodando.
2.  Pressione `Ctrl + C` para parar o servidor.
3.  Execute `npm run dev` para iniciá-lo novamente.

Com essas chaves configuradas, o site poderá se comunicar com seu novo backend. O próximo passo será criar as tabelas no banco de dados (ex: `products`, `profiles`) através do painel do Supabase.
