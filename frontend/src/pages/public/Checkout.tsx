import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, MapPin, Car, CreditCard, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '../../store/cartStore';
import { usePriceFormatter } from '../../hooks/usePriceFormatter';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import toast from 'react-hot-toast';
import { parkingService } from '../../services/parkingService';
import ParkingGrid from '../../components/parking/ParkingGrid';
import { getLocalizedParkingName } from '../../utils/parkingTranslations';

import { subscriptionService } from '../../services/subscriptionService';

type CheckoutStep = 'cart' | 'parking' | 'slot' | 'payment';

export default function Checkout() {
  const { t } = useTranslation();
  const { formatPrice } = usePriceFormatter();
  const navigate = useNavigate();
  const { getItems, getTotalPrice, clearCart } = useCartStore();
  const items = getItems();
  
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [selectedParking, setSelectedParking] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'balance'>('card');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: parkingsData } = useQuery({
    queryKey: ['parkings'],
    queryFn: parkingService.getAllParkings,
  });

  const parkings = parkingsData?.parkings || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error(t('checkout.emptyCart'));
      return;
    }

    setIsProcessing(true);
    const methodName = paymentMethod === 'card' 
      ? t('checkout.card') 
      : t('checkout.balance');
    
    try {
      // Process each item in the cart
      for (const item of items) {
        if (item.type === 'tariff') {
          await subscriptionService.createSubscription({
            tariffId: item.data.tariffId,
            paymentMethod,
            parkingId: selectedParking?._id
          });
        }
        // Add handling for other item types if needed (e.g. booking)
      }

      toast.success(t('checkout.orderPlaced', { method: methodName }));
      clearCart();
      navigate('/');
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || t('common.error'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold mb-4">{t('checkout.emptyCart')}</h2>
            <p className="text-gray-600 mb-8">
              {t('checkout.emptyCartDescription')}
            </p>
            <Button variant="primary" onClick={() => navigate('/tariffs')}>
              {t('checkout.goToTariffs')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  const steps = [
    { id: 'cart', label: t('checkout.steps.cart'), icon: ShoppingCart },
    { id: 'parking', label: t('checkout.steps.parking'), icon: MapPin },
    { id: 'slot', label: t('checkout.steps.slot'), icon: Car },
    { id: 'payment', label: t('checkout.steps.payment'), icon: CreditCard },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">{t('checkout.title')}</h1>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />
            {steps.map((s, index) => {
              const Icon = s.icon;
              const isActive = index <= currentStepIndex;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={s.id} className="flex flex-col items-center bg-gray-50 px-4">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      isActive ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                  </div>
                  <span className={`text-sm font-medium ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {step === 'cart' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">{t('checkout.reviewCart')}</h2>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary-600">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {t('checkout.quantity')}: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={() => setStep('parking')}>
                      {t('common.next')}
                    </Button>
                  </div>
                </div>
              )}

              {step === 'parking' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">{t('checkout.selectParking')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {parkings.map((parking: any) => (
                      <div
                        key={parking._id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedParking?._id === parking._id
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                        onClick={() => setSelectedParking(parking)}
                      >
                        <h3 className="font-semibold text-lg">{getLocalizedParkingName(parking.name, t)}</h3>
                        <p className="text-gray-600 text-sm mt-1">{parking.address}</p>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            {t('parking.available')}: {parking.availableSlots}
                          </span>
                          <span className="font-medium text-primary-600">
                            {formatPrice(parking.pricePerHour)}/{t('tariff.perHour')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setStep('cart')}>
                      {t('common.back')}
                    </Button>
                    <Button 
                      onClick={() => setStep('slot')}
                      disabled={!selectedParking}
                    >
                      {t('common.next')}
                    </Button>
                  </div>
                </div>
              )}

              {step === 'slot' && selectedParking && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">
                    {t('checkout.selectSlot')} - {getLocalizedParkingName(selectedParking.name, t)}
                  </h2>
                  <div className="mb-6">
                    <ParkingGrid
                      parkingName={selectedParking.name}
                      parkingId={selectedParking._id}
                      totalSpots={selectedParking.totalSlots}
                      selectionMode="selection"
                      onSlotSelect={(slot) => setSelectedSlot(slot)}
                    />
                  </div>
                  {selectedSlot && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6 text-center">
                      <p className="text-green-800 font-medium">
                        {t('checkout.selectedSlot')}: <span className="text-xl font-bold">{selectedSlot}</span>
                      </p>
                    </div>
                  )}
                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setStep('parking')}>
                      {t('common.back')}
                    </Button>
                    <Button 
                      onClick={() => setStep('payment')}
                      disabled={!selectedSlot}
                    >
                      {t('common.next')}
                    </Button>
                  </div>
                </div>
              )}

              {step === 'payment' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">{t('checkout.paymentDetails')}</h2>
                  
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">{t('checkout.contactInfo')}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('checkout.fullName')}
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('checkout.email')}
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('checkout.phone')}
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">{t('checkout.paymentMethod')}</h3>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'balance')}
                          className="mr-3"
                        />
                        <span className="font-medium">{t('checkout.card')}</span>
                      </label>
                      <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                        <input
                          type="radio"
                          name="payment"
                          value="balance"
                          checked={paymentMethod === 'balance'}
                          onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'balance')}
                          className="mr-3"
                        />
                        <span className="font-medium">{t('checkout.balance')}</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button type="button" variant="outline" onClick={() => setStep('slot')}>
                      {t('common.back')}
                    </Button>
                    <Button type="submit" variant="primary" disabled={isProcessing}>
                      {isProcessing ? 'Processing...' : t('checkout.placeOrder')}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h2 className="text-2xl font-bold mb-6">{t('checkout.summary')}</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6 border-b pb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        {t('checkout.quantity')}: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedParking && (
                <div className="mb-6 border-b pb-6">
                  <h3 className="font-semibold mb-2">{t('checkout.selectedLocation')}</h3>
                  <p className="text-sm text-gray-600">{getLocalizedParkingName(selectedParking.name, t)}</p>
                  {selectedSlot && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      {t('checkout.spot')}: {selectedSlot}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>{t('checkout.subtotal')}:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('checkout.tax')} (20%):</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-3">
                  <span>{t('checkout.total')}:</span>
                  <span className="text-primary-600">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                {t('checkout.terms')}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
