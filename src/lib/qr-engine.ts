import QRCodeStyling from 'qr-code-styling';
import { QROptions } from './types';

// Build formatted QR text string based on input type
export function formatQRData(options: QROptions): string {
  switch (options.inputType) {
    case 'wifi': {
      const { ssid, password, encryption, hidden } = options.wifi;
      return `WIFI:S:${ssid};T:${encryption};P:${password};H:${hidden ? 'true' : 'false'};;`;
    }
    case 'vcard': {
      const { firstName, lastName, phone, email, company, title, website } = options.vcard;
      return `BEGIN:VCARD\nVERSION:3.0\nN:${lastName};${firstName};;;\nFN:${firstName} ${lastName}\nORG:${company}\nTITLE:${title}\nTEL;TYPE=CELL:${phone}\nEMAIL:${email}\nURL:${website}\nEND:VCARD`;
    }
    case 'whatsapp': {
      const cleanPhone = options.whatsapp.phone.replace(/[^0-9]/g, '');
      const encodedMsg = encodeURIComponent(options.whatsapp.message);
      return `https://wa.me/${cleanPhone}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
    }
    case 'social': {
      const username = options.social.username.replace('@', '');
      switch (options.social.platform) {
        case 'instagram':
          return `https://instagram.com/${username}`;
        case 'youtube':
          return `https://youtube.com/@${username}`;
        case 'tiktok':
          return `https://tiktok.com/@${username}`;
        case 'linkedin':
          return `https://linkedin.com/in/${username}`;
        case 'twitter':
          return `https://x.com/${username}`;
        default:
          return `https://instagram.com/${username}`;
      }
    }
    case 'url':
    default:
      return options.rawText || 'https://quarana.app';
  }
}

// Instantiate and configure QRCodeStyling instance
export function createQREngine(options: QROptions, width: number = 300, height: number = 300): QRCodeStyling {
  const data = formatQRData(options);
  const eccLevel = options.logoUrl ? 'H' : 'M';

  // Configure dots options
  const dotsOptions: any = {
    type: options.dotStyle || 'square',
  };

  if (options.gradientType !== 'single') {
    dotsOptions.gradient = {
      type: options.gradientType === 'radial' ? 'radial' : 'linear',
      rotation: (options.gradientRotation || 0) * (Math.PI / 180),
      colorStops: [
        { offset: 0, color: options.color1 || '#000000' },
        { offset: 1, color: options.color2 || '#10b981' },
      ],
    };
  } else {
    dotsOptions.color = options.color1 || '#000000';
  }

  // Configure background options
  const backgroundOptions: any = {
    color: options.bgTransparent ? 'transparent' : options.bgColor || '#ffffff',
  };

  // Configure corners square (outer eye)
  const cornersSquareOptions: any = {
    type: options.eyeFrameStyle || 'square',
    color: options.outerEyeColor || options.color1 || '#000000',
  };

  // Configure corners dot (inner eye)
  const cornersDotOptions: any = {
    type: options.eyeBallStyle || 'square',
    color: options.innerEyeColor || options.color1 || '#000000',
  };

  // Configure logo image options
  const imageOptions: any = {
    hideBackgroundDots: true,
    imageSize: options.logoSize || 0.22,
    margin: options.logoMargin || 4,
  };

  return new QRCodeStyling({
    width,
    height,
    data,
    margin: 12,
    qrOptions: {
      errorCorrectionLevel: eccLevel,
    },
    image: options.logoUrl || undefined,
    dotsOptions,
    backgroundOptions,
    cornersSquareOptions,
    cornersDotOptions,
    imageOptions,
  });
}
