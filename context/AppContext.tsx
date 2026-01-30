import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { User, Product, Order, Ticket, Language, UserRole, ServiceRequest, OrderStatus, TicketStatus, Review, ServiceOffering, UserPreferences, ResourceItem } from '../types';
import { TELEGRAM_BOT_USERNAME, TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID, MOCK_PRODUCTS, MOCK_SERVICE_OFFERINGS, MOCK_REVIEWS, MOCK_USER, MOCK_ADMIN, MOCK_ALL_USERS, MOCK_ORDERS, MOCK_TICKETS, MOCK_SERVICE_REQUESTS } from '../services/mockData';
import { secureStorage } from '../services/secureStorage';
import { api } from '../services/api'; 

interface AppContextType {
  user: User | null;
  allUsers: User[];
  products: Product[];
  bonusItems: Product[]; 
  serviceOfferings: ServiceOffering[];
  resources: ResourceItem[];
  cart: Product[];
  orders: Order[];
  tickets: Ticket[];
  reviews: Review[];
  serviceRequests: ServiceRequest[];
  language: Language;
  telegramSettings: { 
      botToken: string; 
      adminChatId: string; 
      botUsername: string;
      emailServiceId: string;
      emailTemplateId: string;
      emailPublicKey: string;
  };
  trendingConfig: { mode: 'AUTOMATIC' | 'MANUAL', manualProductIds: string[] };
  trendingProducts: Product[];
  bonusProductId: string | null;
  welcomeGift: Product | null;
  unreadCount: number;
  successNotification: Order | null; 
  isDemoMode: boolean;
  login: (email: string, role?: UserRole, name?: string, telegramData?: Partial<User>, avatarUrl?: string, isRegister?: boolean) => Promise<void>;
  logout: () => void;
  updateUserProfile: (name: string, avatarUrl: string) => void;
  toggleUserPreference: (key: keyof UserPreferences) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  createOrder: () => Promise<Order | null>;
  confirmPayment: (orderId: string, method: string) => Promise<void>;
  toggleLanguage: () => void;
  createTicket: (subject: string, message: string) => void;
  replyToTicket: (ticketId: string, message: string) => void;
  markTicketAsRead: (ticketId: string) => void;
  deleteTicket: (ticketId: string) => void;
  closeTicket: (ticketId: string, byAdmin?: boolean) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addBonusItem: (item: Product) => void;
  updateBonusItem: (item: Product) => void;
  deleteBonusItem: (id: string) => void;
  addServiceOffering: (service: ServiceOffering) => void;
  updateServiceOffering: (service: ServiceOffering) => void;
  deleteServiceOffering: (id: string) => void;
  addResource: (resource: ResourceItem) => void;
  updateResource: (resource: ResourceItem) => void;
  deleteResource: (id: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => void;
  adminReply: (ticketId: string, reply: string) => void;
  deleteUser: (userId: string) => void;
  adminUpdateUser: (userId: string, updates: Partial<User>) => void;
  updateTelegramSettings: (token: string, chatId: string, username: string, emailServiceId: string, emailTemplateId: string, emailPublicKey: string) => void;
  updateTrendingConfig: (mode: 'AUTOMATIC' | 'MANUAL', ids: string[]) => void;
  updateBonusProduct: (productId: string | null) => void;
  closeWelcomeGift: () => void;
  adminInitiateChat: (userId: string, orderId: string) => void;
  closeSuccessNotification: () => void;
  addReview: (review: Review) => void;
  deleteReview: (id: string) => void;
  submitServiceRequest: (type: string, contact: string, details: string) => Promise<void>;
  updateServiceRequestStatus: (id: string, status: 'NEW' | 'IN_WORK' | 'COMPLETED') => void;
  deleteServiceRequest: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('app_language') as Language) || 'RU');
  const [user, setUser] = useState<User | null>(() => secureStorage.getItem('app_current_user', null));
  const [isDemoMode, setIsDemoMode] = useState(false); // Always false now
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bonusItems, setBonusItems] = useState<Product[]>([]);
  const [serviceOfferings, setServiceOfferings] = useState<ServiceOffering[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  
  const [cart, setCart] = useState<Product[]>(() => secureStorage.getItem('app_cart', []));
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [successNotification, setSuccessNotification] = useState<Order | null>(null);
  const [bonusProductId, setBonusProductId] = useState<string | null>(() => localStorage.getItem('bonus_product_id'));
  const [welcomeGift, setWelcomeGift] = useState<Product | null>(null);

  const [telegramSettings, setTelegramSettings] = useState(() => {
      const defaultSettings = { 
          botToken: TELEGRAM_BOT_TOKEN || '', 
          adminChatId: TELEGRAM_ADMIN_CHAT_ID || '', 
          botUsername: TELEGRAM_BOT_USERNAME || '', 
          emailServiceId: '', 
          emailTemplateId: '', 
          emailPublicKey: '' 
      };
      return secureStorage.getItem('telegram_settings', defaultSettings);
  });

  const [trendingConfig, setTrendingConfig] = useState<{ mode: 'AUTOMATIC' | 'MANUAL', manualProductIds: string[] }>(() => secureStorage.getItem('trending_config', { mode: 'AUTOMATIC', manualProductIds: [] }));

  // --- SERVER SYNC ONLY ---
  useEffect(() => {
    const fetchServerData = async () => {
        try {
            // Check health first to ensure connection, but don't switch to demo if fails
            await api.checkHealth();

            // --- REAL MODE DATA LOADING ---
            const serverProducts = await api.getProducts();
            setProducts(serverProducts);

            const serverServices = await api.getServices();
            setServiceOfferings(serverServices);

            const serverResources = await api.getResources().catch(() => []);
            setResources(serverResources);

            const serverReviews = await api.getReviews().catch(() => []);
            setReviews(serverReviews);

            if (user) {
                const serverOrders = user.role === UserRole.ADMIN ? await api.getAllOrders() : await api.getUserOrders(user.id);
                setOrders(serverOrders || []);

                const serverTickets = await api.getTickets();
                const relevantTickets = user.role === UserRole.ADMIN ? serverTickets : serverTickets.filter(t => t.userId === user.id);
                setTickets(relevantTickets || []);
            }

            if (user?.role === UserRole.ADMIN) {
                const serverUsers = await api.getAllUsers();
                setAllUsers(serverUsers || []);
                
                const serverRequests = await api.getServiceRequests();
                setServiceRequests(serverRequests || []);
            }

        } catch (error) {
            console.error('⚠️ Critical: Server unavailable or DB disconnected.', error);
            // No fallback to mock data. App will show empty states or errors handled by UI components.
        }
    };
    fetchServerData();
  }, [user]);

  useEffect(() => { secureStorage.setItem('app_current_user', user); }, [user]);
  useEffect(() => { secureStorage.setItem('app_cart', cart); }, [cart]);
  
  const trendingProducts = useMemo(() => {
    if (trendingConfig.mode === 'MANUAL') {
        if (trendingConfig.manualProductIds.length === 0) return products.slice(0, 3);
        return products.filter(p => trendingConfig.manualProductIds.includes(p.id));
    } else {
        const salesMap: Record<string, number> = {};
        orders.forEach(order => {
            if (order.status === OrderStatus.COMPLETED) {
                order.items.forEach(item => {
                    salesMap[item.id] = (salesMap[item.id] || 0) + 1;
                });
            }
        });
        return [...products].sort((a, b) => (salesMap[b.id] || 0) - (salesMap[a.id] || 0)).slice(0, 3); 
    }
  }, [products, orders, trendingConfig]);

  const toggleLanguage = () => {
    setLanguage(prev => {
        const newLang = prev === 'RU' ? 'EN' : 'RU';
        localStorage.setItem('app_language', newLang); 
        return newLang;
    });
  };

  const login = async (email: string, role: UserRole = UserRole.USER, name?: string, telegramData?: Partial<User>, avatarUrl?: string, isRegister: boolean = false) => {
    // --- REAL LOGIN ONLY ---
    try {
        const serverUser: any = await api.login({
            email,
            name,
            telegramId: telegramData?.telegramId,
            avatarUrl: avatarUrl || telegramData?.avatarUrl,
            registrationSource: telegramData ? 'TELEGRAM' : 'EMAIL',
            isRegister
        });

        if (serverUser) {
            setUser({ ...serverUser }); 
            setAllUsers(prev => {
                const exists = prev.find(u => u.id === serverUser.id);
                return exists ? prev.map(u => u.id === serverUser.id ? serverUser : u) : [...prev, serverUser];
            });
        }
    } catch (e: any) {
        console.error('Login Error:', e);
        // Ensure error bubbles up to UI for display (e.g. "DB FAILED")
        throw e;
    }
  };

  const logout = () => {
      setUser(null);
      setOrders([]);
      setTickets([]);
      secureStorage.removeItem('app_current_user');
  };

  const updateUserProfile = (name: string, avatarUrl: string) => {
    if (user) {
      const updatedUser = { ...user, name, avatarUrl };
      setUser(updatedUser);
      // API Call logic would be here for real implementation
    }
  };

  const toggleUserPreference = (key: keyof UserPreferences) => {
      if (!user || !user.preferences) return;
      setUser({ ...user, preferences: { ...user.preferences, [key]: !user.preferences[key] } });
  };

  const updateBonusProduct = (productId: string | null) => {
      setBonusProductId(productId);
      if (productId) localStorage.setItem('bonus_product_id', productId);
      else localStorage.removeItem('bonus_product_id');
  };

  const closeWelcomeGift = () => { setWelcomeGift(null); };

  const addToCart = (product: Product) => {
    setCart(prev => {
        if (!prev.find(p => p.id === product.id)) return [...prev, product];
        return prev;
    });
  };

  const removeFromCart = (productId: string) => { setCart(prev => prev.filter(p => p.id !== productId)); };
  const clearCart = () => setCart([]);

  const updateTelegramSettings = (token: string, chatId: string, username: string, emailServiceId: string, emailTemplateId: string, emailPublicKey: string) => {
    const newSettings = { botToken: token, adminChatId: chatId, botUsername: username, emailServiceId, emailTemplateId, emailPublicKey };
    setTelegramSettings(newSettings);
    secureStorage.setItem('telegram_settings', newSettings);
  };

  const updateTrendingConfig = (mode: 'AUTOMATIC' | 'MANUAL', ids: string[]) => {
      const newConfig = { mode, manualProductIds: ids };
      setTrendingConfig(newConfig);
      secureStorage.setItem('trending_config', newConfig);
  };

  const createOrder = async () => {
    if (!user) return null;
    const orderData = { userId: user.id, items: [...cart], total: cart.reduce((sum, p) => sum + p.price, 0), paymentMethod: 'PENDING' };
    
    try {
        const res = await api.createOrder(orderData);
        if (res && res.orderId) {
             const newOrder: Order = { id: res.orderId, userId: user.id, items: [...cart], total: orderData.total, status: OrderStatus.PENDING, date: new Date().toISOString().split('T')[0] };
             setOrders(prev => [newOrder, ...prev]);
             return newOrder;
        }
    } catch (e) {
        console.error("Order creation failed", e);
        return null;
    }
    return null;
  };

  const confirmPayment = async (orderId: string, method: string) => {
      setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status: OrderStatus.PROCESSING, paymentMethod: method as any } : o));
      const currentOrder = orders.find(o => o.id === orderId) || { id: orderId, userId: user?.id, items: cart, total: 0 } as any;
      setSuccessNotification({ ...currentOrder, status: OrderStatus.PROCESSING });
      clearCart();
      await api.updateOrderStatus(orderId, OrderStatus.PROCESSING);
  }

  const closeSuccessNotification = () => setSuccessNotification(null);

  const createTicket = async (subject: string, message: string) => {
    if(!user) return;
    const tempId = `tkt-${Date.now()}`;
    const newTicket: Ticket = { id: tempId, userId: user.id, subject, messages: [{ sender: 'USER', text: message, timestamp: new Date().toLocaleTimeString(), read: false }], status: TicketStatus.OPEN, date: new Date().toISOString().split('T')[0] }
    setTickets(prev => [newTicket, ...prev]);
    api.createTicket({ userId: user.id, subject, message }).catch(() => {});
  }

  const replyToTicket = async (ticketId: string, message: string) => {
    if (!user) return;
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: TicketStatus.OPEN, messages: [...t.messages, { sender: 'USER', text: message, timestamp: new Date().toLocaleTimeString(), read: false }] } : t));
    api.replyTicket(ticketId, 'USER', message).catch(() => {});
  }

  const markTicketAsRead = (ticketId: string) => {
    if (!user) return;
    const targetSender = user.role === UserRole.ADMIN ? 'USER' : 'ADMIN';
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, messages: t.messages.map(m => m.sender === targetSender ? { ...m, read: true } : m) } : t));
  }

  const deleteTicket = (ticketId: string) => { setTickets(prev => prev.filter(t => t.id !== ticketId)); }
  
  const closeTicket = async (ticketId: string, byAdmin: boolean = false) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: TicketStatus.RESOLVED, messages: [...t.messages, { sender: byAdmin ? 'ADMIN' : 'USER', text: 'Chat Closed.', timestamp: new Date().toLocaleTimeString(), read: true }] } : t));
    api.updateTicketStatus(ticketId, TicketStatus.RESOLVED).catch(() => {});
  }

  const addProduct = (product: Product) => { 
      setProducts(prev => [...prev, product]); 
      api.addProduct(product).catch(() => {});
  }
  
  const updateProduct = (product: Product) => { 
      setProducts(prev => prev.map(p => p.id === product.id ? product : p)); 
      api.updateProduct(product).catch(() => {});
  }
  
  const deleteProduct = (id: string) => { 
      setProducts(prev => prev.filter(p => p.id !== id)); 
      api.deleteProduct(id).catch(() => {});
  }

  const addServiceOffering = (service: ServiceOffering) => { setServiceOfferings(prev => [...prev, service]); }
  const updateServiceOffering = (service: ServiceOffering) => { setServiceOfferings(prev => prev.map(s => s.id === service.id ? service : s)); }
  const deleteServiceOffering = (id: string) => { setServiceOfferings(prev => prev.filter(s => s.id !== id)); }

  const addResource = (resource: ResourceItem) => { 
      setResources(prev => [...prev, resource]); 
      api.addResource(resource).catch(() => {});
  }
  const updateResource = (resource: ResourceItem) => { 
      setResources(prev => prev.map(r => r.id === resource.id ? resource : r)); 
      api.updateResource(resource).catch(() => {});
  }
  const deleteResource = (id: string) => { 
      setResources(prev => prev.filter(r => r.id !== id)); 
      api.deleteResource(id).catch(() => {});
  }

  const submitServiceRequest = async (type: string, contact: string, details: string) => {
      if (!user) throw new Error("User not authenticated");
      const newRequest: ServiceRequest = { id: `srv-${Date.now()}`, userId: user.id, contact, serviceType: type, comment: details, status: 'NEW', date: new Date().toISOString().split('T')[0], reviewed: false };
      setServiceRequests(prev => [newRequest, ...prev]);
      await api.submitServiceRequest({ userId: user.id, serviceType: type, contact, details });
  };

  const updateServiceRequestStatus = (id: string, status: 'NEW' | 'IN_WORK' | 'COMPLETED') => { 
      setServiceRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req)); 
      api.updateServiceRequestStatus(id, status).catch(() => {});
  };
  const deleteServiceRequest = (id: string) => { setServiceRequests(prev => prev.filter(req => req.id !== id)); };

  const addBonusItem = (item: Product) => { setBonusItems(prev => [...prev, item]); }
  const updateBonusItem = (item: Product) => { setBonusItems(prev => prev.map(b => b.id === item.id ? item : b)); }
  const deleteBonusItem = (id: string) => { setBonusItems(prev => prev.filter(b => b.id !== id)); }

  const updateOrderStatus = (orderId: string, status: OrderStatus, reason?: string) => {
    setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status, rejectionReason: reason } : o));
    api.updateOrderStatus(orderId, status, reason).catch(() => {});
  };

  const adminReply = (ticketId: string, reply: string) => { 
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, messages: [...t.messages, { sender: 'ADMIN', text: reply, timestamp: new Date().toLocaleTimeString(), read: false }] } : t)); 
      api.replyTicket(ticketId, 'ADMIN', reply).catch(() => {});
  };
  
  const deleteUser = (userId: string) => { 
      setAllUsers(prev => prev.filter(u => u.id !== userId)); 
      if (user && user.id === userId) logout(); 
      // REAL API CALL ADDED
      api.deleteUser(userId).catch(err => console.error('Failed to delete user:', err));
  };
  
  const adminUpdateUser = (userId: string, updates: Partial<User>) => { 
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u)); 
      if (user && user.id === userId) setUser({ ...user, ...updates });
      api.updateUser(userId, updates).catch(console.error);
  };

  const addReview = (review: Review) => { setReviews(prev => [review, ...prev]); api.addReview(review).catch(() => {}); }
  const deleteReview = (id: string) => { setReviews(prev => prev.filter(r => r.id !== id)); api.deleteReview(id).catch(() => {}); }
  const adminInitiateChat = (userId: string, orderId: string) => { }

  return (
    <AppContext.Provider value={{
      user, allUsers, products, bonusItems, serviceOfferings, resources, cart, orders, tickets, serviceRequests, language, telegramSettings, unreadCount, successNotification, reviews: reviews || [], 
      trendingConfig, trendingProducts, bonusProductId, welcomeGift, isDemoMode,
      login, logout, updateUserProfile, toggleUserPreference, addToCart, removeFromCart, clearCart, createOrder, confirmPayment,
      toggleLanguage, createTicket, replyToTicket, markTicketAsRead, deleteTicket, closeTicket, addProduct, updateProduct, deleteProduct,
      addBonusItem, updateBonusItem, deleteBonusItem, addServiceOffering, updateServiceOffering, deleteServiceOffering,
      updateOrderStatus, adminReply, deleteUser, updateTelegramSettings, adminInitiateChat, closeSuccessNotification, addReview, deleteReview,
      adminUpdateUser, updateTrendingConfig, updateBonusProduct, closeWelcomeGift, submitServiceRequest,
      updateServiceRequestStatus, deleteServiceRequest,
      addResource, updateResource, deleteResource
    }}>
      {children}
    </AppContext.Provider>
  );
};