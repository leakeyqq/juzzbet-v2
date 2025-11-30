// components/QRCodeComponent.tsx
import React from 'react';
import { useQRCode } from 'next-qrcode';

interface QRCodeProps {
  text: string;
}

const QRCodeComponent: React.FC<QRCodeProps> = ({ text }) => {
  const { Image } = useQRCode();

  return (
    <Image
      text={text}
      options={{
        type: 'image/jpeg',
        quality: 0.3,
        errorCorrectionLevel: 'M',
        margin: 1,
        scale: 4,
        width: 130,
        color: {
          dark: '#2D3748',
          light: '#F7FAFC',
        },
      }}
    />
  );
};

export default QRCodeComponent;
