export type ChassisId = 'gt3' | 'st' | 'spyder';

export type CameraPreset = 'hero' | 'profile' | 'rear' | 'top';

export type LightingMood = 'cyber' | 'stuttgart' | 'acid';

export type ProductCategory = 'Hardware' | 'Armor' | 'Shell' | 'Utility' | 'Base';

export type ProductSize = 'S' | 'M' | 'L' | 'XL';

export interface Product {
  id: string | number;
  code?: string;
  name: string;
  price: number;
  type: ProductCategory | string;
  img: string;
  spec?: string;
  description?: string;
  stock?: number;
}

export interface CartItem {
  key: string;
  productId: string | number;
  name: string;
  price: number;
  type: string;
  img: string;
  selectedSize: ProductSize;
  quantity: number;
}

export interface OrderItem {
  id?: string | number;
  name: string;
  price: number;
  size: string;
  quantity?: number;
}

export interface OrderRecord {
  id: string | number;
  created_at: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  postal_code: string;
  shipping_method: string;
  payment_method: string;
  total_price: number;
  order_items?: OrderItem[];
  source?: 'supabase' | 'local';
}

export interface ChassisSpec {
  id: ChassisId;
  code: string;
  name: string;
  subtitle: string;
  year: string;
  modelUrl: string;
  fallbackUrl: string;
  accentHex: string;
  serial: string;
  power: string;
  redline: string;
  engine: string;
  zeroToHundred: string;
  topSpeed: string;
  weight: string;
  nurburgring: string;
  scaleMultiplier: number;
  yOffset: number;
  notes: string;
}

export interface ToastItem {
  id: string;
  title: string;
  detail?: string;
  tone?: 'cyber' | 'success' | 'danger';
}
