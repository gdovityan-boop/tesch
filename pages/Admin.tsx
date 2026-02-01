
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, ProductType, OrderStatus, TicketStatus, Product, User, ServiceOffering, ResourceCategory, ResourceItem } from '../types';
import { 
  Users, ShoppingBag, DollarSign, MessageSquare, Plus, Edit, Trash, Settings, ShieldAlert, 
  BarChart3, Search, ChevronDown, ChevronUp, Send, Save, Key, Bot, Link as LinkIcon, 
  CheckCircle, XCircle, MessageCircle, Lock, Trash2, AlertCircle, Upload, Image as ImageIcon, 
  RefreshCw, Tag, X, Gift, Star, TrendingUp, TrendingDown, Eye, Smartphone, Globe, 
  Calendar, Shield, Headphones, FileText, User as UserIcon, Mail, Loader, Server, 
  ExternalLink, Smartphone as MobileIcon, Monitor, PieChart, LayoutTemplate, Menu, 
  Briefcase, Database, Cpu, Zap, ClipboardList, AlertTriangle, MonitorPlay, Video, Activity, Wifi, CreditCard 
} from 'lucide-react';
import { MOCK_ANALYTICS_DATA, WEB_APP_URL } from '../services/mockData';
import { authService } from '../services/authService';

// --- COMPONENTS ---

const RevenueChart = ({ data, timeRange }: { data: any[], timeRange: string }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const maxVal = Math.max(...data.map(d => d.value), 100) * 1.1; 
    const points = useMemo(() => {
        return data.map((d, i) => ({
            x: (i / (data.length - 1 || 1)) * 100,
            y: 100 - (d.value / maxVal) * 100,
            ...d
        }));
    }, [data, maxVal]);

    const getPath = (pts: typeof points, isClosed: boolean) => {
        if (pts.length === 0) return "";
        if (pts.length === 1) return `M 0 ${pts[0].y} L 100 ${pts[0].y}`;

        let d = `M ${pts[0].x} ${pts[0].y}`;

        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = i > 0 ? pts[i - 1] : pts[0];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = i !== pts.length - 2 ? pts[i + 2] : p2;

            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;

            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }

        if (isClosed) {
            d += ` L 100 120 L 0 120 Z`;
        }

        return d;
    };

    const linePath = useMemo(() => getPath(points, false), [points]);
    const areaPath = useMemo(() => getPath(points, true), [points]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percentage = (x / width);
        const index = Math.round(percentage * (data.length - 1));
        
        if (index >= 0 && index < data.length) {
            setHoveredIndex(index);
        }
    };

    return (
        <div 
            ref={containerRef}
            className="relative h-72 w-full group cursor-crosshair select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIndex(null)}
        >
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                {[0, 25, 50, 75, 100].map((p) => (
                    <div key={p} className="w-full border-t border-dashed border-gray-500/50 h-0" />
                ))}
            </div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
                <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#00f0ff" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <path d={areaPath} fill="url(#chartGradient)" className="transition-all duration-300" />
                <path d={linePath} fill="none" stroke="#00f0ff" strokeWidth="0.8" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" className="drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                {hoveredIndex !== null && (
                    <g>
                        <line x1={points[hoveredIndex].x} y1={0} x2={points[hoveredIndex].x} y2={100} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" strokeDasharray="1 1" vectorEffect="non-scaling-stroke"/>
                        <circle cx={points[hoveredIndex].x} cy={points[hoveredIndex].y} r="1.5" fill="#0a0a0f" stroke="#00f0ff" strokeWidth="0.5" vectorEffect="non-scaling-stroke" className="animate-pulse"/>
                        <circle cx={points[hoveredIndex].x} cy={points[hoveredIndex].y} r="4" fill="rgba(0,240,255,0.2)" vectorEffect="non-scaling-stroke"/>
                    </g>
                )}
            </svg>
            {hoveredIndex !== null && (
                <div 
                    className="absolute z-20 pointer-events-none transition-all duration-75"
                    style={{ 
                        left: `${points[hoveredIndex].x}%`, 
                        top: `${points[hoveredIndex].y}%`,
                        transform: 'translate(-50%, -120%)'
                    }}
                >
                    <div className="bg-cyber-900/90 backdrop-blur-md border border-cyber-primary/50 text-white text-xs px-3 py-2 rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.3)] whitespace-nowrap min-w-[100px]">
                        <div className="text-[10px] text-gray-400 font-mono mb-1">{points[hoveredIndex].fullDate}</div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-gray-300">Revenue:</span>
                            <span className="font-bold text-cyber-primary text-sm">{points[hoveredIndex].value.toLocaleString('ru-RU')} ₽</span>
                        </div>
                    </div>
                    <div className="w-2 h-2 bg-cyber-primary/50 border-r border-b border-cyber-primary/50 transform rotate-45 absolute left-1/2 -bottom-1 -translate-x-1/2 bg-cyber-900"></div>
                </div>
            )}
            <div className="flex justify-between mt-4 text-[10px] text-gray-500 font-mono uppercase tracking-wider px-2">
                {data.map((d, i) => {
                    const showLabel = timeRange === 'year' ? i % 2 === 0 : timeRange === 'month' ? i % 5 === 0 : true;
                    if (!showLabel && i !== data.length -1 && i !== 0) return <div key={i} className="w-4"></div>;
                    return (
                        <div key={i} className={`text-center transition-colors ${hoveredIndex === i ? 'text-cyber-primary font-bold scale-110' : ''}`}>
                            {d.label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface AdminTabProps {
  label: string;
  icon: any;
  active: boolean;
  onClick: () => void;
  hasBadge?: boolean;
  badgeCount?: number;
}

const AdminTab = ({ label, icon: Icon, active, onClick, hasBadge, badgeCount }: AdminTabProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
      active
        ? 'bg-cyber-primary/10 text-cyber-primary border-r-2 border-cyber-primary'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </div>
    {hasBadge && badgeCount !== undefined && badgeCount > 0 && (
      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
        {badgeCount}
      </span>
    )}
  </button>
);

interface KPICardProps {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: any;
  color: string;
  sparkline?: boolean;
}

const KPICard = ({ title, value, trend, isPositive, icon: Icon, color, sparkline }: KPICardProps) => (
  <div className="bg-cyber-900/50 p-6 rounded-xl border border-white/5 relative overflow-hidden group hover:border-cyber-primary/20 transition-all">
    <div className={`absolute top-4 right-4 p-2 rounded-lg bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
      <Icon size={20} />
    </div>
    <div className="relative z-10">
      <p className="text-sm text-gray-500 mb-1 font-mono uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
      <div className={`text-xs font-bold flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{trend}</span>
        <span className="text-gray-600 font-normal ml-1">vs last period</span>
      </div>
    </div>
    {sparkline && (
        <div className="absolute bottom-0 left-0 w-full h-16 opacity-10 pointer-events-none">
             <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
                 <path d="M0 30 C 20 20, 40 35, 60 15 S 80 25, 100 5" fill="none" stroke="currentColor" strokeWidth="2" className={color.replace('text-', 'stroke-')} />
             </svg>
        </div>
    )}
  </div>
);

// --- MAIN ADMIN COMPONENT ---

export const Admin = () => {
  const { 
    user, allUsers, products, orders, tickets, reviews, bonusItems, serviceOfferings, serviceRequests, resources,
    addProduct, updateProduct, deleteProduct, updateOrderStatus, adminReply, closeTicket, deleteUser,
    telegramSettings, updateTelegramSettings, language, markTicketAsRead, unreadCount, adminInitiateChat, deleteTicket, deleteReview, adminUpdateUser,
    trendingConfig, updateTrendingConfig, bonusProductId, updateBonusProduct, addBonusItem, updateBonusItem, deleteBonusItem,
    addServiceOffering, updateServiceOffering, deleteServiceOffering, updateServiceRequestStatus, deleteServiceRequest,
    addResource, updateResource, deleteResource
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products' | 'bonuses' | 'services' | 'programs' | 'orders' | 'requests' | 'support' | 'settings' | 'reviews' | 'storefront'>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [isResetting, setIsResetting] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Live Stats State - REAL DATA
  const [serverStatus, setServerStatus] = useState<'Checking' | 'Online' | 'Offline'>('Checking');
  const [latency, setLatency] = useState(0);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const t = (ru: string, en: string) => language === 'RU' ? ru : en;

  // Real Health Check
  useEffect(() => {
      const checkHealth = async () => {
          const start = Date.now();
          try {
              const res = await fetch('/api/health');
              if (res.ok) {
                  const end = Date.now();
                  setLatency(end - start);
                  setServerStatus('Online');
              } else {
                  setServerStatus('Offline');
              }
          } catch (e) {
              setServerStatus('Offline');
          }
          setLastCheck(new Date());
      };

      // Check immediately
      checkHealth();

      // Poll every 5 seconds
      const interval = setInterval(checkHealth, 5000);
      return () => clearInterval(interval);
  }, []);

  // Chart Data Logic
  const chartData = useMemo(() => {
      const dataPoints: { label: string; fullDate: string; value: number }[] = [];
      const now = new Date();
      if (timeRange === 'year') {
          for (let i = 11; i >= 0; i--) {
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              const monthKey = d.toISOString().slice(0, 7);
              const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
              const total = orders
                  .filter(o => o.status === OrderStatus.COMPLETED && o.date.startsWith(monthKey))
                  .reduce((sum, o) => sum + o.total, 0);
              dataPoints.push({ label: monthLabel, fullDate: monthKey, value: total });
          }
      } else {
          const days = timeRange === 'month' ? 30 : 7;
          for (let i = days - 1; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const dateKey = d.toISOString().split('T')[0];
              const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
              const total = orders
                  .filter(o => o.status === OrderStatus.COMPLETED && o.date === dateKey)
                  .reduce((sum, o) => sum + o.total, 0);
              dataPoints.push({ label: timeRange === 'week' ? d.toLocaleDateString('en-US', { weekday: 'short' }) : dayLabel, fullDate: dateKey, value: total });
          }
      }
      return dataPoints;
  }, [orders, timeRange]);

  const growthStats = useMemo(() => {
      const currentRevenue = chartData.reduce((sum, d) => sum + d.value, 0);
      let prevRevenue = 0;
      if (timeRange === 'week') {
          for(let i=14; i>=7; i--) {
             const d = new Date(); d.setDate(d.getDate() - i);
             const k = d.toISOString().split('T')[0];
             prevRevenue += orders.filter(o => o.status === OrderStatus.COMPLETED && o.date === k).reduce((s,o)=>s+o.total,0);
          }
      } else {
          prevRevenue = currentRevenue * 0.8;
      }
      const percent = prevRevenue === 0 ? 100 : ((currentRevenue - prevRevenue) / prevRevenue) * 100;
      return { value: currentRevenue, percent: percent.toFixed(1), isPositive: percent >= 0 };
  }, [chartData, orders, timeRange]);

  // Form States
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProd, setNewProd] = useState({ title: '', price: '', type: ProductType.PROMPT, desc: '', downloadUrl: '', image: '', features: [] as string[] });
  
  // Bonus Form State
  const [isAddingBonus, setIsAddingBonus] = useState(false);
  const [newBonus, setNewBonus] = useState({ title: '', desc: '', downloadUrl: '', image: '' });

  // Service Form State
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newService, setNewService] = useState({ title: '', description: '', price: '', icon: 'Bot' });

  // Resource (Program) Form State
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [resourceForm, setResourceForm] = useState({ title: '', description: '', category: 'OTHER', image: '', downloadUrl: '', version: '' });
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [customTagInput, setCustomTagInput] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [bonusToDelete, setBonusToDelete] = useState<string | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [ticketAction, setTicketAction] = useState<{ id: string, type: 'CLOSE' | 'DELETE' } | null>(null);
  
  const [settingsForm, setSettingsForm] = useState({
    botToken: telegramSettings.botToken,
    chatId: telegramSettings.adminChatId,
    botUsername: telegramSettings.botUsername,
    emailServiceId: telegramSettings.emailServiceId || '',
    emailTemplateId: telegramSettings.emailTemplateId || '',
    emailPublicKey: telegramSettings.emailPublicKey || '',
  });

  // Storefront Form State
  const [storefrontForm, setStorefrontForm] = useState({
      mode: trendingConfig.mode,
      ids: trendingConfig.manualProductIds
  });

  useEffect(() => {
      setStorefrontForm({
          mode: trendingConfig.mode,
          ids: trendingConfig.manualProductIds
      });
  }, [trendingConfig]);

  const PRESET_TAGS = ['ZIP', 'RAR', 'PDF', 'MP4', 'TXT', 'Source Code', 'Instant Access', 'Guide', 'Digital Asset', 'Free'];
  const SERVICE_ICONS = ['Bot', 'Shield', 'Code', 'Server', 'Database', 'Globe', 'Cpu', 'Zap'];

  // Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setNewProd(prev => ({ ...prev, image: reader.result as string })); reader.readAsDataURL(file); } };
  const handleBonusImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setNewBonus(prev => ({ ...prev, image: reader.result as string })); reader.readAsDataURL(file); } };
  const handleServiceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setNewService(prev => ({ ...prev, icon: reader.result as string })); reader.readAsDataURL(file); } };
  const handleResourceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setResourceForm(prev => ({ ...prev, image: reader.result as string })); reader.readAsDataURL(file); } };
  
  const toggleFeature = (tag: string) => { setNewProd(prev => { const exists = prev.features.includes(tag); if (exists) return { ...prev, features: prev.features.filter(f => f !== tag) }; return { ...prev, features: [...prev.features, tag] }; }); };
  const addCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => { if ((e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') || !customTagInput.trim()) return; e.preventDefault(); const tag = customTagInput.trim(); if (!newProd.features.includes(tag)) { setNewProd(prev => ({ ...prev, features: [...prev.features, tag] })); } setCustomTagInput(''); };
  
  const handleProductSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!newProd.title || (!newProd.price && newProd.price !== '0') || !newProd.downloadUrl) { alert(language === 'RU' ? 'Заполните поля' : 'Fill required fields'); return; } const finalImage = newProd.image || `https://picsum.photos/400/300?random=${Date.now()}`; const finalFeatures = newProd.features.length > 0 ? newProd.features : ['Digital Asset']; const productData: Product = { id: editingId || Date.now().toString(), title: newProd.title, price: parseFloat(newProd.price), type: newProd.type as ProductType, description: newProd.desc, image: finalImage, downloadUrl: newProd.downloadUrl, language: 'EN', features: finalFeatures, features_ru: finalFeatures }; if (editingId) updateProduct(productData); else addProduct(productData); resetProductForm(); };
  
  const handleBonusSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newBonus.title || !newBonus.downloadUrl) {
          alert('Title and Download Link are required');
          return;
      }
      const bonusData: Product = {
          id: `bonus-${Date.now()}`,
          title: newBonus.title,
          title_ru: newBonus.title, 
          description: newBonus.desc,
          description_ru: newBonus.desc,
          price: 0,
          type: ProductType.MANUAL, 
          image: newBonus.image || `https://picsum.photos/400/300?random=${Date.now()}`,
          downloadUrl: newBonus.downloadUrl,
          language: 'EN',
          features: ['Bonus', 'Gift', 'Exclusive'],
          features_ru: ['Бонус', 'Подарок', 'Эксклюзив']
      };
      addBonusItem(bonusData);
      setNewBonus({ title: '', desc: '', downloadUrl: '', image: '' });
      setIsAddingBonus(false);
  }

  const handleServiceSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const serviceData: ServiceOffering = {
          id: editingServiceId || `svc-${Date.now()}`,
          title: newService.title,
          description: newService.description,
          price: newService.price,
          icon: newService.icon
      };
      
      if (editingServiceId) {
          updateServiceOffering(serviceData);
      } else {
          addServiceOffering(serviceData);
      }
      setIsAddingService(false);
      setEditingServiceId(null);
      setNewService({ title: '', description: '', price: '', icon: 'Bot' });
  }

  const handleResourceSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const resData: ResourceItem = {
          id: editingResourceId || `res-${Date.now()}`,
          title: resourceForm.title,
          description: resourceForm.description,
          category: resourceForm.category,
          image: resourceForm.image || `https://picsum.photos/400/300?random=${Date.now()}`,
          downloadUrl: resourceForm.downloadUrl,
          version: resourceForm.version,
          dateAdded: new Date().toISOString().split('T')[0]
      };
      if (editingResourceId) {
          updateResource(resData);
      } else {
          addResource(resData);
      }
      setIsAddingResource(false);
      setEditingResourceId(null);
      setResourceForm({ title: '', description: '', category: 'OTHER', image: '', downloadUrl: '', version: '' });
  };

  const handleEditService = (service: ServiceOffering) => {
      setNewService({ title: service.title, description: service.description, price: service.price, icon: service.icon });
      setEditingServiceId(service.id);
      setIsAddingService(true);
  }

  const handleEditClick = (product: Product) => { setNewProd({ title: product.title, price: product.price.toString(), type: product.type, desc: product.description, downloadUrl: product.downloadUrl || '', image: product.image, features: product.features || [] }); setEditingId(product.id); setIsAdding(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const resetProductForm = () => { setIsAdding(false); setEditingId(null); setNewProd({ title: '', price: '', type: ProductType.PROMPT, desc: '', downloadUrl: '', image: '', features: [] }); };
  const toggleFree = (e: React.ChangeEvent<HTMLInputElement>) => { const isFree = e.target.checked; if (isFree) setNewProd(prev => ({ ...prev, price: '0', features: [...new Set([...prev.features, 'Free'])] })); else setNewProd(prev => ({ ...prev, price: '', features: prev.features.filter(f => f !== 'Free') })); }
  const toggleTicket = (ticketId: string) => { if (expandedTicket === ticketId) setExpandedTicket(null); else { setExpandedTicket(ticketId); markTicketAsRead(ticketId); } }
  const toggleReview = (reviewId: string) => { if (expandedReviewId === reviewId) setExpandedReviewId(null); else setExpandedReviewId(reviewId); }
  const handleReplyTicket = (e: React.FormEvent, ticketId: string) => { e.stopPropagation(); e.preventDefault(); if (!replyText[ticketId]) return; adminReply(ticketId, replyText[ticketId]); setReplyText({ ...replyText, [ticketId]: '' }); };
  const requestCloseTicket = (e: React.MouseEvent, ticketId: string) => { e.preventDefault(); e.stopPropagation(); setTicketAction({ id: ticketId, type: 'CLOSE' }); }
  const requestDeleteTicket = (e: React.MouseEvent, ticketId: string) => { e.preventDefault(); e.stopPropagation(); setTicketAction({ id: ticketId, type: 'DELETE' }); }
  
  const confirmTicketAction = () => { 
      if (!ticketAction) return; 
      if (ticketAction.type === 'DELETE') { 
          deleteTicket(ticketAction.id); 
          if (expandedTicket === ticketAction.id) setExpandedTicket(null); 
      } else if (ticketAction.type === 'CLOSE') { 
          closeTicket(ticketAction.id, true); 
      } 
      setTicketAction(null); 
  }
  
  const confirmDeleteReview = () => { if (reviewToDelete) { deleteReview(reviewToDelete); if (expandedReviewId === reviewToDelete) setExpandedReviewId(null); setReviewToDelete(null); } }
  const confirmDeleteProduct = () => { if (productToDelete) { deleteProduct(productToDelete); setProductToDelete(null); } };
  const confirmDeleteBonus = () => { if (bonusToDelete) { deleteBonusItem(bonusToDelete); setBonusToDelete(null); } };
  const confirmDeleteService = () => { if (serviceToDelete) { deleteServiceOffering(serviceToDelete); setServiceToDelete(null); } };
  const confirmDeleteResource = () => { if (resourceToDelete) { deleteResource(resourceToDelete); setResourceToDelete(null); } };
  
  const handleUserEditSave = (e: React.FormEvent) => { e.preventDefault(); if (!editingUser) return; adminUpdateUser(editingUser.id, editingUser); setEditingUser(null); };
  const handlePasswordReset = async () => { if (!editingUser || !user) return; setIsResetting(true); try { const result = await authService.adminResetUserPassword(user, editingUser); alert(result.message); } catch (error) { alert('Error'); } finally { setIsResetting(false); } };
  const confirmDeleteUser = () => { if (userToDelete) { deleteUser(userToDelete); setUserToDelete(null); } };
  
  const handleSaveSettings = (e: React.FormEvent) => { 
      e.preventDefault();
      updateTelegramSettings(settingsForm.botToken, settingsForm.chatId, settingsForm.botUsername, settingsForm.emailServiceId, settingsForm.emailTemplateId, settingsForm.emailPublicKey);
      
      setNotification({
          message: t('Настройки успешно сохранены!', 'Settings saved successfully!'),
          type: 'success'
      });
      setTimeout(() => setNotification(null), 3000);
  };

  const confirmRejection = () => { if (!rejectingOrderId) return; const finalReason = rejectionReason || 'Failed'; updateOrderStatus(rejectingOrderId, OrderStatus.FAILED, finalReason); setRejectingOrderId(null); setRejectionReason(''); }
  const handleApproveClick = (e: React.MouseEvent, orderId: string) => { e.preventDefault(); e.stopPropagation(); setApprovingOrderId(orderId); };
  const confirmApprove = () => { if (approvingOrderId) { updateOrderStatus(approvingOrderId, OrderStatus.COMPLETED); setApprovingOrderId(null); } };
  
  const handleStorefrontSave = () => {
      updateTrendingConfig(storefrontForm.mode as any, storefrontForm.ids);
      setNotification({
          message: t('Настройки витрины успешно сохранены', 'Storefront settings saved successfully'),
          type: 'success'
      });
      setTimeout(() => setNotification(null), 3000);
  };

  const toggleManualProduct = (id: string) => {
      const currentIds = storefrontForm.ids;
      if (currentIds.includes(id)) {
          setStorefrontForm({ ...storefrontForm, ids: currentIds.filter(pid => pid !== id) });
      } else {
          setStorefrontForm({ ...storefrontForm, ids: [...currentIds, id] });
      }
  };

  const handleTabClick = (tabId: any) => {
      setActiveTab(tabId);
      setIsMobileMenuOpen(false);
  };

  const totalRevenueLifetime = orders.reduce((sum, order) => sum + (order.status === OrderStatus.COMPLETED ? order.total : 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === OrderStatus.PROCESSING).length;
  
  const STATUS_LABELS = { [OrderStatus.PENDING]: language === 'RU' ? 'Ожидает' : 'Pending', [OrderStatus.PROCESSING]: language === 'RU' ? 'Проверка' : 'Processing', [OrderStatus.COMPLETED]: language === 'RU' ? 'Выполнен' : 'Completed', [OrderStatus.FAILED]: language === 'RU' ? 'Отклонен' : 'Failed' };
  const ROLE_ICONS = { [UserRole.ADMIN]: ShieldAlert, [UserRole.EDITOR]: FileText, [UserRole.SUPPORT]: Headphones, [UserRole.USER]: UserIcon };
  const ROLE_COLORS = { [UserRole.ADMIN]: 'text-red-400 bg-red-500/10 border-red-500/20', [UserRole.EDITOR]: 'text-purple-400 bg-purple-500/10 border-purple-500/20', [UserRole.SUPPORT]: 'text-orange-400 bg-orange-500/10 border-orange-500/20', [UserRole.USER]: 'text-gray-400 bg-gray-700/50 border-gray-600' };

  if (!user || user.role !== UserRole.ADMIN) return <div className="flex flex-col items-center justify-center h-[60vh] text-red-500"><ShieldAlert size={64} className="mb-4" /><h2 className="text-2xl font-bold font-mono">ACCESS DENIED</h2></div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[85vh] relative">
      <aside className="w-full lg:w-72 flex-shrink-0 bg-cyber-800/40 rounded-xl p-6 border border-white/5 h-fit backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6 lg:mb-8 px-2">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 flex-shrink-0">
                    <ShieldAlert size={20} className="text-red-500" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white leading-none">ROOT PANEL</h2>
                    <span className="text-xs text-gray-500 font-mono">v.2.4.2-secure</span>
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

        <nav className={`space-y-2 ${isMobileMenuOpen ? 'block' : 'hidden'} lg:block transition-all duration-300`}>
          <p className="text-xs font-bold text-gray-500 uppercase px-4 mb-2">{t('Управление', 'Management')}</p>
          <AdminTab label={t('Аналитика', 'Analytics')} icon={BarChart3} active={activeTab === 'overview'} onClick={() => handleTabClick('overview')} />
          <AdminTab label={t('Пользователи', 'Users')} icon={Users} active={activeTab === 'users'} onClick={() => handleTabClick('users')} />
          <AdminTab label={t('Товары', 'Products')} icon={ShoppingBag} active={activeTab === 'products'} onClick={() => handleTabClick('products')} />
          <AdminTab label={t('Бонусы', 'Bonuses')} icon={Gift} active={activeTab === 'bonuses'} onClick={() => handleTabClick('bonuses')} />
          <AdminTab label={t('Программы', 'Programs')} icon={MonitorPlay} active={activeTab === 'programs'} onClick={() => handleTabClick('programs')} />
          <AdminTab label={t('Услуги', 'Services')} icon={Briefcase} active={activeTab === 'services'} onClick={() => handleTabClick('services')} />
          <AdminTab label={t('Заказы', 'Orders')} icon={DollarSign} active={activeTab === 'orders'} onClick={() => handleTabClick('orders')} hasBadge={pendingOrdersCount > 0} badgeCount={pendingOrdersCount} />
          <AdminTab label={t('Заявки', 'Requests')} icon={ClipboardList} active={activeTab === 'requests'} onClick={() => handleTabClick('requests')} hasBadge={serviceRequests.filter(r => r.status === 'NEW').length > 0} badgeCount={serviceRequests.filter(r => r.status === 'NEW').length} />
          
          <p className="text-xs font-bold text-gray-500 uppercase px-4 mb-2 mt-6">{t('Магазин', 'Storefront')}</p>
          <AdminTab label={t('Витрина', 'Trending Config')} icon={LayoutTemplate} active={activeTab === 'storefront'} onClick={() => handleTabClick('storefront')} />

          <p className="text-xs font-bold text-gray-500 uppercase px-4 mb-2 mt-6">{t('Коммуникация', 'Communication')}</p>
          <AdminTab label={t('Поддержка', 'Support')} icon={MessageSquare} active={activeTab === 'support'} onClick={() => handleTabClick('support')} hasBadge={unreadCount > 0} badgeCount={unreadCount} />
          <AdminTab label={t('Отзывы', 'Reviews')} icon={Star} active={activeTab === 'reviews'} onClick={() => handleTabClick('reviews')} />
          <p className="text-xs font-bold text-gray-500 uppercase px-4 mb-2 mt-6">{t('Система', 'System')}</p>
          <AdminTab label={t('Настройки', 'Settings')} icon={Settings} active={activeTab === 'settings'} onClick={() => handleTabClick('settings')} />
        </nav>
      </aside>

      <div className="flex-grow bg-cyber-800/20 rounded-xl border border-white/5 p-6 lg:p-8 backdrop-blur-sm relative overflow-hidden">
        
        {activeTab === 'overview' && (
             <div className="space-y-8 animate-in fade-in duration-500">
                
                {/* Header with Live Status */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-3xl font-bold mb-1 flex items-center gap-3">
                            {t('Дашборд', 'Dashboard')}
                            <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono animate-pulse ${
                                serverStatus === 'Online' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 
                                serverStatus === 'Offline' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
                                'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${serverStatus === 'Online' ? 'bg-green-500' : serverStatus === 'Offline' ? 'bg-red-500' : 'bg-yellow-500'}`}></span> 
                                {serverStatus === 'Online' ? 'SERVER ONLINE' : serverStatus === 'Offline' ? 'SERVER OFFLINE' : 'CONNECTING...'}
                            </span>
                        </h3>
                        <p className="text-gray-400 text-sm">{t('Мониторинг в реальном времени', 'Real-time monitoring system')}</p>
                    </div>
                    
                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                        {(['week', 'month', 'year'] as const).map((r) => (
                            <button key={r} onClick={() => setTimeRange(r)} className={`px-4 py-1.5 rounded text-xs font-bold uppercase transition-all ${timeRange === r ? 'bg-cyber-primary text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>{t(r === 'week' ? 'Неделя' : r === 'month' ? 'Месяц' : 'Год', r)}</button>
                        ))}
                    </div>
                </div>

                {/* Real-time Status Bar - UPDATED WITH REAL API CHECK */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/30 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Globe size={20} /></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">API Status</p>
                                <p className={`text-xl font-mono font-bold ${serverStatus === 'Online' ? 'text-green-400' : 'text-red-400'}`}>{serverStatus}</p>
                            </div>
                        </div>
                        <div className="h-8 w-20">
                            <svg viewBox="0 0 100 40" className="w-full h-full"><path d="M0 20 Q 25 10 50 20 T 100 20" fill="none" stroke={serverStatus === 'Online' ? '#4ADE80' : '#EF4444'} strokeWidth="2" className="animate-pulse" /></svg>
                        </div>
                    </div>
                    <div className="bg-black/30 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Server size={20} /></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Latency</p>
                                <p className="text-xl font-mono text-white font-bold">{latency > 0 ? `${latency}ms` : '--'}</p>
                            </div>
                        </div>
                        <div className="w-20 bg-gray-800 rounded-full h-1.5 mt-2">
                            <div className={`h-1.5 rounded-full transition-all duration-1000 ${latency < 100 ? 'bg-green-500' : latency < 500 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (latency / 500) * 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-black/30 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><Database size={20} /></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Last Check</p>
                                <p className="text-xl font-mono text-white font-bold">{lastCheck.toLocaleTimeString()}</p>
                            </div>
                        </div>
                        <Activity size={20} className="text-green-500 animate-pulse" />
                    </div>
                </div>
                
                {/* KPI Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard title={t('Общая выручка', 'Total Revenue')} value={`${totalRevenueLifetime.toLocaleString('ru-RU')} ₽`} trend={`+${growthStats.percent}%`} isPositive={growthStats.isPositive} icon={DollarSign} color="text-green-400" sparkline={true} />
                    <KPICard title={t('Активные пользователи', 'Active Users')} value={allUsers.length.toString()} trend="+5.2%" isPositive={true} icon={Users} color="text-cyber-primary" sparkline={true} />
                    <KPICard title={t('Новые заказы', 'New Orders')} value={orders.length.toString()} trend="-2.1%" isPositive={false} icon={ShoppingBag} color="text-orange-400" sparkline={true} />
                    <KPICard title={t('Средний чек', 'Avg Order Value')} value={`${(totalRevenueLifetime / (orders.length || 1)).toLocaleString('ru-RU')} ₽`} trend="+0.8%" isPositive={true} icon={BarChart3} color="text-purple-400" sparkline={true} />
                </div>
                
                {/* Main Chart */}
                <div className="bg-cyber-900/50 p-6 rounded-xl border border-white/5 relative overflow-hidden shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-bold flex items-center gap-2">
                            <BarChart3 className="text-cyber-primary" size={20} />
                            {t('Динамика доходов', 'Revenue Dynamics')}
                        </h4>
                        <span className="text-xs text-gray-500 bg-black/40 px-2 py-1 rounded border border-white/5">Auto-updating</span>
                    </div>
                    <RevenueChart data={chartData} timeRange={timeRange} />
                </div>
             </div>
        )}

        {/* ... (ALL OTHER TABS PRESERVED EXACTLY AS IS) ... */}
        {activeTab === 'users' && (
          <div>
            <h3 className="text-2xl font-bold mb-6">{t('Управление пользователями', 'User Management')}</h3>
            <div className="bg-cyber-900/30 rounded-xl border border-white/5 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-black/20 text-gray-400 border-b border-white/10">
                  <tr><th className="p-4">{t('Пользователь', 'User')}</th><th className="p-4">{t('Роль', 'Role')}</th><th className="p-4">{t('Регистрация', 'Source')}</th><th className="p-4 text-right">{t('Действия', 'Actions')}</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allUsers.map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 flex items-center space-x-3"><img src={u.avatarUrl || 'https://via.placeholder.com/30'} alt="" className="w-10 h-10 rounded-full object-cover" /><div><span className="font-medium block">{u.name}</span><span className="text-xs text-gray-500">{u.email}</span></div></td>
                          <td className="p-4"><span className="text-[10px] font-bold px-2 py-1 rounded-md border flex items-center gap-1 w-fit border-gray-600 bg-gray-700/50 text-gray-400">{u.role}</span></td>
                          <td className="p-4"><div className="flex items-center gap-2 text-xs text-gray-400">{u.registrationSource === 'TELEGRAM' ? <Send size={14} className="text-[#24A1DE]" /> : <Mail size={14} className="text-gray-400" />}<span className="font-mono">{u.registrationSource}</span></div></td>
                          <td className="p-4 flex justify-end space-x-2"><button onClick={() => setEditingUser(u)} className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-500/10 rounded"><Edit size={16} /></button><button onClick={() => setUserToDelete(u.id)} className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded"><Trash size={16} /></button></td>
                        </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ... (Products, Bonuses, Services, Programs tabs below) ... */}
        {activeTab === 'products' && (
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div><h3 className="text-2xl font-bold">{t('Каталог товаров', 'Product Catalog')}</h3></div>
                    <button onClick={() => { resetProductForm(); setIsAdding(!isAdding); }} className="bg-cyber-primary text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                        <Plus size={18} /> {t('Добавить товар', 'Add Product')}
                    </button>
                </div>
                {isAdding && (
                    <form onSubmit={handleProductSubmit} className="bg-cyber-900/80 p-6 rounded-xl mb-8 border border-cyber-primary/30 shadow-lg animate-in slide-in-from-top-4">
                        <h4 className="font-bold mb-4 text-cyber-primary">{editingId ? t('Редактирование', 'Edit Product') : t('Новый товар', 'New Asset')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                             <div>
                                <label className="text-xs text-gray-500 mb-1 block">{t("Название", "Title")}</label>
                                <input value={newProd.title} onChange={e => setNewProd({...newProd, title: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-cyber-primary outline-none" required />
                             </div>
                             <div>
                                <label className="text-xs text-gray-500 mb-1 block">{t("Цена (₽)", "Price (RUB)")}</label>
                                <div className="flex gap-2 items-center">
                                    <input type="number" value={newProd.price} onChange={e => setNewProd({...newProd, price: e.target.value})} className={`w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-cyber-primary outline-none ${newProd.price === '0' ? 'opacity-50' : ''}`} required disabled={newProd.price === '0'}/>
                                    <div className="flex items-center gap-2 whitespace-nowrap bg-black/30 px-3 py-3 rounded border border-white/10">
                                        <input type="checkbox" id="freeCheck" checked={newProd.price === '0'} onChange={toggleFree} className="w-4 h-4 accent-green-500" />
                                        <label htmlFor="freeCheck" className="text-xs text-white cursor-pointer font-bold select-none">FREE</label>
                                    </div>
                                </div>
                             </div>
                             <div className="md:col-span-2">
                                <label className="text-xs text-gray-500 mb-2 block">{t("Изображение", "Image")}</label>
                                <div className="flex items-start gap-4">
                                    <div className="relative w-24 h-24 bg-black/30 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center group">
                                        {newProd.image ? (
                                            <img src={newProd.image} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-gray-600" size={24} />
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <label className="cursor-pointer text-cyber-primary">
                                                <Upload size={20} />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="relative mb-2">
                                            <input 
                                                type="text" 
                                                value={newProd.image} 
                                                onChange={e => setNewProd({...newProd, image: e.target.value})} 
                                                className="w-full bg-black/30 border border-white/10 p-3 pl-10 rounded text-white focus:border-cyber-primary outline-none font-mono text-sm" 
                                                placeholder={t("Или вставьте URL...", "Or paste URL...")}
                                            />
                                            <ImageIcon size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                        </div>
                                    </div>
                                </div>
                             </div>
                             <div>
                                <label className="text-xs text-gray-500 mb-1 block">{t("Тип", "Type")}</label>
                                <select value={newProd.type} onChange={e => setNewProd({...newProd, type: e.target.value as ProductType})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-gray-300 focus:border-cyber-primary outline-none">
                                    {Object.values(ProductType).map(pt => <option key={pt} value={pt}>{pt}</option>)}
                                </select>
                             </div>
                             <div>
                                <label className="text-xs text-gray-500 mb-1 block">{t("Ссылка на файл", "File Link")}</label>
                                <input type="text" value={newProd.downloadUrl} onChange={e => setNewProd({...newProd, downloadUrl: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-cyber-primary outline-none" required />
                             </div>
                             <div className="md:col-span-2">
                                <label className="text-xs text-gray-500 mb-2 block">{t("Теги", "Tags")}</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {newProd.features.map(tag => (
                                        <span key={tag} className="flex items-center gap-1 bg-cyber-primary text-black px-2 py-1 rounded text-xs font-bold">
                                            {tag}
                                            <X size={12} className="cursor-pointer hover:text-red-600" onClick={() => toggleFeature(tag)} />
                                        </span>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2 items-center">
                                    {PRESET_TAGS.map(tag => (
                                        <button key={tag} type="button" onClick={() => toggleFeature(tag)} className={`text-xs px-2 py-1 rounded border transition-colors ${newProd.features.includes(tag) ? 'bg-cyber-800 text-gray-500 border-gray-700 opacity-50 cursor-not-allowed' : 'bg-black/30 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'}`} disabled={newProd.features.includes(tag)}>{tag}</button>
                                    ))}
                                    <div className="relative flex items-center">
                                        <Tag size={12} className="absolute left-2 text-gray-500" />
                                        <input type="text" value={customTagInput} onChange={(e) => setCustomTagInput(e.target.value)} onKeyDown={addCustomTag} placeholder="Add tag..." className="bg-black/30 border border-white/10 rounded px-2 py-1 pl-6 text-xs text-white focus:border-cyber-primary outline-none w-24"/>
                                        <button type="button" onClick={addCustomTag} className="ml-1 text-cyber-primary hover:text-white"><Plus size={14}/></button>
                                    </div>
                                </div>
                             </div>
                             <div className="md:col-span-2">
                                <label className="text-xs text-gray-500 mb-1 block">{t("Описание", "Description")}</label>
                                <textarea rows={3} value={newProd.desc} onChange={e => setNewProd({...newProd, desc: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-cyber-primary outline-none" />
                             </div>
                        </div>
                         <div className="flex justify-end gap-2">
                            <button type="button" onClick={resetProductForm} className="px-4 py-2 text-gray-400 hover:text-white">{t('Отмена', 'Cancel')}</button>
                            <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded font-bold hover:bg-green-600">{editingId ? t('Обновить', 'Update') : t('Сохранить', 'Save Asset')}</button>
                        </div>
                    </form>
                )}
                <div className="bg-cyber-900/30 rounded-xl border border-white/5 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-gray-400 border-b border-white/10">
                            <tr>
                                <th className="p-4">{t('Название', 'Name')}</th>
                                <th className="p-4">{t('Тип', 'Type')}</th>
                                <th className="p-4">{t('Цена', 'Price')}</th>
                                <th className="p-4 text-right">{t('Действия', 'Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-white/5">
                                    <td className="p-4 flex items-center gap-3">
                                        <img src={p.image} className="w-8 h-8 rounded object-cover" alt=""/>
                                        {p.title}
                                    </td>
                                    <td className="p-4"><span className="text-xs bg-gray-700 px-2 py-1 rounded">{p.type}</span></td>
                                    <td className="p-4 font-mono text-cyber-primary">{p.price.toLocaleString('ru-RU')} ₽</td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <button onClick={() => handleEditClick(p)}><Edit size={16}/></button>
                                        <button onClick={() => setProductToDelete(p.id)}><Trash size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'bonuses' && (
             <div className="animate-in fade-in">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                            <Gift className="text-purple-400" /> 
                            {t('Бонусные товары', 'Bonus Items')}
                        </h3>
                    </div>
                    <button onClick={() => setIsAddingBonus(!isAddingBonus)} className="bg-purple-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-purple-600 transition-colors">
                        <Plus size={18} /> {t('Создать бонус', 'Create Bonus')}
                    </button>
                </div>
                {isAddingBonus && (
                    <form onSubmit={handleBonusSubmit} className="bg-cyber-900/80 p-6 rounded-xl mb-8 border border-purple-500/30 shadow-lg animate-in slide-in-from-top-4">
                        <div className="grid grid-cols-1 gap-4">
                            <input value={newBonus.title} onChange={e => setNewBonus({...newBonus, title: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-purple-500 outline-none" required placeholder={t("Название", "Title")} />
                            <div className="flex gap-2">
                                <div className="relative flex-grow">
                                    <input type="text" value={newBonus.image} onChange={e => setNewBonus({...newBonus, image: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-purple-500 outline-none" placeholder={t("URL Изображения", "Image URL")} />
                                    <label className="absolute right-3 top-3 cursor-pointer text-purple-400"><Upload size={18} /><input type="file" className="hidden" accept="image/*" onChange={handleBonusImageUpload} /></label>
                                </div>
                            </div>
                            <input type="text" value={newBonus.downloadUrl} onChange={e => setNewBonus({...newBonus, downloadUrl: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-purple-500 outline-none" required placeholder={t("Ссылка на файл", "File Link")} />
                            <textarea rows={2} value={newBonus.desc} onChange={e => setNewBonus({...newBonus, desc: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-purple-500 outline-none" placeholder={t("Описание", "Description")} />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" onClick={() => setIsAddingBonus(false)} className="px-4 py-2 text-gray-400 hover:text-white">{t('Отмена', 'Cancel')}</button>
                            <button type="submit" className="bg-purple-500 text-white px-6 py-2 rounded font-bold hover:bg-purple-600">{t('Сохранить', 'Save Bonus')}</button>
                        </div>
                    </form>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bonusItems.map(item => (
                        <div key={item.id} className={`relative bg-cyber-900/40 rounded-xl border p-4 flex flex-col transition-all hover:border-purple-500/50 ${bonusProductId === item.id ? 'border-purple-500' : 'border-white/10'}`}>
                            {bonusProductId === item.id && <div className="absolute top-2 right-2 bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={12} /> ACTIVE</div>}
                            <div className="h-32 w-full bg-black/30 rounded-lg mb-4 overflow-hidden relative"><img src={item.image} alt={item.title} className="w-full h-full object-cover" /></div>
                            <h4 className="font-bold text-white mb-1 line-clamp-1">{item.title}</h4>
                            <div className="mt-auto flex gap-2">
                                <button onClick={() => updateBonusProduct(bonusProductId === item.id ? null : item.id)} className={`flex-1 py-2 rounded-lg text-xs font-bold ${bonusProductId === item.id ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-gray-300 hover:bg-purple-500/20'}`}>{bonusProductId === item.id ? t('Отключить', 'Disable') : t('Сделать активным', 'Make Active')}</button>
                                <button onClick={() => setBonusToDelete(item.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 p-2 rounded-lg"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        )}

        {activeTab === 'services' && (
            <div className="animate-in fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div><h3 className="text-2xl font-bold">{t('Управление услугами', 'Manage Services')}</h3></div>
                    <button onClick={() => setIsAddingService(!isAddingService)} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors"><Plus size={18} /> {t('Добавить услугу', 'Add Service')}</button>
                </div>
                {isAddingService && (
                    <form onSubmit={handleServiceSubmit} className="bg-cyber-900/80 p-6 rounded-xl mb-8 border border-blue-500/30 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-blue-500 outline-none" required placeholder={t("Название", "Title")}/>
                            <input value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-blue-500 outline-none" required placeholder={t("Цена", "Price")}/>
                            <div className="md:col-span-2 relative">
                                <input value={newService.icon} onChange={e => setNewService({...newService, icon: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-blue-500 outline-none" placeholder={t("Иконка / URL", "Icon / URL")}/>
                                <label className="absolute right-3 top-3 cursor-pointer text-blue-400"><Upload size={18} /><input type="file" className="hidden" accept="image/*" onChange={handleServiceImageUpload} /></label>
                            </div>
                            <textarea rows={2} value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-blue-500 outline-none md:col-span-2" required placeholder={t("Описание", "Description")}/>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" onClick={() => setIsAddingService(false)} className="px-4 py-2 text-gray-400 hover:text-white">{t('Отмена', 'Cancel')}</button>
                            <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded font-bold hover:bg-blue-600">{t('Сохранить', 'Save Service')}</button>
                        </div>
                    </form>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serviceOfferings.map(s => (
                        <div key={s.id} className="bg-cyber-900/40 rounded-xl border border-white/10 p-6 flex flex-col hover:border-blue-500/30 transition-all group">
                            <h4 className="font-bold text-white mb-2">{s.title}</h4>
                            <p className="text-sm text-gray-400 mb-4 flex-grow">{s.description}</p>
                            <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                                <span className="font-mono text-white font-bold">{s.price}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditService(s)} className="text-blue-400 hover:text-blue-300"><Edit size={16}/></button>
                                    <button onClick={() => setServiceToDelete(s.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- PROGRAMS (RESOURCES) TAB [NEW] --- */}
        {activeTab === 'programs' && (
             <div className="animate-in fade-in">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                            <MonitorPlay className="text-green-400" /> 
                            {t('Программы и Ресурсы', 'Programs & Resources')}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                            {t('Управление контентом для раздела "Программы" в кабинете пользователя.', 'Manage content for the "Programs" section in user dashboard.')}
                        </p>
                    </div>
                    <button 
                        onClick={() => { setIsAddingResource(!isAddingResource); setEditingResourceId(null); setResourceForm({ title: '', description: '', category: 'OTHER', image: '', downloadUrl: '', version: '' }); }} 
                        className="bg-green-500 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-400 transition-colors"
                    >
                        <Plus size={18} /> {t('Добавить ресурс', 'Add Resource')}
                    </button>
                </div>

                {isAddingResource && (
                    <form onSubmit={handleResourceSubmit} className="bg-cyber-900/80 p-6 rounded-xl mb-8 border border-green-500/30 shadow-lg animate-in slide-in-from-top-4">
                        <h4 className="font-bold mb-4 text-green-400">{editingResourceId ? t('Редактировать ресурс', 'Edit Resource') : t('Новый ресурс', 'New Resource')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">{t("Название", "Title")}</label>
                                <input value={resourceForm.title} onChange={e => setResourceForm({...resourceForm, title: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-green-500 outline-none" required />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">{t("Категория (Список или Своя)", "Category (List or Custom)")}</label>
                                <div className="relative">
                                    <input 
                                        list="category-suggestions" 
                                        value={resourceForm.category}
                                        onChange={e => setResourceForm({...resourceForm, category: e.target.value})}
                                        className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-green-500 outline-none uppercase font-mono"
                                        placeholder="VIDEO_EDITING"
                                        required
                                    />
                                    <datalist id="category-suggestions">
                                        {Object.values(ResourceCategory).map(cat => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="text-xs text-gray-500 mb-2 block">{t("Обложка (Картинка) или Ссылка на видео (MP4)", "Cover (Image) or Video Link (MP4)")}</label>
                                <div className="flex gap-4 items-start">
                                    <div className="relative flex-grow">
                                        <input 
                                            placeholder={t("Ссылка на изображение или видео...", "Image or Video URL...")} 
                                            value={resourceForm.image} 
                                            onChange={e => setResourceForm({...resourceForm, image: e.target.value})} 
                                            className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-green-500 outline-none" 
                                        />
                                        <label className="absolute right-3 top-3 cursor-pointer text-green-400 bg-black/50 rounded-full p-1 hover:bg-black/80 transition-colors" title="Upload Image">
                                            <Upload size={16} />
                                            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleResourceImageUpload} />
                                        </label>
                                    </div>
                                    {resourceForm.image && (
                                        <div className="w-20 h-20 bg-black/50 rounded border border-white/10 overflow-hidden flex-shrink-0">
                                            {resourceForm.image.endsWith('.mp4') ? (
                                                <video src={resourceForm.image} className="w-full h-full object-cover" muted autoPlay loop />
                                            ) : (
                                                <img src={resourceForm.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <input placeholder={t("Ссылка на скачивание", "Download Link")} value={resourceForm.downloadUrl} onChange={e => setResourceForm({...resourceForm, downloadUrl: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-green-500 outline-none" required />
                            <input placeholder={t("Версия (например v1.0)", "Version (e.g. v1.0)")} value={resourceForm.version} onChange={e => setResourceForm({...resourceForm, version: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-green-500 outline-none" />
                            
                            <textarea placeholder={t("Описание", "Description")} rows={3} value={resourceForm.description} onChange={e => setResourceForm({...resourceForm, description: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-green-500 outline-none md:col-span-2" />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" onClick={() => {setIsAddingResource(false); setEditingResourceId(null); }} className="px-4 py-2 text-gray-400 hover:text-white">{t('Отмена', 'Cancel')}</button>
                            <button type="submit" className="bg-green-500 text-black px-6 py-2 rounded font-bold hover:bg-green-400">{t('Сохранить', 'Save Resource')}</button>
                        </div>
                    </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map(item => (
                        <div key={item.id} className="bg-cyber-900/40 rounded-xl border border-white/10 p-4 flex flex-col hover:border-green-500/30 transition-all group">
                            <div className="h-40 w-full bg-black/30 rounded-lg mb-4 overflow-hidden relative">
                                {item.image.endsWith('.mp4') ? (
                                    <video src={item.image} className="w-full h-full object-cover" muted loop onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
                                ) : (
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                )}
                                <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-green-400 border border-green-500/30 uppercase backdrop-blur-md">
                                    {item.category}
                                </div>
                            </div>
                            <h4 className="font-bold text-white mb-1 line-clamp-1">{item.title}</h4>
                            <p className="text-xs text-gray-500 mb-2">{item.version ? `v${item.version}` : ''} • {item.dateAdded}</p>
                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{item.description}</p>
                            
                            <div className="mt-auto flex gap-2">
                                <button onClick={() => { 
                                    setEditingResourceId(item.id); 
                                    setResourceForm({
                                        title: item.title,
                                        description: item.description,
                                        category: item.category,
                                        image: item.image,
                                        downloadUrl: item.downloadUrl,
                                        version: item.version || ''
                                    }); 
                                    setIsAddingResource(true); 
                                    window.scrollTo(0,0); 
                                }} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold py-2 rounded transition-colors border border-white/5 hover:border-white/20">{t('Изменить', 'Edit')}</button>
                                <button onClick={() => setResourceToDelete(item.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded border border-red-500/20 transition-colors"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    {resources.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500 border border-white/5 border-dashed rounded-xl">
                            {t('Список программ пуст. Добавьте первый ресурс!', 'Programs list is empty. Add your first resource!')}
                        </div>
                    )}
                </div>
             </div>
        )}

        {/* UPDATED ORDERS TAB WITH WORKING BUTTONS */}
        {activeTab === 'orders' && (
            <div>
                <h3 className="text-2xl font-bold mb-6">{t('История заказов', 'Order History')}</h3>
                <div className="bg-cyber-900/30 rounded-xl border border-white/5 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-gray-400 border-b border-white/10">
                            <tr>
                                <th className="p-4">ID / Date</th>
                                <th className="p-4">User</th>
                                <th className="p-4">Total / Method</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {orders.map(o => (
                                <tr key={o.id} className="hover:bg-white/5">
                                    <td className="p-4">
                                        <div className="font-mono text-sm">{o.id}</div>
                                        <div className="text-xs text-gray-500">{o.date}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm font-bold text-white">{allUsers.find(u => u.id === o.userId)?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{o.userId}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold">{o.total.toLocaleString('ru-RU')} ₽</div>
                                        {o.paymentMethod && (
                                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                                <CreditCard size={12} /> {o.paymentMethod}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded font-bold ${
                                                o.status === OrderStatus.COMPLETED ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                o.status === OrderStatus.PROCESSING ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                o.status === OrderStatus.FAILED ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                'bg-gray-700 text-gray-300 border border-gray-600'
                                            }`}>{STATUS_LABELS[o.status]}</span>
                                            
                                            {o.status === OrderStatus.PROCESSING && (
                                                <div className="flex gap-1 ml-2">
                                                    <button 
                                                        onClick={(e) => handleApproveClick(e, o.id)} 
                                                        className="bg-green-500/20 hover:bg-green-500/30 text-green-400 p-1.5 rounded transition-colors" 
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={16}/>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.preventDefault(); setRejectingOrderId(o.id); }} 
                                                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-1.5 rounded transition-colors" 
                                                        title="Reject"
                                                    >
                                                        <XCircle size={16}/>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {o.rejectionReason && <p className="text-xs text-red-400 mt-1">{o.rejectionReason}</p>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* UPDATED REQUESTS TAB WITH RUSSIAN STATUSES */}
        {activeTab === 'requests' && (
            <div className="animate-in fade-in">
                <h3 className="text-2xl font-bold mb-6">{t('Заявки на услуги', 'Service Requests')}</h3>
                <div className="space-y-4">
                    {serviceRequests.map(req => (
                        <div key={req.id} className="bg-cyber-900/30 p-6 rounded-xl border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row gap-6">
                            {/* Left Side: Info */}
                            <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-blue-500/10 text-blue-400 p-2 rounded-lg"><Briefcase size={20} /></span>
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{req.serviceType}</h4>
                                        <p className="text-xs text-gray-500 font-mono">ID: {req.id}</p>
                                    </div>
                                </div>
                                
                                <div className="bg-black/40 p-3 rounded-lg border border-white/5 mb-3">
                                    <p className="text-sm text-gray-300 italic">"{req.comment}"</p>
                                </div>

                                <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><UserIcon size={14}/> {allUsers.find(u => u.id === req.userId)?.name || 'Unknown'}</span>
                                    <span className="flex items-center gap-1"><Smartphone size={14}/> <span className="text-white font-bold">{req.contact}</span></span>
                                    <span className="flex items-center gap-1"><Calendar size={14}/> {req.date}</span>
                                </div>
                            </div>

                            {/* Right Side: Controls */}
                            <div className="flex flex-col gap-3 min-w-[200px] border-l border-white/5 pl-0 md:pl-6">
                                <label className="text-xs font-bold text-gray-500 uppercase">Статус заявки</label>
                                <div className="relative">
                                    <select 
                                        value={req.status} 
                                        onChange={(e) => updateServiceRequestStatus(req.id, e.target.value as any)} 
                                        className={`w-full appearance-none p-3 rounded-lg text-sm font-bold outline-none border transition-colors cursor-pointer ${
                                            req.status === 'NEW' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 
                                            req.status === 'IN_WORK' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 
                                            'bg-green-500/10 text-green-400 border-green-500/30'
                                        }`}
                                    >
                                        <option value="NEW">🔵 НОВАЯ</option>
                                        <option value="IN_WORK">🟠 В РАБОТЕ</option>
                                        <option value="COMPLETED">🟢 ЗАВЕРШЕНО</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-3.5 pointer-events-none opacity-50" />
                                </div>

                                <button 
                                    onClick={() => deleteServiceRequest(req.id)} 
                                    className="mt-auto w-full py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Trash2 size={14} /> {t('Удалить заявку', 'Delete Request')}
                                </button>
                            </div>
                        </div>
                    ))}
                    {serviceRequests.length === 0 && (
                        <div className="text-center py-12 text-gray-500 border border-white/5 border-dashed rounded-xl">
                            {t('Заявок пока нет.', 'No requests yet.')}
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'storefront' && (
            <div className="animate-in fade-in">
                <h3 className="text-2xl font-bold mb-6">{t('Настройка витрины', 'Storefront Settings')}</h3>
                <div className="bg-cyber-900/40 p-6 rounded-xl border border-white/5">
                    <div className="flex items-center gap-4 mb-6">
                        <LayoutTemplate size={32} className="text-cyber-primary" />
                        <div>
                            <h4 className="font-bold text-white">{t('Популярные товары', 'Trending Products')}</h4>
                            <p className="text-xs text-gray-500">{t('Выберите, какие товары отображать на главной.', 'Choose which products to show on home page.')}</p>
                        </div>
                    </div>

                    <div className="flex gap-4 mb-6">
                        <button 
                            onClick={() => setStorefrontForm({...storefrontForm, mode: 'AUTOMATIC'})}
                            className={`flex-1 py-3 rounded-lg border text-sm font-bold transition-all ${storefrontForm.mode === 'AUTOMATIC' ? 'bg-cyber-primary/20 border-cyber-primary text-cyber-primary' : 'bg-black/30 border-white/10 text-gray-400'}`}
                        >
                            {t('Автоматически (Топ продаж)', 'Automatic (Top Sales)')}
                        </button>
                        <button 
                            onClick={() => setStorefrontForm({...storefrontForm, mode: 'MANUAL'})}
                            className={`flex-1 py-3 rounded-lg border text-sm font-bold transition-all ${storefrontForm.mode === 'MANUAL' ? 'bg-cyber-primary/20 border-cyber-primary text-cyber-primary' : 'bg-black/30 border-white/10 text-gray-400'}`}
                        >
                            {t('Вручную', 'Manual Selection')}
                        </button>
                    </div>

                    {storefrontForm.mode === 'MANUAL' && (
                        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {products.map(p => (
                                <div key={p.id} onClick={() => toggleManualProduct(p.id)} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${storefrontForm.ids.includes(p.id) ? 'bg-green-500/10 border-green-500/30' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${storefrontForm.ids.includes(p.id) ? 'bg-green-500 border-green-500 text-black' : 'border-gray-600'}`}>
                                        {storefrontForm.ids.includes(p.id) && <CheckCircle size={14} />}
                                    </div>
                                    <img src={p.image} className="w-10 h-10 rounded object-cover" />
                                    <span className="text-sm font-medium">{p.title}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <button onClick={handleStorefrontSave} className="bg-cyber-primary text-black px-6 py-2 rounded-lg font-bold hover:bg-cyan-400 transition-colors w-full">{t('Сохранить настройки', 'Save Configuration')}</button>
                </div>
            </div>
        )}

        {activeTab === 'support' && (
            <div className="h-full flex flex-col">
                <h3 className="text-2xl font-bold mb-6">{t('Техподдержка', 'Support Tickets')}</h3>
                <div className="space-y-4">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="bg-cyber-900/30 rounded-xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
                            <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5" onClick={() => toggleTicket(ticket.id)}>
                                <div>
                                    <span className="font-bold text-sm block">{ticket.subject}</span>
                                    <span className="text-xs text-gray-500">User: {ticket.userId} • {ticket.date}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`bg-white/10 px-2 py-1 rounded text-[10px] font-bold uppercase ${ticket.status === 'OPEN' ? 'text-green-400 border border-green-500/30' : 'text-gray-400'}`}>{ticket.status}</span>
                                    {expandedTicket === ticket.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </div>
                            {expandedTicket === ticket.id && (
                                <div className="border-t border-white/5 p-4 bg-black/20 animate-in slide-in-from-top-2">
                                    <div className="max-h-60 overflow-y-auto mb-4 space-y-3 pr-2 custom-scrollbar">
                                        {ticket.messages.map((m, i) => (
                                            <div key={i} className={`flex flex-col ${m.sender === 'ADMIN' ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[80%] p-2 rounded text-sm ${m.sender === 'ADMIN' ? 'bg-cyber-primary text-black rounded-tr-none' : 'bg-gray-800 text-white rounded-tl-none'}`}>{m.text}</div>
                                                <span className="text-[10px] text-gray-600 mt-1">{m.timestamp}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input value={replyText[ticket.id] || ''} onChange={e => setReplyText({...replyText, [ticket.id]: e.target.value})} className="flex-grow bg-black/40 border border-white/10 rounded px-3 text-sm text-white focus:border-cyber-primary outline-none" placeholder={t("Ответить...", "Reply...")} />
                                        <button onClick={(e) => handleReplyTicket(e, ticket.id)} className="bg-cyber-primary text-black p-2 rounded hover:bg-cyan-400 transition-colors"><Send size={16}/></button>
                                        <button onClick={(e) => requestCloseTicket(e, ticket.id)} className="bg-gray-700 text-white p-2 rounded hover:bg-gray-600 transition-colors" title="Close Ticket"><CheckCircle size={16}/></button>
                                        <button onClick={(e) => requestDeleteTicket(e, ticket.id)} className="bg-red-500/20 text-red-400 p-2 rounded hover:bg-red-500/30 transition-colors" title="Delete Chat"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'reviews' && (
            <div>
                <h3 className="text-2xl font-bold mb-6">{t('Отзывы пользователей', 'User Reviews')}</h3>
                <div className="grid gap-4">
                    {reviews.map(review => (
                        <div key={review.id} className="bg-cyber-900/30 p-4 rounded-xl border border-white/5 relative group hover:border-white/10 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-cyber-800 flex items-center justify-center text-cyber-primary font-bold border border-white/5">{review.userName.charAt(0)}</div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{review.userName}</h4>
                                        <p className="text-xs text-gray-500">{review.productName}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 text-yellow-500">
                                    {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                </div>
                            </div>
                            <p className="mt-3 text-sm text-gray-300 italic">"{review.text}"</p>
                            <button onClick={() => setReviewToDelete(review.id)} className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 p-1 rounded"><Trash2 size={16}/></button>
                        </div>
                    ))}
                    {reviews.length === 0 && <p className="text-gray-500">{t('Отзывов пока нет.', 'No reviews yet.')}</p>}
                </div>
            </div>
        )}

        {activeTab === 'settings' && (
            <div className="animate-in fade-in">
                <h3 className="text-2xl font-bold mb-6">{t('Системные настройки', 'System Settings')}</h3>
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
                    <div className="bg-cyber-900/40 p-6 rounded-xl border border-white/5">
                        <h4 className="font-bold mb-4 flex items-center gap-2 text-blue-400"><Send size={18}/> Telegram Integration</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Bot Token</label>
                                <input type="password" value={settingsForm.botToken} onChange={e => setSettingsForm({...settingsForm, botToken: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-blue-500 outline-none font-mono text-sm" placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Admin Chat ID</label>
                                <input type="text" value={settingsForm.chatId} onChange={e => setSettingsForm({...settingsForm, chatId: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-blue-500 outline-none font-mono text-sm" placeholder="123456789" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Bot Username (without @)</label>
                                <input type="text" value={settingsForm.botUsername} onChange={e => setSettingsForm({...settingsForm, botUsername: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-blue-500 outline-none font-mono text-sm" placeholder="MyCoolBot" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-cyber-900/40 p-6 rounded-xl border border-white/5">
                        <h4 className="font-bold mb-4 flex items-center gap-2 text-orange-400"><Mail size={18}/> EmailJS Configuration</h4>
                        <div className="space-y-4">
                            <input type="text" value={settingsForm.emailServiceId} onChange={e => setSettingsForm({...settingsForm, emailServiceId: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-orange-500 outline-none font-mono text-sm" placeholder="Service ID" />
                            <input type="text" value={settingsForm.emailTemplateId} onChange={e => setSettingsForm({...settingsForm, emailTemplateId: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-orange-500 outline-none font-mono text-sm" placeholder="Template ID" />
                            <input type="text" value={settingsForm.emailPublicKey} onChange={e => setSettingsForm({...settingsForm, emailPublicKey: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white focus:border-orange-500 outline-none font-mono text-sm" placeholder="Public Key" />
                        </div>
                    </div>

                    <button type="submit" className="bg-cyber-primary text-black px-8 py-3 rounded-xl font-bold hover:bg-cyan-400 transition-colors shadow-lg flex items-center gap-2">
                        <Save size={18} /> {t('Сохранить изменения', 'Save Changes')}
                    </button>
                </form>
            </div>
        )}

      </div>
      
      {/* NOTIFICATION TOAST */}
      {notification && (
          <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 z-50 ${notification.type === 'success' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
              {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span className="font-bold">{notification.message}</span>
          </div>
      )}

      {/* MODALS */}
      {approvingOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-cyber-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-green-400">
                      <CheckCircle /> {t('Подтвердить заказ?', 'Confirm Order?')}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                      {t('Заказ будет отмечен как выполненный, а пользователь получит доступ к товарам.', 'Order will be marked as completed and user will get access.')}
                  </p>
                  <div className="flex gap-2">
                      <button onClick={() => setApprovingOrderId(null)} className="flex-1 py-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white transition-colors">{t('Отмена', 'Cancel')}</button>
                      <button onClick={confirmApprove} className="flex-1 py-2 rounded-lg bg-green-500 text-black font-bold hover:bg-green-400 transition-colors">{t('Подтвердить', 'Confirm')}</button>
                  </div>
              </div>
          </div>
      )}

      {rejectingOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-cyber-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-red-400">
                      <XCircle /> {t('Отклонить заказ?', 'Reject Order?')}
                  </h3>
                  <div className="mb-4">
                      <label className="text-xs text-gray-500 mb-1 block">{t('Причина (опционально)', 'Reason (Optional)')}</label>
                      <input 
                          type="text" 
                          value={rejectionReason} 
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-red-500 outline-none"
                          placeholder={t('Например: Оплата не поступила', 'e.g. Payment not received')}
                      />
                  </div>
                  <div className="flex gap-2">
                      <button onClick={() => { setRejectingOrderId(null); setRejectionReason(''); }} className="flex-1 py-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white transition-colors">{t('Отмена', 'Cancel')}</button>
                      <button onClick={confirmRejection} className="flex-1 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">{t('Отклонить', 'Reject')}</button>
                  </div>
              </div>
          </div>
      )}

      {resourceToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-cyber-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-red-400"><Trash2 /> {t('Удалить ресурс?', 'Delete Resource?')}</h3>
                  <div className="flex gap-2">
                      <button onClick={() => setResourceToDelete(null)} className="flex-1 py-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white">{t('Отмена', 'Cancel')}</button>
                      <button onClick={confirmDeleteResource} className="flex-1 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600">{t('Удалить', 'Delete')}</button>
                  </div>
              </div>
          </div>
      )}
      
      {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-cyber-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Trash2 className="text-red-500"/> {t('Удалить пользователя?', 'Delete User?')}</h3>
                  <div className="flex gap-2">
                      <button onClick={() => setUserToDelete(null)} className="flex-1 py-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white">{t('Отмена', 'Cancel')}</button>
                      <button onClick={confirmDeleteUser} className="flex-1 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600">{t('Удалить', 'Delete')}</button>
                  </div>
              </div>
          </div>
      )}

      {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-cyber-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
                  <h3 className="font-bold mb-4 text-red-400">{t('Удалить товар?', 'Delete Product?')}</h3>
                  <div className="flex gap-2">
                      <button onClick={() => setProductToDelete(null)} className="flex-1 py-2 rounded bg-gray-800 hover:text-white">{t('Отмена', 'Cancel')}</button>
                      <button onClick={confirmDeleteProduct} className="flex-1 py-2 rounded bg-red-500 text-white hover:bg-red-600">{t('Удалить', 'Delete')}</button>
                  </div>
              </div>
          </div>
      )}

      {bonusToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-cyber-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
                  <h3 className="font-bold mb-4 text-red-400">{t('Удалить бонус?', 'Delete Bonus?')}</h3>
                  <div className="flex gap-2">
                      <button onClick={() => setBonusToDelete(null)} className="flex-1 py-2 rounded bg-gray-800 hover:text-white">{t('Отмена', 'Cancel')}</button>
                      <button onClick={confirmDeleteBonus} className="flex-1 py-2 rounded bg-red-500 text-white hover:bg-red-600">{t('Удалить', 'Delete')}</button>
                  </div>
              </div>
          </div>
      )}

      {serviceToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-cyber-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
                  <h3 className="font-bold mb-4 text-red-400">{t('Удалить услугу?', 'Delete Service?')}</h3>
                  <div className="flex gap-2">
                      <button onClick={() => setServiceToDelete(null)} className="flex-1 py-2 rounded bg-gray-800 hover:text-white">{t('Отмена', 'Cancel')}</button>
                      <button onClick={confirmDeleteService} className="flex-1 py-2 rounded bg-red-500 text-white hover:bg-red-600">{t('Удалить', 'Delete')}</button>
                  </div>
              </div>
          </div>
      )}

      {reviewToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-cyber-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
                  <h3 className="font-bold mb-4 text-red-400">{t('Удалить отзыв?', 'Delete Review?')}</h3>
                  <div className="flex gap-2">
                      <button onClick={() => setReviewToDelete(null)} className="flex-1 py-2 rounded bg-gray-800 hover:text-white">{t('Отмена', 'Cancel')}</button>
                      <button onClick={confirmDeleteReview} className="flex-1 py-2 rounded bg-red-500 text-white hover:bg-red-600">{t('Удалить', 'Delete')}</button>
                  </div>
              </div>
          </div>
      )}

      {ticketAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-cyber-900 p-6 rounded-xl border border-white/10 shadow-2xl">
                  <h3 className="mb-4 text-white font-bold text-lg flex items-center gap-2">
                      {ticketAction.type === 'DELETE' ? <><Trash2 className="text-red-500"/> {t('Удалить чат?', 'Delete Chat?')}</> : <><CheckCircle className="text-green-500"/> {t('Закрыть тикет?', 'Close Ticket?')}</>}
                  </h3>
                  <div className="flex gap-2">
                      <button onClick={() => setTicketAction(null)} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">{t('Отмена', 'Cancel')}</button>
                      <button onClick={confirmTicketAction} className={`px-4 py-2 text-white rounded font-bold ${ticketAction.type === 'DELETE' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>{t('Подтвердить', 'Confirm')}</button>
                  </div>
              </div>
          </div>
      )}

      {/* Editing User Modal */}
      {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-cyber-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                  <h3 className="font-bold mb-6 text-white text-lg border-b border-white/5 pb-2">{t('Редактировать пользователя', 'Edit User')}</h3>
                  <form onSubmit={handleUserEditSave} className="space-y-4">
                      <div>
                          <label className="text-xs text-gray-500 mb-1 block">{t('Имя', 'Name')}</label>
                          <input type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white outline-none focus:border-cyber-primary transition-colors" />
                      </div>
                      <div>
                          <label className="text-xs text-gray-500 mb-1 block">{t('Роль', 'Role')}</label>
                          <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})} className="w-full bg-black/30 border border-white/10 p-3 rounded text-white outline-none focus:border-cyber-primary transition-colors">
                              {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                      </div>
                      <div className="pt-4 flex justify-between gap-4">
                          <button type="button" onClick={handlePasswordReset} disabled={isResetting} className="text-xs text-cyber-primary hover:text-white underline transition-colors">
                              {isResetting ? t('Отправка...', 'Sending...') : t('Сбросить пароль', 'Reset Password')}
                          </button>
                          <div className="flex gap-2">
                              <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 rounded bg-gray-800 text-gray-300 hover:text-white transition-colors">{t('Отмена', 'Cancel')}</button>
                              <button type="submit" className="px-4 py-2 rounded bg-cyber-primary text-black font-bold hover:bg-cyan-400 transition-colors">{t('Сохранить', 'Save')}</button>
                          </div>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
};
