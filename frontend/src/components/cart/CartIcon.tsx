import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '../../store/cartStore';
import CartModal from './CartModal';

export default function CartIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <ShoppingCart size={24} />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      <CartModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
