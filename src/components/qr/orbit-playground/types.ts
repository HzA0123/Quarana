export type SpaceThemeId = 'nebula' | 'mars' | 'moon' | 'deep-space';

export interface SpaceThemeConfig {
  id: SpaceThemeId;
  name: string;
  badge: string;
  description: string;
  // Visual colors (Hex)
  accentColor: string;
  secondaryColor: string;
  platformColor: string;
  ringColor: string;
  particleColor: string;
  particleCount: number;
  spaceBgDark: string;
  spaceBgLight: string;
  ambientIntensity: number;
}
