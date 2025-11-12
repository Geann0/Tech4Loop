import BlackFridayBanner from "@/components/home/BlackFridayBanner";
import Link from "next/link";
import Image from "next/image";
import WhatsAppButton from "@/components/WhatsAppButton";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

const whyUsItems = [
  {
    title: "Garantia 90 dias",
    description: "Compre com segurança e confiança.",
  },
  {
    title: "Suporte em Português",
    description: "Atendimento rápido e especializado.",
  },
  {
    title: "Testado e Aprovado",
    description: "Produtos selecionados e validados.",
  },
];

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies });

  // Destaques: Apenas produtos Tech4Loop
  const { data: featuredProductsData } = await supabase
    .from("products")
    .select("*, profiles(whatsapp_number, service_regions)")
    .is("partner_id", null) // Pega Tech4Loop ou parceiro nulo
    .limit(3);
  const featuredProducts: Product[] = featuredProductsData || [];

  // Novidades: Todos os produtos recentes
  const { data: newProductsData } = await supabase
    .from("products")
    .select("*, profiles(whatsapp_number, service_regions)")
    .order("created_at", { ascending: false })
    .limit(4);
  const newProducts: Product[] = newProductsData || [];

  // Produto em destaque para a seção superior
  const { data: productsForFeatured } = await supabase
    .from("products")
    .select("*, profiles(whatsapp_number, service_regions)")
    .is("partner_id", null)
    .order("created_at", { ascending: false })
    .limit(4);
  const products = productsForFeatured || [];
  const featuredProduct = products.find((p) => p.is_featured) || products[0];

  return (
    <div>
      {/* 1. Seção Hero */}
      <section className="bg-background text-white text-center py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-electric-purple">
            Conecte-se na estrada com o Intercomunicador Y10
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Comunicação segura e estável para suas viagens.
          </p>
          <Link
            href="/produtos"
            className="bg-neon-blue text-black font-bold py-3 px-10 rounded-lg hover:shadow-glow transition-all text-lg transform hover:scale-105"
          >
            Compre agora
          </Link>
        </div>
      </section>

      {/* 2. Destaques de Produtos */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">
            Produtos em Destaque
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-900/50 rounded-lg p-6 text-center border border-gray-800 hover:border-neon-blue transition-all group flex flex-col transform hover:-translate-y-2"
              >
                {/* Imagem do produto otimizada */}
                <div className="relative w-full h-80 rounded-lg overflow-hidden border border-gray-700">
                  <Image
                    src={product.image_urls[0]}
                    alt={product.name}
                    fill
                    style={{ objectFit: "contain" }}
                    // Placeholder para imagens reais
                  />
                </div>
                <div className="flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-2 truncate">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 mb-2 flex-grow break-words">
                    {(product.short_description || "").substring(0, 40)}...
                  </p>
                  <p className="text-2xl font-bold text-neon-blue mb-4">
                    R$ {product.price.toFixed(2)}
                  </p>
                  <Link
                    href={`/produtos/${product.slug}`}
                    className="w-full bg-electric-purple text-white font-bold py-2 px-6 rounded-lg group-hover:shadow-glow transition-shadow"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Seção "Por que escolher a Tech4Loop?" */}
      <section className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">
            Por que escolher a Tech4Loop?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {whyUsItems.map((item) => (
              <div key={item.title} className="p-6">
                {/* Ícone placeholder */}
                <div className="text-neon-blue mb-4 text-4xl mx-auto w-fit">
                  ICON
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Destaque do Produto (superior) */}
      {featuredProduct && (
        <section className="py-20 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-4">Produto em Destaque</h2>
                <div className="relative w-full h-80 rounded-lg overflow-hidden border border-gray-700">
                  <Image
                    src={featuredProduct.image_urls[0]}
                    alt={featuredProduct.name}
                    fill
                    style={{ objectFit: "contain" }}
                    className="bg-gray-800"
                    priority // Carrega a imagem principal com prioridade
                  />
                </div>
              </div>
              <div className="mt-6 md:mt-0">
                <h3 className="text-2xl font-bold break-words">
                  {featuredProduct.name}
                </h3>
                <p className="text-gray-400 mt-2 h-20 overflow-hidden break-words">
                  {featuredProduct.short_description || ""}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-3xl font-bold text-neon-blue">
                    R$ {featuredProduct.price.toFixed(2)}
                  </span>
                  <Link
                    href={`/produtos/${featuredProduct.slug}`}
                    className="bg-electric-purple text-white font-bold py-3 px-6 rounded-lg hover:shadow-glow transition-shadow"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Nova Seção Novidades */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Novidades</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-900/50 rounded-lg overflow-hidden border border-gray-800 flex flex-col"
              >
                <Link
                  href={`/produtos/${product.slug}`}
                  className="block relative w-full h-56"
                >
                  <Image
                    src={product.image_urls[0]}
                    alt={product.name}
                    fill
                    style={{ objectFit: "contain" }}
                    className="bg-gray-700"
                  />
                </Link>
                <div className="p-4 flex flex-col flex-grow">
                  <span className="text-xs text-gray-400 mb-1">
                    Vendido por: {product.partner_name || "Tech4Loop"}
                  </span>
                  <h3 className="text-xl font-bold mb-2 truncate">
                    {product.name}
                  </h3>
                  <p className="text-2xl font-bold text-neon-blue mb-4 flex-grow">
                    R$ {product.price.toFixed(2)}
                  </p>
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/produtos/${product.slug}`}
                      className="w-full text-center bg-electric-purple text-white font-bold py-2 px-4 rounded-lg group-hover:shadow-glow transition-shadow"
                    >
                      Ver Detalhes
                    </Link>
                    <WhatsAppButton
                      productName={product.name}
                      className="w-full text-center"
                      partnerName={product.partner_name}
                      partnerWhatsapp={
                        product.profiles?.whatsapp_number || null
                      }
                      partnerRegions={product.profiles?.service_regions || null}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Banner Black Friday (condicional) */}
      <BlackFridayBanner />
    </div>
  );
}
