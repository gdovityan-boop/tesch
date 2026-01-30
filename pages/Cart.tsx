import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trash, CreditCard, ShieldCheck, Loader, X, Wallet, Copy, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Order } from '../types';
import { PAYMENT_REQUISITES, USDT_RATE } from '../services/mockData';

export const Cart = () => {
  const { cart, removeFromCart, createOrder, confirmPayment, clearCart, user, language } = useApp();
  const navigate = useNavigate();

  // Payment Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CRYPTO' | 'SBP'>('CRYPTO');
  const [cryptoNetwork, setCryptoNetwork] = useState<'TRC20' | 'BEP20'>('TRC20');
  const [isProcessing, setIsProcessing] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  
  // Calculate USDT Amount
  const usdtAmount = (total / USDT_RATE).toFixed(2);

  const handleCheckout = async () => {
      const order = await createOrder();
      if (order) {
          setCurrentOrder(order);
          setIsPaymentOpen(true);
      }
  };

  const handleConfirmPayment = async () => {
      if (!currentOrder) return;
      setIsProcessing(true);
      
      const fullMethod = paymentMethod === 'CRYPTO' ? `USDT ${cryptoNetwork} (${usdtAmount})` : 'SBP';
      
      // Simulate API call
      await new Promise(r => setTimeout(r, 2000));
      
      await confirmPayment(currentOrder.id, fullMethod);
      setIsProcessing(false);
      setIsPaymentOpen(false);
      navigate('/dashboard');
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4 text-gray-400">{language === 'RU' ? 'Корзина пуста' : 'Your cart is empty'}</h2>
        <Link to="/shop" className="text-cyber-primary hover:underline">{language === 'RU' ? 'Перейти в магазин' : 'Go to Shop'}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto relative">
      <h2 className="text-3xl font-bold mb-8">{language === 'RU' ? 'Корзина' : 'Shopping Cart'}</h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="md:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-cyber-800/50 p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img src={item.image} alt="" className="w-16 h-16 rounded object-cover bg-gray-700" />
                <div>
                  <h3 className="font-bold">{language === 'RU' ? (item.title_ru || item.title) : item.title}</h3>
                  <p className="text-sm text-gray-400">{item.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-bold whitespace-nowrap">{item.price.toLocaleString('ru-RU')} ₽</span>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-400">
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-gray-400 hover:text-white underline">
             {language === 'RU' ? 'Очистить корзину' : 'Clear Cart'}
          </button>
        </div>

        {/* Summary */}
        <div className="bg-cyber-800 p-6 rounded-xl border border-white/5 h-fit">
          <h3 className="text-xl font-bold mb-4">{language === 'RU' ? 'Итого' : 'Summary'}</h3>
          <div className="flex justify-between mb-2 text-gray-400">
            <span>{language === 'RU' ? 'Товары' : 'Subtotal'}</span>
            <span>{total.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div className="border-t border-white/10 my-4 pt-4 flex justify-between text-xl font-bold text-cyber-primary">
            <span>Total</span>
            <span>{total.toLocaleString('ru-RU')} ₽</span>
          </div>
          
          {user ? (
            <button 
              onClick={handleCheckout}
              className="w-full bg-cyber-primary text-black py-3 rounded-lg font-bold flex items-center justify-center space-x-2 hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              <CreditCard size={20} />
              <span>{language === 'RU' ? 'Оплатить' : 'Checkout'}</span>
            </button>
          ) : (
            <Link 
              to="/login"
              className="block w-full text-center bg-gray-700 text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-600"
            >
              {language === 'RU' ? 'Войдите для покупки' : 'Login to Checkout'}
            </Link>
          )}
          
          <div className="mt-4 text-center">
            <span className="text-xs text-gray-500">Secured by Stripe & Crypto payments</span>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {isPaymentOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-cyber-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden max-h-[90vh] overflow-y-auto">
                  
                  {/* Header */}
                  <div className="bg-cyber-800/50 p-4 border-b border-white/5 flex justify-between items-center sticky top-0 bg-cyber-900 z-10">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                          <ShieldCheck className="text-cyber-primary" /> 
                          {language === 'RU' ? 'Безопасная оплата' : 'Secure Payment'}
                      </h3>
                      <button onClick={() => setIsPaymentOpen(false)} className="text-gray-400 hover:text-white">
                          <X size={20} />
                      </button>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                      <div className="text-center mb-6">
                          <p className="text-gray-400 text-sm mb-1">{language === 'RU' ? 'Сумма к оплате' : 'Amount to pay'}</p>
                          <p className="text-4xl font-mono font-bold text-white">{total.toLocaleString('ru-RU')} ₽</p>
                      </div>

                      {/* Method Tabs */}
                      <div className="flex bg-black/40 p-1 rounded-lg mb-4">
                          <button 
                             onClick={() => setPaymentMethod('CRYPTO')}
                             className={`flex-1 py-2 text-sm font-bold rounded flex items-center justify-center gap-2 transition-colors ${paymentMethod === 'CRYPTO' ? 'bg-cyber-800 text-cyber-primary shadow' : 'text-gray-500 hover:text-gray-300'}`}
                          >
                              <Wallet size={16} /> Crypto (USDT)
                          </button>
                          <button 
                             onClick={() => setPaymentMethod('SBP')}
                             className={`flex-1 py-2 text-sm font-bold rounded flex items-center justify-center gap-2 transition-colors ${paymentMethod === 'SBP' ? 'bg-cyber-800 text-green-400 shadow' : 'text-gray-500 hover:text-gray-300'}`}
                          >
                              <CreditCard size={16} /> {language === 'RU' ? 'СБП (Карта)' : 'Card (SBP)'}
                          </button>
                      </div>

                      {/* Payment Details */}
                      <div className="bg-black/30 border border-white/10 rounded-xl p-6 mb-6">
                          {paymentMethod === 'CRYPTO' ? (
                              <div className="text-center space-y-4">
                                  
                                  {/* Conversion Info */}
                                  <div className="bg-cyber-primary/10 border border-cyber-primary/30 p-3 rounded-lg">
                                      <div className="flex justify-between items-center text-xs text-cyber-primary mb-1">
                                          <span>Курс конвертации</span>
                                          <span className="font-bold">1 USDT ≈ {USDT_RATE} ₽</span>
                                      </div>
                                      <div className="flex justify-between items-center text-lg font-bold text-white">
                                          <span>К оплате:</span>
                                          <span className="font-mono text-cyber-primary">{usdtAmount} USDT</span>
                                      </div>
                                  </div>

                                  {/* Network Selector */}
                                  <div className="flex justify-center gap-4 mb-2">
                                      <label className="flex items-center gap-2 cursor-pointer">
                                          <input type="radio" name="network" checked={cryptoNetwork === 'TRC20'} onChange={() => setCryptoNetwork('TRC20')} className="accent-cyber-primary" />
                                          <span className="text-sm font-bold text-white">TRC20</span>
                                      </label>
                                      <label className="flex items-center gap-2 cursor-pointer">
                                          <input type="radio" name="network" checked={cryptoNetwork === 'BEP20'} onChange={() => setCryptoNetwork('BEP20')} className="accent-cyber-primary" />
                                          <span className="text-sm font-bold text-white">BEP20 (BSC)</span>
                                      </label>
                                  </div>

                                  <div className="w-32 h-32 bg-white mx-auto rounded-lg p-2">
                                      {/* QR Code Auto-generated from wallet address */}
                                      <img 
                                        src={PAYMENT_REQUISITES.getQrUrl(cryptoNetwork === 'TRC20' ? PAYMENT_REQUISITES.usdtTrc20Address : PAYMENT_REQUISITES.usdtBep20Address)} 
                                        alt="QR" 
                                        className="w-full h-full" 
                                      />
                                  </div>
                                  <div className="text-left">
                                      <p className="text-xs text-gray-500 mb-1">USDT ({cryptoNetwork}) Address:</p>
                                      <div 
                                        className="bg-cyber-900 border border-white/10 p-3 rounded flex justify-between items-center group cursor-pointer hover:border-cyber-primary/50 transition-colors" 
                                        onClick={() => navigator.clipboard.writeText(cryptoNetwork === 'TRC20' ? PAYMENT_REQUISITES.usdtTrc20Address : PAYMENT_REQUISITES.usdtBep20Address)}
                                      >
                                          <code className="text-xs text-cyber-primary truncate mr-2">
                                            {cryptoNetwork === 'TRC20' ? PAYMENT_REQUISITES.usdtTrc20Address : PAYMENT_REQUISITES.usdtBep20Address}
                                          </code>
                                          <button className="text-gray-400 hover:text-white" title="Copy"><Copy size={14} /></button>
                                      </div>
                                  </div>
                                  <p className="text-xs text-yellow-500/80">
                                      {language === 'RU' 
                                        ? `Отправляйте только USDT в сети ${cryptoNetwork}.` 
                                        : `Send only USDT on ${cryptoNetwork} network.`}
                                  </p>
                              </div>
                          ) : (
                              <div className="text-center space-y-4">
                                  <div className="bg-cyber-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-cyber-primary">
                                      <CreditCard size={32} />
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-white mb-2">{language === 'RU' ? 'Перевод по номеру (СБП)' : 'Transfer via Number'}</p>
                                      <div className="flex items-center justify-center gap-2 cursor-pointer group" onClick={() => navigator.clipboard.writeText(PAYMENT_REQUISITES.sbpPhoneNumber)}>
                                         <p className="text-xl font-mono text-white mb-1 group-hover:text-cyber-primary transition-colors">{PAYMENT_REQUISITES.sbpPhoneNumber}</p>
                                         <Copy size={14} className="opacity-0 group-hover:opacity-100 text-gray-500" />
                                      </div>
                                      
                                      <p className="text-sm text-gray-500">{PAYMENT_REQUISITES.sbpBanks}</p>
                                      {PAYMENT_REQUISITES.sbpRecipientName && <p className="text-xs text-gray-600">({PAYMENT_REQUISITES.sbpRecipientName})</p>}
                                  </div>
                                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded text-left">
                                      <p className="text-xs text-yellow-200">
                                          {language === 'RU' ? 'В комментарии к платежу укажите ID заказа:' : 'Include Order ID in comment:'} <span className="font-bold text-white">{currentOrder?.id}</span>
                                      </p>
                                  </div>
                              </div>
                          )}
                      </div>
                      
                      {/* Warning Box */}
                      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-4 text-xs text-blue-200 flex gap-2 items-start">
                         <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                         <span>
                            {language === 'RU' 
                                ? 'Ваш заказ будет отправлен на проверку администратору. После подтверждения оплаты товары появятся в разделе "Мои Покупки".' 
                                : 'Your order will be sent for admin verification. Once approved, items will appear in "My Library".'}
                         </span>
                      </div>

                      {/* Action Button */}
                      <button 
                        onClick={handleConfirmPayment}
                        disabled={isProcessing}
                        className="w-full bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                          {isProcessing ? (
                              <>
                                  <Loader size={20} className="animate-spin" />
                                  {language === 'RU' ? 'Отправка...' : 'Sending...'}
                              </>
                          ) : (
                              <>
                                  <CheckCircle size={20} />
                                  {language === 'RU' ? 'Я оплатил' : 'I have paid'}
                              </>
                          )}
                      </button>
                      <p className="text-center text-[10px] text-gray-500 mt-4">
                          {language === 'RU' ? 'Нажимая кнопку, вы подтверждаете перевод средств.' : 'By clicking, you confirm the transfer of funds.'}
                      </p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};