# Guia Opcional: Testando Pagamentos com Ngrok

## O Problema do `localhost`

O erro `auto_return invalid` acontece porque o **servidor do Mercado Pago** precisa redirecionar o seu navegador de volta para o seu site. No entanto, o endereço `http://localhost:3000` só existe no seu computador; o servidor do Mercado Pago não consegue acessá-lo.

A remoção da linha `auto_return: 'approved'` faz o pagamento funcionar, mas o cliente precisa clicar manualmente no botão "Voltar para o site" na página de sucesso do Mercado Pago.

Para testar a experiência completa (com o redirecionamento automático) em seu ambiente local, você precisa de uma URL pública que aponte para o seu `localhost`. É para isso que serve o **Ngrok**.

## O que é Ngrok?

Ngrok é uma ferramenta que cria um "túnel" seguro da internet pública para o seu `localhost`. Ele te dá uma URL temporária (ex: `https://aleatorio.ngrok.io`) que você pode usar para testar webhooks e redirecionamentos.

## Como Usar o Ngrok

1.  **Baixe o Ngrok**: Vá para o [site oficial do Ngrok](https://ngrok.com/download) e baixe o arquivo para o seu sistema operacional. Descompacte-o.

2.  **Inicie seu site local**: Em um terminal, rode o comando `npm run dev`. Seu site estará rodando em `http://localhost:3000`.

3.  **Inicie o Ngrok**: Abra **outro** terminal, navegue até a pasta onde você descompactou o Ngrok e execute o comando:

    ```bash
    ./ngrok http 3000
    ```

    (No Windows, pode ser apenas `ngrok http 3000`)

4.  **Copie a URL**: O Ngrok mostrará uma URL "Forwarding" que termina com `.ngrok-free.app` (ou similar) e começa com `https`. Copie essa URL completa.

5.  **Atualize o `.env.local`**: Cole a URL do Ngrok no seu arquivo `.env.local`:

    ```bash
    # .env.local
    NEXT_PUBLIC_SITE_URL="https://SUA_URL_DO_NGROK.ngrok-free.app"
    ```

6.  **Reinicie o servidor do site**: Volte ao primeiro terminal, pare o servidor (`Ctrl + C`) e inicie-o novamente (`npm run dev`).

Agora, se você descomentar a linha `auto_return: 'approved'`, o Mercado Pago usará a URL pública do Ngrok e o redirecionamento automático funcionará perfeitamente, mesmo no seu ambiente local.
