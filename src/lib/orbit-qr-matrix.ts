import qrcode from 'qrcode-generator';
import { QROptions } from './types';
import { formatQRData } from './qr-engine';

export interface QRMatrixResult {
  moduleCount: number;
  matrix: boolean[][];
  eccLevel: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Generates raw boolean matrix from QROptions using qrcode-generator
 * Enforces minimum ECL 'Q' or 'H' if a logo is present to maintain scannability
 */
export function extractQRMatrix(options: QROptions, forceScannableECL = false): QRMatrixResult {
  const data = formatQRData(options);
  
  // Scannability rule: if logo exists or forceScannableECL is true, use at least Q or H
  let eccLevel: 'L' | 'M' | 'Q' | 'H' = 'M';
  if (options.logoUrl || forceScannableECL) {
    eccLevel = 'Q';
  }

  // TypeNumber 0 = auto-detect minimum version that fits data
  const qr = qrcode(0, eccLevel);
  qr.addData(data);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const matrix = Array.from({ length: moduleCount }, (_, r) =>
    Array.from({ length: moduleCount }, (_, c) => qr.isDark(r, c))
  );

  return {
    moduleCount,
    matrix,
    eccLevel,
  };
}
