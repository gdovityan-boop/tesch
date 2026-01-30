
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Code, Zap, Search, CreditCard, Download, HelpCircle, Mail, Star, PlayCircle, Send, Video, Globe, Box, Layers, ShieldCheck, MessageCircle, Flame, ShoppingBag, Lock, Terminal, Activity, ArrowUpRight, Users, Clock, Database, Rocket, GitMerge, ChevronRight } from 'lucide-react';
import { ProductType } from '../types';

// Custom CSS for 3D rotation and floating animations
const customStyles = `
  @keyframes float {
    0% { transform: translateY(0px) rotateX(0deg); }
    50% { transform: translateY(-20px) rotateX(2deg); }
    100% { transform: translateY(0px) rotateX(0deg); }
  }
  @keyframes spin-slow {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .perspective-1000 { perspective: 1000px; }
  .transform-style-3d { transform-style: preserve-3d; }
  .backface-hidden { backface-visibility: hidden; }
  .rotate-y-180 { transform: rotateY(180deg); }
  .floating-card { animation: float 6s ease-in-out infinite; }
  .writing-mode-vertical { writing-mode: vertical-rl; text-orientation: mixed; }
`;

// Modern Stat Card with Icon
const StatCard = ({ number, label, delay, icon: Icon }: { number: string, label: string, delay: string, icon: any }) => (
    <div 
        className="relative group"
        style={{ animationDelay: delay }}
    >
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-primary to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
        
        <div className="relative bg-[#0a0a0f] border border-white/10 p-5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 flex items-center justify-between h-full">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity transform scale-150 translate-x-2 -translate-y-2 pointer-events-none">
                <Icon size={80} />
            </div>

            <div className="z-10">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-1 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-cyber-primary transition-all">
                    {number}
                </div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-400">
                    {label}
                </div>
            </div>
            
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 group-hover:text-cyber-primary group-hover:bg-cyber-primary/10 group-hover:border-cyber-primary/20 transition-all duration-300 relative z-10">
                <Icon size={22} />
            </div>
        </div>
    </div>
);

export const Home = () => {
  const { language, products, reviews, trendingProducts } = useApp();
  const [activeFeature, setActiveFeature] = useState<string>('ai');

  const displayTrending = (trendingProducts && trendingProducts.length > 0) 
    ? trendingProducts 
    : (products || []).slice(0, 3);
  
  const recentReviews = (reviews || []).slice(0, 3);

  const SOCIAL_LINKS = [
    {
      id: 'tg-channel',
      icon: Send,
      gradient: 'from-[#24A1DE] to-[#1a8bc4]',
      label: 'Channel',
      url: 'https://t.me/TechHacker_Official_Channel'
    },
    {
      id: 'tg-soft',
      icon: MessageCircle,
      gradient: 'from-[#2AABEE] to-[#229ED9]',
      label: 'Soft',
      url: 'https://t.me/TechHacker_Official_Programs'
    },
    {
      id: 'rutube',
      icon: Video,
      gradient: 'from-[#e62020] to-[#b31919]',
      label: 'RuTube',
      url: 'https://rutube.ru/channel/68054006/'
    },
    {
      id: 'vk',
      icon: Globe,
      gradient: 'from-[#0077FF] to-[#0055BB]',
      label: 'VK',
      url: 'https://vk.com/techhacker_official'
    }
  ];

  const FEATURES = [
    {
        id: 'ai',
        icon: Cpu,
        title: language === 'RU' ? "Генеративный AI" : "Generative AI",
        subtitle: "PROMPTS & MODELS",
        desc: language === 'RU' 
            ? "Премиальная библиотека промптов для Midjourney, Stable Diffusion и GPT-4. Модели, лоры и настройки для идеальной генерации." 
            : "Premium prompt library for Midjourney, Stable Diffusion, and GPT-4. Models, LoRAs and settings for perfect generation.",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop",
        color: "text-cyber-primary",
        border: "group-hover:border-cyber-primary/50",
        shadow: "group-hover:shadow-cyber-primary/20"
    },
    {
        id: 'code',
        icon: Terminal,
        title: language === 'RU' ? "Автоматизация" : "Automation",
        subtitle: "SCRIPTS & BOTS",
        desc: language === 'RU' 
            ? "Python скрипты и Telegram боты для бизнеса. Парсинг, рассылки и интеграции под ключ." 
            : "Python scripts and Telegram bots for business. Parsing, broadcasting and turnkey integrations.",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
        color: "text-purple-400",
        border: "group-hover:border-purple-500/50",
        shadow: "group-hover:shadow-purple-500/20"
    },
    {
        id: 'speed',
        icon: Zap,
        title: language === 'RU' ? "Моментально" : "Instant Delivery",
        subtitle: "FAST TRACK",
        desc: language === 'RU' 
            ? "Автоматическая выдача товаров 24/7. Покупайте и скачивайте цифровые ассеты мгновенно после оплаты." 
            : "Automatic delivery 24/7. Buy and download digital assets instantly after payment.",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
        color: "text-green-400",
        border: "group-hover:border-green-500/50",
        shadow: "group-hover:shadow-green-500/20"
    }
  ];

  const WORKFLOW_STEPS = [
      {
          id: '01',
          title: language === 'RU' ? 'Выберите Ассет' : 'Locate Asset',
          desc: language === 'RU' ? 'Найдите нужный скрипт или промпт в нашем каталоге.' : 'Find the script or prompt you need in our catalog.',
          icon: Search,
          color: 'text-cyber-primary',
          bg: 'bg-cyber-primary/10',
          border: 'border-cyber-primary/30'
      },
      {
          id: '02',
          title: language === 'RU' ? 'Получите Доступ' : 'Secure Access',
          desc: language === 'RU' ? 'Мгновенная оплата и автоматическая доставка.' : 'Instant payment and automatic delivery to dashboard.',
          icon: Download,
          color: 'text-purple-400',
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30'
      },
      {
          id: '03',
          title: language === 'RU' ? 'Внедряйте' : 'Deploy & Scale',
          desc: language === 'RU' ? 'Интегрируйте решения и масштабируйте свои проекты.' : 'Integrate solutions and scale your projects immediately.',
          icon: Rocket,
          color: 'text-green-400',
          bg: 'bg-green-500/10',
          border: 'border-green-500/30'
      }
  ];
  
  const MainFeatureIcon = FEATURES[0].icon;

  return (
    <div className="space-y-24 pb-20 relative overflow-hidden">
      <style>{customStyles}</style>

      {/* HERO SECTION - REVERTED TO SPLIT LAYOUT WITH 3D VISUALS */}
      <section className="relative pt-0 pb-16 lg:pt-0 grid lg:grid-cols-2 gap-12 items-center min-h-[500px] px-4 md:px-8 max-w-[1800px] mx-auto">
        
        {/* LEFT: TEXT CONTENT */}
        <div className="space-y-8 relative z-10 flex flex-col justify-center text-center lg:text-left lg:pl-10">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md w-fit animate-in slide-in-from-left duration-700 mx-auto lg:mx-0 cursor-default hover:bg-white/10 transition-colors">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_#22c55e]"></span>
                <span className="text-xs font-bold tracking-[0.2em] text-gray-300">SYSTEM V3.0 ONLINE</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.9] animate-in fade-in zoom-in-95 duration-1000">
                {language === 'RU' ? 'Цифровой' : 'Digital'} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary via-white to-cyber-primary bg-[length:200%_auto] animate-pulse-slow">
                    {language === 'RU' ? 'Арсенал' : 'Arsenal'}
                </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed animate-in slide-in-from-bottom-10 duration-700 delay-200 mx-auto lg:mx-0">
                {language === 'RU'
                    ? 'Премиум ассеты, скрипты и AI-инструменты для создателей нового поколения. Ускорьте свою работу прямо сейчас.'
                    : 'Premium assets, scripts, and AI tools for next-gen creators. Accelerate your workflow right now.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom-10 duration-700 delay-300 justify-center lg:justify-start pt-4">
                <Link 
                  to="/shop"
                  className="group relative px-8 py-4 bg-cyber-primary text-black font-bold rounded-2xl overflow-hidden hover:scale-105 transition-transform text-center shadow-[0_0_40px_rgba(0,240,255,0.3)]"
                >
                  <div className="absolute inset-0 bg-white/40 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <span className="relative flex items-center justify-center gap-2">
                      {language === 'RU' ? 'В каталог' : 'Explore Assets'} <ArrowRight size={18} />
                  </span>
                </Link>
                <Link 
                  to="/services"
                  className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors text-center hover:border-white/20"
                >
                  {language === 'RU' ? 'Наши услуги' : 'Our Services'}
                </Link>
            </div>
        </div>

        {/* RIGHT: 3D VISUAL ELEMENT (RESTORED) */}
        <div className="relative h-[500px] w-full flex items-center justify-center perspective-1000 animate-in fade-in duration-1000 delay-500 hidden lg:flex">
            <div className="transform scale-110 origin-center flex items-center justify-center relative">
                {/* Rings */}
                <div className="absolute w-[450px] h-[450px] border border-cyber-primary/20 rounded-full animate-[spin-slow_25s_linear_infinite]"></div>
                <div className="absolute w-[380px] h-[380px] border border-purple-500/20 rounded-full animate-[spin-slow_20s_linear_infinite_reverse]"></div>
                <div className="absolute w-[550px] h-[550px] border border-white/5 rounded-full animate-[spin-slow_40s_linear_infinite] opacity-50"></div>
                
                {/* Floating Card */}
                <div className="relative w-72 h-96 transform-style-3d rotate-y-[-15deg] rotate-x-[10deg] floating-card">
                    <div className="absolute inset-0 bg-cyber-800/80 border border-white/10 rounded-2xl transform translate-z-[-50px] translate-x-[50px] shadow-2xl"></div>
                    <div className="absolute inset-0 bg-cyber-900/90 border border-white/10 rounded-2xl transform translate-z-[-25px] translate-x-[25px] shadow-2xl"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black border border-cyber-primary/50 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.25)] p-8 flex flex-col justify-between overflow-hidden backdrop-blur-xl">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-cyber-primary/20 blur-[50px] rounded-full"></div>
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-full bg-cyber-primary/20 flex items-center justify-center text-cyber-primary">
                                <Zap size={24} />
                            </div>
                            <div className="text-[10px] font-mono text-gray-500">SECURE_HASH_256</div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-2 w-1/2 bg-gray-700 rounded-full"></div>
                            <div className="h-2 w-3/4 bg-gray-700 rounded-full"></div>
                            <div className="h-20 w-full bg-cyber-primary/10 rounded-xl border border-cyber-primary/20 mt-4 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-cyber-primary/10 animate-pulse"></div>
                                <span className="text-cyber-primary font-bold font-mono tracking-widest relative z-10 text-lg">ACCESS GRANTED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-0 md:px-4">
          <StatCard 
            number="5K+" 
            label={language === 'RU' ? 'Пользователей' : 'Active Users'} 
            delay="0s" 
            icon={Users}
          />
          <StatCard 
            number="12K+" 
            label={language === 'RU' ? 'Загрузок' : 'Downloads'} 
            delay="0.2s" 
            icon={Download}
          />
          <StatCard 
            number="99%" 
            label={language === 'RU' ? 'Рейтинг' : 'Satisfaction'} 
            delay="0.4s" 
            icon={Star}
          />
          <StatCard 
            number="24/7" 
            label={language === 'RU' ? 'Аптайм' : 'Uptime'} 
            delay="0.6s" 
            icon={Activity}
          />
      </section>

      {/* FEATURES SECTION - CENTERED HEADER */}
      <section className="px-0 md:px-4 py-10 relative">
        <div className="flex flex-col items-center text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-7xl font-bold tracking-tighter text-white mb-6 leading-none">
                {language === 'RU' ? 'Технологическое' : 'Technological'} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyber-primary to-purple-500 animate-pulse-slow">
                    {language === 'RU' ? 'Превосходство' : 'Superiority'}
                </span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl">
                {language === 'RU' ? 'Инструменты нового поколения для тех, кто строит будущее.' : 'Next-gen tools for those building the future.'}
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">
            
            {/* Feature 1 (Main - AI) */}
            <div className={`lg:col-span-2 relative group overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0a0a0f] transition-all duration-500 hover:border-cyber-primary/30 hover:shadow-[0_0_50px_rgba(0,240,255,0.15)]`}>
                {/* Background Image with Zoom */}
                <div className="absolute inset-0">
                    <img src={FEATURES[0].image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent"></div>
                </div>
                
                {/* Content */}
                <div className="relative h-full p-8 md:p-12 flex flex-col justify-end z-10">
                    <div className="mb-auto">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 mb-6 group-hover:border-cyber-primary/50 transition-colors group-hover:bg-cyber-primary/10">
                            <MainFeatureIcon size={32} className="text-cyber-primary" />
                        </div>
                    </div>
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-cyber-primary font-mono text-xs tracking-widest uppercase">{FEATURES[0].subtitle}</span>
                            <div className="h-px w-10 bg-cyber-primary/50"></div>
                        </div>
                        <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{FEATURES[0].title}</h3>
                        <p className="text-gray-300 text-lg max-w-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 translate-y-2 group-hover:translate-y-0">
                            {FEATURES[0].desc}
                        </p>
                    </div>
                </div>
                
                {/* Corner Decoration */}
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity duration-700">
                    <Cpu size={180} strokeWidth={0.5} className="text-white" />
                </div>
            </div>

            {/* Side Column (Code & Speed) */}
            <div className="flex flex-col gap-6 lg:h-full">
                {FEATURES.slice(1).map((feature, idx) => {
                    const FeatureIcon = feature.icon;
                    return (
                        <div key={feature.id} className={`flex-1 relative group overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0a0a0f] min-h-[280px] transition-all duration-500 ${feature.border} hover:shadow-lg`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            {/* Image overlay */}
                            <div className="absolute inset-0">
                                <img src={feature.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-30 group-hover:opacity-20" />
                                <div className="absolute inset-0 bg-[#0a0a0f]/80 group-hover:bg-[#0a0a0f]/60 transition-colors"></div>
                            </div>

                            <div className="relative p-8 h-full flex flex-col justify-between z-10">
                                <div className="flex justify-between items-start">
                                    <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${feature.color} backdrop-blur-md group-hover:scale-110 transition-transform duration-300`}>
                                        <FeatureIcon size={24} />
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0">
                                        <ArrowUpRight className="text-white" size={20} />
                                    </div>
                                </div>
                                
                                <div>
                                    <span className={`text-[10px] font-bold tracking-wider uppercase mb-1 block opacity-70 ${feature.color}`}>{feature.subtitle}</span>
                                    <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-2 group-hover:text-gray-200 transition-colors">{feature.desc}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </section>

      {/* TRENDING SECTION - FLIPPED LAYOUT (ZIG-ZAG) */}
      <section className="relative px-0 md:px-4 py-10">
          <div className="flex justify-between items-end mb-8">
              <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                      <Flame size={24} className="fill-orange-500 animate-pulse" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{language === 'RU' ? 'В тренде' : 'Trending Now'}</h2>
              </div>
              <Link to="/shop" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-bold text-sm">
                  {language === 'RU' ? 'Весь каталог' : 'View All'} <ArrowRight size={16} />
              </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* SECONDARY ITEMS (Left Stack - Flipped) */}
              <div className="col-span-1 lg:col-span-5 flex flex-col gap-6 h-[500px]">
                  {displayTrending.slice(1, 3).map((product, idx) => (
                      <Link 
                        key={product.id} 
                        to="/shop" 
                        className="flex-1 relative group overflow-hidden rounded-3xl bg-cyber-900 border border-white/10 hover:border-cyber-primary/50 transition-all duration-300"
                      >
                          <div className="absolute inset-0 flex">
                              {/* Half Image */}
                              <div className="w-2/5 h-full relative overflow-hidden">
                                  <img src={product.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-cyber-900"></div>
                              </div>
                              {/* Content */}
                              <div className="w-3/5 p-6 flex flex-col justify-center relative z-10">
                                  <div className="absolute top-4 right-4 text-xs font-bold text-gray-500">#{idx + 2}</div>
                                  <h4 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-cyber-primary transition-colors">
                                      {language === 'RU' ? (product.title_ru || product.title) : product.title}
                                  </h4>
                                  <p className="text-xs text-gray-400 mb-4 line-clamp-1">{product.type}</p>
                                  <div className="flex items-center justify-between mt-auto">
                                      <span className="text-xl font-bold font-mono">{product.price.toLocaleString('ru-RU')} ₽</span>
                                      <div className="p-2 rounded-lg bg-white/5 group-hover:bg-cyber-primary group-hover:text-black transition-colors">
                                          <ArrowRight size={16} />
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </Link>
                  ))}
                  {/* Filler */}
                  {displayTrending.length < 3 && <div className="flex-1 rounded-3xl border border-white/5 border-dashed"></div>}
              </div>

              {/* PRIMARY TRENDING ITEM (Large Right - Flipped) */}
              {displayTrending.length > 0 && (
                  <Link 
                    to="/shop" 
                    className="col-span-1 lg:col-span-7 h-[400px] lg:h-[500px] relative group overflow-hidden rounded-3xl border border-white/10 hover:border-orange-500/50 transition-all duration-500 shadow-2xl"
                  >
                      <div className="absolute inset-0">
                          <img src={displayTrending[0].image} alt={displayTrending[0].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                      </div>
                      
                      {/* Floating Badge */}
                      <div className="absolute top-6 left-6 z-10">
                          <span className="bg-orange-500 text-black font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.6)] animate-pulse-slow">
                              <Flame size={16} fill="black" /> #1 HOT
                          </span>
                      </div>

                      <div className="absolute bottom-0 left-0 w-full p-8 z-10">
                          <span className="inline-block px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white mb-4">
                              {displayTrending[0].type}
                          </span>
                          <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight group-hover:text-orange-400 transition-colors">
                              {language === 'RU' ? (displayTrending[0].title_ru || displayTrending[0].title) : displayTrending[0].title}
                          </h3>
                          <div className="flex items-center gap-6">
                              <span className="text-3xl font-mono font-bold text-white">{displayTrending[0].price.toLocaleString('ru-RU')} ₽</span>
                              <div className="w-12 h-12 rounded-full bg-orange-500 text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                  <ShoppingBag size={20} />
                              </div>
                          </div>
                      </div>
                  </Link>
              )}
          </div>
      </section>

      {/* WORKFLOW SECTION - CENTERED HEADER */}
      <section className="px-0 md:px-4 py-12">
          <div className="flex flex-col items-center text-center mb-16">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] mb-4">
                    <GitMerge size={24} className="rotate-90" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">{language === 'RU' ? 'Протокол Развертывания' : 'Deployment Protocol'}</h2>
                <p className="text-gray-400 font-mono text-sm max-w-xl">{language === 'RU' ? 'Как это работает: от выбора до внедрения в 3 простых шага.' : 'How it works: from selection to execution in 3 simple steps.'}</p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Connection Lines (Desktop) */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-white/10 hidden md:block -translate-y-1/2 z-0"></div>

              {WORKFLOW_STEPS.map((step, i) => {
                  const StepIcon = step.icon;
                  return (
                      <div key={step.id} className="relative z-10 group text-center md:text-left">
                          <div className={`bg-[#0a0a0f] p-8 rounded-3xl border border-white/10 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] ${step.border} group-hover:border-opacity-50`}>
                              {/* Number BG */}
                              <div className="absolute -right-4 -bottom-4 text-9xl font-bold text-white/5 font-mono select-none pointer-events-none group-hover:text-white/10 transition-colors">
                                  {step.id}
                              </div>
                              
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 ${step.bg} ${step.color} shadow-lg`}>
                                  <StepIcon size={32} />
                              </div>
                              
                              <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                              <p className="text-gray-400 leading-relaxed text-sm">{step.desc}</p>
                          </div>
                          
                          {/* Mobile Connector */}
                          {i !== WORKFLOW_STEPS.length - 1 && (
                              <div className="flex justify-center my-4 md:hidden">
                                  <ArrowRight className="rotate-90 text-gray-600" />
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>
      </section>

      {/* REVIEWS & COMMUNITY - FULL WIDTH REDESIGN */}
      <section className="px-0 md:px-4 pb-20">
          <div className="bg-gradient-to-b from-white/5 to-transparent rounded-[3rem] border border-white/10 p-8 md:p-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyber-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                  
                  {/* Left: Community Call */}
                  <div className="text-center lg:text-left relative z-10">
                      <div className="inline-flex items-center gap-2 text-cyber-primary font-bold mb-4 bg-cyber-primary/10 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                          <Globe size={14} /> {language === 'RU' ? 'Комьюнити' : 'Community'}
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                          {language === 'RU' ? 'Присоединяйтесь к элите.' : 'Join the Elite.'}
                      </h2>
                      <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto lg:mx-0">
                          {language === 'RU' ? 'Следите за обновлениями, получайте бесплатные ресурсы и общайтесь с единомышленниками.' : 'Stay updated, get free resources and connect with like-minded creators.'}
                      </p>
                      
                      <div className="flex gap-4 flex-wrap justify-center lg:justify-start">
                          {SOCIAL_LINKS.map((social) => (
                              <a 
                                key={social.id}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group/btn relative w-14 h-14 flex items-center justify-center bg-black border border-white/10 rounded-2xl hover:-translate-y-1 transition-all hover:shadow-lg hover:shadow-${social.gradient.split('-')[1]}/30 overflow-hidden`}
                              >
                                  <div className={`absolute inset-0 bg-gradient-to-br ${social.gradient} opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300`}></div>
                                  <social.icon size={24} className="relative z-10 text-gray-400 group-hover/btn:text-white transition-colors" />
                              </a>
                          ))}
                      </div>
                  </div>

                  {/* Right: Reviews Preview */}
                  <div className="relative">
                      <div className="grid gap-4 opacity-80 hover:opacity-100 transition-opacity">
                          {recentReviews.map((review, i) => (
                              <div key={review.id} className={`bg-black/40 border border-white/10 p-4 rounded-xl flex gap-4 backdrop-blur-sm ${i === 1 ? 'lg:translate-x-8' : ''}`}>
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center font-bold text-white border border-white/10 flex-shrink-0">
                                      {review.userName[0]}
                                  </div>
                                  <div>
                                      <div className="flex items-center gap-2 mb-1">
                                          <span className="font-bold text-white text-sm">{review.userName}</span>
                                          <div className="flex text-yellow-500"><Star size={10} fill="currentColor" /></div>
                                      </div>
                                      <p className="text-xs text-gray-400 line-clamp-2">"{review.text}"</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                      <Link to="/reviews" className="absolute -bottom-6 right-0 text-xs font-bold text-cyber-primary hover:text-white flex items-center gap-1 bg-black/80 px-3 py-1 rounded-full border border-cyber-primary/20">
                          {language === 'RU' ? 'Все отзывы' : 'All Reviews'} <ChevronRight size={12} />
                      </Link>
                  </div>
              </div>
          </div>
      </section>

    </div>
  );
};
