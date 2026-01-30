import { Product, ProductType, User, UserRole, OrderStatus, TicketStatus, Ticket, Order, ServiceRequest, Review, ServiceOffering } from '../types';

// ==========================================
// ⚙️ НАСТРОЙКИ ПРОЕКТА (МЕНЯТЬ ЗДЕСЬ)
// ==========================================

// 1. ВАШ ДОМЕН
// ⚠️ ВАЖНО: При загрузке на хостинг поменяйте это на реальный домен
export const WEB_APP_URL = 'https://tesch.vercel.app'; // Production v3.0 Active

// 2. ЮЗЕРНЕЙМ ВАШЕГО БОТА (Без @)
// ⚠️ ВАЖНО: Впишите сюда имя бота, который соответствует токену ниже! 
// Если имена не совпадут, виджет входа не появится.
export const TELEGRAM_BOT_USERNAME = 'techhshop_bot'; 

// 3. ID АДМИНА В TELEGRAM (Чтобы система узнала вас при входе)
// Узнать свой ID можно в боте @userinfobot
export const ADMIN_TELEGRAM_IDS = ['797164901'];

// 4. ТОКЕН БОТА И ЧАТ ID (ДЛЯ УВЕДОМЛЕНИЙ)
export const TELEGRAM_BOT_TOKEN = '8298017046:AAGU0kh-dkDeWDgWzxSYCJXjE0RDHdQPqNQ'; 
export const TELEGRAM_ADMIN_CHAT_ID = '797164901';

// 5. ОПЛАТА
export const USDT_RATE = 100; // Примерный курс
export const PAYMENT_REQUISITES = {
    usdtTrc20Address: 'T_YOUR_TRC20_WALLET',
    usdtBep20Address: '0x_YOUR_BEP20_WALLET',
    sbpPhoneNumber: '+70000000000',
    sbpBanks: 'Sberbank, Tinkoff',
    sbpRecipientName: 'Admin',
    getQrUrl: (address: string) => `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${address}`
};

// ==========================================
// 📦 MOCK DATA (ДЛЯ ДЕМО РЕЖИМА)
// ==========================================

export const MOCK_USER: User = {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Demo User',
    role: UserRole.USER,
    registrationSource: 'EMAIL',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=User',
    preferences: {
        telegramNotifications: true,
        emailNewsletter: false,
        securityAlerts: true
    }
};

export const MOCK_ADMIN: User = {
    id: 'admin-1',
    email: 'admin@techhacker.io',
    name: 'Admin',
    role: UserRole.ADMIN,
    registrationSource: 'EMAIL',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin',
    preferences: {
        telegramNotifications: true,
        emailNewsletter: true,
        securityAlerts: true
    }
};

export const MOCK_ALL_USERS: User[] = [MOCK_USER, MOCK_ADMIN];

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 'p1',
        title: 'Midjourney Professional Prompts',
        description: 'A collection of high-quality prompts for Midjourney v6.',
        price: 2990,
        type: ProductType.PROMPT,
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000',
        downloadUrl: '#',
        language: 'EN',
        features: ['v6 Ready', 'Styles Guide'],
        title_ru: 'Профессиональные промпты Midjourney',
        description_ru: 'Коллекция высококачественных промптов для Midjourney v6.',
        features_ru: ['v6 Ready', 'Гайд по стилям']
    }
];

export const MOCK_SERVICE_OFFERINGS: ServiceOffering[] = [
    {
        id: 's1',
        title: 'Telegram Bot Development',
        description: 'Custom bots for business and automation.',
        price: 'From 15 000 ₽',
        icon: 'Bot'
    },
    {
        id: 's2',
        title: 'AI Integration',
        description: 'ChatGPT & Midjourney API integration.',
        price: 'From 20 000 ₽',
        icon: 'Cpu'
    }
];

export const MOCK_REVIEWS: Review[] = [
    {
        id: 'r1',
        userId: 'u2',
        userName: 'Alex',
        rating: 5,
        text: 'Great service, highly recommended!',
        date: '2023-11-01',
        productId: 'p1',
        productName: 'Midjourney Professional Prompts'
    }
];

export const MOCK_ORDERS: Order[] = [];

export const MOCK_TICKETS: Ticket[] = [];

export const MOCK_SERVICE_REQUESTS: ServiceRequest[] = [];

export const MOCK_ANALYTICS_DATA = [
    { label: 'Mon', value: 1200 },
    { label: 'Tue', value: 900 },
    { label: 'Wed', value: 1500 },
    { label: 'Thu', value: 2000 },
    { label: 'Fri', value: 1800 },
    { label: 'Sat', value: 3200 },
    { label: 'Sun', value: 2800 },
];