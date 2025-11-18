# 🤝 Guia de Contribuição - Tech4Loop

Obrigado por considerar contribuir com o Tech4Loop! Este guia estabelece as convenções e boas práticas do projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Padrões de Código](#padrões-de-código)
- [Convenções de Commit](#convenções-de-commit)
- [Estrutura de Branches](#estrutura-de-branches)
- [Pull Requests](#pull-requests)
- [Testes](#testes)

## 📜 Código de Conduta

- Seja respeitoso e profissional
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros

## 🔧 Como Contribuir

### 1. Fork e Clone

```bash
# Fork no GitHub, depois:
git clone https://github.com/SEU_USUARIO/Tech4Loop.git
cd Tech4Loop
npm install
```

### 2. Crie uma Branch

```bash
git checkout -b feat/minha-feature
# ou
git checkout -b fix/correcao-bug
```

### 3. Faça suas Mudanças

- Siga os padrões de código
- Adicione testes se aplicável
- Atualize a documentação

### 4. Commit

```bash
git add .
git commit -m "feat: adicionar nova funcionalidade X"
```

### 5. Push e PR

```bash
git push origin feat/minha-feature
# Abra um Pull Request no GitHub
```

## 💻 Padrões de Código

### TypeScript

#### Tipos

```typescript
// ✅ BOM - Tipos explícitos
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User | null> {
  // ...
}

// ❌ EVITAR - Tipos implícitos any
function getUser(id) {
  // ...
}
```

#### Null Safety

```typescript
// ✅ BOM - Verificação de null/undefined
const user = await getUser(id);
if (!user) {
  return { error: "Usuário não encontrado" };
}
console.log(user.name);

// ❌ EVITAR - Acesso sem verificação
const user = await getUser(id);
console.log(user.name); // Pode causar erro
```

### React/Next.js

#### Componentes

```typescript
// ✅ BOM - Componente funcional tipado
interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function Button({ text, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled} className="...">
      {text}
    </button>
  );
}

// ❌ EVITAR - Props sem tipagem
export default function Button({ text, onClick }) {
  // ...
}
```

#### Server Components vs Client Components

```typescript
// ✅ BOM - Server Component (padrão)
// src/app/produtos/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function ProductsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from("products").select("*");
  // ...
}

// ✅ BOM - Client Component (quando necessário)
// src/components/CartButton.tsx
("use client");

import { useState } from "react";

export default function CartButton() {
  const [isOpen, setIsOpen] = useState(false);
  // ...
}
```

### Validação com Zod

```typescript
// ✅ BOM - Sempre validar inputs
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  const data = {
    name: String(formData.get("name")),
    email: String(formData.get("email")),
  };

  const result = schema.safeParse(data);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  // Prosseguir com dados validados
}

// ❌ EVITAR - Sem validação
export async function createUser(formData: FormData) {
  const name = formData.get("name"); // Pode ser null!
  // ...
}
```

### Tratamento de Erros

```typescript
// ✅ BOM - Try-catch e mensagens claras
export async function deleteProduct(id: string) {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Erro ao deletar produto:", error);
      return { error: "Não foi possível deletar o produto." };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro inesperado:", error);
    return { error: "Erro inesperado. Tente novamente." };
  }
}

// ❌ EVITAR - Erros não tratados
export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  // E se houver erro?
}
```

### Segurança

```typescript
// ✅ BOM - Verificar permissões
import { requireAdmin } from "@/lib/auth";

export async function deleteUser(userId: string) {
  await requireAdmin(); // Lança erro se não for admin

  // Prosseguir com a ação
}

// ❌ EVITAR - Sem verificação de permissões
export async function deleteUser(userId: string) {
  // Qualquer um pode deletar!
}
```

### Performance

```typescript
// ✅ BOM - Lazy loading de componentes pesados
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <p>Carregando...</p>,
  ssr: false,
});

// ✅ BOM - Memoização quando apropriado
import { useMemo } from "react";

function ExpensiveComponent({ data }) {
  const processedData = useMemo(() => {
    return data.map(/* processamento pesado */);
  }, [data]);

  return <div>{/* usar processedData */}</div>;
}
```

## 📝 Convenções de Commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

### Formato

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Apenas documentação
- `style`: Formatação (sem mudança de lógica)
- `refactor`: Refatoração de código
- `perf`: Melhoria de performance
- `test`: Adicionar ou corrigir testes
- `chore`: Tarefas de build, CI, dependências

### Exemplos

```bash
# Nova funcionalidade
git commit -m "feat(cart): adicionar botão de limpar carrinho"

# Correção de bug
git commit -m "fix(checkout): corrigir validação de CEP"

# Documentação
git commit -m "docs: atualizar README com instruções de deploy"

# Refatoração
git commit -m "refactor(products): extrair lógica de validação"

# Performance
git commit -m "perf(images): otimizar carregamento com lazy loading"
```

### Descrição

- Use imperativo ("adicionar" não "adicionado")
- Não capitalize a primeira letra
- Sem ponto final
- Máximo 72 caracteres

## 🌿 Estrutura de Branches

### Branches Principais

- `main`: Código em produção (protegida)
- `develop`: Próxima versão em desenvolvimento

### Branches de Funcionalidade

```
feat/nome-da-funcionalidade
fix/nome-do-bug
docs/nome-da-doc
refactor/nome-da-refatoracao
```

### Exemplo de Workflow

```bash
# Sempre partir da develop atualizada
git checkout develop
git pull origin develop

# Criar branch de feature
git checkout -b feat/sistema-reviews

# Fazer mudanças e commits
git add .
git commit -m "feat(reviews): adicionar schema de reviews"
git commit -m "feat(reviews): criar componente de avaliação"

# Atualizar com develop antes de mergear
git checkout develop
git pull origin develop
git checkout feat/sistema-reviews
git rebase develop

# Push e criar PR
git push origin feat/sistema-reviews
```

## 🔍 Pull Requests

### Checklist antes de criar PR

- [ ] Código segue os padrões do projeto
- [ ] Testes passando (quando aplicável)
- [ ] Documentação atualizada
- [ ] Sem console.logs ou código comentado
- [ ] Commits seguem convenções
- [ ] Branch atualizada com develop/main

### Template de PR

```markdown
## Descrição

Breve descrição das mudanças

## Tipo de Mudança

- [ ] Nova funcionalidade (feat)
- [ ] Correção de bug (fix)
- [ ] Breaking change
- [ ] Documentação

## Como Testar

1. Passo 1
2. Passo 2

## Screenshots (se aplicável)

[Adicionar screenshots]

## Checklist

- [ ] Código segue os padrões
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
```

### Revisão de Código

O revisor deve verificar:

- ✅ Lógica está correta
- ✅ Segue padrões do projeto
- ✅ Sem vulnerabilidades de segurança
- ✅ Performance adequada
- ✅ Código legível e bem documentado

## 🧪 Testes

### Estrutura

```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── lib/
│   ├── utils.ts
│   └── __tests__/
│       └── utils.test.ts
```

### Exemplo de Teste

```typescript
// src/lib/__tests__/utils.test.ts
import { formatCurrency, validateCPF } from "../utils";

describe("formatCurrency", () => {
  it("deve formatar número como BRL", () => {
    expect(formatCurrency(1000)).toBe("R$ 1.000,00");
  });

  it("deve lidar com centavos", () => {
    expect(formatCurrency(10.5)).toBe("R$ 10,50");
  });
});

describe("validateCPF", () => {
  it("deve validar CPF correto", () => {
    expect(validateCPF("123.456.789-09")).toBe(true);
  });

  it("deve rejeitar CPF inválido", () => {
    expect(validateCPF("000.000.000-00")).toBe(false);
  });
});
```

## 📚 Recursos Adicionais

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev/)
- [Supabase Docs](https://supabase.com/docs)

## ❓ Dúvidas?

Abra uma issue ou entre em contato:

- Email: dev@tech4loop.com.br
- Discord: [Link do servidor]

---

**Obrigado por contribuir! 🚀**
