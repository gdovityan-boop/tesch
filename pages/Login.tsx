
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { Terminal, Mail, Lock, User as UserIcon, LogIn, Loader, Info, CheckCircle, ArrowLeft, Check, HelpCircle } from 'lucide-react';
import { ADMIN_TELEGRAM_IDS } from '../services/mockData';
import { authService } from '../services/authService';

const DEFAULT_AVATARS = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Zane',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Milo',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Bear',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Cyber',
];

export const Login = () => {
  const { login, language, telegramSettings, allUsers } = useApp();
  const navigate = useNavigate();
  
  // State
  const [isRegister, setIsRegister] = useState(false);
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [widgetKey, setWidgetKey] = useState(0); 
  
  // Avatar Selection State
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);

  // Reset State
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Inject Telegram Widget
  useEffect(() => {
    (window as any).onTelegramAuth = (user: any) => {
      console.log('Telegram Auth:', user);
      
      const tgId = user.id.toString();
      const isAdminUser = ADMIN_TELEGRAM_IDS.includes(tgId);
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
      
      login(
        user.username ? `${user.username}@t.me` : `tg_${tgId}@telegram.org`,
        isAdminUser ? UserRole.ADMIN : UserRole.USER,
        fullName,
        {
          id: `tg-${tgId}`,
          telegramId: tgId,
          avatarUrl: user.photo_url, // Automatically use Telegram photo
          name: fullName,
          registrationSource: 'TELEGRAM'
        }
      );
      
      navigate('/dashboard');
    };

    const container = document.getElementById('telegram-login-container');
    if (!container) return;

    const existingScript = document.getElementById('telegram-widget-script');
    if (existingScript) existingScript.remove();
    container.innerHTML = '';

    const script = document.createElement('script');
    script.id = 'telegram-widget-script';
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute('data-telegram-login', telegramSettings.botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    container.appendChild(script);
    
    return () => {}
  }, [telegramSettings.botUsername, login, navigate, widgetKey]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegister) {
      if (password !== confirmPassword) {
        alert(language === 'RU' ? 'Пароли не совпадают!' : 'Passwords do not match!');
        return;
      }
      if (!name) {
        alert(language === 'RU' ? 'Введите имя!' : 'Please enter your name!');
        return;
      }
    }

    // Default role is USER. Admin role must be set in Database manually.
    const role = UserRole.USER; 
    const finalName = name || (email.split('@')[0]);
    
    login(email, role, finalName, undefined, isRegister ? selectedAvatar : undefined);
    navigate('/dashboard');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setResetSuccess(null);
      
      const foundUser = allUsers.find(u => u.email === email || u.name === email);
      
      if (foundUser) {
          setIsResetting(true);
          try {
              const result = await authService.sendPasswordReset(foundUser);
              setResetSuccess(result.message);
          } catch (error) {
              alert('Error sending reset link');
          } finally {
              setIsResetting(false);
          }
      } else {
          alert(language === 'RU' 
            ? 'Пользователь с таким Email или именем не найден.' 
            : 'User with this Email or username not found.');
      }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
      <div className="w-full max-w-md bg-cyber-800/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.7)] relative overflow-hidden mb-8">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-primary to-transparent opacity-50"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyber-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center mb-8">
          <div className="bg-cyber-900 p-4 rounded-xl border border-cyber-primary/30 shadow-[0_0_20px_rgba(0,240,255,0.15)] mb-4 group">
            <Terminal size={32} className="text-cyber-primary group-hover:text-white transition-colors" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {showForgotPass 
              ? (language === 'RU' ? 'Восстановление' : 'Recovery')
              : isRegister 
                ? (language === 'RU' ? 'Инициализация' : 'Initialize Identity') 
                : (language === 'RU' ? 'Вход в терминал' : 'Access Terminal')
            }
          </h2>
          <p className="text-gray-500 text-xs font-mono mt-1 tracking-wider uppercase">
            {showForgotPass
              ? (language === 'RU' ? 'СБРОС ДОСТУПА' : 'ACCESS RESET')
              : isRegister 
                ? (language === 'RU' ? 'СОЗДАНИЕ НОВОГО ПРОФИЛЯ' : 'NEW PROFILE CREATION')
                : (language === 'RU' ? 'ТРЕБУЕТСЯ АВТОРИЗАЦИЯ' : 'AUTHENTICATION REQUIRED')
            }
          </p>
        </div>
        
        {showForgotPass ? (
             <form onSubmit={handleForgotPassword} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                 {resetSuccess ? (
                     <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-center">
                         <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                         <p className="text-green-200 text-sm">{resetSuccess}</p>
                         <button 
                            type="button"
                            onClick={() => { setShowForgotPass(false); setResetSuccess(null); }}
                            className="mt-4 text-xs bg-green-500 text-black font-bold px-4 py-2 rounded hover:bg-green-400"
                         >
                            OK
                         </button>
                     </div>
                 ) : (
                     <>
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-xs text-blue-200 flex gap-3">
                            <Info size={16} className="flex-shrink-0 mt-0.5" />
                            <p>
                                {language === 'RU' 
                                    ? 'Введите ваш Email или имя пользователя. Мы отправим ссылку для сброса туда, где вы регистрировались (Email или Telegram).' 
                                    : 'Enter your Email or username. We will send a reset link to your registration source (Email or Telegram).'}
                            </p>
                        </div>

                        <div className="relative group">
                            <Mail size={18} className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-cyber-primary transition-colors" />
                            <input
                            type="text"
                            placeholder={language === 'RU' ? 'Email или Имя' : 'Email or Username'}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:border-cyber-primary focus:bg-black/60 outline-none transition-all font-mono"
                            required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isResetting}
                            className="w-full bg-cyber-primary text-black font-bold py-3 rounded-lg hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] flex items-center justify-center gap-2"
                        >
                            {isResetting && <Loader className="animate-spin" size={16} />}
                            {language === 'RU' ? 'ОТПРАВИТЬ ССЫЛКУ' : 'SEND RESET LINK'}
                        </button>
                     </>
                 )}

                 <button 
                    type="button"
                    onClick={() => setShowForgotPass(false)}
                    className="w-full text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2"
                 >
                    <ArrowLeft size={14} /> {language === 'RU' ? 'Вернуться ко входу' : 'Back to Login'}
                 </button>
             </form>
        ) : (
            <>
                {/* Tabs */}
                <div className="flex bg-black/40 rounded-lg p-1 mb-8 border border-white/5 relative">
                <button 
                    onClick={() => setIsRegister(false)}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-300 ${!isRegister ? 'bg-cyber-700 text-cyber-primary shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    {language === 'RU' ? 'Вход' : 'Login'}
                </button>
                <button 
                    onClick={() => setIsRegister(true)}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-300 ${isRegister ? 'bg-cyber-700 text-cyber-primary shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    {language === 'RU' ? 'Регистрация' : 'Register'}
                </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-5">
                
                {/* Avatar Selection (Register Only) */}
                <div className={`transition-all duration-500 overflow-hidden ${isRegister ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <label className="block text-xs text-gray-500 mb-2 font-mono uppercase">{language === 'RU' ? 'Выберите аватар' : 'Select Avatar'}</label>
                    <div className="grid grid-cols-6 gap-2">
                        {DEFAULT_AVATARS.map((avatar, index) => (
                            <div 
                                key={index}
                                onClick={() => setSelectedAvatar(avatar)}
                                className={`relative cursor-pointer rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                                    selectedAvatar === avatar ? 'border-cyber-primary shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                            >
                                <img src={avatar} alt={`Avatar ${index}`} className="w-full h-full object-cover bg-black/50" />
                                {selectedAvatar === avatar && (
                                    <div className="absolute inset-0 bg-cyber-primary/20 flex items-center justify-center">
                                        <Check size={12} className="text-white drop-shadow-md" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Name Field (Register Only) */}
                <div className={`transition-all duration-300 overflow-hidden ${isRegister ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="relative group">
                    <UserIcon size={18} className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-cyber-primary transition-colors" />
                    <input
                        type="text"
                        placeholder={language === 'RU' ? 'Имя пользователя' : 'Username'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:border-cyber-primary focus:bg-black/60 outline-none transition-all font-mono"
                        required={isRegister}
                    />
                    </div>
                </div>

                {/* Email Field */}
                <div className="relative group">
                    <Mail size={18} className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-cyber-primary transition-colors" />
                    <input
                    type="email"
                    placeholder={language === 'RU' ? 'Email адрес' : 'Email Address'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:border-cyber-primary focus:bg-black/60 outline-none transition-all font-mono"
                    required
                    />
                </div>

                {/* Password Field */}
                <div>
                    <div className="relative group">
                        <Lock size={18} className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-cyber-primary transition-colors" />
                        <input
                        type="password"
                        placeholder={language === 'RU' ? 'Пароль' : 'Password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:border-cyber-primary focus:bg-black/60 outline-none transition-all font-mono"
                        required
                        />
                    </div>
                    {!isRegister && (
                        <div className="flex justify-end mt-2">
                            <button 
                                type="button" 
                                onClick={() => setShowForgotPass(true)}
                                className="text-xs text-gray-500 hover:text-cyber-primary transition-colors flex items-center gap-1"
                            >
                                <HelpCircle size={10} /> {language === 'RU' ? 'Забыли пароль?' : 'Forgot password?'}
                            </button>
                        </div>
                    )}
                </div>

                <div className={`transition-all duration-300 overflow-hidden ${isRegister ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="relative group">
                    <Lock size={18} className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-cyber-primary transition-colors" />
                    <input
                        type="password"
                        placeholder={language === 'RU' ? 'Подтверждение пароля' : 'Confirm Password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:border-cyber-primary focus:bg-black/60 outline-none transition-all font-mono"
                        required={isRegister}
                    />
                    </div>
                </div>

                <button
                    type="submit"
                    className="group w-full bg-cyber-primary text-black font-bold py-3 rounded-lg hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] flex justify-center items-center gap-2 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <div className="relative flex items-center gap-2">
                    {isRegister ? (
                        <span>{language === 'RU' ? 'ПОДТВЕРДИТЬ' : 'REGISTER'}</span>
                    ) : (
                        <>
                            <LogIn size={18} />
                            <span>{language === 'RU' ? 'ВОЙТИ' : 'CONNECT'}</span>
                        </>
                    )}
                    </div>
                </button>
                </form>

                <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-cyber-900 text-gray-500 font-mono uppercase">
                    {language === 'RU' ? 'Или через Telegram' : 'Or via Telegram'}
                    </span>
                </div>
                </div>

                <div className="flex flex-col gap-4">
                
                <div className="flex flex-col items-center w-full relative">
                    <div id="telegram-login-container" className="min-h-[40px] flex items-center justify-center w-full">
                    <div className="flex items-center space-x-2 text-gray-500 text-sm">
                        <Loader className="animate-spin" size={16} />
                        <span>Loading Telegram Widget...</span>
                    </div>
                    </div>
                </div>

                </div>
            </>
        )}
      </div>
    </div>
  );
};
