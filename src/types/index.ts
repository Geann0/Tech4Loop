export interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  old_price?: number;
  category: string;
  image_url: string;
  short_description: string;
  technical_specs?: { [key: string]: string };
  box_contents?: string[];
  partner_name?: string;
}
