export type InputType = 'url' | 'wifi' | 'vcard' | 'whatsapp' | 'social';

export type DotStyle = 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
export type EyeFrameStyle = 'square' | 'dots' | 'rounded';
export type EyeBallStyle = 'square' | 'dots';

export type LogoShape = 'circle' | 'rounded' | 'square' | 'shield';

export type GradientType = 'single' | 'linear' | 'radial';

export interface WifiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  title: string;
  website: string;
}

export interface WhatsAppData {
  phone: string;
  message: string;
}

export interface SocialData {
  platform: 'instagram' | 'youtube' | 'tiktok' | 'linkedin' | 'twitter';
  username: string;
}

export interface FrameOptions {
  enabled: boolean;
  text: string;
  textColor: string;
  backgroundColor: string;
  position: 'bottom' | 'top';
  fontFamily: string;
}

export interface QROptions {
  inputType: InputType;
  rawText: string;
  wifi: WifiData;
  vcard: VCardData;
  whatsapp: WhatsAppData;
  social: SocialData;

  // Dots Styling
  dotStyle: DotStyle;
  gradientType: GradientType;
  color1: string;
  color2: string;
  gradientRotation: number;

  // Eye Styling
  eyeFrameStyle: EyeFrameStyle;
  eyeBallStyle: EyeBallStyle;
  outerEyeColor: string;
  innerEyeColor: string;

  // Background
  bgColor: string;
  bgTransparent: boolean;

  // Logo Overlay
  logoUrl: string | null;
  logoShape: LogoShape;
  logoSize: number; // 0.1 to 0.3
  logoMargin: number; // padding in px
  logoHalo: boolean;
  logoHaloColor: string;

  // Frame CTA
  frame: FrameOptions;
}

export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  options: Partial<QROptions>;
}
