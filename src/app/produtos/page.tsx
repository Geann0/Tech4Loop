import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Product, Category } from "@/types";
import ProductGrid from "@/components/ProductGrid";
import ProductFilters from "@/components/ProductFilters";
import { parseCoverageFromRegions, validateCoverage } from "@/lib/geolocation";

export const dynamic = "force-dynamic";

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createServerComponentClient({ cookies });
  const category = searchParams?.category as string;
  const search = searchParams?.search as string;
  const similar = searchParams?.similar as string; // ID do produto similar
  const city = searchParams?.city as string; // Cidade do usuário
  const state = searchParams?.state as string; // Estado do usuário
  const priceMin = searchParams?.priceMin as string;
  const priceMax = searchParams?.priceMax as string;
  const sortBy = searchParams?.sort as string;

  let query = supabase
    .from("products")
    .select(
      "*, categories(name), profiles!products_partner_id_fkey(partner_name, whatsapp_number, service_regions)"
    );

  // Se está buscando produto similar, filtra pela mesma categoria
  if (similar) {
    const { data: originalProduct } = await supabase
      .from("products")
      .select("category_id")
      .eq("id", similar)
      .single();

    if (originalProduct) {
      query = query.eq("category_id", originalProduct.category_id);
      query = query.neq("id", similar); // Exclui o produto original
    }
  } else if (category) {
    query = query.eq("category_id", category);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  // Filtros de preço
  if (priceMin) {
    query = query.gte("price", parseFloat(priceMin));
  }
  if (priceMax) {
    query = query.lte("price", parseFloat(priceMax));
  }

  // Ordenação
  if (sortBy) {
    switch (sortBy) {
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "name_asc":
        query = query.order("name", { ascending: true });
        break;
      case "name_desc":
        query = query.order("name", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: products, error: productsError } = await query;

  const { data: categoriesData, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, created_at")
    .order("name");

  if (productsError || categoriesError) {
    console.error("Error fetching data:", productsError || categoriesError);
    return (
      <p className="text-center text-red-500">
        Ocorreu um erro ao carregar os produtos. Tente novamente mais tarde.
      </p>
    );
  }

  // Filtrar produtos por cobertura geográfica (se city e state foram informados)
  let filteredProducts = products || [];
  if (city && state && similar) {
    console.log(`🔍 Filtrando produtos para ${city}/${state}`);

    // Criar um "CEP fake" baseado no estado para validação
    // Buscar CEPs reais seria ideal, mas aqui usamos a cidade/estado direto
    const productsWithCoverage = await Promise.all(
      filteredProducts.map(async (product: any) => {
        const coverage = parseCoverageFromRegions(
          product.profiles?.service_regions,
          product.profiles?.partner_name
        );

        // Validação simplificada baseada em cidade/estado
        let isValid = false;

        if (coverage.type === "country") {
          isValid = true;
        } else if (coverage.type === "state") {
          isValid = coverage.states?.includes(state.toUpperCase()) || false;
        } else if (coverage.type === "city") {
          const normalizedCity = city
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase();
          const coverageCities =
            coverage.cities?.map((c) =>
              c
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toUpperCase()
            ) || [];
          isValid = coverageCities.includes(normalizedCity);
        }

        return { ...product, isValid };
      })
    );

    filteredProducts = productsWithCoverage.filter((p: any) => p.isValid);
    console.log(
      `✅ Encontrados ${filteredProducts.length} produtos disponíveis`
    );
  }

  const allCategories = categoriesData ?? [];

  // Calcular faixa de preço para os filtros
  const prices = (products || []).map((p: any) => p.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 10000;

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Título da Página */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-electric-purple mb-2">
            Todos os Produtos
          </h1>
          <p className="text-gray-400">
            Encontre os melhores produtos de tecnologia
          </p>
        </div>

        {/* Filtros */}
        {!similar && (
          <ProductFilters
            categories={allCategories}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        )}

        {similar && city && state && (
          <div className="mb-8 p-4 bg-neon-blue/10 border border-neon-blue/30 rounded-lg">
            <h2 className="text-xl font-bold text-neon-blue mb-2">
              🎯 Produtos Similares para {city}/{state}
            </h2>
            <p className="text-gray-300">
              Mostrando apenas produtos de lojas que atendem sua região.
              {filteredProducts.length === 0 &&
                " Infelizmente, não encontramos produtos similares disponíveis para sua área."}
            </p>
          </div>
        )}

        {/* Contador de Resultados */}
        <div className="mb-6">
          <p className="text-gray-400">
            {filteredProducts.length === 0 ? (
              <span className="text-yellow-500">
                Nenhum produto encontrado com os filtros aplicados.
              </span>
            ) : (
              <>
                Mostrando{" "}
                <span className="text-white font-bold">
                  {filteredProducts.length}
                </span>{" "}
                {filteredProducts.length === 1 ? "produto" : "produtos"}
              </>
            )}
          </p>
        </div>

        <ProductGrid
          products={filteredProducts as any[]}
          allCategories={allCategories}
          currentCategory={category}
          searchQuery={search}
        />
      </div>
    </div>
  );
}
