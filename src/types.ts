export interface Product {
  id: string;
  partner_id: string;
  partner_name: string;
  name: string;
  slug: string;
  price: number;
  old_price?: number;
  category_id?: string;
  short_description?: string;
  description?: string;
  image_urls: string[];
  technical_specs?: any;
  box_contents?: any;
  stock?: number;
  status?: "active" | "inactive";
  is_featured?: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Order {
  id: string;
  partner_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_cep: string;
  customer_address: string;
  customer_city: string;
  customer_state: string;
  total_amount: number;
  payment_id?: string;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  products: Product | null; // Adicionado para refletir a consulta
}

export interface Profile {
  id: string;
  email: string;
  role: "admin" | "partner";
  partner_name: string;
  whatsapp_number?: string;
  service_regions?: string[];
  is_banned: boolean;
  updated_at: string;
}
