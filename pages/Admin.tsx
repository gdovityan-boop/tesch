import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Navigate } from 'react-router-dom';
import { UserRole, OrderStatus, TicketStatus, ProductType, Product } from '../types';
import { 
    LayoutDashboard, Users, Box, ShoppingCart, MessageSquare, Briefcase, 
    CheckCircle, XCircle, CreditCard, Shield, Plus, Edit, Trash2, Search,
    FileText, X, Save, ExternalLink, ArrowRight, Clock, TrendingUp, DollarSign, Activity, AlertCircle, BarChart3, Download
} from 'lucide-react';

export const Admin = () => {
    const { 
        user, allUsers, orders, tickets, products, serviceRequests,
        language, updateOrderStatus, deleteUser, adminUpdateUser,
        addProduct, updateProduct, deleteProduct, adminReply, closeTicket,
        updateServiceRequestStatus
    } = useApp();

    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'users' | 'products' | 'tickets' | 'services'>('overview');
    
    // Modal States
    const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    // Product Editing State
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productSearch, setProductSearch] = useState('');

    if (!user || user.role !== UserRole.ADMIN) {
        return <Navigate to="/" replace />;
    }

    const t = (ru: string, en: string) => language === 'RU' ? ru : en;

    const STATUS_LABELS = {
        [OrderStatus.PENDING]: language === 'RU' ? 'Ожидание оплаты' : 'Pending Payment',
        [OrderStatus.PROCESSING]: language === 'RU' ? 'Проверка оплаты' : 'Processing',
        [OrderStatus.COMPLETED]: language === 'RU' ? 'Выполнен' : 'Completed',
        [OrderStatus.FAILED]: language === 'RU' ? 'Отклонен' : 'Failed'
    };

    // --- ANALYTICS CALCULATIONS ---
    const totalRevenue = orders.filter(o => o.status === OrderStatus.COMPLETED).reduce((acc, o) => acc + o.total, 0);
    const pendingRevenue = orders.filter(o => o.status === OrderStatus.PROCESSING).reduce((acc, o) => acc + o.total, 0);
    const totalOrders = orders.length;
    const completedOrdersCount = orders.filter(o => o.status === OrderStatus.COMPLETED).length;
    const activeTicketsCount = tickets.filter(t => t.status !== TicketStatus.RESOLVED).length;
    
    // Mock Chart Data (Revenue last 7 days)
    const chartData = [45, 70, 35, 60, 50, 85, 65]; 

    // --- HANDLERS ---

    const handleApproveClick = (e: React.MouseEvent, orderId: string) => {
        e.preventDefault();
        if (window.confirm(t('Подтвердить выполнение заказа?', 'Approve this order?'))) {
            updateOrderStatus(orderId, OrderStatus.COMPLETED);
            setShowSuccessModal(true);
            setTimeout(() => setShowSuccessModal(false), 3000);
        }
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rejectingOrderId && rejectionReason) {
            updateOrderStatus(rejectingOrderId, OrderStatus.FAILED, rejectionReason);
            setRejectingOrderId(null);
            setRejectionReason('');
        }
    };

    const handleSaveProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        
        if (!editingProduct.id) editingProduct.id = `prod-${Date.now()}`;
        
        // Ensure features is array
        if (typeof editingProduct.features === 'string') {
            editingProduct.features = (editingProduct.features as string).split(',').map((s: string) => s.trim());
        }

        if (products.find(p => p.id === editingProduct.id)) {
            updateProduct(editingProduct);
        } else {
            addProduct(editingProduct);
        }
        setIsProductModalOpen(false);
        setEditingProduct(null);
    };

    const handleDeleteUser = (userId: string) => {
        if (window.confirm(t('Удалить пользователя? Это действие необратимо.', 'Delete user? This is irreversible.'))) {
            deleteUser(userId);
        }
    };

    const handleTicketReply = (ticketId: string, message: string) => {
        if (!message.trim()) return;
        adminReply(ticketId, message);
    };

    const filteredProducts = products.filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase()));

    return (
        <div className="flex flex-col lg:flex-row gap-6 min-h-[85vh] p-4 relative animate-in fade-in duration-500">
            {/* Success Notification */}
            {showSuccessModal && (
                <div className="fixed top-24 right-4 z-[9999] bg-green-500 text-black px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right">
                    <CheckCircle size={24} />
                    <div>
                        <h4 className="font-bold">{t('Успешно!', 'Success!')}</h4>
                        <p className="text-xs">{t('Действие выполнено.', 'Action completed.')}</p>
                    </div>
                </div>
            )}

            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-72 flex-shrink-0 bg-[#0a0a0f] rounded-2xl border border-white/10 p-4 h-fit sticky top-24 shadow-2xl">
                <div className="flex items-center gap-3 px-4 py-4 mb-4 border-b border-white/5">
                    <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500 border border-red-500/20">
                        <Shield size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-white text-lg">Admin Panel</h2>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                </div>
                
                <nav className="space-y-1">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: t('Обзор', 'Dashboard') },
                        { id: 'orders', icon: ShoppingCart, label: t('Заказы', 'Orders'), badge: orders.filter(o => o.status === OrderStatus.PROCESSING).length },
                        { id: 'users', icon: Users, label: t('Пользователи', 'Users') },
                        { id: 'products', icon: Box, label: t('Товары', 'Products') },
                        { id: 'tickets', icon: MessageSquare, label: t('Тикеты', 'Tickets'), badge: activeTicketsCount },
                        { id: 'services', icon: Briefcase, label: t('Услуги', 'Services') },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                                activeTab === item.id 
                                ? 'bg-cyber-primary text-black font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)]' 
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={18} className={activeTab === item.id ? 'text-black' : 'group-hover:text-cyber-primary transition-colors'} />
                                <span>{item.label}</span>
                            </div>
                            {item.badge ? (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === item.id ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
                                    {item.badge}
                                </span>
                            ) : null}
                        </button>
                    ))}
                </nav>

                <div className="mt-8 px-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">System Status</h4>
                        <div className="flex items-center gap-2 text-xs text-green-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Database Connected
                        </div>
                        <div className="flex items-center gap-2 text-xs text-green-400 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            API Operational
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow">
                
                {/* 1. OVERVIEW DASHBOARD */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-[#0a0a0f] p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign size={48}/></div>
                                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{t('Общий доход', 'Total Revenue')}</div>
                                <div className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors">{totalRevenue.toLocaleString()} ₽</div>
                                <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <TrendingUp size={12} className="text-green-500"/> +12.5% {t('за неделю', 'this week')}
                                </div>
                            </div>
                            <div className="bg-[#0a0a0f] p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><ShoppingCart size={48}/></div>
                                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{t('Заказы', 'Orders')}</div>
                                <div className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">{totalOrders}</div>
                                <div className="text-xs text-gray-500 mt-2">{completedOrdersCount} completed</div>
                            </div>
                            <div className="bg-[#0a0a0f] p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Users size={48}/></div>
                                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{t('Пользователи', 'Users')}</div>
                                <div className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors">{allUsers.length}</div>
                                <div className="text-xs text-gray-500 mt-2">Active database</div>
                            </div>
                            <div className="bg-[#0a0a0f] p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><AlertCircle size={48}/></div>
                                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{t('В обработке', 'Pending')}</div>
                                <div className="text-3xl font-bold text-orange-400">{pendingRevenue.toLocaleString()} ₽</div>
                                <div className="text-xs text-gray-500 mt-2">{orders.filter(o => o.status === OrderStatus.PROCESSING).length} orders waiting</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Revenue Chart Simulation */}
                            <div className="lg:col-span-2 bg-[#0a0a0f] rounded-2xl border border-white/10 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-white flex items-center gap-2"><BarChart3 size={18} className="text-cyber-primary"/> {t('Статистика продаж', 'Sales Analytics')}</h3>
                                    <select className="bg-black border border-white/10 rounded-lg text-xs p-2 text-white outline-none">
                                        <option>Last 7 Days</option>
                                        <option>Last Month</option>
                                    </select>
                                </div>
                                <div className="h-64 flex items-end justify-between gap-2">
                                    {chartData.map((val, i) => (
                                        <div key={i} className="w-full bg-white/5 rounded-t-lg relative group hover:bg-cyber-primary/20 transition-colors" style={{ height: `${val}%` }}>
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black border border-white/20 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {val * 1000} ₽
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-4 text-xs text-gray-500 font-mono">
                                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-[#0a0a0f] rounded-2xl border border-white/10 p-6">
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Activity size={18} className="text-orange-400"/> {t('Активность', 'Recent Activity')}</h3>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {orders.slice(0, 6).map(order => (
                                        <div key={order.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                                order.status === OrderStatus.COMPLETED ? 'bg-green-500/20 text-green-400' :
                                                order.status === OrderStatus.PROCESSING ? 'bg-orange-500/20 text-orange-400' :
                                                'bg-gray-700 text-gray-400'
                                            }`}>
                                                {order.status === OrderStatus.COMPLETED ? <CheckCircle size={14}/> : <ShoppingCart size={14}/>}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="text-sm font-bold text-white truncate">{order.total.toLocaleString()} ₽</div>
                                                <div className="text-[10px] text-gray-500 truncate">{order.userEmail}</div>
                                            </div>
                                            <span className="text-[10px] text-gray-600 font-mono">{order.date}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. PRODUCTS MANAGEMENT */}
                {activeTab === 'products' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0a0a0f] p-4 rounded-2xl border border-white/10">
                            <h3 className="text-2xl font-bold text-white">{t('Управление товарами', 'Product Management')}</h3>
                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="relative flex-grow md:flex-grow-0">
                                    <Search size={16} className="absolute left-3 top-3 text-gray-500"/>
                                    <input 
                                        type="text" 
                                        placeholder="Search products..." 
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className="bg-black border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white w-full outline-none focus:border-cyber-primary"
                                    />
                                </div>
                                <button 
                                    onClick={() => {
                                        setEditingProduct({
                                            id: '',
                                            title: '',
                                            description: '',
                                            price: 0,
                                            type: ProductType.PROMPT,
                                            image: '',
                                            downloadUrl: '',
                                            language: 'RU',
                                            features: []
                                        });
                                        setIsProductModalOpen(true);
                                    }}
                                    className="bg-cyber-primary text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-cyan-400 transition-colors whitespace-nowrap"
                                >
                                    <Plus size={18} /> {t('Добавить', 'Add New')}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map(p => (
                                <div key={p.id} className="group bg-[#0a0a0f] border border-white/10 rounded-2xl p-4 flex flex-col gap-4 hover:border-cyber-primary/30 transition-all hover:-translate-y-1">
                                    <div className="relative h-40 bg-gray-800 rounded-xl overflow-hidden">
                                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-white">{p.type}</div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white line-clamp-1 mb-1">{p.title}</h4>
                                        <div className="flex justify-between items-center">
                                            <span className="text-cyber-primary font-mono font-bold">{p.price} ₽</span>
                                            <span className="text-[10px] text-gray-500 uppercase">{p.language}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-white/5">
                                        <button 
                                            onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }}
                                            className="bg-white/5 hover:bg-white/10 py-2 rounded-lg text-xs font-bold text-white transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button 
                                            onClick={() => deleteProduct(p.id)}
                                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. USERS MANAGEMENT */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="bg-[#0a0a0f] rounded-2xl border border-white/10 overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">{t('База пользователей', 'User Database')}</h3>
                                <div className="text-xs text-gray-500">{allUsers.length} total users</div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-gray-400 border-b border-white/10 text-xs uppercase">
                                        <tr>
                                            <th className="p-4">User</th>
                                            <th className="p-4">Role</th>
                                            <th className="p-4">Registration</th>
                                            <th className="p-4">Source</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {allUsers.map(u => (
                                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden border border-white/10">
                                                            <img src={u.avatarUrl || 'https://via.placeholder.com/30'} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white text-sm">{u.name}</div>
                                                            <div className="text-xs text-gray-500">{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <select 
                                                        value={u.role}
                                                        onChange={(e) => adminUpdateUser(u.id, { role: e.target.value as UserRole })}
                                                        className={`bg-black border border-white/10 rounded px-2 py-1 text-xs outline-none font-bold ${
                                                            u.role === UserRole.ADMIN ? 'text-red-400 border-red-500/30' : 'text-green-400 border-green-500/30'
                                                        }`}
                                                    >
                                                        {Object.values(UserRole).map(role => (
                                                            <option key={role} value={role}>{role}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-4 text-xs text-gray-400 font-mono">
                                                    {u.id.startsWith('user-') || u.id.startsWith('admin-') ? 'System' : 'Telegram'}
                                                </td>
                                                <td className="p-4">
                                                    <span className="bg-white/5 text-gray-400 px-2 py-1 rounded text-[10px] font-bold border border-white/5">
                                                        {u.registrationSource}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button 
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="text-gray-500 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. ORDERS MANAGEMENT */}
                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <div className="bg-[#0a0a0f] rounded-2xl border border-white/10 overflow-hidden">
                            <div className="p-6 border-b border-white/10">
                                <h3 className="text-xl font-bold text-white">{t('Управление заказами', 'Order Management')}</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-gray-400 border-b border-white/10 text-xs uppercase">
                                        <tr>
                                            <th className="p-4">ID</th>
                                            <th className="p-4">User</th>
                                            <th className="p-4">Total</th>
                                            <th className="p-4">Method</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {orders.map(o => (
                                            <tr key={o.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-mono text-xs text-cyber-primary">{o.id}</div>
                                                    <div className="text-[10px] text-gray-500">{o.date}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm font-bold text-white">{o.userName || 'Unknown'}</div>
                                                    <div className="text-xs text-gray-500">{o.userEmail}</div>
                                                </td>
                                                <td className="p-4 font-mono font-bold text-white">
                                                    {o.total.toLocaleString()} ₽
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <CreditCard size={14}/> {o.paymentMethod || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase border ${
                                                        o.status === OrderStatus.COMPLETED ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        o.status === OrderStatus.PROCESSING ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                        o.status === OrderStatus.FAILED ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-gray-700 text-gray-300 border-gray-600'
                                                    }`}>
                                                        {STATUS_LABELS[o.status]}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {o.status === OrderStatus.PROCESSING && (
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={(e) => handleApproveClick(e, o.id)} 
                                                                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 p-2 rounded-lg transition-colors border border-green-500/30" 
                                                                title="Approve"
                                                            >
                                                                <CheckCircle size={16}/>
                                                            </button>
                                                            <button 
                                                                onClick={(e) => { e.preventDefault(); setRejectingOrderId(o.id); }} 
                                                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-colors border border-red-500/30" 
                                                                title="Reject"
                                                            >
                                                                <XCircle size={16}/>
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. TICKETS & SERVICES - Reused styling */}
                {activeTab === 'tickets' && (
                    <div className="grid gap-6">
                        {tickets.map(ticket => (
                            <div key={ticket.id} className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{ticket.subject}</h4>
                                        <p className="text-xs text-gray-500 font-mono">User ID: {ticket.userId}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded font-bold border ${ticket.status === 'OPEN' ? 'border-green-500 text-green-500' : 'border-gray-600 text-gray-500'}`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <div className="bg-black/40 p-4 rounded-xl max-h-60 overflow-y-auto mb-4 space-y-3 border border-white/5">
                                    {ticket.messages.map((m, i) => (
                                        <div key={i} className={`flex flex-col ${m.sender === 'ADMIN' ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${m.sender === 'ADMIN' ? 'bg-cyber-primary/20 text-cyber-primary border border-cyber-primary/20' : 'bg-gray-800 text-gray-300 border border-white/5'}`}>
                                                <span className="font-bold text-[10px] block opacity-50 mb-1">{m.sender}</span>
                                                {m.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {ticket.status !== 'RESOLVED' && (
                                    <div className="flex gap-2">
                                        <form 
                                            className="flex-grow flex gap-2"
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                const form = e.target as HTMLFormElement;
                                                const input = form.elements.namedItem('reply') as HTMLInputElement;
                                                handleTicketReply(ticket.id, input.value);
                                                input.value = '';
                                            }}
                                        >
                                            <input name="reply" type="text" placeholder="Type a reply..." className="flex-grow bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyber-primary outline-none" />
                                            <button type="submit" className="bg-cyber-primary text-black px-6 rounded-xl font-bold text-sm hover:bg-cyan-400">Reply</button>
                                        </form>
                                        <button onClick={() => closeTicket(ticket.id, true)} className="px-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 font-bold text-sm">Close</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Services Tab - Standard Table */}
                {activeTab === 'services' && (
                    <div className="bg-[#0a0a0f] rounded-2xl border border-white/10 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 border-b border-white/10 text-xs uppercase">
                                <tr>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Contact</th>
                                    <th className="p-4">Details</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {serviceRequests.map(req => (
                                    <tr key={req.id}>
                                        <td className="p-4 font-bold text-white">{req.serviceType}</td>
                                        <td className="p-4 text-sm text-cyber-primary">{req.contact}</td>
                                        <td className="p-4 text-sm text-gray-400 max-w-xs truncate" title={req.comment}>{req.comment}</td>
                                        <td className="p-4">
                                            <select 
                                                value={req.status}
                                                onChange={(e) => updateServiceRequestStatus(req.id, e.target.value as any)}
                                                className="bg-black border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
                                            >
                                                <option value="NEW">NEW</option>
                                                <option value="IN_WORK">IN_WORK</option>
                                                <option value="COMPLETED">COMPLETED</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </main>

            {/* Rejection Modal */}
            {rejectingOrderId && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-[#0a0a0f] p-6 rounded-2xl border border-white/10 w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 text-white">{t('Отклонение заказа', 'Reject Order')}</h3>
                        <form onSubmit={handleRejectSubmit}>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white mb-4 focus:border-red-500 outline-none"
                                placeholder={t('Причина отказа...', 'Reason for rejection...')}
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setRejectingOrderId(null)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white">
                                    {t('Отмена', 'Cancel')}
                                </button>
                                <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 shadow-lg">
                                    {t('Отклонить', 'Reject')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Product Edit Modal */}
            {isProductModalOpen && editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#0a0a0f] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl p-8 my-8 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">{editingProduct.id ? t('Редактировать товар', 'Edit Product') : t('Новый товар', 'New Product')}</h3>
                            <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
                        </div>
                        
                        <form onSubmit={handleSaveProduct} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 ml-1 uppercase font-bold">Title (EN)</label>
                                    <input required type="text" value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyber-primary outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 ml-1 uppercase font-bold">Title (RU)</label>
                                    <input type="text" value={editingProduct.title_ru || ''} onChange={e => setEditingProduct({...editingProduct, title_ru: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyber-primary outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1 ml-1 uppercase font-bold">Description</label>
                                <textarea required rows={3} value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyber-primary outline-none" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 ml-1 uppercase font-bold">Price (₽)</label>
                                    <input required type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyber-primary outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 ml-1 uppercase font-bold">Type</label>
                                    <select value={editingProduct.type} onChange={e => setEditingProduct({...editingProduct, type: e.target.value as ProductType})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyber-primary outline-none">
                                        {Object.values(ProductType).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 ml-1 uppercase font-bold">Language</label>
                                    <select value={editingProduct.language} onChange={e => setEditingProduct({...editingProduct, language: e.target.value as any})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyber-primary outline-none">
                                        <option value="EN">EN</option>
                                        <option value="RU">RU</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1 ml-1 uppercase font-bold">Image URL</label>
                                <input required type="text" value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyber-primary outline-none" />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1 ml-1 uppercase font-bold">Features (comma separated)</label>
                                <input type="text" value={Array.isArray(editingProduct.features) ? editingProduct.features.join(', ') : editingProduct.features} onChange={e => setEditingProduct({...editingProduct, features: e.target.value.split(',')})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyber-primary outline-none" />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1 ml-1 uppercase font-bold">Download Link (Secret)</label>
                                <input required type="text" value={editingProduct.downloadUrl || ''} onChange={e => setEditingProduct({...editingProduct, downloadUrl: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyber-primary outline-none" />
                            </div>

                            <button type="submit" className="w-full bg-cyber-primary text-black font-bold py-3 rounded-xl hover:bg-cyan-400 mt-4 shadow-lg shadow-cyan-500/20 transition-all">
                                {t('Сохранить', 'Save Product')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};