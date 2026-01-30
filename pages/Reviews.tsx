import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Star, MessageSquare, ThumbsUp, Plus, X, Check, Lock, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OrderStatus, Product } from '../types';

export const Reviews = () => {
  const { reviews, user, orders, products, language, addReview } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);
  
  // Form State
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Determine eligible products for review
  useEffect(() => {
      if (user) {
          const completedOrders = orders.filter(o => o.userId === user.id && o.status === OrderStatus.COMPLETED);
          const allItems = completedOrders.flatMap(o => o.items);
          
          // Unique products
          const uniqueItems = Array.from(new Map(allItems.map((item): [string, Product] => [item.id, item])).values());
          setPurchasedProducts(uniqueItems);
      }
  }, [user, orders]);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      if (!selectedProduct) {
          alert(language === 'RU' ? 'Выберите товар из списка купленных' : 'Select a product from your purchases');
          return;
      }

      const productDetails = products.find(p => p.id === selectedProduct);

      addReview({
          id: `rev-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatarUrl,
          productId: selectedProduct,
          productName: productDetails?.title || 'Unknown Product',
          rating: rating,
          text: reviewText,
          date: new Date().toISOString().split('T')[0]
      });

      setReviewText('');
      setRating(5);
      setSelectedProduct('');
      setIsModalOpen(false);
  };

  const renderStars = (count: number) => {
      return (
          <div className="flex space-x-0.5">
              {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={i < count ? "text-cyber-primary fill-cyber-primary" : "text-gray-600"} 
                  />
              ))}
          </div>
      );
  };

  return (
    <div className="space-y-8 min-h-[80vh]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-white/5">
            <div>
                <h2 className="text-4xl font-bold tracking-tight mb-2">{language === 'RU' ? 'Отзывы Клиентов' : 'Customer Reviews'}</h2>
                <p className="text-gray-400">
                    {language === 'RU' ? 'Что говорят о нас наши пользователи' : 'What our community says about us'}
                </p>
            </div>
            
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-cyber-primary text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
            >
                <Plus size={18} /> {language === 'RU' ? 'Оставить отзыв' : 'Write a Review'}
            </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(reviews || []).map(review => (
                <div key={review.id} className="bg-cyber-800/40 p-6 rounded-2xl border border-white/5 hover:border-cyber-primary/20 transition-colors flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            {review.userAvatar ? (
                                <img src={review.userAvatar} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-cyber-700 flex items-center justify-center text-cyber-primary font-bold">
                                    {review.userName.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h4 className="font-bold text-sm text-white">{review.userName}</h4>
                                <p className="text-[10px] text-gray-500">{review.date}</p>
                            </div>
                        </div>
                        {renderStars(review.rating)}
                    </div>
                    
                    {review.productName && (
                        <div className="mb-4">
                            <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-400 border border-white/5">
                                {language === 'RU' ? 'Купил:' : 'Purchased:'} <span className="text-cyber-primary">{review.productName}</span>
                            </span>
                        </div>
                    )}

                    <div className="flex-grow">
                        <p className="text-gray-300 text-sm leading-relaxed italic">"{review.text}"</p>
                    </div>
                </div>
            ))}
            {(reviews || []).length === 0 && (
                <div className="col-span-3 text-center text-gray-500 py-20">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>{language === 'RU' ? 'Отзывов пока нет. Будьте первыми!' : 'No reviews yet. Be the first!'}</p>
                </div>
            )}
        </div>

        {/* ADD REVIEW MODAL */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                <div className="bg-cyber-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
                    <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>

                    <h3 className="text-xl font-bold mb-1">{language === 'RU' ? 'Написать отзыв' : 'Write a Review'}</h3>
                    <p className="text-sm text-gray-400 mb-6">{language === 'RU' ? 'Поделитесь впечатлениями о покупке' : 'Share your experience with the product'}</p>

                    {!user ? (
                         <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center">
                             <Lock className="mx-auto text-red-500 mb-2" />
                             <p className="text-red-200 text-sm mb-2">{language === 'RU' ? 'Войдите, чтобы оставить отзыв.' : 'Please login to leave a review.'}</p>
                             <Link to="/login" className="text-white underline text-sm font-bold">{language === 'RU' ? 'Войти' : 'Login'}</Link>
                         </div>
                    ) : purchasedProducts.length === 0 ? (
                        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl text-center">
                             <ThumbsUp className="mx-auto text-orange-500 mb-2" />
                             <p className="text-orange-200 text-sm font-bold">{language === 'RU' ? 'Вы еще ничего не купили.' : 'You haven\'t purchased anything yet.'}</p>
                             <p className="text-xs text-orange-200/70 mt-1">{language === 'RU' ? 'Отзывы могут оставлять только реальные покупатели.' : 'Only verified buyers can leave reviews.'}</p>
                         </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1 font-bold uppercase">{language === 'RU' ? 'Выберите товар' : 'Select Product'}</label>
                                <select 
                                    value={selectedProduct} 
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-cyber-primary outline-none"
                                    required
                                >
                                    <option value="">{language === 'RU' ? '-- Выберите --' : '-- Select --'}</option>
                                    {purchasedProducts.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-2 font-bold uppercase">{language === 'RU' ? 'Оценка' : 'Rating'}</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star} 
                                            type="button" 
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none hover:scale-110 transition-transform"
                                        >
                                            <Star 
                                                size={28} 
                                                className={star <= rating ? "text-cyber-primary fill-cyber-primary" : "text-gray-600"} 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1 font-bold uppercase">{language === 'RU' ? 'Ваш отзыв' : 'Your Review'}</label>
                                <textarea 
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    rows={4}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-cyber-primary outline-none"
                                    placeholder={language === 'RU' ? 'Расскажите, что понравилось...' : 'Tell us what you liked...'}
                                    required
                                />
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-cyber-primary text-black font-bold py-3 rounded-xl hover:bg-cyan-400 shadow-lg"
                            >
                                {language === 'RU' ? 'Опубликовать' : 'Submit Review'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};