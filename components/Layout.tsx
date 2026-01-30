import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingCart, User, Home, Box, Shield, MessageSquare, LogOut, Menu, X, Globe, Terminal, Mail, CheckCircle, Download, ArrowRight, Gift, Star, ThumbsUp, Users } from 'lucide-react';
import { UserRole, OrderStatus } from '../types';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { user, cart, language, toggleLanguage, logout, unreadCount, successNotification, closeSuccessNotification, welcomeGift, closeWelcomeGift } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Automatically close mobile menu whenever the route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;
  const isAdminPage = location.pathname.startsWith('/admin');

  // Ensure notification is only shown for the owner of the order AND NOT on admin pages
  const showNotification = successNotification && user && successNotification.userId === user.id && !isAdminPage;

  const handleGoToLibrary = () => {
    closeSuccessNotification();
    closeWelcomeGift();
    // Navigate with state to force opening the library tab
    navigate('/dashboard', { state: { tab: 'library' } });
  };

  const handleGoToReviews = () => {
      closeSuccessNotification();
      navigate('/reviews');
  }

  const handleLogout = () => {
      logout();
      navigate('/');
  };

  // Updated NavItem with responsive sizing to prevent overlap
  const NavItem = ({ to, icon: Icon, label, hasBadge = false }: { to: string, icon: any, label: string, hasBadge?: boolean }) => (
    <Link
      to={to}
      onClick={() => setMobileMenuOpen(false)}
      className={`relative flex items-center gap-1.5 lg:gap-1 xl:gap-2 px-3 py-2 rounded-lg transition-all duration-200 group whitespace-nowrap ${
        isActive(to) 
          ? 'bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]' 
          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
      }`}
    >
      <Icon size={16} className="flex-shrink-0" />
      <span className="font-medium text-xs xl:text-sm">{label}</span>
      {hasBadge && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-black shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
      )}
      
      {/* Hover Glow Effect */}
      {!isActive(to) && (
        <div className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen bg-cyber-900 text-gray-200 font-sans flex flex-col relative">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-cyber-800/80 backdrop-blur-xl border-b border-white/5 supports-[backdrop-filter]:bg-cyber-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="bg-cyber-primary/10 p-2 rounded-lg border border-cyber-primary/20 group-hover:border-cyber-primary/50 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                  <Terminal size={24} className="text-cyber-primary" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white font-mono hidden sm:block">
                  TECH<span className="text-cyber-primary">HACKER</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - Centered & Responsive */}
            <div className="hidden lg:flex items-center justify-center flex-1 px-4 lg:space-x-0.5 xl:space-x-1">
              <NavItem to="/" icon={Home} label={language === 'RU' ? 'Главная' : 'Home'} />
              <NavItem to="/shop" icon={Box} label={language === 'RU' ? 'Магазин' : 'Shop'} />
              <NavItem to="/free" icon={Gift} label={language === 'RU' ? 'Бесплатное' : 'Free'} />
              <NavItem to="/services" icon={Shield} label={language === 'RU' ? 'Услуги' : 'Services'} />
              <NavItem to="/reviews" icon={Star} label={language === 'RU' ? 'Отзывы' : 'Reviews'} />
              <NavItem to="/contacts" icon={Users} label={language === 'RU' ? 'Контакты' : 'Contacts'} />
              
              {user && (
                 <NavItem 
                    to="/dashboard" 
                    icon={User} 
                    label={language === 'RU' ? 'Кабинет' : 'Dashboard'} 
                    hasBadge={user.role === UserRole.USER && unreadCount > 0} 
                 />
              )}
              
              {user?.role === UserRole.ADMIN && (
                 <NavItem 
                    to="/admin" 
                    icon={Shield} 
                    label="Admin" 
                    hasBadge={unreadCount > 0} 
                 />
              )}
            </div>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-4 flex-shrink-0">
              <button onClick={toggleLanguage} className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-lg hover:bg-white/10">
                <span className="font-mono text-xs font-bold">{language}</span>
              </button>

              <Link to="/cart" className="relative p-2 text-gray-400 hover:text-cyber-primary transition-colors bg-white/5 rounded-lg hover:bg-white/10 group">
                <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold leading-none text-black bg-cyber-primary rounded-full border border-cyber-900">
                    {cart.length}
                  </span>
                )}
              </Link>

              {user ? (
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg border border-red-500/20 transition-all text-xs font-bold"
                >
                  <LogOut size={16} />
                  <span>{language === 'RU' ? 'ВЫЙТИ' : 'EXIT'}</span>
                </button>
              ) : (
                <Link to="/login" className="bg-cyber-primary text-black px-4 py-2 rounded-lg font-bold hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] text-xs xl:text-sm">
                   {language === 'RU' ? 'ВОЙТИ' : 'LOGIN'}
                </Link>
              )}
            </div>

            {/* Mobile Menu Button - UPDATED to Button Style */}
            <div className="lg:hidden flex items-center gap-3">
               <Link to="/cart" className="relative p-2 text-gray-400 hover:text-cyber-primary transition-colors">
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold leading-none text-black bg-cyber-primary rounded-full">
                    {cart.length}
                  </span>
                )}
              </Link>
              
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="flex items-center gap-2 bg-white/5 border border-white/10 text-gray-200 px-3 py-2 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
              >
                <span className="text-xs font-bold tracking-wider">
                    {mobileMenuOpen 
                        ? (language === 'RU' ? 'ЗАКРЫТЬ' : 'CLOSE') 
                        : (language === 'RU' ? 'МЕНЮ' : 'MENU')
                    }
                </span>
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-cyber-900/95 backdrop-blur-xl border-b border-white/5 animate-in slide-in-from-top-5 shadow-2xl absolute w-full left-0 top-16 z-40 h-[calc(100vh-64px)] overflow-y-auto">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavItem to="/" icon={Home} label={language === 'RU' ? 'Главная' : 'Home'} />
              <NavItem to="/shop" icon={Box} label={language === 'RU' ? 'Магазин' : 'Shop'} />
              <NavItem to="/free" icon={Gift} label={language === 'RU' ? 'Бесплатное' : 'Free'} />
              <NavItem to="/services" icon={Shield} label={language === 'RU' ? 'Услуги' : 'Services'} />
              <NavItem to="/reviews" icon={Star} label={language === 'RU' ? 'Отзывы' : 'Reviews'} />
              <NavItem to="/contacts" icon={Users} label={language === 'RU' ? 'Контакты' : 'Contacts'} />
              {user && <NavItem to="/dashboard" icon={User} label={language === 'RU' ? 'Кабинет' : 'Dashboard'} hasBadge={user.role === UserRole.USER && unreadCount > 0} />}
              {user?.role === UserRole.ADMIN && <NavItem to="/admin" icon={Shield} label="Admin" hasBadge={unreadCount > 0} />}
              
              <div className="border-t border-white/10 mt-4 pt-4 flex justify-between px-4 pb-8">
                 <button onClick={toggleLanguage} className="flex items-center space-x-2 text-gray-400 bg-white/5 px-3 py-2 rounded-lg">
                   <Globe size={18} /> <span className="font-mono font-bold">{language}</span>
                 </button>
                 {user ? (
                   <button 
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                      className="text-red-400 flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20"
                   >
                      <LogOut size={16} />
                      {language === 'RU' ? 'Выйти' : 'Logout'}
                   </button>
                 ) : (
                   <Link 
                      to="/login" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-black bg-cyber-primary px-6 py-2 rounded-lg font-bold shadow-lg"
                   >
                      {language === 'RU' ? 'Войти' : 'Login'}
                   </Link>
                 )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-cyber-800/50 border-t border-white/5 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2023 TechHacker. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            <a href="https://t.me/TechHacker_Official_Channel" target="_blank" rel="noopener noreferrer" className="hover:text-cyber-primary transition-colors">Telegram Channel</a>
            <a href="https://rutube.ru/channel/68054006/" target="_blank" rel="noopener noreferrer" className="hover:text-cyber-primary transition-colors">RuTube</a>
            <a href="https://vk.com/techhacker_official" target="_blank" rel="noopener noreferrer" className="hover:text-cyber-primary transition-colors">VKontakte</a>
            <Link to="/reviews" className="hover:text-cyber-primary transition-colors">{language === 'RU' ? 'Отзывы' : 'Reviews'}</Link>
            <Link to="/contacts" className="hover:text-cyber-primary transition-colors">{language === 'RU' ? 'Поддержка' : 'Support'}</Link>
          </div>
        </div>
      </footer>

      {/* GLOBAL SUCCESS MODAL (PAYMENT) */}
      {showNotification && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-cyber-900 border border-cyber-primary/30 rounded-2xl w-full max-w-lg shadow-[0_0_60px_rgba(0,240,255,0.2)] overflow-hidden relative">
                  {/* Decorative Glow */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyber-primary to-transparent"></div>
                  
                  <button onClick={closeSuccessNotification} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                      <X size={24} />
                  </button>

                  <div className="p-8 text-center">
                      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                          <CheckCircle size={48} className="text-green-500" />
                      </div>
                      
                      <h2 className="text-2xl font-bold text-white mb-2">
                          {language === 'RU' ? 'Поздравляем с покупкой!' : 'Congratulations!'}
                      </h2>
                      <p className="text-gray-400 mb-6">
                          {language === 'RU' 
                            ? 'Оплата прошла успешно. Ваши товары доступны для скачивания.' 
                            : 'Payment successful. Your items are now ready for download.'}
                      </p>

                      <div className="bg-cyber-800/50 rounded-xl p-4 mb-6 border border-white/5 text-left">
                          <p className="text-xs text-gray-500 uppercase font-bold mb-2 tracking-wider">
                              {language === 'RU' ? 'ВЫ КУПИЛИ' : 'PURCHASED ITEMS'}
                          </p>
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                              {successNotification.items.map((item, i) => (
                                  <div key={i} className="flex items-center gap-3">
                                      <div className="bg-cyber-700 p-1 rounded">
                                          <Box size={14} className="text-cyber-primary" />
                                      </div>
                                      <span className="text-sm font-medium truncate">{item.title}</span>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={handleGoToLibrary}
                            className="w-full bg-cyber-primary text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2 text-sm"
                        >
                            <Download size={18} />
                            {language === 'RU' ? 'Скачать' : 'Download'}
                        </button>
                        <button 
                            onClick={handleGoToReviews}
                            className="w-full bg-cyber-800 text-white border border-white/10 font-bold py-3 rounded-lg hover:bg-cyber-700 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <ThumbsUp size={18} />
                            {language === 'RU' ? 'Оценить' : 'Rate It'}
                        </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* WELCOME GIFT MODAL */}
      {welcomeGift && user && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-cyber-900 border border-purple-500/30 rounded-2xl w-full max-w-lg shadow-[0_0_80px_rgba(168,85,247,0.3)] overflow-hidden relative transform transition-all">
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none"></div>
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyber-primary/20 blur-[60px] rounded-full pointer-events-none"></div>

                  <button onClick={closeWelcomeGift} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
                      <X size={24} />
                  </button>

                  <div className="p-8 text-center relative z-10">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-cyber-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)] animate-bounce">
                          <Gift size={48} className="text-purple-400" />
                      </div>
                      
                      <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                          {language === 'RU' ? 'Добро пожаловать!' : 'Welcome Aboard!'}
                      </h2>
                      <p className="text-gray-300 mb-8 max-w-sm mx-auto leading-relaxed">
                          {language === 'RU' 
                            ? 'Поздравляем с регистрацией! Мы подготовили для вас эксклюзивный подарок.' 
                            : 'Thanks for joining! We have added an exclusive gift to your account.'}
                      </p>

                      <div className="bg-black/40 rounded-xl p-4 mb-8 border border-purple-500/20 flex items-center gap-4 text-left">
                          <img src={welcomeGift.image} className="w-16 h-16 rounded-lg object-cover border border-white/10" alt="Gift" />
                          <div>
                              <p className="text-[10px] text-purple-400 uppercase font-bold tracking-wider mb-1">
                                  {language === 'RU' ? 'ВАШ ПОДАРОК' : 'YOUR GIFT'}
                              </p>
                              <h4 className="text-white font-bold text-lg leading-tight">{welcomeGift.title}</h4>
                              <p className="text-xs text-gray-500 mt-1">{language === 'RU' ? 'Уже доступно в кабинете' : 'Available in Dashboard'}</p>
                          </div>
                      </div>

                      <button 
                          onClick={handleGoToLibrary}
                          className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-500 transition-all shadow-[0_0_25px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 group"
                      >
                          <Download size={20} className="group-hover:scale-110 transition-transform" />
                          {language === 'RU' ? 'Забрать подарок' : 'Claim Gift'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};