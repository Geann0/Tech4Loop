import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: products } = await supabase.from("products").select("slug");

  const productUrls =
    products?.map((product) => ({
      url: `${baseUrl}/produtos/${product.slug}`,
      lastModified: new Date(),
    })) || [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/produtos`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/parcerias`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/contato`,
      lastModified: new Date(),
    },
    ...productUrls,
  ];
}
