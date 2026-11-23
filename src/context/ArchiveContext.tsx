import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_PRODUCTS } from '../data/catalog';
import {
  CartItem,
  ChassisId,
  LightingMood,
  OrderRecord,
  Product,
  ProductSize,
  ToastItem,
} from '../types';

const BAG_STORAGE_KEY = 'porsche_archive_bag_v2';
const PRODUCTS_STORAGE_KEY = 'porsche_archive_products_v2';
const ORDERS_STORAGE_KEY = 'porsche_archive_orders_v2';
const PORTAL_SESSION_KEY = 'porsche_portal_entered_v2';

interface ArchiveContextValue {
  products: Product[];
  loadingProducts: boolean;
  apiMode: 'supabase' | 'local';
  bag: CartItem[];
  bagCount: number;
  bagSubtotal: number;
  orders: OrderRecord[];
  loadingOrders: boolean;
  garageOpen: boolean;
  garageChassis: ChassisId;
  lightingMood: LightingMood;
  bagOpen: boolean;
  inspectProduct: Product | null;
  portalEntered: boolean;
  toasts: ToastItem[];
  setLightingMood: (mood: LightingMood) => void;
  openGarage: (chassis?: ChassisId) => void;
  closeGarage: () => void;
  setGarageChassis: (chassis: ChassisId) => void;
  setBagOpen: (open: boolean) => void;
  setInspectProduct: (product: Product | null) => void;
  enterPortal: () => void;
  resetPortal: () => void;
  addToBag: (product: Product, size: ProductSize) => void;
  removeFromBag: (key: string) => void;
  updateBagQty: (key: string, delta: number) => void;
  clearBag: () => void;
  refreshProducts: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  createProduct: (input: { name: string; price: number; type: string; img: string; spec?: string }) => Promise<Product>;
  deleteProduct: (id: string | number) => Promise<void>;
  submitOrder: (payload: {
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    postal_code: string;
    shipping_method: string;
    payment_method: string;
    total_price: number;
    items: CartItem[];
  }) => Promise<OrderRecord>;
  pushToast: (title: string, detail?: string, tone?: ToastItem['tone']) => void;
  dismissToast: (id: string) => void;
}

const ArchiveContext = createContext<ArchiveContextValue | null>(null);

function safeReadJSON<T>(storage: Storage, key: string, fallback: T): T {
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const ArchiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = safeReadJSON<Product[]>(localStorage, PRODUCTS_STORAGE_KEY, []);
    return saved.length > 0 ? saved : DEFAULT_PRODUCTS;
  });
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [apiMode, setApiMode] = useState<'supabase' | 'local'>('local');

  const [bag, setBag] = useState<CartItem[]>(() =>
    safeReadJSON<CartItem[]>(localStorage, BAG_STORAGE_KEY, [])
  );
  const [orders, setOrders] = useState<OrderRecord[]>(() =>
    safeReadJSON<OrderRecord[]>(localStorage, ORDERS_STORAGE_KEY, [])
  );
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [garageOpen, setGarageOpen] = useState(false);
  const [garageChassis, setGarageChassis] = useState<ChassisId>('gt3');
  const [lightingMood, setLightingMood] = useState<LightingMood>('cyber');
  const [bagOpen, setBagOpen] = useState(false);
  const [inspectProduct, setInspectProduct] = useState<Product | null>(null);
  const [portalEntered, setPortalEntered] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(PORTAL_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(bag));
    } catch {
      // ignore storage quota errors
    }
  }, [bag]);

  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (title: string, detail?: string, tone: ToastItem['tone'] = 'cyber') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, detail, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3600);
    },
    []
  );

  const refreshProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products', { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const normalized: Product[] = data.map((item: Product, idx: number) => ({
            ...DEFAULT_PRODUCTS[idx % DEFAULT_PRODUCTS.length],
            ...item,
            code: item.code || `LOG_${String(idx + 1).padStart(2, '0')}`,
          }));
          setProducts(normalized);
          setApiMode('supabase');
          setLoadingProducts(false);
          return;
        }
      }
      setApiMode('local');
    } catch {
      setApiMode('local');
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders', { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data.map((o: OrderRecord) => ({ ...o, source: 'supabase' })));
          setApiMode('supabase');
          setLoadingOrders(false);
          return;
        }
      }
    } catch {
      // Keep local orders
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const enterPortal = useCallback(() => {
    setPortalEntered(true);
    try {
      sessionStorage.setItem(PORTAL_SESSION_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  const resetPortal = useCallback(() => {
    setPortalEntered(false);
    try {
      sessionStorage.removeItem(PORTAL_SESSION_KEY);
    } catch {
      // ignore
    }
  }, []);

  const openGarage = useCallback((chassis?: ChassisId) => {
    if (chassis) setGarageChassis(chassis);
    setGarageOpen(true);
  }, []);

  const closeGarage = useCallback(() => {
    setGarageOpen(false);
  }, []);

  const addToBag = useCallback(
    (product: Product, size: ProductSize) => {
      const key = `${product.id}-${size}`;
      setBag((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) {
          return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + 1 } : i));
        }
        return [
          ...prev,
          {
            key,
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            type: product.type,
            img: product.img,
            selectedSize: size,
            quantity: 1,
          },
        ];
      });
      pushToast('UNIT ALLOCATED', `${product.name} · SIZE ${size}`, 'cyber');
    },
    [pushToast]
  );

  const removeFromBag = useCallback((key: string) => {
    setBag((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const updateBagQty = useCallback((key: string, delta: number) => {
    setBag((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearBag = useCallback(() => {
    setBag([]);
  }, []);

  const createProduct = useCallback(
    async (input: { name: string; price: number; type: string; img: string; spec?: string }) => {
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        if (res.ok) {
          const created = (await res.json()) as Product;
          setProducts((prev) => [...prev, created]);
          setApiMode('supabase');
          pushToast('HARDWARE DEPLOYED', `${created.name} synced to Supabase`, 'success');
          return created;
        }
      } catch {
        // Fallback to local
      }

      const localItem: Product = {
        id: `LOCAL-${Date.now()}`,
        code: `LOG_${String(products.length + 1).padStart(2, '0')}`,
        name: input.name,
        price: Number(input.price),
        type: input.type,
        img: input.img,
        spec: input.spec || 'Stuttgart Custom Archive Spec',
        description: 'Deployed via Admin Terminal in local persistence mode.',
        stock: 10,
      };
      setProducts((prev) => [...prev, localItem]);
      pushToast('HARDWARE DEPLOYED (LOCAL)', `${localItem.name} stored in local archive`, 'cyber');
      return localItem;
    },
    [products.length, pushToast]
  );

  const deleteProduct = useCallback(
    async (id: string | number) => {
      try {
        const res = await fetch(`/api/products?id=${encodeURIComponent(String(id))}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
          pushToast('UNIT PURGED', `ID ${id} removed from Supabase`, 'danger');
          return;
        }
      } catch {
        // Fallback local removal
      }
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
      pushToast('UNIT PURGED (LOCAL)', `ID ${id} removed from archive`, 'danger');
    },
    [pushToast]
  );

  const submitOrder = useCallback(
    async (payload: {
      first_name: string;
      last_name: string;
      address: string;
      city: string;
      postal_code: string;
      shipping_method: string;
      payment_method: string;
      total_price: number;
      items: CartItem[];
    }) => {
      const apiBody = {
        ...payload,
        items: payload.items.flatMap((it) =>
          Array.from({ length: it.quantity }, () => ({
            name: it.name,
            price: it.price,
            selectedSize: it.selectedSize,
          }))
        ),
      };

      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiBody),
        });
        if (res.ok) {
          const data = await res.json();
          const record: OrderRecord = {
            id: data.orderId || `911-${Date.now().toString().slice(-5)}`,
            created_at: new Date().toISOString(),
            first_name: payload.first_name,
            last_name: payload.last_name,
            address: payload.address,
            city: payload.city,
            postal_code: payload.postal_code,
            shipping_method: payload.shipping_method,
            payment_method: payload.payment_method,
            total_price: payload.total_price,
            order_items: payload.items.map((it) => ({
              name: it.name,
              price: it.price,
              size: it.selectedSize,
              quantity: it.quantity,
            })),
            source: 'supabase',
          };
          setOrders((prev) => [record, ...prev]);
          clearBag();
          pushToast('DISPATCH AUTHORIZED', `Order #${record.id} logged to Supabase`, 'success');
          return record;
        }
      } catch {
        // Fallback local order
      }

      const localRecord: OrderRecord = {
        id: `STG-${Math.floor(10000 + Math.random() * 90000)}`,
        created_at: new Date().toISOString(),
        first_name: payload.first_name,
        last_name: payload.last_name,
        address: payload.address,
        city: payload.city,
        postal_code: payload.postal_code,
        shipping_method: payload.shipping_method,
        payment_method: payload.payment_method,
        total_price: payload.total_price,
        order_items: payload.items.map((it) => ({
          name: it.name,
          price: it.price,
          size: it.selectedSize,
          quantity: it.quantity,
        })),
        source: 'local',
      };
      setOrders((prev) => [localRecord, ...prev]);
      clearBag();
      pushToast('DISPATCH AUTHORIZED', `Order #${localRecord.id} logged to local vault`, 'success');
      return localRecord;
    },
    [clearBag, pushToast]
  );

  const bagCount = useMemo(() => bag.reduce((sum, i) => sum + i.quantity, 0), [bag]);
  const bagSubtotal = useMemo(() => bag.reduce((sum, i) => sum + i.price * i.quantity, 0), [bag]);

  const value: ArchiveContextValue = {
    products,
    loadingProducts,
    apiMode,
    bag,
    bagCount,
    bagSubtotal,
    orders,
    loadingOrders,
    garageOpen,
    garageChassis,
    lightingMood,
    bagOpen,
    inspectProduct,
    portalEntered,
    toasts,
    setLightingMood,
    openGarage,
    closeGarage,
    setGarageChassis,
    setBagOpen,
    setInspectProduct,
    enterPortal,
    resetPortal,
    addToBag,
    removeFromBag,
    updateBagQty,
    clearBag,
    refreshProducts,
    refreshOrders,
    createProduct,
    deleteProduct,
    submitOrder,
    pushToast,
    dismissToast,
  };

  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
};

export function useArchive(): ArchiveContextValue {
  const ctx = useContext(ArchiveContext);
  if (!ctx) {
    throw new Error('useArchive must be used inside ArchiveProvider');
  }
  return ctx;
}
