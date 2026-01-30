import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Code, Zap, Search, CreditCard, Download, HelpCircle, Mail, Star, PlayCircle, Send, Video, Globe } from 'lucide-react';
import { ProductType } from '../types';

// Components for Home Page sections
const StatItem = ({ number, label }: { number: string, label: string }) => (
    <div className="text-center">
        <div className="text-3xl md:text-4xl font-bold text-white mb-1 font-mono">{number}</div>
        <div className="text-sm text-gray-500 uppercase tracking-wider">{label}</div>
    </div>
);

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="bg-cyber-800/50 p-6 rounded-xl border border-white/5 hover:border-cyber-primary/30 transition-all hover:-translate-y-1">
        <div className="bg-cyber-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-cyber-primary border border-white/10">
            <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

const ProcessStep = ({ number, icon: Icon, title, desc }: { number: string, icon: any, title: string, desc: string }) => (
    <div className="relative text-center md:text-left md:pl-8 group">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-12 h-12 bg-cyber-900 border border-cyber-primary rounded-full flex items-center justify-center text-cyber-primary z-10 font-bold font-mono">
            {number}
        </div>
        <div className="pt-16 md:pt-2">
            <div className="bg-cyber-800/30 p-6 rounded-xl border border-white/5 hover:border-cyber-primary/20 transition-all">
                <Icon size={24} className="mb-3 text-gray-300 group-hover:text-cyber-primary transition-colors mx-auto md:mx-0" />
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
            </div>
        </div>
    </div>
);

// Define Props Interface for TestimonialCard to fix key issue
interface TestimonialCardProps {
    name: string;
    product?: string;
    text: string;
    rating: number;
    avatar?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, product, text, rating, avatar }) => (
    <div className="bg-cyber-900/50 p-6 rounded-xl border border-white/5">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-cyber-700 flex items-center justify-center overflow-hidden">
                {avatar ? <img src={avatar} className="w-full h-full object-cover" alt={name} /> : <span className="font-bold">{name[0]}</span>}
            </div>
            <div>
                <h4 className="font-bold text-sm text-white">{name}</h4>
                {product && <p className="text-xs text-cyber-primary">{product}</p>}
            </div>
            <div className="ml-auto flex">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className={i < rating ? "fill-yellow-500 text-yellow-500" : "text-gray-600"} />
                ))}
            </div>
        </div>
        <p className="text-gray-400 text-sm italic">"{text}"</p>
    </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <div className="border-b border-white/10">
            <button 
                className="w-full py-4 flex justify-between items-center text-left hover:text-cyber-primary transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-bold">{question}</span>
                <span className="text-2xl">{isOpen ? '−' : '+'}</span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 pb-4' : 'max-h-0'}`}>
                <p className="text-gray-400 text-sm leading-relaxed">{answer}</p>
            </div>
        </div>
    );
};

// Helper component for Code icon since I cannot import it directly if it's not exported from lucide-react in the same way (using Send as placeholder logic above)
const CodeIcon = ({ size, className }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
);

export const Home = () => {
  const { language, products, reviews, trendingProducts } = useApp();

  const heroTitle = language === 'RU' 
    ? <>Цифровые активы для <span className="text-cyber-primary">AI Эры</span></>
    : <>Digital Assets for the <span className="text-cyber-primary">AI Era</span></>;
  
  const heroSubtitle = language === 'RU'
    ? 'Промпты, скрипты, курсы и автоматизация. Повысьте свою продуктивность с TechHacker.'
    : 'Prompts, scripts, courses, and automation. Boost your productivity with TechHacker.';

  const cta = language === 'RU' ? 'Открыть каталог' : 'Explore Catalog';

  // Use the computed trending products from context, fallback to slice if empty
  const displayTrending = (trendingProducts && trendingProducts.length > 0) 
    ? trendingProducts 
    : (products || []).slice(0, 3);
  
  const recentReviews = (reviews || []).slice(0, 3);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 text-center">
        <div className="absolute inset-0 bg-cyber-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
            {/* Status Badge */}
            <div className="inline-flex items-center space-x-2 bg-cyber-800/80 border border-cyber-primary/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-mono text-cyber-primary tracking-wide">SYSTEM ONLINE v2.0</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
              {heroTitle}
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              {heroSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to="/shop"
                  className="inline-flex items-center space-x-2 bg-cyber-primary text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-cyan-400 transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                >
                  <span>{cta}</span>
                  <ArrowRight size={20} />
                </Link>
                <Link 
                  to="/services"
                  className="inline-flex items-center space-x-2 bg-cyber-800 text-white border border-white/10 px-8 py-4 rounded-full font-bold text-lg hover:bg-cyber-700 transition-all"
                >
                  <span>{language === 'RU' ? 'Услуги' : 'Services'}</span>
                </Link>
            </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/5 py-12 bg-black/20">
          <StatItem number="5K+" label={language === 'RU' ? 'Пользователей' : 'Active Users'} />
          <StatItem number="10K+" label={language === 'RU' ? 'Продаж' : 'Sales Made'} />
          <StatItem number="99%" label={language === 'RU' ? 'Рейтинг' : 'Satisfaction'} />
          <StatItem number="24/7" label={language === 'RU' ? 'Поддержка' : 'Support'} />
      </section>

      {/* Features */}
      <section>
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{language === 'RU' ? 'Почему мы?' : 'Why Choose Us?'}</h2>
            <p className="text-gray-400">{language === 'RU' ? 'Технологии, которые работают на вас' : 'Technologies that work for you'}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Cpu} 
              title={language === 'RU' ? "AI Промпты" : "AI Prompts"} 
              desc={language === 'RU' ? "Профессиональные промпты для Midjourney и GPT, протестированные экспертами." : "Professional prompts for Midjourney and GPT, tested by experts."}
            />
            <FeatureCard 
              icon={Code} 
              title={language === 'RU' ? "Скрипты" : "Scripts"} 
              desc={language === 'RU' ? "Готовые решения для автоматизации Telegram и бизнес-процессов." : "Ready-made solutions for Telegram automation and business processes."}
            />
            <FeatureCard 
              icon={Zap} 
              title={language === 'RU' ? "Мгновенный доступ" : "Instant Access"} 
              desc={language === 'RU' ? "Автоматическая доставка цифровых товаров сразу после оплаты." : "Automatic delivery of digital goods immediately after payment."}
            />
        </div>
      </section>

      {/* Workflow Process */}
      <section className="py-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{language === 'RU' ? 'Как это работает' : 'How It Works'}</h2>
          <div className="h-1 w-20 bg-cyber-primary mx-auto rounded-full"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
           {/* Connecting Line (Desktop) */}
           <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-cyber-primary/20 -z-10 transform -translate-y-1/2"></div>
           
           <ProcessStep 
             number="01"
             icon={Search}
             title={language === 'RU' ? 'Выберите' : 'Select'}
             desc={language === 'RU' ? 'Найдите нужный товар или услугу в нашем каталоге.' : 'Find the tool or service you need in our catalog.'}
           />
           <ProcessStep 
             number="02"
             icon={CreditCard}
             title={language === 'RU' ? 'Оплатите' : 'Pay'}
             desc={language === 'RU' ? 'Безопасная оплата картой или криптой через шлюз.' : 'Secure payment via card or crypto gateway.'}
           />
           <ProcessStep 
             number="03"
             icon={Download}
             title={language === 'RU' ? 'Получите' : 'Receive'}
             desc={language === 'RU' ? 'Мгновенный доступ к файлам или старт работы по услуге.' : 'Instant access to files or service kickoff.'}
           />
        </div>
      </section>

      {/* Trending Products Preview */}
      <section>
          <div className="flex justify-between items-end mb-8">
              <div>
                  <h2 className="text-3xl font-bold mb-2">{language === 'RU' ? 'Популярное' : 'Trending Now'}</h2>
                  <p className="text-gray-400">{language === 'RU' ? 'Выбор наших пользователей' : 'Top picks by our users'}</p>
              </div>
              <Link to="/shop" className="text-cyber-primary hover:text-white transition-colors hidden md:flex items-center gap-2">
                  {language === 'RU' ? 'Все товары' : 'View All'} <ArrowRight size={16} />
              </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
              {displayTrending.map(product => (
                  <Link key={product.id} to="/shop" className="group bg-cyber-800/40 border border-white/5 rounded-xl overflow-hidden hover:border-cyber-primary/30 transition-all">
                      <div className="h-48 overflow-hidden relative">
                          <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-mono text-cyber-primary border border-cyber-primary/20">
                              {product.type}
                          </div>
                      </div>
                      <div className="p-4">
                          <h3 className="font-bold text-lg mb-1 group-hover:text-cyber-primary transition-colors line-clamp-1">
                              {language === 'RU' ? (product.title_ru || product.title) : product.title}
                          </h3>
                          <div className="flex justify-between items-center mt-4">
                              <span className="text-white font-bold text-xl">${product.price}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">{product.language}</span>
                              </div>
                          </div>
                      </div>
                  </Link>
              ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/shop" className="text-cyber-primary hover:text-white transition-colors inline-flex items-center gap-2">
                {language === 'RU' ? 'Все товары' : 'View All'} <ArrowRight size={16} />
            </Link>
          </div>
      </section>

      {/* Testimonials */}
      <section className="bg-cyber-800/30 border border-white/5 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-8">
             <h2 className="text-3xl font-bold text-center md:text-left">{language === 'RU' ? 'Отзывы Клиентов' : 'Neural Feedback'}</h2>
             <Link to="/reviews" className="text-sm text-cyber-primary hover:text-white transition-colors">
                 {language === 'RU' ? 'Все отзывы' : 'View All Reviews'}
             </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
           {recentReviews.map(review => (
                <TestimonialCard 
                    key={review.id}
                    name={review.userName}
                    product={review.productName}
                    text={review.text}
                    rating={review.rating}
                    avatar={review.userAvatar}
                />
           ))}
           {recentReviews.length === 0 && (
               <div className="col-span-3 text-center text-gray-500 py-8">
                   {language === 'RU' ? 'Отзывов пока нет.' : 'No reviews yet.'}
               </div>
           )}
        </div>
      </section>

      {/* FAQ Section */}
      <section>
         <h2 className="text-3xl font-bold mb-8 text-center">{language === 'RU' ? 'База знаний' : 'Data Archive (FAQ)'}</h2>
         <div className="max-w-3xl mx-auto space-y-4">
            <FAQItem 
              question={language === 'RU' ? 'Как быстро я получу доступ?' : 'How fast do I get access?'}
              answer={language === 'RU' ? 'Мгновенно. Сразу после оплаты ссылка появится в личном кабинете и на почте.' : 'Instantly. Right after payment, the link appears in your dashboard and email.'}
            />
             <FAQItem 
              question={language === 'RU' ? 'Можно ли вернуть деньги?' : 'Is there a refund policy?'}
              answer={language === 'RU' ? 'Мы рассматриваем возвраты индивидуально, если товар не соответствует описанию.' : 'We review refunds individually if the product does not match the description.'}
            />
             <FAQItem 
              question={language === 'RU' ? 'Нужны ли технические навыки?' : 'Do I need tech skills?'}
              answer={language === 'RU' ? 'Для курсов и гайдов - нет. Для скриптов желательны базовые знания, но есть инструкции.' : 'For courses and guides, no. For scripts, basic knowledge is preferred, but instructions are included.'}
            />
         </div>
      </section>

      {/* Community Links (Updated with 4 links) */}
      <section className="py-12 border-t border-white/5">
        <div className="bg-cyber-900/50 rounded-2xl border border-white/5 p-8 md:p-12 relative overflow-hidden text-center">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none"></div>
            
            <h2 className="text-3xl font-bold mb-4 relative z-10">
                {language === 'RU' ? 'Присоединяйтесь к Сообществу' : 'Join the Community'}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8 relative z-10">
                {language === 'RU' 
                    ? 'Следите за обновлениями, получайте бесплатные материалы и общайтесь с единомышленниками.' 
                    : 'Stay updated, get free resources, and connect with like-minded people.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 max-w-5xl mx-auto">
                <a 
                    href="https://t.me/TechHacker_Official_Channel"
                    target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2 bg-[#24A1DE]/10 hover:bg-[#24A1DE]/20 text-white p-6 rounded-xl border border-[#24A1DE]/20 transition-all hover:-translate-y-1 group"
                >
                    <Send size={24} className="text-[#24A1DE]" />
                    <span className="font-bold">Telegram Channel</span>
                    <span className="text-xs text-gray-500">News & Updates</span>
                </a>

                <a 
                    href="https://t.me/TechHacker_Official_Programs"
                    target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2 bg-[#24A1DE]/10 hover:bg-[#24A1DE]/20 text-white p-6 rounded-xl border border-[#24A1DE]/20 transition-all hover:-translate-y-1 group"
                >
                    <CodeIcon size={24} className="text-[#24A1DE]" />
                    <span className="font-bold">Telegram Programs</span>
                    <span className="text-xs text-gray-500">Soft & Scripts</span>
                </a>

                <a 
                    href="https://rutube.ru/channel/68054006/" 
                    target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2 bg-[#e62020]/10 hover:bg-[#e62020]/20 text-white p-6 rounded-xl border border-[#e62020]/20 transition-all hover:-translate-y-1 group"
                >
                    <Video size={24} className="text-[#e62020]" />
                    <span className="font-bold">RuTube Channel</span>
                    <span className="text-xs text-gray-500">Videos & Reviews</span>
                </a>
                
                <a 
                    href="https://vk.com/techhacker_official" 
                    target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2 bg-[#0077FF]/10 hover:bg-[#0077FF]/20 text-white p-6 rounded-xl border border-[#0077FF]/20 transition-all hover:-translate-y-1 group"
                >
                    <Globe size={24} className="text-[#0077FF]" />
                    <span className="font-bold">VKontakte</span>
                    <span className="text-xs text-gray-500">Community</span>
                </a>
            </div>
        </div>
      </section>
    </div>
  );
};