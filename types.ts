
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  SUPPORT = 'SUPPORT'
}

export enum ProductType {
  PROMPT = 'PROMPT',
  COURSE = 'COURSE',
  SOFTWARE = 'SOFTWARE',
  MANUAL = 'MANUAL'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

// NEW: Categories for the Programs section
export enum ResourceCategory {
    VIDEO_EDITING = 'VIDEO_EDITING', // Программы для монтажа
    PLUGINS = 'PLUGINS',             // Плагины
    PRESETS = 'PRESETS',             // Пресеты
    CODECS = 'CODECS',               // Кодеки
    PROMPTS = 'PROMPTS',             // Промты (бесплатные/ресурсные)
    DRIVERS = 'DRIVERS',             // Драйвера
    OTHER = 'OTHER'                  // Другое
}

export interface UserPreferences {
    telegramNotifications: boolean;
    emailNewsletter: boolean;
    securityAlerts: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  telegramId?: string;
  avatarUrl?: string;
  registrationSource: 'EMAIL' | 'TELEGRAM';
  preferences?: UserPreferences;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  type: ProductType;
  image: string;
  downloadUrl?: string; // The secret link to the file
  language: 'RU' | 'EN';
  features: string[];
  
  // Localization fields
  title_ru?: string;
  description_ru?: string;
  features_ru?: string[];
}

// NEW: Interface for Programs/Resources
export interface ResourceItem {
    id: string;
    title: string;
    description: string;
    category: string; // Can use ResourceCategory enum values or custom string
    image: string;
    downloadUrl: string;
    version?: string;
    dateAdded: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId?: string; // Optional, if reviewing specific product
  productName?: string;
  rating: number; // 1-5
  text: string;
  date: string;
}

export interface Order {
  id: string;
  userId: string;
  userName?: string; // Added for Admin display
  userEmail?: string; // Added for Admin display
  items: Product[];
  total: number;
  status: OrderStatus;
  date: string;
  paymentMethod?: 'CRYPTO' | 'SBP';
  rejectionReason?: string; // Reason why admin rejected the order
}

export interface TicketMessage {
    sender: 'USER' | 'ADMIN';
    text: string;
    timestamp: string;
    read: boolean;
}

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  messages: TicketMessage[];
  status: TicketStatus;
  date: string;
}

export interface ServiceRequest {
  id: string;
  userId: string;
  contact: string; // Contact info provided by user
  serviceType: string;
  comment: string;
  status: 'NEW' | 'IN_WORK' | 'COMPLETED';
  date: string;
  reviewed?: boolean;
}

export interface ServiceOffering {
  id: string;
  title: string;
  description: string;
  price: string;
  icon: string; // 'Bot' | 'Shield' | 'Code' | 'Server' | 'Database' | 'Globe' | 'Cpu' | 'Zap'
}

export type Language = 'RU' | 'EN';