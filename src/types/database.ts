export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface Material {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category_id: number;
  material_id: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  size: string;
  color: string;
  stock: number;
}

export interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export interface CartItem {
  id: number;
  user_id: string;
  variant_id: number;
  quantity: number;
  created_at: string;
}

export type OrderStatus = "pending" | "paid" | "shipping" | "delivered" | "cancelled";

export interface Order {
  id: number;
  user_id: string;
  total_price: number;
  status: OrderStatus;
  shipping_address: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  variant_id: number;
  quantity: number;
  price: number;
}
