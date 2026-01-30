
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { Terminal, Mail, Lock, User as UserIcon, LogIn, Loader, Info, CheckCircle, ArrowLeft, Check, HelpCircle, ChevronRight } from 'lucide-react';
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
  const [isProcessing, setIsProcessing] = useState(false);
  
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
        },
        undefined,
        true // Telegram auth always treats as register/login mixed, backend handles
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
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    container.appendChild(script);
    
    return () => {}
  }, [telegramSettings.botUsername, login, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    if (isRegister) {
      if (password !== confirmPassword) {
        alert(language === 'RU' ? 'Пароли не совпадают!' : 'Passwords do not match!');
        setIsProcessing(false);
        return;
      }
      if (!name) {
        alert(language === 'RU' ? 'Введите имя!' : 'Please enter your name!');
        setIsProcessing(false);
        return;
      }
    }

    const role = UserRole.USER; 
    const finalName = name || (email.split('@')[0]);
    
    try {
        await login(email, role, finalName, undefined, isRegister ? selectedAvatar : undefined, isRegister);
        navigate('/dashboard');
    } catch (e) {
        // Error handled in AppContext, just stop spinner
    } finally {
        setIsProcessing(false);
    }
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
    <div className="flex flex-col items-center justify-center min-h-[85vh] relative py-12 px-4">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="w-full max-w-md bg-black/60 backdrop-blur-2xl p-1 rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(0,240,255,0.15)] relative z-10 animate-in zoom-in-95 duration-500">
        
        {/* Glowing Border Inner */}
        <div className="absolute -inset-[1px] bg-gradient-to-b from-white/20 to-transparent rounded-3xl pointer-events-none"></div>

        <div className="bg-[#0a0a0f] rounded-[22px] p-8 relative overflow-hidden">
            
            {/* Header Icon */}
            <div className="flex justify-center mb-8">
                <div className="relative group">
                    <div className="absolute inset-0 bg-cyber-primary blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                    <div className="relative w-16 h-16 bg-black border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl group-hover:border-cyber-primary/50 transition-colors">
                        <Terminal size={32} className="text-white group-hover:text-cyber-primary transition-colors" />
                    </div>
                </div>
            </div>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                    {showForgotPass 
                    ? (language === 'RU' ? 'Восстановление' : 'Recovery')
                    : isRegister 
                        ? (language === 'RU' ? 'Создать аккаунт' : 'Create Account') 
                        : (language === 'RU' ? 'Терминал доступа' : 'Access Terminal')
                    }
                </h2>
                <p className="text-gray-500 text-xs mt-2">
                    {language === 'RU' ? 'Введите идентификатор для входа в систему' : 'Enter credentials to access the system'}
                </p>
                <div className="mt-4 flex justify-center">
                    <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-400 animate-pulse">
                        SYSTEM v2.8.4 ONLINE
                    </span>
                </div>
            </div>
            
            {showForgotPass ? (
                <form onSubmit={handleForgotPassword} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    {resetSuccess ? (
                        <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                                <CheckCircle size={24} />
                            </div>
                            <p className="text-green-200 text-sm font-medium">{resetSuccess}</p>
                            <button 
                                type="button"
                                onClick={() => { setShowForgotPass(false); setResetSuccess(null); }}
                                className="mt-6 text-xs bg-green-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-green-400 w-full"
                            >
                                {language === 'RU' ? 'ВЕРНУТЬСЯ КО ВХОДУ' : 'BACK TO LOGIN'}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl text-xs text-blue-300 flex gap-3 leading-relaxed">
                                <Info size={16} className="flex-shrink-0 mt-0.5" />
                                <p>
                                    {language === 'RU' 
                                        ? 'Введите ваш Email или имя пользователя. Мы отправим ссылку для сброса туда, где вы регистрировались (Email или Telegram).' 
                                        : 'Enter your Email or username. We will send a reset link to your registration source (Email or Telegram).'}
                                </p>
                            </div>

                            <div className="relative group">
                                <Mail size={18} className="absolute left-4 top-4 text-gray-500 group-focus-within:text-cyber-primary transition-colors" />
                                <input
                                type="text"
                                placeholder={language === 'RU' ? 'Email или Имя' : 'Email or Username'}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-gray-600 focus:border-cyber-primary focus:bg-black/40 outline-none transition-all font-mono"
                                required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isResetting}
                                className="w-full bg-cyber-primary text-black font-bold py-3.5 rounded-xl hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] flex items-center justify-center gap-2"
                            >
                                {isResetting ? <Loader className="animate-spin" size={18} /> : (language === 'RU' ? 'ОТПРАВИТЬ ССЫЛКУ' : 'SEND RESET LINK')}
                            </button>

                            <button 
                                type="button"
                                onClick={() => setShowForgotPass(false)}
                                className="w-full text-gray-500 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <ArrowLeft size={14} /> {language === 'RU' ? 'Отмена' : 'Cancel'}
                            </button>
                        </>
                    )}
                </form>
            ) : (
                <>
                    {/* Mode Toggle */}
                    <div className="grid grid-cols-2 gap-1 bg-white/5 p-1 rounded-xl mb-8">
                        <button 
                            onClick={() => setIsRegister(false)}
                            className={`py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${!isRegister ? 'bg-cyber-800 text-white shadow-lg border border-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {language === 'RU' ? 'Вход' : 'Login'}
                        </button>
                        <button 
                            onClick={() => setIsRegister(true)}
                            className={`py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${isRegister ? 'bg-cyber-800 text-white shadow-lg border border-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {language === 'RU' ? 'Регистрация' : 'Register'}
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                    
                    {/* Avatar Selection (Register Only) */}
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isRegister ? 'max-h-40 opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'}`}>
                        <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">{language === 'RU' ? 'Выберите аватар' : 'Select Avatar'}</label>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {DEFAULT_AVATARS.map((avatar, index) => (
                                <div 
                                    key={index}
                                    onClick={() => setSelectedAvatar(avatar)}
                                    className={`relative flex-shrink-0 w-12 h-12 cursor-pointer rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                                        selectedAvatar === avatar ? 'border-cyber-primary shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                                    }`}
                                >
                                    <img src={avatar} alt={`Avatar ${index}`} className="w-full h-full object-cover bg-black/50" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Name Field (Register Only) */}
                    <div className={`transition-all duration-300 overflow-hidden ${isRegister ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="relative group">
                        <UserIcon size={18} className="absolute left-4 top-4 text-gray-500 group-focus-within:text-cyber-primary transition-colors" />
                        <input
                            type="text"
                            name="username"
                            autoComplete="username"
                            placeholder={language === 'RU' ? 'Имя пользователя' : 'Username'}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-gray-600 focus:border-cyber-primary focus:bg-black/40 outline-none transition-all font-mono"
                            required={isRegister}
                        />
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="relative group">
                        <Mail size={18} className="absolute left-4 top-4 text-gray-500 group-focus-within:text-cyber-primary transition-colors" />
                        <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder={language === 'RU' ? 'Email адрес' : 'Email Address'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-gray-600 focus:border-cyber-primary focus:bg-black/40 outline-none transition-all font-mono"
                        required
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <div className="relative group">
                            <Lock size={18} className="absolute left-4 top-4 text-gray-500 group-focus-within:text-cyber-primary transition-colors" />
                            <input
                            type="password"
                            name="password"
                            autoComplete={isRegister ? "new-password" : "current-password"}
                            placeholder={language === 'RU' ? 'Пароль' : 'Password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-gray-600 focus:border-cyber-primary focus:bg-black/40 outline-none transition-all font-mono"
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
                                    <HelpCircle size={12} /> {language === 'RU' ? 'Забыли пароль?' : 'Forgot password?'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={`transition-all duration-300 overflow-hidden ${isRegister ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="relative group">
                        <Lock size={18} className="absolute left-4 top-4 text-gray-500 group-focus-within:text-cyber-primary transition-colors" />
                        <input
                            type="password"
                            name="confirmPassword"
                            autoComplete="new-password"
                            placeholder={language === 'RU' ? 'Подтверждение пароля' : 'Confirm Password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-gray-600 focus:border-cyber-primary focus:bg-black/40 outline-none transition-all font-mono"
                            required={isRegister}
                        />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isProcessing}
                        className="group w-full bg-gradient-to-r from-cyber-primary to-blue-500 text-black font-bold py-4 rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all flex justify-center items-center gap-2 relative overflow-hidden mt-6"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <div className="relative flex items-center gap-2">
                        {isProcessing ? (
                            <Loader className="animate-spin" size={20} />
                        ) : isRegister ? (
                            <span>{language === 'RU' ? 'СОЗДАТЬ АККАУНТ' : 'CREATE ACCOUNT'}</span>
                        ) : (
                            <>
                                <span>{language === 'RU' ? 'ВОЙТИ В СИСТЕМУ' : 'LOGIN TO SYSTEM'}</span>
                                <ChevronRight size={18} />
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
                            <span className="px-3 bg-[#0a0a0f] text-gray-600 font-mono uppercase tracking-wider">
                            {language === 'RU' ? 'Или через Telegram' : 'Or via Telegram'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col items-center w-full relative">
                            <div id="telegram-login-container" className="min-h-[40px] flex items-center justify-center w-full">
                            <div className="flex items-center space-x-2 text-gray-500 text-sm animate-pulse">
                                <Loader className="animate-spin" size={16} />
                                <span>Wait...</span>
                            </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};
