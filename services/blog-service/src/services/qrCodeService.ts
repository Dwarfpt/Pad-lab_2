import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export interface QRCodeData {
  userId: string;
  type: 'login' | 'parking' | 'payment';
  timestamp: number;
  expiresAt: number;
}

export const generateQRCode = async (data: QRCodeData): Promise<string> => {
  const qrData = JSON.stringify({
    ...data,
    id: uuidv4(),
  });

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

export const generateLoginQRCode = async (userId: string): Promise<string> => {
  const now = Date.now();
  const qrData: QRCodeData = {
    userId,
    type: 'login',
    timestamp: now,
    expiresAt: now + 5 * 60 * 1000, // 5 minutes
  };

  return await generateQRCode(qrData);
};

export const verifyQRCode = (qrCodeData: string): QRCodeData => {
  try {
    const data: QRCodeData = JSON.parse(qrCodeData);
    
    if (Date.now() > data.expiresAt) {
      throw new Error('QR code expired');
    }

    return data;
  } catch (error) {
    throw new Error('Invalid QR code');
  }
};
