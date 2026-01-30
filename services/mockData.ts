
import { Product, ProductType, User, UserRole, OrderStatus, TicketStatus, Ticket, Order, ServiceRequest, Review, ServiceOffering } from '../types';

// ==========================================
// ⚙️ НАСТРОЙКИ ПРОЕКТА
// ==========================================

export const WEB_APP_URL = 'https://tesch.vercel.app'; 

// ⚠️ ВАЖНО: Впишите сюда Username бота (без @), которого вы создали в BotFather.
// Если это поле не совпадает с токеном, виджет входа НЕ ПОЯВИТСЯ.
export const TELEGRAM_BOT_USERNAME = 'ВАШ_БОТ_USERNAME'; // <-- ЗАМЕНИТЕ НА ИМЯ БОТА (например, MyShopBot)

export const ADMIN_TELEGRAM_IDS = ['797164901'];

export const TELEGRAM_BOT_TOKEN = '8298017046:AAGU0kh-dkDeWDgWzxSYCJXjE0RDHdQPqNQ'; 
export const TELEGRAM_ADMIN_CHAT_ID = '';

export const PAYMENT_REQUISITES = {
    usdtTrc20Address: 'TJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    usdtBep20Address: '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    sbpPhoneNumber: '+7 (999) 123-45-67',
    sbpBanks: 'Сбербанк, Тинькофф, ВТБ',
    sbpRecipientName: 'Иван И.',
    getQrUrl: (address: string) => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`
};

export const USDT_RATE = 100;

// ... (Остальные данные остаются без изменений, просто для краткости)
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
];

export const MOCK_ORDERS: Order[] = [];
export const MOCK_TICKETS: Ticket[] = [];
export const MOCK_SERVICE_REQUESTS: ServiceRequest[] = [];
export const MOCK_REVIEWS: Review[] = [];
