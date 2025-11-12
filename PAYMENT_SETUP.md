# Guia de Configuração de Pagamento com Mercado Pago

Para habilitar pagamentos com Cartão, Pix e Boleto, você precisa de uma conta no Mercado Pago e de suas credenciais de produção.

## Passo 1: Criar e Configurar sua Conta

1.  Se você ainda não tem, crie uma conta no [Mercado Pago](https://www.mercadopago.com.br/). Certifique-se de que é uma conta de **vendedor**.
2.  Após criar a conta, acesse o painel e complete as informações do seu negócio. Você precisará ativar sua conta para poder receber pagamentos.

## Passo 2: Obter suas Credenciais de Produção

As credenciais são as "senhas" que conectam seu site ao Mercado Pago.

1.  Acesse o painel do Mercado Pago e vá para **Seu negócio > Configurações > Credenciais**.
2.  Você estará na aba "Credenciais de produção". Clique em "Ativar credenciais". Pode ser necessário preencher um formulário sobre seu site/negócio.
3.  Após a ativação, você terá acesso a duas chaves essenciais:
    - **Public key**: Usada no frontend (lado do cliente).
    - **Access token**: Usado no backend (lado do servidor). É secreta e não deve ser exposta.

## Passo 3: Adicionar as Credenciais ao Projeto

Abra o arquivo `.env.local` na raiz do seu projeto e adicione as chaves que você copiou:

```
# ... outras chaves ...

# Credenciais do Mercado Pago
# Cole sua Public Key aqui
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
# Cole seu Access Token aqui
MERCADO_PAGO_ACCESS_TOKEN="APP_USR-xxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxx-xxxxxxxxxx"
```

Com as credenciais salvas no arquivo `.env.local`, o site estará pronto para processar pagamentos reais.
