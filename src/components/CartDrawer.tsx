import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, X, Plus, Minus, Trash2, Truck, Zap, CreditCard, Banknote, Wallet, Building2, ChevronLeft } from "lucide-react";
import { Product } from "../types";

interface CartItem extends Product {
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  whatsappNumber: string;
  onOrderPlaced: (order: any) => void;
}

const SHIPPING_OPTIONS = [
  { id: 'standard', name: 'Standard Shipping', price: 0, estimatedDays: '5-7 business days', icon: Truck },
  { id: 'express', name: 'Express Shipping', price: 25, estimatedDays: '1-2 business days', icon: Zap },
];

const PAYMENT_METHODS = [
  { id: 'COD', name: 'Cash on Delivery', desc: 'Pay when you receive your phone', icon: Banknote },
  { id: 'Bank Transfer', name: 'Bank Transfer', desc: 'Transfer to our HBL account', icon: Building2 },
  { id: 'EasyPaisa', name: 'EasyPaisa', desc: 'Pay via EasyPaisa App', icon: Wallet },
  { id: 'JazzCash', name: 'JazzCash', desc: 'Pay via JazzCash App', icon: Wallet },
] as const;

export default function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemove, whatsappNumber, onOrderPlaced }: CartDrawerProps) {
  const [step, setStep] = useState<'cart' | 'payment'>('cart');
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0]);
  const [selectedPayment, setSelectedPayment] = useState<typeof PAYMENT_METHODS[number]>(PAYMENT_METHODS[0]);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + selectedShipping.price;

  const handleCheckout = () => {
    const itemsList = cart.map(item => `- ${item.name} (x${item.quantity}) - $${item.price * item.quantity}`).join('%0A');
    const shippingInfo = `%0AShipping: ${selectedShipping.name} ($${selectedShipping.price}) - ${selectedShipping.estimatedDays}`;
    const paymentInfo = `%0APayment Method: ${selectedPayment.name}`;
    const message = `Hi, I'd like to place an order for:%0A${itemsList}${shippingInfo}${paymentInfo}%0A%0ATotal: $${total}`;
    
    // Create order object
    const newOrder = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date().toISOString(),
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: total,
      status: "Pending",
      paymentMethod: selectedPayment.id,
      shipping: {
        method: selectedShipping.name,
        price: selectedShipping.price,
        estimatedDays: selectedShipping.estimatedDays
      }
    };

    onOrderPlaced(newOrder);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
    setStep('cart'); // Reset for next time
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                {step === 'payment' && (
                  <button 
                    onClick={() => setStep('cart')}
                    className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <ShoppingCart className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold">{step === 'cart' ? 'Your Cart' : 'Payment Method'}</h2>
                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-sm font-medium">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {step === 'cart' ? (
                <>
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                      <ShoppingCart className="w-16 h-16 opacity-20" />
                      <p className="text-lg">Your cart is empty</p>
                      <button
                        onClick={onClose}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        Start shopping
                      </button>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">{item.name}</h3>
                            <p className="text-sm text-slate-500">{item.brand}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border rounded-lg">
                              <button
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                className="p-1 hover:bg-slate-50 disabled:opacity-50"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                className="p-1 hover:bg-slate-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-slate-900">${item.price * item.quantity}</span>
                              <button
                                onClick={() => onRemove(item.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {cart.length > 0 && (
                    <div className="pt-6 border-t space-y-4">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Shipping Method</h3>
                      <div className="space-y-3">
                        {SHIPPING_OPTIONS.map((option) => {
                          const Icon = option.icon;
                          const isSelected = selectedShipping.id === option.id;
                          return (
                            <button
                              key={option.id}
                              onClick={() => setSelectedShipping(option)}
                              className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                                isSelected 
                                  ? 'border-blue-600 bg-blue-50/50' 
                                  : 'border-slate-100 hover:border-slate-200'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                              }`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className={`font-bold ${isSelected ? 'text-blue-600' : 'text-slate-900'}`}>
                                    {option.name}
                                  </p>
                                  <p className="font-bold text-slate-900">
                                    {option.price === 0 ? 'FREE' : `$${option.price}`}
                                  </p>
                                </div>
                                <p className="text-xs text-slate-500">{option.estimatedDays}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 mb-6">Select how you would like to pay for your order.</p>
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      const isSelected = selectedPayment.id === method.id;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setSelectedPayment(method)}
                          className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                            isSelected 
                              ? 'border-blue-600 bg-blue-50/50' 
                              : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className={`font-bold ${isSelected ? 'text-blue-600' : 'text-slate-900'}`}>
                              {method.name}
                            </p>
                            <p className="text-xs text-slate-500">{method.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {selectedPayment.id === 'Bank Transfer' && (
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Bank Details</p>
                      <p className="text-sm font-bold text-slate-900">HBL Bank Limited</p>
                      <p className="text-sm text-slate-600">Account: 1234 5678 9012 3456</p>
                      <p className="text-sm text-slate-600">Name: MOBISTORE PVT LTD</p>
                    </div>
                  )}

                  {(selectedPayment.id === 'EasyPaisa' || selectedPayment.id === 'JazzCash') && (
                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100 space-y-2">
                      <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Mobile Account</p>
                      <p className="text-sm font-bold text-slate-900">{selectedPayment.name} Number</p>
                      <p className="text-sm text-slate-600">0349 5205706</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t bg-slate-50 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span>${subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Shipping</span>
                    <span>{selectedShipping.price === 0 ? 'FREE' : `$${selectedShipping.price}`}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span>${total}</span>
                  </div>
                </div>
                {step === 'cart' ? (
                  <button 
                    onClick={() => setStep('payment')}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                  >
                    Continue to Payment
                  </button>
                ) : (
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                  >
                    Place Order via WhatsApp
                  </button>
                )}
                <p className="text-center text-xs text-slate-500">
                  {step === 'cart' ? 'Next: Select Payment Method' : 'Order will be confirmed via WhatsApp'}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
