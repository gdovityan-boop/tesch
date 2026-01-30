
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { User, Product, Order, Ticket, Language, UserRole, ServiceRequest, OrderStatus, TicketStatus, Review, ServiceOffering, UserPreferences, ResourceItem, ResourceCategory } from '../types';
import { MOCK_PRODUCTS, MOCK_USER, MOCK_ADMIN, MOCK_ORDERS, MOCK_TICKETS, MOCK_ALL_USERS, MOCK_SERVICE_REQUESTS, ADMIN_TELEGRAM_IDS, TELEGRAM_BOT_USERNAME, TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID, MOCK_REVIEWS, MOCK_BONUS_ITEMS, MOCK_SERVICE_OFFERINGS } from '../services/mockData';
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
      emailServiceId?: string;
      emailTemplateId?: string;
      emailPublicKey?: string;
  };
  trendingConfig: { mode: 'AUTOMATIC' | 'MANUAL', manualProductIds: string[] };
  trendingProducts: Product[];
  bonusProductId: string | null;
  welcomeGift: Product | null;
  unreadCount: number;
  successNotification: Order | null; 
  login: (email: string, role?: UserRole, name?: string, telegramData?: Partial<User>, avatarUrl?: string) => void;
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
  updateTelegramSettings: (token: string, chatId: string, username: string, emailServiceId?: string, emailTemplateId?: string, emailPublicKey?: string) => void;
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
  // --- STATES ---
  
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('app_language') as Language) || 'RU');
  const [user, setUser] = useState<User | null>(() => secureStorage.getItem('app_current_user', null));
  const [allUsers, setAllUsers] = useState<User[]>(() => secureStorage.getItem('app_users', MOCK_ALL_USERS));
  
  const [products, setProducts] = useState<Product[]>([]);
  const [bonusItems, setBonusItems] = useState<Product[]>(() => secureStorage.getItem('app_bonus_items', MOCK_BONUS_ITEMS));
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
      const defaultSettings = { botToken: TELEGRAM_BOT_TOKEN || '', adminChatId: TELEGRAM_ADMIN_CHAT_ID || '', botUsername: TELEGRAM_BOT_USERNAME || '', emailServiceId: '', emailTemplateId: '', emailPublicKey: '' };
      return secureStorage.getItem('telegram_settings', defaultSettings);
  });

  const [trendingConfig, setTrendingConfig] = useState<{ mode: 'AUTOMATIC' | 'MANUAL', manualProductIds: string[] }>(() => secureStorage.getItem('trending_config', { mode: 'AUTOMATIC', manualProductIds: [] }));

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchServerData = async () => {
        try {
            console.log('Connecting to server...');
            
            // 1. Fetch Products
            const serverProducts = await api.getProducts();
            if (serverProducts) setProducts(serverProducts);

            // 2. Fetch Services
            const serverServices = await api.getServices();
            if (serverServices) setServiceOfferings(serverServices);

            // 3. Fetch Resources
            const serverResources = await api.getResources();
            if (serverResources) setResources(serverResources);

            // 4. Fetch Reviews
            const serverReviews = await api.getReviews();
            if (serverReviews) setReviews(serverReviews);

            // 5. Fetch Global Orders & Tickets (For Dashboard)
            // For a simple platform, we load all data to client state. 
            // In a huge app, we would paginate or only load admin data when in admin panel.
            try {
                const serverOrders = await api.getAllOrders();
                if (serverOrders) setOrders(serverOrders);

                const serverTickets = await api.getTickets();
                if (serverTickets) setTickets(serverTickets);

                const serverRequests = await api.getServiceRequests();
                if (serverRequests) setServiceRequests(serverRequests);
                
                const serverUsers = await api.getAllUsers();
                if (serverUsers) setAllUsers(serverUsers);

            } catch (e) {
                console.log('Could not fetch protected data (orders/tickets) yet.');
            }

        } catch (error) {
            console.log('Server offline or not configured, using local storage/mock data.');
            setProducts(secureStorage.getItem('app_products', MOCK_PRODUCTS));
            setServiceOfferings(secureStorage.getItem('app_services', MOCK_SERVICE_OFFERINGS));
            setResources(secureStorage.getItem('app_resources', [])); 
            setOrders(MOCK_ORDERS);
            setTickets(MOCK_TICKETS);
            setReviews(MOCK_REVIEWS);
            setServiceRequests(MOCK_SERVICE_REQUESTS);
        }
    };
    fetchServerData();
  }, [user]); // Re-fetch when user logs in to ensure they get data permissions

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => { secureStorage.setItem('app_current_user', user); }, [user]);
  useEffect(() => { secureStorage.setItem('app_cart', cart); }, [cart]);
  
  // Computed Trending Products
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

  // --- ACTIONS ---
  const toggleLanguage = () => {
    setLanguage(prev => {
        const newLang = prev === 'RU' ? 'EN' : 'RU';
        localStorage.setItem('app_language', newLang); 
        return newLang;
    });
  };

  const login = async (email: string, role: UserRole = UserRole.USER, name?: string, telegramData?: Partial<User>, avatarUrl?: string) => {
    // 1. Try SERVER Login
    try {
        const serverUser = await api.login({
            email,
            name,
            telegramId: telegramData?.telegramId,
            avatarUrl: avatarUrl || telegramData?.avatarUrl,
            registrationSource: telegramData ? 'TELEGRAM' : 'EMAIL'
        });
        if (serverUser) {
            setUser({ ...serverUser, role: role }); 
            return;
        }
    } catch (e) {
        console.warn('Login API failed, falling back to local.', e);
    }

    // 2. Fallback LOCAL Login
    let finalRole = role;
    let userId = telegramData?.id;
    if (!userId) {
        const existingMock = allUsers.find(u => u.email === email);
        userId = existingMock ? existingMock.id : `user-${Date.now()}`;
    }

    const existingUser = allUsers.find(u => u.id === userId || u.email === email);

    if (existingUser) {
        setUser({ ...existingUser, role: existingUser.email === MOCK_ADMIN.email ? UserRole.ADMIN : role });
    } else {
        const newUser: User = {
            id: userId,
            email: email,
            name: name || email.split('@')[0],
            role: finalRole,
            avatarUrl: avatarUrl || telegramData?.avatarUrl || 'https://via.placeholder.com/100',
            registrationSource: telegramData ? 'TELEGRAM' : 'EMAIL',
            telegramId: telegramData?.telegramId,
            preferences: { telegramNotifications: true, emailNewsletter: true, securityAlerts: true }
        };
        setAllUsers(prev => [...prev, newUser]);
        setUser(newUser);
    }
  };

  const logout = () => setUser(null);

  const updateUserProfile = (name: string, avatarUrl: string) => {
    if (user) {
      const updatedUser = { ...user, name, avatarUrl };
      setUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
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

  const updateTelegramSettings = (token: string, chatId: string, username: string, emailServiceId?: string, emailTemplateId?: string, emailPublicKey?: string) => {
    const newSettings = { botToken: token, adminChatId: chatId, botUsername: username, emailServiceId, emailTemplateId, emailPublicKey };
    setTelegramSettings(newSettings);
    secureStorage.setItem('telegram_settings', newSettings);
  };

  const updateTrendingConfig = (mode: 'AUTOMATIC' | 'MANUAL', ids: string[]) => {
      const newConfig = { mode, manualProductIds: ids };
      setTrendingConfig(newConfig);
      secureStorage.setItem('trending_config', newConfig);
  };

  const sendTelegramNotification = async (message: string) => {
    if (!telegramSettings.botToken || !telegramSettings.adminChatId) return;
    try {
      await fetch(`https://api.telegram.org/bot${telegramSettings.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: telegramSettings.adminChatId, text: message, parse_mode: 'HTML' }),
      });
    } catch (error) { console.error('Failed to send Telegram notification', error); }
  };

  const createOrder = async () => {
    if (!user) return null;
    try {
        const orderData = {
            userId: user.id,
            items: [...cart],
            total: cart.reduce((sum, p) => sum + p.price, 0),
            paymentMethod: 'PENDING'
        };
        const serverRes = await api.createOrder(orderData);
        if (serverRes && serverRes.success) {
            const newOrder: Order = {
                id: serverRes.orderId,
                userId: user.id,
                items: [...cart],
                total: orderData.total,
                status: OrderStatus.PENDING,
                date: new Date().toISOString().split('T')[0]
            };
            setOrders(prev => [newOrder, ...prev]);
            return newOrder;
        }
    } catch (e) {
        console.warn('Server order failed, using local fallback', e);
    }
    // Fallback
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      userId: user.id,
      items: [...cart],
      total: cart.reduce((sum, p) => sum + p.price, 0),
      status: OrderStatus.PENDING,
      date: new Date().toISOString().split('T')[0]
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const confirmPayment = async (orderId: string, method: string) => {
      try {
          await api.updateOrderStatus(orderId, OrderStatus.PROCESSING);
      } catch(e) {}
      
      setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status: OrderStatus.PROCESSING, paymentMethod: method as any } : o));
      clearCart();
      const order = orders.find(o => o.id === orderId);
      if(order) {
          const itemsList = order.items?.map((i: Product) => `▫️ ${i.title} ($${i.price})`).join('\n') || 'Items';
          await sendTelegramNotification(`<b>⚠️ Требуется проверка</b>\nID: ${order.id}\nUser: ${user?.name}\nTotal: ${order.total}\nMethod: ${method}\n\n${itemsList}`);
      }
  }

  const createTicket = async (subject: string, message: string) => {
    if(!user) return;
    try { await api.createTicket({ userId: user.id, subject, message }); } catch(e) {}
    const newTicket: Ticket = {
        id: `tkt-${Date.now()}`,
        userId: user.id,
        subject,
        messages: [{ sender: 'USER', text: message, timestamp: new Date().toLocaleTimeString(), read: false }],
        status: TicketStatus.OPEN,
        date: new Date().toISOString().split('T')[0]
    }
    setTickets(prev => [newTicket, ...prev]);
    sendTelegramNotification(`<b>🎫 Новый тикет</b>\nUser: ${user.name}\nSubject: ${subject}`);
  }

  const adminInitiateChat = (userId: string, orderId: string) => {
    const newTicket: Ticket = {
        id: `tkt-${Date.now()}`,
        userId: userId,
        subject: `Order Issue #${orderId}`,
        messages: [{ sender: 'ADMIN', text: `Hello. Issues with order #${orderId}.`, timestamp: new Date().toLocaleTimeString(), read: false }],
        status: TicketStatus.OPEN,
        date: new Date().toISOString().split('T')[0]
    }
    setTickets(prev => [newTicket, ...prev]);
  }

  const replyToTicket = async (ticketId: string, message: string) => {
    if (!user) return;
    try { await api.replyTicket(ticketId, 'USER', message); } catch(e) {}
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: t.status === TicketStatus.RESOLVED ? t.status : TicketStatus.OPEN, messages: [...t.messages, { sender: 'USER', text: message, timestamp: new Date().toLocaleTimeString(), read: false }] } : t));
  }

  const markTicketAsRead = (ticketId: string) => {
    if (!user) return;
    const targetSender = user.role === UserRole.ADMIN ? 'USER' : 'ADMIN';
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, messages: t.messages.map(m => m.sender === targetSender ? { ...m, read: true } : m) } : t));
  }

  const deleteTicket = (ticketId: string) => { setTickets(prev => prev.filter(t => t.id !== ticketId)); }
  const closeTicket = async (ticketId: string, byAdmin: boolean = false) => {
    try { await api.updateTicketStatus(ticketId, TicketStatus.RESOLVED); } catch(e) {}
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: TicketStatus.RESOLVED, messages: [...t.messages, { sender: byAdmin ? 'ADMIN' : 'USER', text: 'Chat Closed.', timestamp: new Date().toLocaleTimeString(), read: true }] } : t));
  }

  // Admin Actions
  const addProduct = async (product: Product) => { try { await api.addProduct(product); setProducts(prev => [...prev, product]); } catch (e) { setProducts(prev => [...prev, product]); } }
  const updateProduct = async (product: Product) => { try { await api.updateProduct(product); setProducts(prev => prev.map(p => p.id === product.id ? product : p)); } catch (e) { setProducts(prev => prev.map(p => p.id === product.id ? product : p)); } }
  const deleteProduct = async (id: string) => { try { await api.deleteProduct(id); setProducts(prev => prev.filter(p => p.id !== id)); } catch (e) { setProducts(prev => prev.filter(p => p.id !== id)); } }

  const addServiceOffering = (service: ServiceOffering) => { setServiceOfferings(prev => [...prev, service]); }
  const updateServiceOffering = (service: ServiceOffering) => { setServiceOfferings(prev => prev.map(s => s.id === service.id ? service : s)); }
  const deleteServiceOffering = (id: string) => { setServiceOfferings(prev => prev.filter(s => s.id !== id)); }

  const addResource = (resource: ResourceItem) => { setResources(prev => [...prev, resource]); }
  const updateResource = (resource: ResourceItem) => { setResources(prev => prev.map(r => r.id === resource.id ? resource : r)); }
  const deleteResource = (id: string) => { setResources(prev => prev.filter(r => r.id !== id)); }

  const submitServiceRequest = async (type: string, contact: string, details: string) => {
      if (!user) throw new Error("User not authenticated");
      // Call Server
      try {
          await api.submitServiceRequest({ userId: user.id, serviceType: type, contact, details });
      } catch (e) { console.error(e); }
      
      const newRequest: ServiceRequest = { id: `srv-${Date.now()}`, userId: user.id, contact, serviceType: type, comment: details, status: 'NEW', date: new Date().toISOString().split('T')[0], reviewed: false };
      setServiceRequests(prev => [newRequest, ...prev]);
      sendTelegramNotification(`<b>🛠️ New Request</b>\nUser: ${user.name}\nService: ${type}\nContact: ${contact}`);
  };

  const updateServiceRequestStatus = async (id: string, status: 'NEW' | 'IN_WORK' | 'COMPLETED') => { 
      try { await api.updateServiceRequestStatus(id, status); } catch(e) {}
      setServiceRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req)); 
  };
  const deleteServiceRequest = (id: string) => { setServiceRequests(prev => prev.filter(req => req.id !== id)); };

  const addBonusItem = (item: Product) => { setBonusItems(prev => [...prev, item]); }
  const updateBonusItem = (item: Product) => { setBonusItems(prev => prev.map(b => b.id === item.id ? item : b)); }
  const deleteBonusItem = (id: string) => { setBonusItems(prev => prev.filter(b => b.id !== id)); if (bonusProductId === id) updateBonusProduct(null); }

  const updateOrderStatus = async (orderId: string, status: OrderStatus, reason?: string) => {
    try { await api.updateOrderStatus(orderId, status, reason); } catch(e) {}
    setOrders(prevOrders => prevOrders.map(o => {
        if (o.id === orderId) {
            const updated = { ...o, status, rejectionReason: reason };
            if (status === OrderStatus.COMPLETED) setSuccessNotification(updated);
            return updated;
        }
        return o;
    }));
  };

  const closeSuccessNotification = () => { setSuccessNotification(null); }
  const adminReply = async (ticketId: string, reply: string) => { 
      try { await api.replyTicket(ticketId, 'ADMIN', reply); } catch(e) {}
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, messages: [...t.messages, { sender: 'ADMIN', text: reply, timestamp: new Date().toLocaleTimeString(), read: false }] } : t)); 
  };
  const deleteUser = (userId: string) => { setAllUsers(prev => prev.filter(u => u.id !== userId)); if (user && user.id === userId) logout(); };
  const adminUpdateUser = (userId: string, updates: Partial<User>) => { setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u)); if (user && user.id === userId) setUser({ ...user, ...updates }); };
  const addReview = async (review: Review) => { 
      try { await api.addReview(review); } catch(e) {}
      setReviews(prev => [review, ...prev]); 
      setServiceRequests(prev => prev.map(req => req.id === review.productId ? { ...req, reviewed: true } : req)); 
  }
  const deleteReview = async (id: string) => { 
      try { await api.deleteReview(id); } catch(e) {}
      setReviews(prev => prev.filter(r => r.id !== id)); 
  }

  return (
    <AppContext.Provider value={{
      user, allUsers, products, bonusItems, serviceOfferings, resources, cart, orders, tickets, serviceRequests, language, telegramSettings, unreadCount, successNotification, reviews: reviews || [], 
      trendingConfig, trendingProducts, bonusProductId, welcomeGift,
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
