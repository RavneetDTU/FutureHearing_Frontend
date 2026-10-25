import { useMemo } from 'react';
import { barcodeToSvg, barcodeValue, isValidBarcodeValue } from '../../utils/barcode';

export function ProductBarcode({ product, height = 48 }) {
  const code = barcodeValue(product);
  const svg = useMemo(() => {
    if (!isValidBarcodeValue(code)) return '';
    try {
      return barcodeToSvg(code, { height, width: 1.6 });
    } catch {
      return '';
    }
  }, [code, height]);

  if (!code) return null;

  return (
    <div className="product-barcode">
      <div className="detail-label">Barcode</div>
      {svg ? (
        <div className="product-barcode-svg" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <p className="muted text-sm" style={{ margin: '8px 0 0' }}>
          This code cannot be drawn as a barcode. Use plain ASCII characters only.
        </p>
      )}
      <div className="mono text-sm" style={{ marginTop: 8 }}>
        {code}
      </div>
    </div>
  );
}
