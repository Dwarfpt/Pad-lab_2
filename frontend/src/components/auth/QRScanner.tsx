import { useState } from 'react';
import { X, Camera } from 'lucide-react';
import Button from '../ui/Button';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string>('');

  // Временное решение - использование input file для загрузки QR кода
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Здесь можно добавить библиотеку для чтения QR из изображения
      // Например: jsQR или qr-scanner
      setError('Загрузка QR кода из файла пока не реализована');
      
      // Для демонстрации - генерируем тестовые данные
      setTimeout(() => {
        onScan(JSON.stringify({
          userId: 'test-user-id',
          type: 'login',
          timestamp: Date.now(),
        }));
      }, 1000);
    } catch (err) {
      setError('Ошибка чтения QR кода');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center">
            <Camera className="mr-2" />
            Сканировать QR код
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Camera className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600 mb-4">
              Загрузите изображение QR кода или используйте камеру
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="qr-upload"
            />
            <label htmlFor="qr-upload">
              <Button variant="primary" className="cursor-pointer" as="span">
                Выбрать файл
              </Button>
            </label>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Или используйте стандартный вход</p>
        </div>
      </div>
    </div>
  );
}
