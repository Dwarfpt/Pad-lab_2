import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, MapPin, DollarSign } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { parkingService } from '../../services/parkingService';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardTitle } from '../../components/ui/Card';
import socketService from '../../services/socketService';
import ParkingGrid from '../../components/parking/ParkingGrid';
import LeafletMap from '../../components/parking/LeafletMap';
import { usePriceFormatter } from '../../hooks/usePriceFormatter';
import { useCurrencyStore } from '../../store/currencyStore';
import { useTranslation } from 'react-i18next';
import { getLocalizedParkingName } from '../../utils/parkingTranslations';

export default function ParkingSlots() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParking, setSelectedParking] = useState<any>(null);
  const [showParkingGrid, setShowParkingGrid] = useState(false);
  const { formatPrice } = usePriceFormatter();
  const { currency } = useCurrencyStore(); // Для перерендера при смене валюты

  const { data: parkingsData, isLoading } = useQuery({
    queryKey: ['parkings'],
    queryFn: parkingService.getAllParkings,
    retry: 1,
    retryDelay: 3000,
    staleTime: 5 * 60 * 1000, // 5 минут кеширования
  });

  useEffect(() => {
    socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);

  const parkings = parkingsData?.parkings || [];
  const filteredParkings = parkings.filter((parking: any) => {
    const localizedName = getLocalizedParkingName(parking.name, t);
    return parking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           localizedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           parking.address.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('parking.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('parking.title')}</h1>
          <p className="text-xl text-gray-600">
            {t('parking.subtitle')}
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('parking.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" className="md:w-auto">
            <Filter size={20} className="mr-2" />
            {t('parking.filters')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Parking List */}
          <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto">
            {filteredParkings.map((parking: any) => (
              <Card
                key={parking._id}
                hover
                className={`cursor-pointer transition ${
                  selectedParking?._id === parking._id ? 'ring-2 ring-primary-600' : ''
                }`}
                onClick={() => setSelectedParking(parking)}
              >
                <CardTitle className="text-lg">{getLocalizedParkingName(parking.name, t)}</CardTitle>
                <CardContent className="mt-3 space-y-2">
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin size={16} className="mr-2 flex-shrink-0" />
                    <span>{parking.address}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <DollarSign size={16} className="mr-1" />
                      <span>{formatPrice(parking.pricePerHour)}{t('parking.perHour')}</span>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          parking.availableSlots > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {parking.availableSlots} / {parking.totalSlots} {t('parking.available')}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full mt-3 relative z-10"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedParking(parking);
                      setShowParkingGrid(true);
                    }}
                  >
                    {t('parking.viewMap')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Map */}
          <LeafletMap 
            parkings={filteredParkings}
            onParkingSelect={setSelectedParking}
            selectedParking={selectedParking}
          />
        </div>

        {/* Parking Grid Modal */}
        {showParkingGrid && selectedParking && (
          <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{getLocalizedParkingName(selectedParking.name, t)}</h2>
                  <p className="text-gray-600">{selectedParking.address}</p>
                </div>
                <button
                  onClick={() => setShowParkingGrid(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <ParkingGrid 
                  parkingName={selectedParking.name}
                  parkingId={selectedParking._id}
                  totalSpots={selectedParking.totalSlots || 20}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
