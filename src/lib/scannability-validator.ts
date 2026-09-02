import { QROptions } from './types';

export interface ScannabilityResult {
  score: number; // 0 to 100
  status: 'safe' | 'caution' | 'warning';
  message: string;
  eccLevel: 'L' | 'M' | 'Q' | 'H';
  contrastRatio: number;
}

// Convert Hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Calculate luminance for contrast calculation
function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Calculate contrast ratio (WCAG algorithm)
function calculateContrast(color1Hex: string, color2Hex: string): number {
  try {
    const rgb1 = hexToRgb(color1Hex);
    const rgb2 = hexToRgb(color2Hex);
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch {
    return 4.5;
  }
}

export function validateScannability(options: QROptions): ScannabilityResult {
  const fgColor = options.color1 || '#000000';
  const bgColor = options.bgTransparent ? '#ffffff' : options.bgColor || '#ffffff';

  const contrastRatio = calculateContrast(fgColor, bgColor);

  // Auto ECC determination
  const eccLevel: 'L' | 'M' | 'Q' | 'H' = options.logoUrl ? 'H' : 'M';

  let score = 100;
  let status: 'safe' | 'caution' | 'warning' = 'safe';
  let message = 'Safe to scan! Excellent contrast and safe logo margins.';

  // Check contrast
  if (contrastRatio < 2.5) {
    score -= 40;
    status = 'warning';
    message = 'Low contrast between QR dots and background. Pemindaian mungkin gagal!';
  } else if (contrastRatio < 4.5) {
    score -= 20;
    status = 'caution';
    message = 'Kontras sedang. Disarankan memakai warna latar yang lebih kontras.';
  }

  // Check logo size
  if (options.logoUrl && options.logoSize > 0.28) {
    score -= 15;
    if (status as string !== 'warning') {
      status = 'caution';
    }
    message = 'Ukuran logo agak besar. Pastikan kamera HP memadai saat memindai.';
  }

  return {
    score: Math.max(10, score),
    status,
    message,
    eccLevel,
    contrastRatio: Number(contrastRatio.toFixed(2)),
  };
}
