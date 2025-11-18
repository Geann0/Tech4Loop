# Tech4Loop - E-commerce Platform

![Tech4Loop](public/images/logo.png)

## 📋 Sobre o Projeto

Tech4Loop é uma plataforma de e-commerce moderna e robusta, desenvolvida com Next.js 14, focada na venda de acessórios tech, especialmente intercomunicadores para motociclistas. A plataforma suporta múltiplos vendedores (parceiros) e oferece uma experiência de compra completa e segura.

## ✨ Funcionalidades Principais

### Para Clientes

- 🛍️ **Navegação de Produtos**: Catálogo completo com filtros e busca
- 🛒 **Carrinho de Compras**: Sistema de carrinho persistente com localStorage
- 💳 **Pagamento Integrado**: Integração com Mercado Pago
- 📱 **Design Responsivo**: Otimizado para mobile, tablet e desktop
- 🔍 **SEO Otimizado**: Meta tags, sitemap dinâmico, structured data (JSON-LD)
- ⚡ **Performance**: Otimização de imagens, lazy loading, bundle splitting

### Para Parceiros (Vendedores)

- 📦 **Gestão de Produtos**: Adicionar, editar e remover produtos
- 📊 **Dashboard**: Visão geral de vendas e pedidos
- 🗺️ **Regiões de Atendimento**: Definir estados atendidos
- 📞 **WhatsApp Integration**: Link direto para contato

### Para Administradores

- 👥 **Gestão de Parceiros**: Criar, editar, banir parceiros
- 🏷️ **Gestão de Categorias**: Organizar produtos
- 📦 **Gestão Global de Produtos**: Controle total do catálogo
- 📈 **Painel de Pedidos**: Visualizar e gerenciar todos os pedidos
- 🛡️ **Controle de Acesso**: Sistema robusto de permissões (RBAC)

## 🛠️ Tecnologias Utilizadas

### Core

- **[Next.js 14](https://nextjs.org/)** - Framework React com App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[Supabase](https://supabase.com/)** - Backend (Database, Auth, Storage)

### Validação e Segurança

- **[Zod](https://zod.dev/)** - Schema validation
- **Rate Limiting** - Proteção contra abuse
- **RBAC** - Role-Based Access Control
- **Security Headers** - X-Frame-Options, CSP, etc.

### Pagamentos e Comunicação

- **[Mercado Pago](https://www.mercadopago.com.br/)** - Gateway de pagamento
- **[Resend](https://resend.com/)** - Email transacional
- **WhatsApp Business API** - Suporte ao cliente

### Dev Tools

- **[ESLint](https://eslint.org/)** - Linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[TypeScript ESLint](https://typescript-eslint.io/)** - TS linting rules

## 📁 Estrutura do Projeto

```
Tech4Loop/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── admin/             # Área administrativa
│   │   ├── partner/           # Área de parceiros
│   │   ├── produtos/          # Catálogo de produtos
│   │   ├── carrinho/          # Carrinho de compras
│   │   ├── checkout/          # Processo de checkout
│   │   ├── api/               # API Routes
│   │   └── ...
│   ├── components/            # Componentes React
│   │   ├── admin/            # Componentes admin
│   │   ├── partner/          # Componentes parceiro
│   │   ├── checkout/         # Componentes checkout
│   │   └── ...
│   ├── contexts/             # React Contexts (Cart, etc)
│   ├── lib/                  # Utilities e helpers
│   │   ├── auth.ts          # Helpers de autenticação
│   │   ├── utils.ts         # Funções utilitárias
│   │   ├── validations.ts   # Schemas Zod
│   │   ├── rateLimit.ts     # Rate limiting
│   │   └── ...
│   └── types/               # TypeScript types
├── public/                  # Arquivos estáticos
├── middleware.ts           # Next.js middleware (auth, security)
├── next.config.mjs        # Configuração Next.js
├── tailwind.config.ts     # Configuração Tailwind
├── .env.example           # Exemplo de variáveis de ambiente
└── package.json

```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ e npm/yarn/pnpm
- Conta no Supabase
- Conta no Mercado Pago (para pagamentos)
- Conta no Resend (para emails)

### Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/Geann0/Tech4Loop.git
cd Tech4Loop
```

2. **Instale as dependências**

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. **Configure as variáveis de ambiente**

Copie o arquivo `.env.example` para `.env.local` e preencha com suas credenciais:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas chaves:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# MercadoPago
MERCADO_PAGO_ACCESS_TOKEN=your_mp_access_token
MERCADO_PAGO_PUBLIC_KEY=your_mp_public_key

# Resend
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Tech4Loop

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999
```

4. **Configure o banco de dados**

Siga as instruções em `DATABASE_SETUP.md` para criar as tabelas necessárias no Supabase.

5. **Execute o servidor de desenvolvimento**

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## 📝 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa ESLint
npm run lint:fix     # Corrige problemas do ESLint
npm run format       # Formata código com Prettier
npm run type-check   # Verifica tipos TypeScript
```

## 🔒 Segurança

### Implementações de Segurança

- ✅ **Rate Limiting**: Proteção contra abuse de APIs
- ✅ **RBAC**: Controle de acesso baseado em roles (admin, partner, customer)
- ✅ **Input Validation**: Validação com Zod em todos os forms
- ✅ **SQL Injection Protection**: Uso de Supabase com queries parametrizadas
- ✅ **XSS Protection**: Sanitização de inputs e uso de dangerouslySetInnerHTML controlado
- ✅ **CSRF Protection**: Tokens de sessão seguros
- ✅ **Security Headers**: X-Frame-Options, CSP, X-Content-Type-Options
- ✅ **Password Hashing**: Gerenciado pelo Supabase Auth
- ✅ **Row Level Security (RLS)**: Políticas no Supabase

### Boas Práticas

- Variáveis sensíveis em `.env.local` (não commitadas)
- Service Role Key usado apenas em server-side
- Middleware para proteção de rotas
- Logs de auditoria para ações críticas
- Validação tanto no cliente quanto no servidor

## 🎨 Customização

### Cores (Tailwind)

As cores principais estão definidas em `tailwind.config.ts`:

```typescript
colors: {
  background: "#0A0F2A",     // Azul-marinho escuro
  "neon-blue": "#00D1FF",    // Azul ciano neon
  "electric-purple": "#934CFF", // Roxo elétrico
  "burnt-orange": "#FF8C00",   // Laranja queimado
}
```

### Fontes

O projeto usa **Poppins** como fonte principal, importada via Google Fonts.

## 📊 Performance e SEO

### Otimizações Implementadas

- ✅ **Image Optimization**: Next.js Image component com AVIF/WebP
- ✅ **Code Splitting**: Automático via Next.js
- ✅ **Dynamic Imports**: Componentes pesados carregados sob demanda
- ✅ **Metadata Dinâmica**: Tags Open Graph, Twitter Cards
- ✅ **Sitemap Dinâmico**: Gerado automaticamente com produtos
- ✅ **Robots.txt**: Configurado para SEO
- ✅ **Structured Data**: JSON-LD para produtos e organização
- ✅ **Semantic HTML**: Tags semânticas corretas
- ✅ **Lazy Loading**: Imagens e componentes
- ✅ **Bundle Size**: Otimização com SWC minifier

### Lighthouse Scores (Target)

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Convenções de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação (sem mudança de código)
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de manutenção

## 📄 Licença

Este projeto é privado e proprietário. Todos os direitos reservados © 2025 Tech4Loop.

## 📞 Suporte

- **Email**: suporte@tech4loop.com.br
- **WhatsApp**: +55 11 99999-9999
- **Website**: https://tech4loop.com.br

## 🙏 Agradecimentos

- Next.js team pela excelente framework
- Supabase pela plataforma backend
- Vercel pelo hosting e deployment
- Comunidade open-source

---

**Desenvolvido com ❤️ pela equipe Tech4Loop**
