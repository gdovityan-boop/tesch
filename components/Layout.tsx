import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingCart, User, Home, Box, Shield, LogOut, Menu, X, Globe, Terminal, CheckCircle, Gift, Star, Users, Clock, Database, Mail, FileText, Scale } from 'lucide-react';
import { OrderStatus } from '../types';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { user, cart, language, toggleLanguage, logout, unreadCount, successNotification, closeSuccessNotification, welcomeGift, closeWelcomeGift, isDemoMode } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
      logout();
      navigate('/');
  };

  const NavItem = ({ to, icon: Icon, label, hasBadge = false }: { to: string, icon: any, label: string, hasBadge?: boolean }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={`relative flex items-center justify-center gap-2 px-4 py-2 rounded-full transition-all duration-200 group ${
          active 
            ? 'text-white bg-white/10' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <Icon size={16} className={`transition-colors ${active ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
        <span className="font-medium text-xs whitespace-nowrap">{label}</span>
        
        {hasBadge && (
            <span className="absolute top-1 right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background text-gray-200 font-sans flex flex-col relative overflow-x-hidden">
      
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center">
        {isDemoMode && (
            <div className="w-full bg-yellow-600/20 text-yellow-400 text-center text-[10px] py-1 font-bold">
                DEMO MODE - DB DISCONNECTED
            </div>
        )}

        <nav className={`w-full transition-all duration-300 border-b ${
            scrolled 
            ? 'bg-black/80 backdrop-blur-md border-white/5 py-3' 
            : 'bg-transparent border-transparent py-5'
        }`}>
            <div className="max-w-[1600px] mx-auto px-4 lg:px-8 flex items-center justify-between">
                
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-lg font-bold">
                        <Terminal size={18} />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">TECHHACKER</span>
                </Link>

                {/* Center Nav */}
                <div className="hidden lg:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
                    <NavItem to="/" icon={Home} label={language === 'RU' ? 'Главная' : 'Home'} />
                    <NavItem to="/shop" icon={Box} label={language === 'RU' ? 'Магазин' : 'Shop'} />
                    <NavItem to="/free" icon={Gift} label={language === 'RU' ? 'Free' : 'Free'} />
                    <NavItem to="/services" icon={Shield} label={language === 'RU' ? 'Услуги' : 'Services'} />
                    <NavItem to="/reviews" icon={Star} label={language === 'RU' ? 'Отзывы' : 'Reviews'} />
                    <NavItem to="/contacts" icon={Mail} label={language === 'RU' ? 'Контакты' : 'Contacts'} />
                </div>

                {/* Right Actions */}
                <div className="hidden lg:flex items-center gap-3">
                    <button onClick={toggleLanguage} className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase">
                        {language}
                    </button>

                    <div className="h-4 w-px bg-white/10"></div>

                    {user ? (
                        <>
                            <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-white transition-colors">
                                <img src={user.avatarUrl || 'https://via.placeholder.com/30'} className="w-6 h-6 rounded-full bg-white/10" alt=""/>
                                <span>{language === 'RU' ? 'Кабинет' : 'Dashboard'}</span>
                            </Link>
                            <button onClick={handleLogout} className="text-gray-500 hover:text-white"><LogOut size={16}/></button>
                        </>
                    ) : (
                        <Link to="/login" className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">
                            {language === 'RU' ? 'ВОЙТИ' : 'LOGIN'}
                        </Link>
                    )}

                    <Link to="/cart" className="relative p-2 text-gray-400 hover:text-white">
                        <ShoppingCart size={20} />
                        {cart.length > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-blue-500 rounded-full text-[9px] flex items-center justify-center text-white">{cart.length}</span>}
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <div className="lg:hidden flex items-center gap-4">
                    <Link to="/cart" className="relative text-white">
                        <ShoppingCart size={20} />
                        {cart.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></span>}
                    </Link>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black pt-24 px-6 pb-10 flex flex-col overflow-y-auto">
              <div className="space-y-6">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-2xl font-bold text-white">Home</Link>
                  <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="block text-2xl font-bold text-white">Shop</Link>
                  <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="block text-2xl font-bold text-white">Services</Link>
                  <Link to="/contacts" onClick={() => setMobileMenuOpen(false)} className="block text-2xl font-bold text-white">Contacts</Link>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-2xl font-bold text-blue-400">Dashboard</Link>
              </div>
              <div className="mt-auto pt-8 border-t border-white/10">
                  {user ? (
                      <button onClick={handleLogout} className="text-red-500 font-bold flex items-center gap-2"><LogOut/> Logout</button>
                  ) : (
                      <Link to="/login" className="block w-full bg-white text-black text-center py-3 rounded-xl font-bold">Login</Link>
                  )}
              </div>
          </div>
      )}

      {/* Main Content */}
      <main className="flex-grow pt-24 lg:pt-32 px-4 max-w-[1600px] mx-auto w-full relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black pt-16 pb-8 mt-20">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white">
                        <Terminal size={24} />
                        <span className="font-bold tracking-wider text-xl">TECHHACKER</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        {language === 'RU' 
                            ? 'Премиальные цифровые активы и инструменты автоматизации для профессионалов.'
                            : 'Premium digital assets and automation tools for professionals.'}
                    </p>
                </div>
                
                <div>
                    <h4 className="font-bold text-white mb-6">{language === 'RU' ? 'Платформа' : 'Platform'}</h4>
                    <ul className="space-y-4 text-sm text-gray-500">
                        <li><Link to="/shop" className="hover:text-cyber-primary transition-colors">{language === 'RU' ? 'Магазин' : 'Shop'}</Link></li>
                        <li><Link to="/services" className="hover:text-cyber-primary transition-colors">{language === 'RU' ? 'Услуги' : 'Services'}</Link></li>
                        <li><Link to="/free" className="hover:text-cyber-primary transition-colors">{language === 'RU' ? 'Бесплатно' : 'Free Resources'}</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-6">{language === 'RU' ? 'Поддержка' : 'Support'}</h4>
                    <ul className="space-y-4 text-sm text-gray-500">
                        <li><Link to="/contacts" className="hover:text-cyber-primary transition-colors">{language === 'RU' ? 'Контакты' : 'Contact Us'}</Link></li>
                        <li><Link to="/reviews" className="hover:text-cyber-primary transition-colors">{language === 'RU' ? 'Отзывы' : 'Reviews'}</Link></li>
                        <li><Link to="/dashboard" className="hover:text-cyber-primary transition-colors">{language === 'RU' ? 'Личный кабинет' : 'Dashboard'}</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-6">{language === 'RU' ? 'Юридическая информация' : 'Legal'}</h4>
                    <ul className="space-y-4 text-sm text-gray-500">
                        <li><Link to="/privacy" className="hover:text-cyber-primary transition-colors flex items-center gap-2"><FileText size={14}/> {language === 'RU' ? 'Политика конфиденциальности' : 'Privacy Policy'}</Link></li>
                        <li><Link to="/terms" className="hover:text-cyber-primary transition-colors flex items-center gap-2"><Scale size={14}/> {language === 'RU' ? 'Условия использования' : 'Terms of Use'}</Link></li>
                    </ul>
                </div>
            </div>
            
            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
                <p>© 2024 TechHacker Inc. All rights reserved.</p>
                <div className="flex gap-4">
                    <span>System v3.0</span>
                    <span>Secure Connection</span>
                </div>
            </div>
        </div>
      </footer>

      {/* Notifications Overlay */}
      {successNotification && (
          <div className="fixed bottom-8 right-8 z-50 bg-white text-black p-6 rounded-xl shadow-2xl animate-slide-up flex flex-col gap-4 max-w-sm">
              <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                      <h4 className="font-bold text-lg">{language === 'RU' ? 'Успешно' : 'Success'}</h4>
                      <p className="text-xs text-gray-600">
                          {successNotification.status === OrderStatus.COMPLETED 
                            ? (language === 'RU' ? 'Доступ к файлам открыт.' : 'Access granted.') 
                            : (language === 'RU' ? 'Заказ на проверке.' : 'Order under review.')}
                      </p>
                  </div>
              </div>
              <button onClick={() => { closeSuccessNotification(); navigate('/dashboard'); }} className="w-full bg-black text-white py-2 rounded-lg text-xs font-bold">
                  {language === 'RU' ? 'В ЛИЧНЫЙ КАБИНЕТ' : 'GO TO DASHBOARD'}
              </button>
          </div>
      )}
    </div>
  );
};
