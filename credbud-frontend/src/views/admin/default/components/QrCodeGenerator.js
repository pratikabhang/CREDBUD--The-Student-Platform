import React, { useState } from 'react';
import QRCode from 'qrcode.react';

const QRCodeGenerator = ({ data }) => {
  const [qrValue, setQRValue] = useState(data || ''); // Set the initial data

  return ( 
    <div>
      <QRCode value={qrValue} size={720} />
    </div>
  );
};

export default QRCodeGenerator;