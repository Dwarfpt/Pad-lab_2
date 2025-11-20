import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';
import { usePriceFormatter } from '../../hooks/usePriceFormatter';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { getItems, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const items = getItems();
  const { formatPrice } = usePriceFormatter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <ShoppingCart size={24} className="text-primary-600" />
              <h2 className="text-2xl font-bold">Корзина</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Корзина пуста</p>
                <p className="text-gray-400 text-sm mt-2">Добавьте тарифы для продолжения</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <div className="mt-2">
                          <span className="text-primary-600 font-bold text-lg">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-lg font-semibold w-12 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-6 space-y-4">
              <div className="flex items-center justify-between text-xl font-bold">
                <span>Итого:</span>
                <span className="text-primary-600">{formatPrice(getTotalPrice())}</span>
              </div>

              <div className="space-y-2">
                <Link to="/checkout" onClick={onClose}>
                  <Button variant="primary" className="w-full">
                    Оформить заказ
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (window.confirm('Очистить корзину?')) {
                      clearCart();
                    }
                  }}
                >
                  Очистить корзину
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
