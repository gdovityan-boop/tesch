import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Navigate } from 'react-router-dom';
import { UserRole, OrderStatus, TicketStatus } from '../types';
import { 
    LayoutDashboard, Users, Box, ShoppingCart, MessageSquare, Briefcase, 
    CheckCircle, XCircle, CreditCard, Shield 
} from 'lucide-react';

export const Admin = () => {
    const { 
        user, allUsers, orders, tickets, 
        language, updateOrderStatus 
    } = useApp();

    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'users' | 'products' | 'tickets' | 'services'>('overview');
    const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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

    const handleApproveClick = (e: React.MouseEvent, orderId: string) => {
        e.preventDefault();
        if (window.confirm(t('Подтвердить выполнение заказа?', 'Approve this order?'))) {
            updateOrderStatus(orderId, OrderStatus.COMPLETED);
            setShowSuccessModal(true); // Show admin success modal
            setTimeout(() => setShowSuccessModal(false), 3000); // Auto close
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

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[80vh] p-4 relative">
            {/* Success Modal for Admin */}
            {showSuccessModal && (
                <div className="fixed top-20 right-4 z-[9999] bg-green-500 text-black px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right">
                    <CheckCircle size={24} />
                    <div>
                        <h4 className="font-bold">{t('Заказ одобрен!', 'Order Approved!')}</h4>
                        <p className="text-xs">{t('Доступ выдан пользователю.', 'Access granted to user.')}</p>
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

            {/* Content */}
            <main className="flex-grow">
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
                
                {activeTab !== 'overview' && activeTab !== 'orders' && (
                    <div className="flex items-center justify-center h-64 border border-white/5 rounded-xl bg-cyber-900/20 text-gray-500">
                        Module Under Construction
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
                                <button
                                    type="button"
                                    onClick={() => setRejectingOrderId(null)}
                                    className="px-4 py-2 rounded text-gray-400 hover:text-white"
                                >
                                    {t('Отмена', 'Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-500 text-white rounded font-bold hover:bg-red-600"
                                >
                                    {t('Отклонить', 'Reject')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};