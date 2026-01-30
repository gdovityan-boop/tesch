import React from 'react';
import { useApp } from '../context/AppContext';
import { Send, Video, MessageCircle, Globe, Mail, ArrowRight, ExternalLink } from 'lucide-react';

// Helper component for Code icon defined at top to ensure availability
const CodeIcon = ({ size, className }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
);

export const Contacts = () => {
  const { language } = useApp();

  const socialLinks = [
    {
      id: 'tg-channel',
      title: 'Telegram Channel',
      desc: language === 'RU' ? 'Новости, обновления и анонсы' : 'News, updates and announcements',
      icon: Send,
      color: 'text-[#24A1DE]',
      bgColor: 'bg-[#24A1DE]/10',
      borderColor: 'border-[#24A1DE]/20',
      url: 'https://t.me/TechHacker_Official_Channel'
    },
    {
      id: 'tg-programs',
      title: 'Telegram Programs',
      desc: language === 'RU' ? 'Каталог программ и скриптов' : 'Catalog of programs and scripts',
      icon: CodeIcon, 
      color: 'text-[#24A1DE]',
      bgColor: 'bg-[#24A1DE]/10',
      borderColor: 'border-[#24A1DE]/20',
      url: 'https://t.me/TechHacker_Official_Programs'
    },
    {
      id: 'rutube',
      title: 'RuTube Channel',
      desc: language === 'RU' ? 'Видео-уроки и обзоры' : 'Video tutorials and reviews',
      icon: Video,
      color: 'text-[#e62020]',
      bgColor: 'bg-[#e62020]/10',
      borderColor: 'border-[#e62020]/20',
      url: 'https://rutube.ru/channel/68054006/'
    },
    {
      id: 'vk',
      title: 'VKontakte',
      desc: language === 'RU' ? 'Наше сообщество ВКонтакте' : 'Our VK Community',
      icon: Globe,
      color: 'text-[#0077FF]',
      bgColor: 'bg-[#0077FF]/10',
      borderColor: 'border-[#0077FF]/20',
      url: 'https://vk.com/techhacker_official'
    }
  ];

  return (
    <div className="space-y-12 pb-12 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          {language === 'RU' ? 'Наши Контакты' : 'Our Contacts'}
        </h1>
        <p className="text-xl text-gray-400">
          {language === 'RU' 
            ? 'Следите за нами в социальных сетях, чтобы не пропустить обновления и бесплатные раздачи.'
            : 'Follow us on social media to stay updated on releases and free giveaways.'}
        </p>
      </div>

      {/* Social Grid */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {socialLinks.map((link) => (
          <a 
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group p-6 rounded-2xl border ${link.borderColor} bg-cyber-900/50 hover:bg-cyber-800 transition-all duration-300 relative overflow-hidden`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${link.bgColor} blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:blur-[60px] transition-all`}></div>
            
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${link.bgColor} ${link.color}`}>
                  <link.icon size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyber-primary transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {link.desc}
                  </p>
                </div>
              </div>
              <ExternalLink size={20} className="text-gray-500 group-hover:text-white transition-colors" />
            </div>
            
            <div className="mt-6 flex items-center text-sm font-bold text-gray-500 group-hover:text-white transition-colors gap-2">
              <span>{language === 'RU' ? 'Перейти' : 'Visit'}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        ))}
      </div>

      {/* Support Section */}
      <div className="max-w-4xl mx-auto bg-cyber-800/30 border border-white/5 rounded-2xl p-8 text-center">
        <div className="inline-flex p-4 rounded-full bg-cyber-primary/10 text-cyber-primary mb-4">
          <Mail size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">{language === 'RU' ? 'Нужна помощь?' : 'Need Help?'}</h2>
        <p className="text-gray-400 mb-6 max-w-lg mx-auto">
          {language === 'RU' 
            ? 'Если у вас возникли вопросы по заказам или продуктам, создайте тикет в личном кабинете.'
            : 'If you have questions about orders or products, please create a ticket in your dashboard.'}
        </p>
        <a 
          href="#/dashboard"
          className="inline-flex items-center gap-2 bg-cyber-primary text-black px-8 py-3 rounded-xl font-bold hover:bg-cyan-400 transition-all shadow-lg"
        >
          {language === 'RU' ? 'В Кабинет' : 'Go to Dashboard'}
        </a>
      </div>
    </div>
  );
};
