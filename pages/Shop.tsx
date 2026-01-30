import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductType } from '../types';
import { ShoppingCart, Check, Search, Terminal, PlayCircle, Code2, BookOpen, Grid, Sparkles, ArrowRight } from 'lucide-react';

export const Shop = () => {
  const { products, addToCart, cart, language } = useApp();
  const [filter, setFilter] = useState<ProductType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Category Configuration with Icons and Localized Labels
  const CATEGORIES = [
    { id: 'ALL', label: language === 'RU' ? 'Все' : 'All', icon: Grid },
    { id: ProductType.PROMPT, label: language === 'RU' ? 'Промпты' : 'Prompts', icon: Sparkles },
    { id: ProductType.COURSE, label: language === 'RU' ? 'Курсы' : 'Courses', icon: PlayCircle },
    { id: ProductType.SOFTWARE, label: language === 'RU' ? 'Софт' : 'Software', icon: Code2 },
    { id: ProductType.MANUAL, label: language === 'RU' ? 'Мануалы' : 'Manuals', icon: BookOpen },
  ];

  // Helper to get localized text
  const getLocalized = (product: any, field: string) => {
      if (language === 'RU') {
          return product[`${field}_ru`] || product[field];
      }
      return product[field];
  }

  // Filter Logic
  // ONLY SHOW PAID PRODUCTS (price > 0)
  const filteredProducts = products.filter(p => {
    // Exclude free products
    if (p.price === 0) return false;

    const matchesCategory = filter === 'ALL' || p.type === filter;
    
    // Search both English and Russian titles/descriptions to be safe
    const title = p.title.toLowerCase();
    const titleRu = (p.title_ru || '').toLowerCase();
    const desc = p.description.toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = title.includes(query) || titleRu.includes(query) || desc.includes(query);
    return matchesCategory && matchesSearch;
  });

  const isInCart = (id: string) => cart.some(p => p.id === id);

  return (
    <div className="space-y-8 min-h-[80vh]">
      
      {/* Header & Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
            <div>
                <h2 className="text-4xl font-bold tracking-tight mb-1">{language === 'RU' ? 'Каталог' : 'Catalog'}</h2>
                <p className="text-gray-400 text-sm">
                    {language === 'RU' ? 'Цифровые товары для автоматизации и обучения' : 'Digital assets for automation and learning'}
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-64">
                <input 
                    type="text" 
                    placeholder={language === 'RU' ? 'Поиск товаров...' : 'Search assets...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-cyber-primary outline-none text-white transition-all hover:border-white/20"
                />
                <Search size={16} className="absolute left-3 top-3.5 text-gray-500" />
            </div>
        </div>
        
        {/* Category Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = filter === cat.id;
            return (
                <button
                key={cat.id}
                onClick={() => setFilter(cat.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                    isActive 
                    ? 'bg-cyber-primary text-black border-cyber-primary shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                    : 'bg-cyber-800/50 text-gray-400 border-white/5 hover:bg-cyber-800 hover:text-white hover:border-white/20'
                }`}
                >
                <Icon size={16} />
                <span>{cat.label}</span>
                </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-cyber-800/20 rounded-2xl border border-white/5 border-dashed">
              <Search size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">{language === 'RU' ? 'Ничего не найдено' : 'No products found'}</p>
              <button onClick={() => {setFilter('ALL'); setSearchQuery('')}} className="text-cyber-primary mt-2 hover:underline">
                  {language === 'RU' ? 'Сбросить фильтры' : 'Reset filters'}
              </button>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
                // Determine display content based on language
                const displayTitle = getLocalized(product, 'title');
                const displayDesc = getLocalized(product, 'description');
                const displayFeatures = getLocalized(product, 'features');

                return (
                <div key={product.id} className="group bg-cyber-900/40 rounded-2xl border border-white/5 overflow-hidden flex flex-col hover:border-cyber-primary/40 hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 relative">
                    
                    {/* Image Area */}
                    <div className="relative h-52 overflow-hidden bg-gray-900">
                        <div className="absolute inset-0 bg-gradient-to-t from-cyber-900 via-transparent to-transparent z-10 opacity-80"></div>
                        <img 
                            src={product.image} 
                            alt={displayTitle} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                        />
                        
                        {/* Badge */}
                        <div className="absolute top-3 right-3 z-20">
                            <span className="bg-black/60 backdrop-blur-md text-cyber-primary border border-cyber-primary/20 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-lg">
                                {CATEGORIES.find(c => c.id === product.type)?.label || product.type}
                            </span>
                        </div>

                        {/* Language Badge */}
                        <div className="absolute bottom-3 left-3 z-20">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${product.language === 'RU' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-orange-500/20 text-orange-300 border-orange-500/30'}`}>
                                {product.language}
                            </span>
                        </div>
                    </div>
                    
                    {/* Content Area */}
                    <div className="p-6 flex-grow flex flex-col relative z-20 -mt-2">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-cyber-primary transition-colors line-clamp-2 leading-tight">
                            {displayTitle}
                        </h3>
                        
                        <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                            {displayDesc}
                        </p>
                        
                        {/* Features Mini List */}
                        <div className="mb-6 flex flex-wrap gap-2">
                            {displayFeatures.slice(0, 3).map((f: string, i: number) => (
                                <span key={i} className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded border border-white/5">
                                    {f}
                                </span>
                            ))}
                            {displayFeatures.length > 3 && (
                                <span className="text-[10px] bg-white/5 text-gray-500 px-2 py-1 rounded border border-white/5">
                                    +{displayFeatures.length - 3}
                                </span>
                            )}
                        </div>

                        {/* Footer Area */}
                        <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-white/5">
                            <div>
                                <span className="text-xs text-gray-500 block mb-0.5">{language === 'RU' ? 'Цена' : 'Price'}</span>
                                <span className="text-2xl font-bold text-white font-mono tracking-tight">{product.price.toLocaleString('ru-RU')} ₽</span>
                            </div>
                            
                            <button
                            onClick={() => addToCart(product)}
                            disabled={isInCart(product.id)}
                            className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex-grow justify-center ${
                                isInCart(product.id)
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default'
                                : 'bg-cyber-primary text-black hover:bg-cyan-400 hover:scale-[1.02] shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                            }`}
                            >
                            {isInCart(product.id) ? (
                                <>
                                <Check size={18} />
                                <span>{language === 'RU' ? 'Добавлено' : 'Added'}</span>
                                </>
                            ) : (
                                <>
                                <ShoppingCart size={18} />
                                <span>{language === 'RU' ? 'В корзину' : 'Add to Cart'}</span>
                                </>
                            )}
                            </button>
                        </div>
                    </div>
                </div>
            )})}
        </div>
      )}
    </div>
  );
};