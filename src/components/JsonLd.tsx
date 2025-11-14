import { Product } from "@/types/index";

interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
}

interface ProductSchema {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  image: string[];
  description: string;
  sku: string;
  brand: {
    "@type": "Brand";
    name: string;
  };
  offers: {
    "@type": "Offer";
    url: string;
    priceCurrency: string;
    price: number;
    availability: string;
    seller: {
      "@type": "Organization";
      name: string;
    };
  };
}

interface BreadcrumbSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }>;
}

/**
 * Schema de Organização para a página inicial
 */
export function generateOrganizationSchema(): OrganizationSchema {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://tech4loop.com.br";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tech4Loop",
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    description:
      "Acessórios tech de qualidade para o seu dia a dia e suas viagens. Intercomunicadores, gadgets e mais.",
    sameAs: [
      // Adicionar redes sociais aqui
      // "https://www.facebook.com/tech4loop",
      // "https://www.instagram.com/tech4loop",
    ],
  };
}

/**
 * Schema de Produto para páginas de produto
 */
export function generateProductSchema(product: Product): ProductSchema {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://tech4loop.com.br";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image_urls,
    description: product.short_description || product.description || "",
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: product.partner_name || "Tech4Loop",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/produtos/${product.slug}`,
      priceCurrency: "BRL",
      price: product.price,
      availability:
        (product.stock || 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: product.partner_name || "Tech4Loop",
      },
    },
  };
}

/**
 * Schema de Breadcrumb
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url?: string }>
): BreadcrumbSchema {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://tech4loop.com.br";

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url ? `${baseUrl}${item.url}` : undefined,
    })),
  };
}

/**
 * Componente para inserir JSON-LD no head
 */
export function JsonLd({ data }: { data: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
