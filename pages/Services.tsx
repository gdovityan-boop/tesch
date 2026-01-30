import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Code, Server, Bot, Database, Globe, Cpu, Zap, CheckCircle, Send, Loader, Lock, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Services = () => {
  const { language, serviceOfferings, submitServiceRequest, user } = useApp();
  const [selectedService, setSelectedService] = useState<string>('');
  const [contact, setContact] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Icon Map helper
  const ICON_MAP: Record<string, any> = {
      'Bot': Bot,
      'Shield': Shield,
      'Code': Code,
      'Server': Server,
      'Database': Database,
      'Globe': Globe,
      'Cpu': Cpu,
      'Zap': Zap
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return; // Should be blocked by UI, but double check
    
    if (!selectedService || !contact || !details) {
        alert(language === 'RU' ? 'Пожалуйста, заполните все поля' : 'Please fill in all fields');
        return;
    }

    setIsSubmitting(true);
    
    // Simulate delay for smoother UX
    await new Promise(r => setTimeout(r, 1500));
    
    await submitServiceRequest(selectedService, contact, details);
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Reset form after a delay
    setTimeout(() => {
        setIsSuccess(false);
        setContact('');
        setDetails('');
        setSelectedService('');
    }, 5000);
  };

  return (
    <div className="space-y-12 pb-12 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Hero Section */}
      <div className="relative text-center py-12 px-4 rounded-3xl bg-cyber-900 border border-white/5 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyber-primary/10 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/20 text-xs font-bold mb-6">
                  <Zap size={14} />
                  <span>{language === 'RU' ? 'ПРОФЕССИОНАЛЬНАЯ РАЗРАБОТКА' : 'PROFESSIONAL DEVELOPMENT'}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white leading-tight">
                  {language === 'RU' ? 'Инжиниринг Будущего' : 'Engineering the Future'}
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                  {language === 'RU' 
                    ? 'Мы создаем передовые решения на стыке AI, блокчейна и автоматизации. Выберите услугу и масштабируйте свой бизнес.' 
                    : 'We build cutting-edge solutions at the intersection of AI, blockchain, and automation. Choose a service and scale your business.'}
              </p>
          </div>
      </div>

      {/* Services Grid */}
      <div id="services-grid" className="grid md:grid-cols-2 gap-6">
        {serviceOfferings.map(s => {
            const isCustomIcon = s.icon.startsWith('http') || s.icon.startsWith('data:');
            const IconComponent = ICON_MAP[s.icon] || Zap;
            const isSelected = selectedService === s.title;
            
            return (
              <div 
                key={s.id}
                onClick={() => setSelectedService(s.title)}
                className={`group cursor-pointer p-8 rounded-2xl border relative overflow-hidden transition-all duration-300 ${
                  isSelected
                    ? 'bg-cyber-primary/5 border-cyber-primary shadow-[0_0_20px_rgba(0,240,255,0.15)] scale-[1.02]' 
                    : 'bg-cyber-800/40 border-white/5 hover:border-white/20 hover:bg-cyber-800/60'
                }`}
              >
                {/* Checkmark for selection */}
                {isSelected && (
                    <div className="absolute top-4 right-4 text-cyber-primary animate-in zoom-in">
                        <CheckCircle size={24} className="fill-cyber-primary/10" />
                    </div>
                )}

                <div className="flex flex-col h-full">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${
                        isSelected ? 'bg-cyber-primary text-black' : 'bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10'
                    }`}>
                        {isCustomIcon ? (
                            <img src={s.icon} alt="" className="w-full h-full object-cover rounded-md" />
                        ) : (
                            <IconComponent size={28} />
                        )}
                    </div>
                    
                    <h3 className={`text-xl font-bold mb-3 ${isSelected ? 'text-cyber-primary' : 'text-white'}`}>
                        {s.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-6 flex-grow leading-relaxed">
                        {s.description}
                    </p>
                    
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-mono uppercase">{language === 'RU' ? 'Старт от' : 'Starting at'}</span>
                        <span className="text-lg font-bold font-mono text-white group-hover:text-cyber-primary transition-colors">{s.price}</span>
                    </div>
                </div>
              </div>
            );
        })}
        
        {serviceOfferings.length === 0 && (
            <div className="col-span-2 text-center py-20 text-gray-500 border border-white/5 border-dashed rounded-xl bg-black/20">
                {language === 'RU' ? 'Список услуг пуст' : 'No services listed yet'}
            </div>
        )}
      </div>

      {/* Submission Form */}
      <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-primary/5 to-transparent blur-3xl -z-10"></div>
          
          <div className="bg-cyber-900/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/10 max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
            
            {isSuccess ? (
                <div className="flex flex-col items-center justify-center text-center py-12 animate-in zoom-in">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                        <CheckCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{language === 'RU' ? 'Заявка отправлена!' : 'Request Sent!'}</h3>
                    <p className="text-gray-400 max-w-md">
                        {language === 'RU' 
                            ? 'Мы получили ваш запрос и свяжемся с вами в ближайшее время по указанным контактам.' 
                            : 'We have received your request and will contact you shortly via the provided details.'}
                    </p>
                    <button 
                        onClick={() => setIsSuccess(false)}
                        className="mt-8 text-sm text-gray-500 hover:text-white underline"
                    >
                        {language === 'RU' ? 'Отправить еще одну' : 'Send another'}
                    </button>
                </div>
            ) : (
                <>
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold mb-3">{language === 'RU' ? 'Оставить заявку' : 'Submit Request'}</h2>
                        <p className="text-gray-400">
                            {language === 'RU' ? 'Заполните форму ниже, и мы обсудим ваш проект.' : 'Fill out the form below and let\'s discuss your project.'}
                        </p>
                    </div>

                    {!user ? (
                        <div className="flex flex-col items-center justify-center py-10 border border-dashed border-white/10 rounded-2xl bg-black/20">
                            <Lock size={48} className="text-gray-600 mb-4" />
                            <h3 className="text-xl font-bold text-gray-300 mb-2">{language === 'RU' ? 'Требуется авторизация' : 'Login Required'}</h3>
                            <p className="text-gray-500 mb-6 max-w-sm text-center">
                                {language === 'RU' ? 'Чтобы оставить заявку на услугу, пожалуйста, войдите или зарегистрируйтесь.' : 'Please login or register to submit a service request.'}
                            </p>
                            <Link to="/login" className="bg-cyber-primary text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-cyan-400 transition-all shadow-lg">
                                <LogIn size={18} />
                                {language === 'RU' ? 'Войти в аккаунт' : 'Login to Account'}
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                        {language === 'RU' ? 'Тип услуги' : 'Service Type'}
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={selectedService} 
                                            readOnly 
                                            placeholder={language === 'RU' ? 'Выберите услугу выше...' : 'Select a service above...'}
                                            className={`w-full bg-black/40 border rounded-xl p-4 text-white focus:outline-none transition-colors cursor-pointer ${
                                                selectedService ? 'border-cyber-primary/50 bg-cyber-primary/5' : 'border-white/10 placeholder-gray-600'
                                            }`}
                                            onClick={() => document.getElementById('services-grid')?.scrollIntoView({ behavior: 'smooth' })}
                                        />
                                        {selectedService && <CheckCircle size={18} className="absolute right-4 top-4 text-cyber-primary" />}
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                        {language === 'RU' ? 'Ваши контакты' : 'Your Contact'}
                                    </label>
                                    <input 
                                        type="text" 
                                        value={contact}
                                        onChange={(e) => setContact(e.target.value)}
                                        placeholder="@username or email" 
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-cyber-primary focus:bg-black/60 outline-none transition-all placeholder-gray-600" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                    {language === 'RU' ? 'Детали проекта' : 'Project Details'}
                                </label>
                                <textarea 
                                    rows={5} 
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-cyber-primary focus:bg-black/60 outline-none transition-all placeholder-gray-600 resize-none" 
                                    placeholder={language === 'RU' ? 'Опишите задачу, сроки и пожелания...' : 'Describe the task, deadlines, and wishes...'} 
                                    required
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-cyber-primary text-black font-bold py-4 rounded-xl hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                {isSubmitting ? (
                                    <>
                                        <Loader size={20} className="animate-spin" />
                                        <span>{language === 'RU' ? 'Отправка...' : 'Sending...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                                        <span>{language === 'RU' ? 'Отправить заявку' : 'Send Request'}</span>
                                    </>
                                )}
                            </button>
                            
                            <p className="text-center text-xs text-gray-600">
                                {language === 'RU' ? 'Нажимая кнопку, вы соглашаетесь с условиями обработки данных.' : 'By clicking submit, you agree to our data processing terms.'}
                            </p>
                        </form>
                    )}
                </>
            )}
          </div>
      </div>
    </div>
  );
};