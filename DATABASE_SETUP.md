# Guia de Configuração do Banco de Dados (Supabase)

Este guia contém os scripts SQL para configurar seu banco de dados. Execute os passos na ordem para garantir uma instalação limpa.

## Passo 0: Resetar o Banco de Dados (Opcional, mas recomendado)

Se você já tentou configurar as tabelas antes, execute este script primeiro para limpar tudo.

**No SQL Editor do Supabase, cole e execute:**

```sql
-- Apaga tabelas, funções e gatilhos para um ambiente limpo
DROP FUNCTION IF EXISTS public.get_my_role() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.decrement_stock(uuid, integer) CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
```

## Passo 1: Acessar o SQL Editor

1.  Acesse seu projeto no [Supabase](https://supabase.com/).
2.  No menu lateral esquerdo, clique no ícone de **banco de dados** (parece um cilindro).
3.  Na nova tela, selecione **SQL Editor**.
4.  Clique em **"+ New query"**.

## Passo 2: Criar a Estrutura Completa do Banco

Este script único cria todas as funções, tabelas, políticas e o gatilho de uma só vez.

**Em uma nova query, cole e execute todo o bloco de código abaixo:**

```sql
-- 1. FUNÇÕES AUXILIARES
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'customer');
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_stock(p_product_id UUID, p_quantity INT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - p_quantity
  WHERE id = p_product_id;
END;
$$;

-- 2. TABELA PROFILES (COM POLÍTICAS CORRIGIDAS)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(50) DEFAULT 'partner',
  partner_name VARCHAR(255) UNIQUE,
  whatsapp_number VARCHAR(20),
  service_regions TEXT[],
  is_banned BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are publicly viewable." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles." ON public.profiles FOR ALL USING (public.get_my_role() = 'admin') WITH CHECK (public.get_my_role() = 'admin');

-- 3. TABELA CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view all categories." ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage all categories." ON public.categories FOR ALL USING (public.get_my_role() = 'admin') WITH CHECK (public.get_my_role() = 'admin');

-- 4. TABELA PRODUCTS (COM CONTROLE DE ESTOQUE E CATEGORIA CORRIGIDA)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  partner_name VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  old_price NUMERIC(10, 2),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  short_description TEXT,
  description TEXT,
  image_urls TEXT[],
  technical_specs JSONB,
  box_contents JSONB,
  stock INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can manage their own products." ON public.products FOR ALL USING (auth.uid() = partner_id) WITH CHECK (auth.uid() = partner_id);
CREATE POLICY "Public can view all products." ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage all products." ON public.products FOR ALL USING (public.get_my_role() = 'admin') WITH CHECK (public.get_my_role() = 'admin');

-- 5. TABELA ORDERS (SUPORTE A MÚLTIPLOS ITENS E PARCEIROS)
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_cep TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  customer_state VARCHAR(2),
  total_amount NUMERIC(10, 2),
  payment_id TEXT, -- ID do Mercado Pago
  status TEXT DEFAULT 'pending', -- pending, approved, failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all orders." ON public.orders FOR ALL USING (public.get_my_role() = 'admin') WITH CHECK (public.get_my_role() = 'admin');
CREATE POLICY "Partners can view their own orders." ON public.orders FOR SELECT USING (partner_id = auth.uid());

-- 6. NOVA TABELA ORDER_ITEMS
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INT NOT NULL,
  price_at_purchase NUMERIC(10, 2) NOT NULL
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all order items." ON public.order_items FOR ALL USING (public.get_my_role() = 'admin') WITH CHECK (public.get_my_role() = 'admin');
CREATE POLICY "Partners can view items from their orders." ON public.order_items FOR SELECT USING ((SELECT partner_id FROM public.orders WHERE id = order_id) = auth.uid());

-- NOVA TABELA ADDRESSES
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  cep TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state VARCHAR(2) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own addresses." ON public.addresses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- 7. GATILHO (TRIGGER)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## Passo 3: Sincronizar Usuários Existentes

Se você já tinha usuários no seu projeto antes de rodar os scripts acima, execute este comando para criar os perfis que faltam.

**Em uma nova query, cole e execute:**

```sql
-- Sincroniza usuários que estão na auth.users mas não na public.profiles
INSERT INTO public.profiles (id, email, partner_name, role, service_regions)
SELECT u.id, u.email, u.email, 'partner', '{}'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

## Solução de Problemas: Erro "schema cache"

Se você encontrar um erro como `Could not find the 'column' in the schema cache` após alterar a estrutura de uma tabela, significa que a API do Supabase está usando uma versão desatualizada do esquema.

**Para resolver:**

1.  **Acesse as Configurações da API:**
    - No painel do seu projeto Supabase, vá para **API Docs** (ícone de documento).
    - No menu lateral, selecione a tabela que está causando o erro (ex: `products`).
2.  **Recarregue o Esquema:**
    - No canto superior direito da página, clique no botão **"Reload schema"**.
3.  **Se o erro persistir, force a atualização:**
    - Vá para **Settings** (ícone de engrenagem) > **General**.
    - Clique em **"Restart project"**. Isso reiniciará o servidor da sua API com o esquema mais recente. **Aguarde alguns minutos** para que o processo seja concluído.

Isso forçará a API a recarregar a estrutura mais recente do seu banco de dados, resolvendo o erro.

Após estes passos, seu banco de dados estará configurado corretamente.
