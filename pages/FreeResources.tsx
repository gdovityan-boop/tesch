import React from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Download, Gift, PlayCircle, Code2, BookOpen, Sparkles, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductType } from '../types';

export const FreeResources = () => {
  const { products, user, language } = useApp();

  // Filter only free products (price === 0)
  const freeProducts = products.filter(p => p.price === 0);

  // Helper to get localized text
  const getLocalized = (product: any, field: string) => {
      if (language === 'RU') {
          return product[`${field}_ru`] || product[field];
      }
      return product[field];
  }

  const handleDownload = (url: string | undefined) => {
      if (!url) return;
      window.open(url, '_blank');
  };

  const CATEGORIES = [
    { id: ProductType.PROMPT, label: language === 'RU' ? 'Промпты' : 'Prompts', icon: Sparkles },
    { id: ProductType.COURSE, label: language === 'RU' ? 'Курсы' : 'Courses', icon: PlayCircle },
    { id: ProductType.SOFTWARE, label: language === 'RU' ? 'Софт' : 'Software', icon: Code2 },
    { id: ProductType.MANUAL, label: language === 'RU' ? 'Мануалы' : 'Manuals', icon: BookOpen },
  ];

  return (
    <div className="space-y-8 min-h-[80vh]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left bg-gradient-to-r from-cyber-900 via-cyber-800 to-cyber-900 p-8 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div>
                <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold mb-4 border border-green-500/20">
                    <Gift size={14} />
                    {language === 'RU' ? 'БЕСПЛАТНЫЙ ДОСТУП' : 'FREE ACCESS'}
                </div>
                <h2 className="text-4xl font-bold tracking-tight mb-2 text-white">
                    {language === 'RU' ? 'Бесплатные Ресурсы' : 'Free Resources'}
                </h2>
                <p className="text-gray-400 max-w-xl">
                    {language === 'RU' 
                        ? 'Коллекция полезных промптов, плагинов и скриптов от команды TechHacker. Доступно бесплатно для всех зарегистрированных пользователей.'
                        : 'A collection of useful prompts, plugins, and scripts from the TechHacker team. Available for free to all registered users.'}
                </p>
            </div>
            
            <div className="bg-black/30 p-6 rounded-2xl border border-white/10 backdrop-blur-sm max-w-sm">
                <div className="flex items-start gap-4">
                    <div className="bg-cyber-primary/20 p-3 rounded-lg text-cyber-primary">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm mb-1">{language === 'RU' ? 'Требуется авторизация' : 'Auth Required'}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            {language === 'RU' ? 'Чтобы скачать файлы, войдите в аккаунт.' : 'Please login to download files.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeProducts.map(product => {
                const displayTitle = getLocalized(product, 'title');
                const displayDesc = getLocalized(product, 'description');
                const displayFeatures = getLocalized(product, 'features');

                return (
                    <div key={product.id} className="group bg-cyber-900/40 rounded-2xl border border-white/5 overflow-hidden flex flex-col hover:border-green-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-all duration-300 relative">
                        
                         {/* Image Area */}
                         <div className="relative h-48 overflow-hidden bg-gray-900">
                            <div className="absolute inset-0 bg-gradient-to-t from-cyber-900 via-transparent to-transparent z-10 opacity-80"></div>
                            <img 
                                src={product.image} 
                                alt={displayTitle} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                            />
                            
                            {/* Type Badge */}
                            <div className="absolute top-3 right-3 z-20">
                                <span className="bg-black/60 backdrop-blur-md text-gray-300 border border-white/10 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                                    {CATEGORIES.find(c => c.id === product.type)?.icon && React.createElement(CATEGORIES.find(c => c.id === product.type)!.icon, {size: 10})}
                                    {product.type}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-grow flex flex-col relative z-20 -mt-2">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-green-400 transition-colors line-clamp-2 leading-tight">
                                {displayTitle}
                            </h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                                {displayDesc}
                            </p>

                             {/* Features Mini List */}
                            <div className="mb-6 flex flex-wrap gap-2">
                                {displayFeatures.slice(0, 3).map((f: string, i: number) => (
                                    <span key={i} className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded border border-white/5">
                                        {f}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-auto pt-4 border-t border-white/5">
                                {user ? (
                                    <button 
                                        onClick={() => handleDownload(product.downloadUrl)}
                                        className="w-full flex items-center justify-center space-x-2 bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-3 rounded-xl font-bold text-sm hover:bg-green-500 hover:text-white transition-all shadow-lg group-hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                    >
                                        <Download size={18} />
                                        <span>{language === 'RU' ? 'Скачать бесплатно' : 'Download Free'}</span>
                                    </button>
                                ) : (
                                    <Link 
                                        to="/login"
                                        className="w-full flex items-center justify-center space-x-2 bg-cyber-800 text-gray-400 border border-white/10 px-4 py-3 rounded-xl font-bold text-sm hover:bg-cyber-700 hover:text-white transition-all"
                                    >
                                        <Lock size={16} />
                                        <span>{language === 'RU' ? 'Войти для скачивания' : 'Login to Download'}</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
        
        {freeProducts.length === 0 && (
             <div className="text-center py-20 bg-cyber-800/20 rounded-2xl border border-white/5 border-dashed">
                <Gift size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">{language === 'RU' ? 'Нет бесплатных ресурсов' : 'No free resources available yet'}</p>
            </div>
        )}

    </div>
  );
};