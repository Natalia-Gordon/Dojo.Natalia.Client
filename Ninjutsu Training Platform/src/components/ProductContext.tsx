import { createContext, useContext, useState, ReactNode } from 'react';

export type ProductType = 'painting' | 'weapon' | 'tool' | 'equipment';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  type: ProductType;
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  image: string;
  inStock: boolean;
  isDigital: boolean;
  category?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  billingInfo: {
    name: string;
    email: string;
    address?: string;
    city?: string;
    zipCode?: string;
    country?: string;
  };
}

interface ProductContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getTeacherProducts: (teacherId: string) => Product[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  createOrder: (userId: string, userName: string, billingInfo: Order['billingInfo']) => void;
  getUserOrders: (userId: string) => Order[];
  getTeacherSales: (teacherId: string) => Order[];
  getUserPurchasedProducts: (userId: string) => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Sample products
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Shadow in Moonlight',
    description: 'Digital art depicting a ninja silhouette against a full moon. High-resolution digital download.',
    price: 49.99,
    type: 'painting',
    teacherId: '3',
    teacherName: 'MasterTakeshi',
    teacherAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop',
    inStock: true,
    isDigital: true,
    category: 'Digital Art'
  },
  {
    id: '2',
    name: 'The Ancient Path',
    description: 'Abstract painting of a warrior\'s journey through traditional Japanese landscapes.',
    price: 79.99,
    type: 'painting',
    teacherId: '4',
    teacherName: 'SenseiHana',
    teacherAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=600&fit=crop',
    inStock: true,
    isDigital: true,
    category: 'Digital Art'
  },
  {
    id: '3',
    name: 'Training Katana',
    description: 'High-quality wooden training katana, perfect for practice. Made from solid oak.',
    price: 89.99,
    type: 'weapon',
    teacherId: '3',
    teacherName: 'MasterTakeshi',
    teacherAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1541087061-1da8e1a862a4?w=800&h=600&fit=crop',
    inStock: true,
    isDigital: false,
    category: 'Weapons'
  },
  {
    id: '4',
    name: 'Shuriken Set (6 pieces)',
    description: 'Professional training shuriken set. Blunt edges for safe practice.',
    price: 34.99,
    type: 'weapon',
    teacherId: '3',
    teacherName: 'MasterTakeshi',
    teacherAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=800&h=600&fit=crop',
    inStock: true,
    isDigital: false,
    category: 'Weapons'
  },
  {
    id: '5',
    name: 'Bamboo Training Sticks (Pair)',
    description: 'Durable bamboo sticks for staff training and weapon handling practice.',
    price: 24.99,
    type: 'tool',
    teacherId: '4',
    teacherName: 'SenseiHana',
    teacherAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&h=600&fit=crop',
    inStock: true,
    isDigital: false,
    category: 'Training Tools'
  },
  {
    id: '6',
    name: 'Meditation Garden',
    description: 'Serene digital painting of a traditional Japanese zen garden at sunrise.',
    price: 59.99,
    type: 'painting',
    teacherId: '4',
    teacherName: 'SenseiHana',
    teacherAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=800&h=600&fit=crop',
    inStock: true,
    isDigital: true,
    category: 'Digital Art'
  }
];

// Sample orders
const initialOrders: Order[] = [
  {
    id: '1',
    userId: '1',
    userName: 'ShadowMaster',
    items: [
      {
        product: initialProducts[0],
        quantity: 1
      }
    ],
    total: 49.99,
    status: 'completed',
    createdAt: '2026-01-05T10:00:00Z',
    billingInfo: {
      name: 'ShadowMaster',
      email: 'shadow@ninjutsu.com',
      address: '123 Ninja Street',
      city: 'Tokyo',
      zipCode: '100-0001',
      country: 'Japan'
    }
  }
];

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString()
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getTeacherProducts = (teacherId: string) => {
    return products.filter(p => p.teacherId === teacherId);
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prev => prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const createOrder = (userId: string, userName: string, billingInfo: Order['billingInfo']) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      userId,
      userName,
      items: [...cart],
      total: getCartTotal(),
      status: 'completed',
      createdAt: new Date().toISOString(),
      billingInfo
    };
    setOrders(prev => [...prev, newOrder]);
    clearCart();
  };

  const getUserOrders = (userId: string) => {
    return orders.filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getTeacherSales = (teacherId: string) => {
    return orders.filter(order =>
      order.items.some(item => item.product.teacherId === teacherId)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getUserPurchasedProducts = (userId: string) => {
    const userOrders = getUserOrders(userId);
    const purchasedProducts: Product[] = [];
    userOrders.forEach(order => {
      order.items.forEach(item => {
        if (!purchasedProducts.find(p => p.id === item.product.id)) {
          purchasedProducts.push(item.product);
        }
      });
    });
    return purchasedProducts;
  };

  return (
    <ProductContext.Provider value={{
      products,
      cart,
      orders,
      addProduct,
      updateProduct,
      deleteProduct,
      getTeacherProducts,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      getCartTotal,
      createOrder,
      getUserOrders,
      getTeacherSales,
      getUserPurchasedProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
