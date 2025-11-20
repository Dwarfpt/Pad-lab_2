import { Car, Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ParkingSpotProps {
  spotNumber: string;
  isOccupied: boolean;
  isReserved?: boolean;
  onBook?: (spotNumber: string) => void;
}

export default function ParkingSpot({ spotNumber, isOccupied, isReserved, onBook }: ParkingSpotProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = () => {
    if (isOccupied) return 'bg-red-500 border-red-600';
    if (isReserved) return 'bg-yellow-500 border-yellow-600';
    return 'bg-green-500 border-green-600';
  };

  const handleClick = () => {
    if (!isOccupied && !isReserved && onBook) {
      onBook(spotNumber);
    }
  };

  return (
    <div
      className={`
        relative w-24 h-32 border-2 rounded-lg transition-all duration-200 cursor-pointer
        ${getStatusColor()}
        ${!isOccupied && !isReserved ? 'hover:scale-105 hover:shadow-lg' : 'cursor-not-allowed opacity-70'}
        ${isHovered && !isOccupied && !isReserved ? 'ring-4 ring-blue-400' : ''}
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Parking spot content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        {isOccupied ? (
          <Car className="w-12 h-12" />
        ) : isReserved ? (
          <Check className="w-12 h-12" />
        ) : (
          <div className="text-center">
            <Car className="w-10 h-10 mx-auto mb-1 opacity-50" />
            <span className="text-xs font-semibold">{t('parking.available')}</span>
          </div>
        )}
        
        {/* Spot number */}
        <div className="absolute bottom-1 text-xs font-bold bg-black/30 px-2 py-1 rounded">
          {spotNumber}
        </div>
      </div>

      {/* Hover tooltip */}
      {isHovered && !isOccupied && !isReserved && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap z-10">
          {t('parking.clickToBook')}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
}
