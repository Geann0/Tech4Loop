# Guia de Testes e Execução Local - Tech4Loop

Este documento descreve os requisitos e os passos necessários para rodar o site da Tech4Loop em seu ambiente de desenvolvimento local.

## 1. Pré-requisitos

Antes de começar, certifique-se de que você tem o seguinte software instalado em seu computador:

1.  **Node.js**: É o ambiente que executa o código do site fora de um navegador. A instalação do Node.js também inclui o **npm** (Node Package Manager), que é usado para gerenciar as dependências do projeto.

    - **Versão recomendada**: 18.x ou superior.
    - **Como instalar**: Baixe a versão "LTS" do [site oficial do Node.js](https://nodejs.org/).

2.  **Um Editor de Código (Recomendado)**: Facilita a visualização e edição dos arquivos.

    - **Recomendação**: [Visual Studio Code](https://code.visualstudio.com/).

3.  **Um Terminal ou Linha de Comando**: Para executar os comandos de instalação e inicialização.
    - O Windows, macOS e Linux já vêm com um terminal. O Visual Studio Code também possui um terminal integrado.

## 2. Passos para Executar o Programa

Com os pré-requisitos instalados, siga estes passos:

### Passo 1: Instalar as Dependências do Projeto

Navegue até a pasta raiz do projeto (`c:\Users\User\Desktop\Tech4Loop`) usando seu terminal e execute o seguinte comando:

```bash
npm install
```

**O que este comando faz?**
Ele lê o arquivo `package.json`, identifica todas as "peças" que o site precisa para funcionar (como Next.js, React, Tailwind CSS) e as baixa para uma pasta chamada `node_modules` dentro do seu projeto. **Você só precisa fazer isso uma vez.**

### Passo 2: Iniciar o Servidor de Desenvolvimento

Após a instalação das dependências, execute o comando:

```bash
npm run dev
```

**O que este comando faz?**
Ele inicia um servidor de desenvolvimento local. O terminal mostrará uma mensagem indicando que o servidor está rodando, geralmente assim:

```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Passo 3: Acessar o Site

Abra seu navegador de internet (Chrome, Firefox, etc.) e acesse o seguinte endereço:

[http://localhost:3000](http://localhost:3000)

Você deverá ver a página inicial do site da Tech4Loop. Agora você pode navegar por todas as páginas e testar as funcionalidades. Qualquer alteração que você fizer nos arquivos do projeto será refletida automaticamente no navegador.

Para parar o servidor, volte ao terminal e pressione `Ctrl + C`.
