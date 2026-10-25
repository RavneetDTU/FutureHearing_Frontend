import JsBarcode from 'jsbarcode';

/** Code 128 needs printable ASCII. */
export function isValidBarcodeValue(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed || trimmed.length > 80) return false;
  return /^[\x20-\x7E]+$/.test(trimmed);
}

export function barcodeValue(product) {
  return String(product?.barcode || product?.sku || '').trim();
}

/** Draw a Code 128 barcode as an SVG string. Same approach as HeadOffice (jsbarcode, no API). */
export function barcodeToSvg(value, options = {}) {
  const trimmed = String(value ?? '').trim();
  if (!isValidBarcodeValue(trimmed)) return '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  JsBarcode(svg, trimmed, {
    format: 'CODE128',
    displayValue: false,
    margin: 0,
    height: options.height ?? 48,
    width: options.width ?? 1.6,
  });
  return svg.outerHTML;
}
