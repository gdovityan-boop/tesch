
import { Product, ProductType, User, UserRole, OrderStatus, TicketStatus, Ticket, Order, ServiceRequest, Review, ServiceOffering } from '../types';

// ==========================================
// ⚙️ НАСТРОЙКИ ПРОЕКТА (МЕНЯТЬ ЗДЕСЬ)
// ==========================================

// 1. ВАШ ДОМЕН
// ⚠️ ВАЖНО: При загрузке на хостинг поменяйте это на реальный домен (например, 'https://mysite.com')
export const WEB_APP_URL = 'https://0svlnx3atw6mm5fv1pf60rull9wzzhyqmnym0ckocrnfgzwerh-h852644758.scf.usercontent.goog';

// 2. ЮЗЕРНЕЙМ ВАШЕГО БОТА (Без @)
export const TELEGRAM_BOT_USERNAME = 'TECHHACKER_bot';

// 3. ID АДМИНА В TELEGRAM (Чтобы система узнала вас при входе)
// Узнать свой ID можно в боте @userinfobot
export const ADMIN_TELEGRAM_IDS = ['797164901'];

// 4. ТОКЕН БОТА И ЧАТ ID (ДЛЯ УВЕДОМЛЕНИЙ)
// Лучше задавать их в Панели Администратора -> Настройки, но можно и здесь.
export const TELEGRAM_BOT_TOKEN = ''; 
export const TELEGRAM_ADMIN_CHAT_ID = '';

// 5. 💰 ПЛАТЕЖНЫЕ РЕКВИЗИТЫ (МЕНЯТЬ ЗДЕСЬ)
export const PAYMENT_REQUISITES = {
    // КРИПТА (USDT)
    usdtTrc20Address: 'TJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // <--- ВАШ КОШЕЛЕК TRC20
    usdtBep20Address: '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // <--- ВАШ КОШЕЛЕК BEP20 (BSC)
    
    // РУБЛИ (СБП)
    sbpPhoneNumber: '+7 (999) 123-45-67', // <--- ВАШ НОМЕР ТЕЛЕФОНА
    sbpBanks: 'Сбербанк, Тинькофф, ВТБ',   // <--- ВАШИ БАНКИ
    sbpRecipientName: 'Иван И.',             // <--- ИМЯ ПОЛУЧАТЕЛЯ (Необязательно)

    // Генератор QR кода (не трогать)
    getQrUrl: (address: string) => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`
};

// 6. КУРС ВАЛЮТ
export const USDT_RATE = 100; // 1 USDT = 100 RUB (Фиксированный курс для сайта)

// ==========================================
// 📊 ДАННЫЕ ДЛЯ ГРАФИКОВ (ТЕСТОВЫЕ)
// ==========================================

export const MOCK_ANALYTICS_DATA = {
  revenueHistory: [
    { date: 'Mon', value: 12000 },
    { date: 'Tue', value: 21000 },
    { date: 'Wed', value: 18000 },
    { date: 'Thu', value: 34000 },
    { date: 'Fri', value: 29000 },
    { date: 'Sat', value: 45000 },
    { date: 'Sun', value: 38000 },
  ],
  trafficSources: [
    { source: 'Telegram', value: 45, color: '#24A1DE' },
    { source: 'Direct', value: 30, color: '#00f0ff' },
    { source: 'Social', value: 15, color: '#7000ff' },
    { source: 'Organic', value: 10, color: '#00ff9d' },
  ],
  deviceStats: {
    mobile: 72,
    desktop: 28
  }
};

// ==========================================

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Ultimate Midjourney Prompts v5',
    title_ru: 'Сборник Промптов Midjourney v5',
    description: 'A collection of 500+ high-quality prompts for architectural and character design.',
    description_ru: 'Коллекция из 500+ высококачественных промптов для архитектурного дизайна и персонажей.',
    price: 2990,
    type: ProductType.PROMPT,
    image: 'https://picsum.photos/400/300?random=1',
    downloadUrl: 'https://example.com/files/midjourney-v5.pdf',
    language: 'EN',
    features: ['PDF', '500+ Prompts', 'Instant Access'],
    features_ru: ['PDF', '500+ Промптов', 'Моментальный доступ']
  },
  {
    id: '2',
    title: 'Python AI Automation Masterclass',
    title_ru: 'Мастер-класс: AI Автоматизация на Python',
    description: 'Learn how to build AI agents using Python and OpenAI API.',
    description_ru: 'Научитесь создавать AI-агентов, используя Python и OpenAI API.',
    price: 19990,
    type: ProductType.COURSE,
    image: 'https://picsum.photos/400/300?random=2',
    downloadUrl: 'https://example.com/files/python-course.zip',
    language: 'RU',
    features: ['MP4', 'Source Code', 'Certificate'],
    features_ru: ['MP4', 'Исходный код', 'Сертификат']
  },
  {
    id: '3',
    title: 'Telegram Bot Template',
    title_ru: 'Шаблон Telegram Бота (Pro)',
    description: 'Production-ready boilerplate for scalable Telegram bots.',
    description_ru: 'Готовый к продакшену шаблон для масштабируемых ботов Telegram.',
    price: 4990,
    type: ProductType.SOFTWARE,
    image: 'https://picsum.photos/400/300?random=3',
    downloadUrl: 'https://github.com/example/bot-template',
    language: 'EN',
    features: ['ZIP', 'Node.js', 'PostgreSQL'],
    features_ru: ['ZIP', 'Node.js', 'PostgreSQL']
  },
  {
    id: '4',
    title: 'ChatGPT Business Guide',
    title_ru: 'Гайд: ChatGPT для Бизнеса',
    description: 'How to implement ChatGPT in your daily business operations.',
    description_ru: 'Как внедрить ChatGPT в повседневные бизнес-процессы и увеличить прибыль.',
    price: 1490,
    type: ProductType.MANUAL,
    image: 'https://picsum.photos/400/300?random=4',
    downloadUrl: 'https://example.com/files/chatgpt-guide.pdf',
    language: 'RU',
    features: ['PDF', 'Checklists', 'Guide'],
    features_ru: ['PDF', 'Чек-листы', 'Гайд']
  },
  // --- FREE PRODUCTS ---
  {
    id: 'free-1',
    title: 'Free Stable Diffusion Pack',
    title_ru: 'Бесплатный пак для Stable Diffusion',
    description: 'A starter pack of 50 styles for SDXL generation.',
    description_ru: 'Стартовый набор из 50 стилей для генерации в SDXL.',
    price: 0,
    type: ProductType.PROMPT,
    image: 'https://picsum.photos/400/300?random=5',
    downloadUrl: 'https://example.com/files/free-sd-pack.zip',
    language: 'EN',
    features: ['ZIP', 'Free', 'Styles'],
    features_ru: ['ZIP', 'Бесплатно', 'Стили']
  },
  {
    id: 'free-2',
    title: 'YouTube Video Downloader Script',
    title_ru: 'Скрипт скачивания видео с YouTube',
    description: 'Simple python script to download videos in 4k.',
    description_ru: 'Простой Python скрипт для скачивания видео в 4k.',
    price: 0,
    type: ProductType.SOFTWARE,
    image: 'https://picsum.photos/400/300?random=6',
    downloadUrl: 'https://github.com/example/yt-downloader',
    language: 'EN',
    features: ['Python', 'Source Code', 'Free'],
    features_ru: ['Python', 'Исходный код', 'Бесплатно']
  }
];

// --- DEDICATED BONUS ITEMS (Not for sale, separate from Shop) ---
export const MOCK_BONUS_ITEMS: Product[] = [
    {
        id: 'bonus-welcome-1',
        title: 'Secret Hacker Checklist',
        title_ru: 'Секретный Чек-лист Хакера',
        description: 'Exclusive checklist for securing your digital footprint.',
        description_ru: 'Эксклюзивный чек-лист по защите вашего цифрового следа.',
        price: 0,
        type: ProductType.MANUAL,
        image: 'https://picsum.photos/400/300?random=99',
        downloadUrl: 'https://example.com/files/secret-checklist.pdf',
        language: 'EN',
        features: ['Exclusive', 'Bonus', 'PDF'],
        features_ru: ['Эксклюзив', 'Бонус', 'PDF']
    }
];

// --- SERVICE OFFERINGS ---
export const MOCK_SERVICE_OFFERINGS: ServiceOffering[] = [
    { id: 'bot-dev', title: 'Telegram Bot Development', icon: 'Bot', price: 'От 10 000 ₽', description: 'Development of turnkey bots of any complexity. Integration with payments and AI.' },
    { id: 'ai-integration', title: 'AI Integration', icon: 'Shield', price: 'От 20 000 ₽', description: 'Implementation of ChatGPT, Midjourney, and Stable Diffusion into your business processes.' },
    { id: 'scripting', title: 'Automation Scripts', icon: 'Code', price: 'От 5 000 ₽', description: 'Writing scripts in Python/JS to automate routine tasks and parsing.' },
    { id: 'consulting', title: 'Tech Consulting', icon: 'Server', price: '5 000 ₽ / час', description: 'Audit of technical architecture, security advice, and stack selection.' },
];

export const MOCK_ADMIN: User = {
  id: 'admin-1',
  email: 'admin@techhacker.io',
  name: 'System Admin',
  role: UserRole.ADMIN,
  avatarUrl: 'https://picsum.photos/100/100?random=10',
  registrationSource: 'EMAIL'
};

export const MOCK_USER: User = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Alex Cyber',
  role: UserRole.USER,
  telegramId: '123456789',
  avatarUrl: 'https://picsum.photos/100/100?random=11',
  registrationSource: 'TELEGRAM'
};

export const MOCK_ALL_USERS: User[] = [
  MOCK_ADMIN,
  MOCK_USER,
  {
    id: 'user-2',
    email: 'sarah@design.io',
    name: 'Sarah Connor',
    role: UserRole.USER,
    avatarUrl: 'https://picsum.photos/100/100?random=12',
    registrationSource: 'EMAIL'
  },
  {
    id: 'user-3',
    email: 'john@doe.com',
    name: 'John Doe',
    role: UserRole.USER,
    avatarUrl: 'https://picsum.photos/100/100?random=13',
    registrationSource: 'EMAIL'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-001',
    userId: 'user-1',
    items: [MOCK_PRODUCTS[0]],
    total: 2990,
    status: OrderStatus.COMPLETED,
    date: '2023-10-25'
  },
  {
    id: 'ord-002',
    userId: 'user-2',
    items: [MOCK_PRODUCTS[1], MOCK_PRODUCTS[3]],
    total: 21480,
    status: OrderStatus.PENDING,
    date: '2023-10-27'
  }
];

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 'tkt-001',
    userId: 'user-1',
    subject: 'Access to course',
    status: TicketStatus.OPEN,
    date: '2023-10-26',
    messages: [
      { sender: 'USER', text: 'I cannot find the download link.', timestamp: '10:00 AM', read: true }
    ]
  },
  {
    id: 'tkt-002',
    userId: 'user-2',
    subject: 'Refund Request',
    status: TicketStatus.RESOLVED,
    date: '2023-10-24',
    messages: [
      { sender: 'USER', text: 'I bought the wrong item.', timestamp: '09:00 AM', read: true },
      { sender: 'ADMIN', text: 'Refund processed.', timestamp: '09:30 AM', read: false }
    ]
  }
];

export const MOCK_SERVICE_REQUESTS: ServiceRequest[] = [
  {
    id: 'srv-001',
    userId: 'user-1',
    serviceType: 'Telegram Bot Development',
    contact: '@alex_cyber',
    comment: 'Need a shop bot with crypto payments.',
    status: 'IN_WORK',
    date: '2023-10-28'
  },
  {
     id: 'srv-002',
     userId: 'user-1',
     serviceType: 'Consulting',
     contact: 'alex@example.com',
     comment: 'Audit my current AI architecture.',
     status: 'NEW',
     date: '2023-10-29'
  }
];

export const MOCK_REVIEWS: Review[] = [
    {
        id: 'rev-1',
        userId: 'user-3',
        userName: 'Alex R.',
        userAvatar: 'https://picsum.photos/100/100?random=11',
        productName: 'Ultimate Midjourney Prompts v5',
        rating: 5,
        text: 'Prompts for Midjourney are just fire. Saved hours of work. / Промпты для Midjourney просто огонь. Сэкономил часы работы.',
        date: '2023-10-20'
    },
    {
        id: 'rev-2',
        userId: 'user-2',
        userName: 'Sarah K.',
        userAvatar: 'https://picsum.photos/100/100?random=12',
        productName: 'Python AI Course',
        rating: 5,
        text: 'Bought the Python AI course. Very structured and clear. / Купила курс по Python AI. Очень структурировано и понятно.',
        date: '2023-10-22'
    },
    {
        id: 'rev-3',
        userId: 'user-4',
        userName: 'Mike T.',
        userAvatar: 'https://picsum.photos/100/100?random=14',
        productName: 'Telegram Bot Dev',
        rating: 4,
        text: 'Ordered bot development. Done quickly and with high quality. / Заказывал разработку бота. Сделали быстро и качественно.',
        date: '2023-10-25'
    }
];
