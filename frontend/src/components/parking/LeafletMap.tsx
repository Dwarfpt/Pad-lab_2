import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { usePriceFormatter } from '../../hooks/usePriceFormatter';
import { getLocalizedParkingName } from '../../utils/parkingTranslations';

// Исправляем проблему с иконками Leaflet в Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LeafletMapProps {
  parkings: any[];
  onParkingSelect: (parking: any) => void;
  selectedParking?: any;
}

export default function LeafletMap({ 
  parkings, 
  onParkingSelect, 
  selectedParking 
}: LeafletMapProps) {
  const { t } = useTranslation();
  const center: [number, number] = [47.0105, 28.8638]; // Кишинев
  const { formatPrice } = usePriceFormatter();

  return (
    <div className="lg:col-span-2 h-[600px] bg-gray-200 rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {parkings.map((parking) => (
          <Marker
            key={parking._id}
            position={[parking.coordinates.lat, parking.coordinates.lng]}
            eventHandlers={{
              click: () => onParkingSelect(parking),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{getLocalizedParkingName(parking.name, t)}</h3>
                <p className="text-sm text-gray-600">{parking.address}</p>
                <p className="text-sm">
                  <strong>{parking.availableSlots}/{parking.totalSlots}</strong> доступно
                </p>
                <p className="text-sm font-medium text-primary-600">
                  {formatPrice(parking.pricePerHour)}/час
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}