# 🌍 Sistema de Alcance Geográfico - Tech4Loop

## ✅ Implementações Concluídas

### 1. **Validação de CEP e Geolocalização**

Criado o arquivo `src/lib/geolocation.ts` com:

- ✅ **Busca automática de CEP** via API ViaCEP
- ✅ **3 tipos de cobertura**:
  - `city`: Atende cidades específicas
  - `state`: Atende estados inteiros
  - `country`: Atende país inteiro (Brasil)
- ✅ **Normalização de nomes** (remove acentos, compara corretamente)
- ✅ **Mensagens de erro personalizadas**

### 2. **Validação no Checkout**

Atualizado `src/app/checkout/actions.ts`:

- ✅ CEP agora é **obrigatório** e **validado**
- ✅ Busca informações do parceiro/loja
- ✅ Valida se CEP está na área de cobertura
- ✅ **Logs detalhados** para debug
- ✅ Retorna `outOfCoverage: true` quando fora da área

### 3. **Interface do Usuário**

Atualizado `src/components/checkout/CheckoutForm.tsx`:

- ✅ Exibe mensagem personalizada quando fora da área
- ✅ **Botão "Buscar Produtos Similares"** quando fora da cobertura
- ✅ Redireciona para `/produtos?similar={id}&city={city}&state={state}`

---

## 📋 Como Funciona

### Exemplo 1: Tech4Loop (Cidades Específicas)

**Configuração no registro:**

```
service_regions: ["OURO PRETO DO OESTE", "JI-PARANÁ"]
```

**Cenário:**

- Usuário em São Paulo tenta comprar
- CEP detectado: São Paulo/SP
- ❌ **Resultado**: Fora da área de cobertura
- **Mensagem**: "Ops! A loja Tech4Loop não atende sua região (São Paulo/SP). Esta loja não atende São Paulo. Cidades atendidas: Ouro Preto do Oeste, Ji-Paraná. Que tal buscar produtos similares de outras lojas que atendem sua área?"
- **Ação**: Botão para buscar produtos similares

---

### Exemplo 2: Loja.Exemplo (Estado Inteiro)

**Configuração no registro:**

```
service_regions: ["SP"]  // Atende todo o estado de SP
```

**Cenário:**

- Usuário em São Paulo tenta comprar
- CEP detectado: São Paulo/SP
- ✅ **Resultado**: Dentro da área de cobertura
- **Ação**: Prossegue para pagamento

---

### Exemplo 3: Loja.Exemplo2 (País Inteiro)

**Configuração no registro:**

```
service_regions: []  // ou null/undefined
```

**Cenário:**

- Usuário em qualquer cidade do Brasil
- ✅ **Resultado**: Dentro da área de cobertura (Brasil inteiro)
- **Ação**: Prossegue para pagamento

---

## 🔧 Configuração de Lojas

### Opção 1: Cidades Específicas

```typescript
service_regions: ["OURO PRETO DO OESTE", "JI-PARANÁ", "ARIQUEMES"];
```

**Como funciona**: Valida se a cidade do CEP corresponde exatamente.

---

### Opção 2: Estados

```typescript
service_regions: ["RO", "SP", "RJ"];
```

**Como funciona**: Valida se o estado do CEP está na lista.

---

### Opção 3: País Inteiro

```typescript
service_regions: []; // ou null
```

**Como funciona**: Aceita qualquer CEP válido do Brasil.

---

## 🚀 Próximos Passos (Opcional)

### 1. Página de Produtos Similares

Criar filtro na página `/produtos` que:

- Aceita parâmetros: `similar`, `city`, `state`
- Filtra produtos da mesma categoria
- Mostra apenas lojas que atendem aquela região
- Ordena por relevância

**Arquivo a criar**: `src/app/produtos/page.tsx`

```typescript
// Exemplo de query
const { data: similarProducts } = await supabase
  .from("products")
  .select(
    `
    *,
    profiles(service_regions)
  `
  )
  .eq("category_id", originalProduct.category_id)
  .neq("id", originalProduct.id);

// Filtrar produtos que atendem a região do usuário
const available = similarProducts.filter((p) => {
  const coverage = parseCoverageFromRegions(p.profiles.service_regions);
  const result = await validateCoverage(userCEP, coverage);
  return result.valid;
});
```

---

### 2. Melhorar Registro de Parceiros

Adicionar interface visual para escolher tipo de cobertura:

```tsx
<select name="coverage_type">
  <option value="city">Cidades Específicas</option>
  <option value="state">Estados</option>
  <option value="country">Todo o Brasil</option>
</select>

{coverageType === 'city' && (
  <textarea
    name="cities"
    placeholder="Digite as cidades (uma por linha)"
  />
)}

{coverageType === 'state' && (
  <select multiple name="states">
    <option value="AC">Acre</option>
    <option value="RO">Rondônia</option>
    <!-- ... -->
  </select>
)}
```

---

### 3. Cache de CEPs

Para melhor performance, implementar cache:

```typescript
// Em geolocation.ts
const cepCache = new Map<string, CEPData>();

export async function fetchCEPData(cep: string): Promise<CEPData | null> {
  if (cepCache.has(cep)) {
    return cepCache.get(cep)!;
  }

  const data = await fetch(/* ... */);
  cepCache.set(cep, data);
  return data;
}
```

---

## 📊 Logs de Debug

O sistema agora gera logs detalhados:

```
📍 Validando cobertura para CEP: 76900-000
✅ CEP válido e dentro da área de cobertura

ou

📍 Validando cobertura para CEP: 01310-100
❌ Fora da área de cobertura: {
  valid: false,
  reason: "Esta loja não atende São Paulo...",
  location: { city: "São Paulo", state: "SP" }
}
```

---

## 🐛 Erros de Checkout Corrigidos

Também foram adicionados logs detalhados para debug de erros:

```
❌ Order creation error: { message: "...", details: "..." }
❌ Mercado Pago error: { message: "...", cause: "..." }
```

Agora você verá exatamente onde está falhando!

---

## ✅ Checklist de Teste

- [ ] Criar produto como Tech4Loop (cidades específicas)
- [ ] Criar parceiro com cobertura estadual
- [ ] Criar parceiro com cobertura nacional
- [ ] Testar checkout com CEP dentro da área
- [ ] Testar checkout com CEP fora da área
- [ ] Verificar se botão "Buscar Similares" aparece
- [ ] Testar API do Mercado Pago
- [ ] Verificar logs no console do servidor
