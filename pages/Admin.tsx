import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Navigate } from 'react-router-dom';
import { UserRole, OrderStatus, TicketStatus, ProductType, Product } from '../types';
import { 
    LayoutDashboard, Users, Box, ShoppingCart, MessageSquare, Briefcase, 
    CheckCircle, XCircle, CreditCard, Shield, Plus, Edit, Trash2, Search,
    FileText, X, Save, ExternalLink
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

    if (!user || user.role !== UserRole.ADMIN) {
        return <Navigate to="/" replace />;
    }

    const t = (ru: string, en: string) => language === 'RU' ? ru : en;

    const STATUS_LABELS = {
        [OrderStatus.PENDING]: t('Ожидание', 'Pending'),
        [OrderStatus.PROCESSING]: t('В обработке', 'Processing'),
        [OrderStatus.COMPLETED]: t('Выполнен', 'Completed'),
        [OrderStatus.FAILED]: t('Отменен', 'Failed')
    };

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
        
        // Basic validation
        if (!editingProduct.id) editingProduct.id = `prod-${Date.now()}`;
        
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

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[80vh] p-4 relative">
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

            {/* Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0 bg-cyber-900/40 rounded-xl p-4 border border-white/5 h-fit">
                <h2 className="text-xl font-bold mb-6 px-4 flex items-center gap-2 text-white">
                    <Shield className="text-red-500" /> Admin
                </h2>
                <nav className="space-y-1">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: t('Обзор', 'Overview') },
                        { id: 'orders', icon: ShoppingCart, label: t('Заказы', 'Orders') },
                        { id: 'users', icon: Users, label: t('Пользователи', 'Users') },
                        { id: 'products', icon: Box, label: t('Товары', 'Products') },
                        { id: 'tickets', icon: MessageSquare, label: t('Тикеты', 'Tickets') },
                        { id: 'services', icon: Briefcase, label: t('Услуги', 'Services') },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                activeTab === item.id 
                                ? 'bg-cyber-primary/10 text-cyber-primary' 
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <item.icon size={18} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow">
                
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-cyber-900/30 p-6 rounded-xl border border-white/5">
                            <h3 className="text-gray-400 text-sm">{t('Всего пользователей', 'Total Users')}</h3>
                            <p className="text-3xl font-bold mt-2 text-white">{allUsers.length}</p>
                        </div>
                        <div className="bg-cyber-900/30 p-6 rounded-xl border border-white/5">
                            <h3 className="text-gray-400 text-sm">{t('Всего заказов', 'Total Orders')}</h3>
                            <p className="text-3xl font-bold mt-2 text-white">{orders.length}</p>
                        </div>
                        <div className="bg-cyber-900/30 p-6 rounded-xl border border-white/5">
                            <h3 className="text-gray-400 text-sm">{t('Доход', 'Revenue')}</h3>
                            <p className="text-3xl font-bold mt-2 text-green-400">
                                {orders.filter(o => o.status === OrderStatus.COMPLETED).reduce((acc, o) => acc + o.total, 0).toLocaleString()} ₽
                            </p>
                        </div>
                        <div className="bg-cyber-900/30 p-6 rounded-xl border border-white/5">
                            <h3 className="text-gray-400 text-sm">{t('Активные тикеты', 'Open Tickets')}</h3>
                            <p className="text-3xl font-bold mt-2 text-orange-400">{tickets.filter(t => t.status !== TicketStatus.RESOLVED).length}</p>
                        </div>
                     </div>
                )}

                {/* 2. ORDERS TAB */}
                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white">{t('История заказов', 'Order History')}</h3>
                        <div className="bg-cyber-900/30 rounded-xl border border-white/5 overflow-hidden overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
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
                                        <tr key={o.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="font-mono text-sm text-white">{o.id}</div>
                                                <div className="text-xs text-gray-500">{o.date}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm font-bold text-white">{o.userName || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{o.userEmail || o.userId}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-white">{o.total.toLocaleString('ru-RU')} ₽</div>
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

                {/* 3. USERS TAB */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white">{t('Пользователи', 'Users')}</h3>
                        <div className="bg-cyber-900/30 rounded-xl border border-white/5 overflow-hidden overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-black/20 text-gray-400 border-b border-white/10">
                                    <tr>
                                        <th className="p-4">User</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Source</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {allUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-white/5">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden">
                                                        <img src={u.avatarUrl || 'https://via.placeholder.com/30'} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{u.name}</div>
                                                        <div className="text-xs text-gray-500">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <select 
                                                    value={u.role}
                                                    onChange={(e) => adminUpdateUser(u.id, { role: e.target.value as UserRole })}
                                                    className="bg-black border border-white/10 rounded px-2 py-1 text-xs text-white outline-none"
                                                >
                                                    {Object.values(UserRole).map(role => (
                                                        <option key={role} value={role}>{role}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-4 text-xs text-gray-400">{u.registrationSource}</td>
                                            <td className="p-4">
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded transition-colors"
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
                )}

                {/* 4. PRODUCTS TAB */}
                {activeTab === 'products' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-white">{t('Товары', 'Products')}</h3>
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
                                className="bg-cyber-primary text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-cyan-400 transition-colors"
                            >
                                <Plus size={18} /> {t('Добавить', 'Add Product')}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {products.map(p => (
                                <div key={p.id} className="bg-cyber-900/30 border border-white/5 rounded-xl p-4 flex flex-col gap-4">
                                    <div className="flex gap-4">
                                        <img src={p.image} className="w-16 h-16 rounded-lg object-cover bg-gray-800" />
                                        <div>
                                            <h4 className="font-bold text-white line-clamp-1">{p.title}</h4>
                                            <p className="text-xs text-gray-500">{p.type} • {p.price} ₽</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-auto">
                                        <button 
                                            onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }}
                                            className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded text-xs font-bold text-white transition-colors"
                                        >
                                            {t('Редактировать', 'Edit')}
                                        </button>
                                        <button 
                                            onClick={() => deleteProduct(p.id)}
                                            className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. TICKETS TAB */}
                {activeTab === 'tickets' && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white">{t('Тикеты', 'Support Tickets')}</h3>
                        <div className="grid gap-4">
                            {tickets.map(ticket => (
                                <div key={ticket.id} className="bg-cyber-900/30 border border-white/5 rounded-xl p-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-white">{ticket.subject}</h4>
                                            <p className="text-xs text-gray-500">User ID: {ticket.userId}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded font-bold border ${ticket.status === 'OPEN' ? 'border-green-500 text-green-500' : 'border-gray-600 text-gray-500'}`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    
                                    <div className="bg-black/20 p-3 rounded-lg max-h-40 overflow-y-auto mb-4 space-y-2">
                                        {ticket.messages.map((m, i) => (
                                            <div key={i} className={`text-sm ${m.sender === 'ADMIN' ? 'text-cyber-primary text-right' : 'text-gray-300'}`}>
                                                <span className="font-bold text-xs opacity-50 block mb-0.5">{m.sender}:</span>
                                                {m.text}
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
                                                <input name="reply" type="text" placeholder="Reply..." className="flex-grow bg-black border border-white/10 rounded px-3 py-2 text-sm text-white" />
                                                <button type="submit" className="bg-white text-black px-4 rounded font-bold text-sm">Send</button>
                                            </form>
                                            <button onClick={() => closeTicket(ticket.id, true)} className="px-3 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20">Close</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 6. SERVICES TAB */}
                {activeTab === 'services' && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white">{t('Заявки на услуги', 'Service Requests')}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left bg-cyber-900/30 rounded-xl border border-white/5">
                                <thead className="bg-black/20 text-gray-400">
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
                                                    className="bg-black border border-white/10 rounded px-2 py-1 text-xs text-white"
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
                    </div>
                )}
            </main>

            {/* Rejection Modal */}
            {rejectingOrderId && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-cyber-900 p-6 rounded-xl border border-white/10 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4 text-white">{t('Отклонение заказа', 'Reject Order')}</h3>
                        <form onSubmit={handleRejectSubmit}>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white mb-4 focus:border-red-500 outline-none"
                                placeholder={t('Причина отказа...', 'Reason for rejection...')}
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setRejectingOrderId(null)} className="px-4 py-2 rounded text-gray-400 hover:text-white">
                                    {t('Отмена', 'Cancel')}
                                </button>
                                <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded font-bold hover:bg-red-600">
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
                    <div className="bg-cyber-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl p-6 my-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">{editingProduct.id ? t('Редактировать товар', 'Edit Product') : t('Новый товар', 'New Product')}</h3>
                            <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
                        </div>
                        
                        <form onSubmit={handleSaveProduct} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Title (EN)</label>
                                    <input required type="text" value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Title (RU)</label>
                                    <input type="text" value={editingProduct.title_ru || ''} onChange={e => setEditingProduct({...editingProduct, title_ru: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Description</label>
                                <textarea required rows={3} value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Price (₽)</label>
                                    <input required type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Type</label>
                                    <select value={editingProduct.type} onChange={e => setEditingProduct({...editingProduct, type: e.target.value as ProductType})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white">
                                        {Object.values(ProductType).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Language</label>
                                    <select value={editingProduct.language} onChange={e => setEditingProduct({...editingProduct, language: e.target.value as any})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white">
                                        <option value="EN">EN</option>
                                        <option value="RU">RU</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Image URL</label>
                                <input required type="text" value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Download Link (Secret)</label>
                                <input required type="text" value={editingProduct.downloadUrl || ''} onChange={e => setEditingProduct({...editingProduct, downloadUrl: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
                            </div>

                            <button type="submit" className="w-full bg-cyber-primary text-black font-bold py-3 rounded-xl hover:bg-cyan-400 mt-4">
                                {t('Сохранить', 'Save Product')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};