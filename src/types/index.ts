// Tipos principais do sistema Tech4Loop
export interface Product {
  id: string;
  partner_id: string | null;
  partner_name: string | null;
  name: string;
  slug: string;
  price: number;
  old_price?: number | null;
  compare_at_price?: number | null;
  brand?: string | null;
  condition?: "new" | "used" | "refurbished" | null;
  availability?: "in_stock" | "low_stock" | "pre_order" | "out_of_stock" | null;
  category_id?: string | null;
  short_description?: string | null;
  description?: string | null;
  image_urls: string[];
  images?: string[];
  technical_specs?: Record<string, string> | null;
  box_contents?: string[] | null;
  stock?: number;
  stock_quantity?: number;
  status?: "active" | "inactive";
  is_featured?: boolean;
  created_at: string;
  updated_at?: string;
  profiles?: {
    whatsapp_number?: string | null;
    service_regions?: string[] | null;
  } | null;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  partner_id: string | null;
  product_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_cep: string;
  customer_address: string;
  customer_city: string;
  customer_state: string;
  total_amount: number;
  payment_id?: string | null;
  payment_status?: "pending" | "approved" | "rejected" | "cancelled";
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  updated_at?: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  created_at: string;
  products?: Product | null;
}

export interface Profile {
  id: string;
  email: string;
  role: "admin" | "partner" | "customer";
  partner_name?: string | null;
  whatsapp_number?: string | null;
  service_regions?: string[] | null;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image: string;
  product_price: number;
  quantity: number;
  partner_id: string | null;
  partner_name: string | null;
  selected?: boolean; // Nova propriedade para seleção
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  user_name: string;
  rating: number;
  comment?: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discount_type: "percentage" | "fixed" | "free_shipping";
  discount_value: number;
  min_purchase_amount?: number | null;
  max_discount_amount?: number | null;
  valid_from: string;
  valid_until: string;
  usage_limit?: number | null;
  usage_count: number;
  is_active: boolean;
  created_at: string;
}

// Tipos para Forms e Validação
export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  cep: string;
  address: string;
  city: string;
  state: string;
  coupon_code?: string;
}

export interface ProductFormData {
  name: string;
  price: number;
  old_price?: number;
  category_id: string;
  short_description: string;
  description: string;
  stock: number;
  technical_specs?: Record<string, string>;
  box_contents?: string[];
}

// Tipos para API Responses
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
