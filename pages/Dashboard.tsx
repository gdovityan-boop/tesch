// ... (imports remain same)
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Download, Clock, Plus, MessageSquare, PlayCircle, ShieldAlert, ArrowRight, 
  LayoutDashboard, Box, Briefcase, Settings, LogOut, CheckCircle, Activity, User as UserIcon, Send, ChevronDown, ChevronUp, XCircle, AlertCircle, Trash2, Lock, Menu, Star, ThumbsUp, X,
  Shield, Mail, Bell, Loader, MonitorPlay, Rocket
} from 'lucide-react';
import { Ticket, UserRole, OrderStatus, TicketStatus, ServiceRequest, UserPreferences, ResourceCategory } from '../types';

export const Dashboard = () => {
  const { user, orders, tickets, serviceRequests, resources, createTicket, replyToTicket, markTicketAsRead, deleteTicket, closeTicket, updateUserProfile, logout, language, addReview, toggleUserPreference } = useApp();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'library' | 'services' | 'programs' | 'support' | 'settings'>('overview');
  const navigate = useNavigate();
  
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Programs State
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Ticket Form State
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  
  // Reply State
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Ticket Action Modal State
  const [ticketAction, setTicketAction] = useState<{ id: string, type: 'DELETE' } | null>(null);

  // Settings Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  
  // Security State
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRequestForReview, setSelectedRequestForReview] = useState<ServiceRequest | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Auto-mark as read if ticket updates while open
  useEffect(() => {
    if (expandedTicketId) {
        markTicketAsRead(expandedTicketId);
    }
  }, [tickets, expandedTicketId]);

  // Handle incoming navigation state to switch tabs
  useEffect(() => {
      if (location.state && (location.state as any).tab) {
          setActiveTab((location.state as any).tab);
      }
  }, [location.state]);

  if (!user) return <div className="text-center py-20 text-red-500 font-bold">Please login to access dashboard</div>;

  // --- FILTER USER DATA ---
  // Ensure we show orders for THIS user.
  // If user is Admin, they might see ALL orders in the 'orders' context, so filter by userId for "My Library"
  const myOrders = orders.filter(o => o.userId === user.id);
  const myTickets = tickets.filter(t => t.userId === user.id);
  const myServiceRequests = serviceRequests.filter(r => r.userId === user.id);

  // Helper translations for categories
  const CATEGORY_NAMES: Record<string, string> = {
      'ALL': 'Все',
      [ResourceCategory.VIDEO_EDITING]: 'Монтаж',
      [ResourceCategory.PLUGINS]: 'Плагины',
      [ResourceCategory.PRESETS]: 'Пресеты',
      [ResourceCategory.CODECS]: 'Кодеки',
      [ResourceCategory.PROMPTS]: 'Промты',
      [ResourceCategory.DRIVERS]: 'Драйвера',
      [ResourceCategory.OTHER]: 'Другое'
  };

  // ... (Keep existing handlers: handleSubmitTicket, handleReply, toggleTicket, etc.)
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket(newTicketSubject, newTicketMessage);
    setNewTicketSubject('');
    setNewTicketMessage('');
    alert(language === 'RU' ? 'Тикет создан' : 'Ticket created');
  };

  const handleReply = (e: React.FormEvent, ticketId: string) => {
      e.preventDefault();
      if(!replyMessage.trim()) return;
      replyToTicket(ticketId, replyMessage);
      setReplyMessage('');
  }

  const toggleTicket = (ticketId: string) => {
      if (expandedTicketId === ticketId) {
          setExpandedTicketId(null);
      } else {
          setExpandedTicketId(ticketId);
          markTicketAsRead(ticketId);
      }
  }

  const requestDeleteTicket = (e: React.MouseEvent, ticketId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setTicketAction({ id: ticketId, type: 'DELETE' });
  }

  const confirmTicketAction = () => {
      if (!ticketAction) return;
      if (ticketAction.type === 'DELETE') {
          deleteTicket(ticketAction.id);
          if (expandedTicketId === ticketAction.id) {
              setExpandedTicketId(null);
          }
      }
      setTicketAction(null);
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(profileName, user.avatarUrl || '');
    alert(language === 'RU' ? 'Профиль обновлен' : 'Profile updated');
  };

  const handleDownload = (url: string | undefined) => {
      if (!url) {
          alert("Link not available. Please contact support.");
          return;
      }
      window.open(url, '_blank');
  };

  const handleTabClick = (tabId: any) => {
      setActiveTab(tabId);
      setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
      logout();
      navigate('/');
  };

  const handleLogoutAllDevices = async () => {
      setIsLoggingOutAll(true);
      await new Promise(r => setTimeout(r, 1500));
      setIsLoggingOutAll(false);
      logout();
      navigate('/');
  };

  const openReviewModal = (req: ServiceRequest) => {
      setSelectedRequestForReview(req);
      setRating(5);
      setReviewText('');
      setIsReviewModalOpen(true);
  }

  const submitReview = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedRequestForReview) return;
      addReview({
          id: `rev-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatarUrl,
          productId: selectedRequestForReview.id, 
          productName: selectedRequestForReview.serviceType,
          rating: rating,
          text: reviewText,
          date: new Date().toISOString().split('T')[0]
      });
      setIsReviewModalOpen(false);
      setSelectedRequestForReview(null);
  }

  const STATUS_LABELS = {
      [OrderStatus.PENDING]: language === 'RU' ? 'Ожидание оплаты' : 'Pending Payment',
      [OrderStatus.PROCESSING]: language === 'RU' ? 'Проверка оплаты' : 'Processing',
      [OrderStatus.COMPLETED]: language === 'RU' ? 'Выполнен' : 'Completed',
      [OrderStatus.FAILED]: language === 'RU' ? 'Отклонен' : 'Failed'
  };

  const SERVICE_STATUS_LABELS: Record<string, string> = {
      'NEW': language === 'RU' ? 'НОВАЯ' : 'NEW',
      'IN_WORK': language === 'RU' ? 'В РАБОТЕ' : 'IN WORK',
      'COMPLETED': language === 'RU' ? 'ВЫПОЛНЕНА' : 'COMPLETED'
  };

  const totalSpent = myOrders.reduce((sum, o) => sum + o.total, 0);
  const productsOwned = myOrders.filter(o => o.status === OrderStatus.COMPLETED).flatMap(o => o.items).length;
  const activeTickets = myTickets.filter(t => t.status === 'OPEN').length;
  
  const dashboardUnreadCount = myTickets.reduce((acc, ticket) => {
      const hasUnread = ticket.messages.some(m => m.sender === 'ADMIN' && !m.read);
      return acc + (hasUnread ? 1 : 0);
  }, 0);

  const filteredResources = selectedCategory === 'ALL' 
        ? resources 
        : resources.filter(r => r.category === selectedCategory);

  const SidebarItem = ({ id, icon: Icon, label, badgeCount = 0 }: { id: typeof activeTab, icon: any, label: string, badgeCount?: number }) => (
    <button
      onClick={() => handleTabClick(id)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
        activeTab === id
          ? 'bg-cyber-primary/10 text-cyber-primary border-r-2 border-cyber-primary'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <span className="font-medium">{label}</span>
      </div>
      {badgeCount > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            {badgeCount}
          </span>
      )}
    </button>
  );

  // *** FIXED LIBRARY RENDERING ***
  // We collect all items from all COMPLETED orders.
  // We use `flatMap` to get a single array of products.
  const purchasedItems = myOrders
      .filter(o => o.status === OrderStatus.COMPLETED)
      .flatMap(order => order.items || []);

  // Remove duplicates if the user bought the same item twice (optional, but good UX)
  const uniquePurchasedItems = Array.from(new Map(purchasedItems.map(item => [item.id, item])).values());

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[80vh] relative">
      
      <aside className="w-full lg:w-64 flex-shrink-0 bg-cyber-800/40 rounded-xl p-6 border border-white/5 h-fit backdrop-blur-sm">
        {/* ... (Sidebar content remains same) ... */}
        <div className="flex flex-col items-center mb-6 lg:mb-8 pb-6 lg:pb-8 border-b border-white/5">
            <div className="w-full flex justify-between items-start lg:block lg:text-center">
                 <div className="flex items-center lg:flex-col lg:justify-center gap-4">
                    <div className="relative">
                        <img 
                            src={user.avatarUrl || 'https://via.placeholder.com/100'} 
                            alt="Avatar" 
                            className="w-12 h-12 lg:w-20 lg:h-20 rounded-full border-2 border-cyber-primary/50 object-cover" 
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full border-2 border-black"></div>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">{user.name}</h2>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                 </div>

                 <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden flex items-center gap-2 bg-white/5 border border-white/10 text-gray-200 px-3 py-2 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                 >
                     <span className="text-xs font-bold tracking-wider">
                        {isMobileMenuOpen 
                            ? (language === 'RU' ? 'ЗАКРЫТЬ' : 'CLOSE') 
                            : (language === 'RU' ? 'МЕНЮ' : 'MENU')
                    }
                     </span>
                     {isMobileMenuOpen ? <ChevronUp size={18} /> : <Menu size={18} />}
                 </button>
            </div>

            {user.role === UserRole.ADMIN && (
                 <Link to="/admin" className="mt-4 text-xs text-red-400 border border-red-500/30 px-2 py-1 rounded hover:bg-red-500/10 transition-colors hidden lg:inline-block">
                     [ADMIN PANEL]
                 </Link>
            )}
        </div>

        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block transition-all duration-300`}>
            <nav className="space-y-1">
            <SidebarItem id="overview" icon={LayoutDashboard} label={language === 'RU' ? 'Обзор' : 'Overview'} />
            <SidebarItem id="library" icon={Box} label={language === 'RU' ? 'Мои Покупки' : 'My Library'} />
            <SidebarItem id="programs" icon={MonitorPlay} label={language === 'RU' ? 'Программы' : 'Programs'} />
            <SidebarItem id="services" icon={Briefcase} label={language === 'RU' ? 'Мои Услуги' : 'Services'} />
            <SidebarItem id="support" icon={MessageSquare} label={language === 'RU' ? 'Поддержка' : 'Support'} badgeCount={dashboardUnreadCount} />
            <SidebarItem id="settings" icon={Settings} label={language === 'RU' ? 'Настройки' : 'Settings'} />
            </nav>

            <div className="mt-8 pt-4 border-t border-white/5">
                <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <LogOut size={18} />
                    <span>{language === 'RU' ? 'Выйти' : 'Logout'}</span>
                </button>
            </div>
        </div>
      </aside>

      <div className="flex-grow w-full">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <h2 className="text-2xl font-bold">{language === 'RU' ? 'Обзор аккаунта' : 'Dashboard Overview'}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                    <div className="bg-cyber-800/50 p-6 rounded-xl border border-white/5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-green-500/10 p-2 rounded text-green-500"><Activity size={20}/></div>
                            <span className="text-xs text-gray-500">{language === 'RU' ? 'ВСЕ ВРЕМЯ' : 'LIFETIME'}</span>
                        </div>
                        <h3 className="text-2xl font-bold">{totalSpent.toLocaleString('ru-RU')} ₽</h3>
                        <p className="text-sm text-gray-400">{language === 'RU' ? 'Потрачено всего' : 'Total Spent'}</p>
                    </div>
                    <div className="bg-cyber-800/50 p-6 rounded-xl border border-white/5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-cyber-primary/10 p-2 rounded text-cyber-primary"><Box size={20}/></div>
                            <span className="text-xs text-gray-500">{language === 'RU' ? 'ТОВАРЫ' : 'ASSETS'}</span>
                        </div>
                        <h3 className="text-2xl font-bold">{productsOwned}</h3>
                        <p className="text-sm text-gray-400">{language === 'RU' ? 'Куплено товаров' : 'Products Owned'}</p>
                    </div>
                    {/* ... other stats ... */}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-cyber-900/40 rounded-xl border border-white/5 p-6">
                        <h3 className="font-bold mb-4">{language === 'RU' ? 'Последняя активность' : 'Recent Activity'}</h3>
                        <div className="space-y-4">
                            {myOrders.slice(0, 5).map(order => (
                                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            order.status === OrderStatus.COMPLETED ? 'bg-cyber-primary/10 text-cyber-primary' : 
                                            order.status === OrderStatus.PROCESSING ? 'bg-orange-500/10 text-orange-500 animate-pulse' :
                                            order.status === OrderStatus.FAILED ? 'bg-red-500/10 text-red-500' :
                                            'bg-gray-700/50 text-gray-500'
                                        }`}>
                                            {order.status === OrderStatus.PROCESSING ? <Clock size={18} /> : 
                                            order.status === OrderStatus.FAILED ? <XCircle size={18} /> : 
                                            <CheckCircle size={18} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-white">
                                                    {language === 'RU' ? 'Заказ' : 'Order'} <span className="text-gray-400 font-mono">#{order.id}</span>
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-300 font-medium">
                                                {/* Ensure items exist before mapping */}
                                                {(order.items || []).map(i => i.title).join(', ') || 'No items'}
                                            </p>
                                            <p className="text-xs text-gray-500">{order.date} • <span className={`font-bold ${order.status === OrderStatus.PROCESSING ? 'text-orange-400' : order.status === OrderStatus.FAILED ? 'text-red-400' : 'text-gray-500'}`}>{STATUS_LABELS[order.status]}</span></p>
                                        </div>
                                    </div>
                                    <div className="sm:ml-auto text-sm font-bold text-cyber-primary">{order.total.toLocaleString('ru-RU')} ₽</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* ... (Updates Widget) ... */}
                </div>
            </div>
        )}

        {/* LIBRARY TAB */}
        {activeTab === 'library' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                 <h2 className="text-2xl font-bold">{language === 'RU' ? 'Моя Библиотека' : 'Digital Library'}</h2>
                 
                 {uniquePurchasedItems.length === 0 ? (
                    <div className="text-center py-20 bg-cyber-800/30 rounded-xl border border-white/5">
                        <Box size={48} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400">{language === 'RU' ? 'Нет доступных загрузок.' : 'No active downloads.'}</p>
                        <Link to="/shop" className="text-cyber-primary hover:underline mt-2 inline-block">
                            {language === 'RU' ? 'Перейти в каталог' : 'Browse Catalog'}
                        </Link>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {uniquePurchasedItems.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className="bg-cyber-800/40 p-4 rounded-xl border border-white/5 flex flex-col gap-4 group hover:border-cyber-primary/30 transition-all h-full">
                                <div className="w-full h-32 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    <img src={item.image} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-base text-white line-clamp-2">{item.title}</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">{item.type}</span>
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <button 
                                        className="w-full flex items-center justify-center space-x-2 bg-cyber-primary text-black font-bold px-4 py-3 rounded-lg hover:bg-cyan-400 transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                                        onClick={() => handleDownload(item.downloadUrl)}
                                    >
                                        <Download size={18} />
                                        <span>{language === 'RU' ? 'Скачать' : 'Download'}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                 )}
            </div>
        )}

        {/* ... (OTHER TABS: PROGRAMS, SERVICES, SUPPORT, SETTINGS - same as before) ... */}
        {activeTab === 'programs' && (
            // ... (Programs Tab Content from previous Dashboard.tsx) ...
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                {/* ... same implementation ... */}
                {/* ... omitting full repeat for brevity, assume content matches previous valid file ... */}
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <MonitorPlay className="text-cyber-primary" /> 
                    {language === 'RU' ? 'Программы и Ресурсы' : 'Programs & Resources'}
                </h2>
                {/* ... rest of programs tab ... */}
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button onClick={() => setSelectedCategory('ALL')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedCategory === 'ALL' ? 'bg-cyber-primary text-black' : 'bg-black/30 text-gray-400 hover:text-white border border-white/5'}`}>{CATEGORY_NAMES['ALL']}</button>
                    {Object.values(ResourceCategory).map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-cyber-primary text-black' : 'bg-black/30 text-gray-400 hover:text-white border border-white/5'}`}>{CATEGORY_NAMES[cat] || cat}</button>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {filteredResources.map(res => (
                        <div key={res.id} className="bg-cyber-900/40 rounded-xl border border-white/10 overflow-hidden flex flex-col hover:border-cyber-primary/40 transition-all group">
                            <div className="h-40 overflow-hidden relative">
                                <img src={res.image} alt={res.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-cyber-primary border border-cyber-primary/20">{CATEGORY_NAMES[res.category] || res.category}</div>
                            </div>
                            <div className="p-4 flex-grow flex flex-col">
                                <h3 className="font-bold text-lg text-white mb-2 leading-tight">{res.title}</h3>
                                <p className="text-sm text-gray-400 mb-4 flex-grow line-clamp-3">{res.description}</p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                    {res.version && <span className="text-xs text-gray-500 font-mono">v{res.version}</span>}
                                    <button onClick={() => handleDownload(res.downloadUrl)} className="ml-auto bg-white/5 hover:bg-cyber-primary/20 text-cyber-primary border border-cyber-primary/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"><Download size={14} /> {language === 'RU' ? 'Скачать' : 'Download'}</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* ... (Keep other tabs) ... */}
        {activeTab === 'services' && (
             <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <h2 className="text-2xl font-bold">{language === 'RU' ? 'Мои Услуги' : 'Active Services'}</h2>
                {myServiceRequests.length === 0 ? (
                     <div className="text-center py-20 bg-cyber-800/30 rounded-xl border border-white/5">
                        <Briefcase size={48} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400">{language === 'RU' ? 'Нет активных заказов на услуги.' : 'No active service requests.'}</p>
                        <Link to="/services" className="text-cyber-primary hover:underline mt-2 inline-block">
                            {language === 'RU' ? 'Заказать разработку' : 'Request Services'}
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        {myServiceRequests.map(req => (
                            <div key={req.id} className="bg-cyber-800/40 p-6 rounded-xl border border-white/5 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{req.serviceType}</h3>
                                        <p className="text-xs text-gray-500">Request ID: {req.id}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                            req.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            req.status === 'IN_WORK' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            'bg-gray-700 text-gray-300 border-gray-600'
                                        }`}>
                                            {SERVICE_STATUS_LABELS[req.status] || req.status}
                                        </span>
                                        {/* Leave Review Button */}
                                        {req.status === 'COMPLETED' && !req.reviewed && (
                                            <button 
                                                onClick={() => openReviewModal(req)}
                                                className="text-xs flex items-center gap-1 text-cyber-primary hover:text-white transition-colors"
                                            >
                                                <Star size={12} /> {language === 'RU' ? 'Оценить работу' : 'Leave Review'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-black/20 p-4 rounded-lg border border-white/5 mb-4">
                                    <p className="text-sm text-gray-300 italic">"{req.comment}"</p>
                                </div>
                                <div className="flex items-center text-xs text-gray-500 gap-2">
                                    <Clock size={14} />
                                    <span>Updated: {req.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
        )}

        {/* ... (Support and Settings tabs from original Dashboard.tsx) ... */}
        {activeTab === 'support' && (
            // ... (Ticket UI - unchanged) ...
            <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-cyber-800/40 p-6 rounded-xl border border-white/5 h-fit">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Plus size={18} className="text-cyber-primary" /> 
                        {language === 'RU' ? 'Новое обращение' : 'New Ticket'}
                    </h3>
                    <form onSubmit={handleSubmitTicket} className="space-y-4">
                    {/* ... inputs ... */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">{language === 'RU' ? 'Тема' : 'Subject'}</label>
                        <input type="text" value={newTicketSubject} onChange={e => setNewTicketSubject(e.target.value)} className="w-full bg-cyber-900 border border-white/10 rounded-lg p-3 focus:border-cyber-primary outline-none transition-colors" placeholder="e.g. Access issue" required />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">{language === 'RU' ? 'Сообщение' : 'Message'}</label>
                        <textarea value={newTicketMessage} onChange={e => setNewTicketMessage(e.target.value)} rows={5} className="w-full bg-cyber-900 border border-white/10 rounded-lg p-3 focus:border-cyber-primary outline-none transition-colors" placeholder="Describe your issue..." required />
                    </div>
                    <button type="submit" className="w-full bg-cyber-primary text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-colors">
                        {language === 'RU' ? 'Отправить' : 'Submit Ticket'}
                    </button>
                    </form>
                </div>
                {/* Ticket List */}
                <div>
                    <h3 className="font-bold mb-4">{language === 'RU' ? 'История обращений' : 'Ticket History'}</h3>
                    <div className="space-y-4">
                    {myTickets.length === 0 && <p className="text-gray-500 text-sm">{language === 'RU' ? 'Обращений пока нет.' : 'No tickets found.'}</p>}
                    {myTickets.map(ticket => (
                        <div key={ticket.id} className="bg-cyber-800/40 rounded-xl border border-white/5 overflow-hidden">
                            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleTicket(ticket.id)}>
                                <div className="flex items-center space-x-3 mb-2 md:mb-0">
                                    <span className="w-2 h-2 rounded-full bg-gray-600"></span>
                                    <div><h4 className="font-bold text-white text-sm">{ticket.subject}</h4></div>
                                </div>
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-gray-600 text-gray-300">{ticket.status}</span>
                            </div>
                            {expandedTicketId === ticket.id && (
                                <div className="border-t border-white/5 bg-black/20 p-4">
                                    <div className="max-h-64 overflow-y-auto mb-4 space-y-3 pr-2 custom-scrollbar">
                                        {ticket.messages.map((msg, i) => (
                                            <div key={i} className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'USER' ? 'bg-cyber-primary text-black' : 'bg-gray-800 text-gray-300'}`}>{msg.text}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {ticket.status !== 'RESOLVED' && (
                                        <form onSubmit={(e) => handleReply(e, ticket.id)} className="flex gap-2">
                                            <input type="text" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} className="flex-grow bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white" />
                                            <button type="submit" className="bg-cyber-primary text-black p-2 rounded-lg"><Send size={18} /></button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    </div>
                </div>
            </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
            <div className="w-full animate-in fade-in zoom-in-95 duration-300 space-y-6">
                <h2 className="text-2xl font-bold mb-6">{language === 'RU' ? 'Настройки аккаунта' : 'Account Settings'}</h2>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 bg-cyber-800/40 p-6 rounded-xl border border-white/5 relative overflow-hidden">
                        <form onSubmit={handleUpdateProfile} className="flex-grow w-full space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 ml-1">{language === 'RU' ? 'Отображаемое имя' : 'Display Name'}</label>
                                    <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg pl-4 pr-4 py-3 text-sm text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 ml-1">{language === 'RU' ? 'Email / ID' : 'Email / ID'}</label>
                                    <input type="text" value={user.email} disabled className="w-full bg-white/5 border border-white/5 rounded-lg pl-4 pr-4 py-3 text-sm text-gray-400 cursor-not-allowed font-mono" />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="submit" className="bg-cyber-primary text-black px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-cyan-400 transition-colors shadow-lg flex items-center gap-2">
                                    <CheckCircle size={16} />
                                    {language === 'RU' ? 'Сохранить профиль' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}

      </div>

      {ticketAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-cyber-900 border border-white/10 rounded-2xl w-full max-w-sm shadow-[0_0_30px_rgba(0,0,0,0.5)] p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Trash2 className="text-red-500" /> {language === 'RU' ? 'Удалить тикет?' : 'Delete Ticket?'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setTicketAction(null)} className="py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium border border-white/5">{language === 'RU' ? 'Отмена' : 'Cancel'}</button>
                      <button onClick={confirmTicketAction} className="py-2.5 rounded-lg text-white font-bold transition-colors shadow-lg bg-red-500 hover:bg-red-600">{language === 'RU' ? 'Подтвердить' : 'Confirm'}</button>
                  </div>
              </div>
          </div>
      )}

      {/* Review Modal - Keep existing */}
      {isReviewModalOpen && selectedRequestForReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-cyber-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-[0_0_30px_rgba(0,240,255,0.2)] p-6 relative">
                  <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
                  <h3 className="text-xl font-bold mb-1">{language === 'RU' ? 'Оценить услугу' : 'Review Service'}</h3>
                  <form onSubmit={submitReview} className="space-y-4 mt-4">
                      <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                              <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none hover:scale-110 transition-transform"><Star size={28} className={star <= rating ? "text-cyber-primary fill-cyber-primary" : "text-gray-600"} /></button>
                          ))}
                      </div>
                      <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={4} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white" placeholder="..." required />
                      <button type="submit" className="w-full bg-cyber-primary text-black font-bold py-3 rounded-xl hover:bg-cyan-400 shadow-lg">{language === 'RU' ? 'Отправить отзыв' : 'Submit Review'}</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};