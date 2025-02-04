import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';

const QRCodeGenerator = ({ data, interval = 30000 }) => { // Default interval set to 30 seconds
  const [qrValue, setQRValue] = useState(data || generateNewValue());

  useEffect(() => {
    const timer = setInterval(() => {
      setQRValue(generateNewValue());
    }, interval);

    return () => clearInterval(timer); // Cleanup interval on component unmount
  }, [interval]);

  function generateNewValue() {
    return `${data || 'default'}-${Date.now()}`; // Append timestamp to make it dynamic
  }

  return (
    <div>
      <QRCode value={qrValue} size={720} />
    </div>
  );
};

export default QRCodeGenerator;
