# Guia de Configuração de E-mail com Resend

Para que os formulários do site enviem e-mails para `suporte.tech4loop@gmail.com`, é crucial configurar corretamente sua conta no [Resend](https://resend.com/).

## Por que os e-mails não estão chegando?

Por padrão, a conta gratuita do Resend só permite enviar e-mails **PARA** o endereço de e-mail que você usou para se cadastrar. Para enviar e-mails para qualquer outro endereço (como seu e-mail de suporte), você precisa provar que é dono de um domínio.

## Passo a Passo para Configurar Corretamente

### Passo 1: Obtenha sua Chave de API (API Key)

1.  Faça login na sua conta Resend.
2.  No menu à esquerda, clique em "API Keys".
3.  Clique em "Create API Key".
4.  Dê um nome para a chave (ex: `Tech4Loop Site`) e selecione a permissão "Full access".
5.  Copie a chave gerada e cole-a no seu arquivo `.env.local`:

    ```
    RESEND_API_KEY="re_SUA_CHAVE_COPIADA_AQUI"
    ```

### Passo 2: Verifique seu Domínio

Este é o passo mais importante.

1.  No menu à esquerda, clique em "Domains".
2.  Clique em "Add Domain" e insira o domínio do seu site (ex: `tech4loop.com`).
3.  O Resend fornecerá alguns registros (geralmente 3 do tipo CNAME ou MX) que você precisa adicionar na zona de DNS do seu provedor de domínio (Hostinger, GoDaddy, etc.).
4.  Após adicionar os registros, aguarde alguns minutos (pode levar até 24 horas, mas geralmente é rápido) e clique em "Verify" no painel do Resend.

### Passo 3: Atualize o Código (Opcional, mas recomendado)

Depois que seu domínio for verificado, é uma boa prática alterar o endereço de "remetente" no código para usar seu próprio domínio. Isso melhora a credibilidade e a taxa de entrega.

- **Arquivo a editar:** `src/app/api/contact/route.ts`
- **Altere a linha:**
  ```typescript
  // De:
  from: 'onboarding@resend.dev',
  // Para (usando seu domínio verificado):
  from: 'Contato <contato@seudominioverificado.com>',
  ```

Após seguir estes passos, os e-mails dos formulários de contato e de parceria chegarão corretamente na sua caixa de entrada.
