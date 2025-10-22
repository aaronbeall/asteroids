type ThemePreset = { name: string; foreground: string; background: string };

export const THEMES: ThemePreset[] = [
  { name: 'Neon Sunset', foreground: '#FF6AD5', background: '#0F0522' },
  { name: 'Cosmic Purple', foreground: '#C792EA', background: '#0B0023' },
  { name: 'Electric Blue', foreground: '#7EFCFF', background: '#001021' },
  { name: 'Solar Flare', foreground: '#FFD166', background: '#2B0A00' },
  { name: 'Mint Void', foreground: '#A6FFCB', background: '#002B1F' },
  { name: 'Starlight', foreground: '#FFF8D6', background: '#001119' },
  { name: 'Violet Nebula', foreground: '#FFC7FF', background: '#14001F' },
  { name: 'Galactic Teal', foreground: '#8FFFCB', background: '#002934' },
  { name: 'Arctic Glow', foreground: '#002D3A', background: '#F0F8FF' },
  { name: 'Daybreak', foreground: '#3B2E2E', background: '#FFF7EC' },
  { name: 'Lavender Mist', foreground: '#2B1B2F', background: '#F6F0FF' },
  { name: 'Paper Space', foreground: '#0B2545', background: '#EAF6FF' },
];

export class Theme {
  static foreground = '#FFFFFF';
  static background = '#000000';

  static setTheme(preset: ThemePreset) {
    Theme.foreground = preset.foreground;
    Theme.background = preset.background;
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.style.setProperty('--theme-foreground', Theme.foreground);
      document.documentElement.style.setProperty('--theme-background', Theme.background);
    }
  }
}

export function getThemeByName(name: string) {
  return THEMES.find(t => t.name.toLowerCase() === name.toLowerCase());
}

export function randomTheme() {
  return THEMES[Math.floor(Math.random() * THEMES.length)];
}
