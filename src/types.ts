export type AspectRatio = '1:1' | '4:5' | '9:16';

export type CardThemeId = 
  | 'modern-dark'
  | 'editorial-navy'
  | 'clean-white'
  | 'emerald-forest'
  | 'sunset-coral'
  | 'cyber-neon';

export interface CardTheme {
  id: CardThemeId;
  name: string;
  nameKo: string;
  bgClass: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentBadge: string;
  accentColor: string;
  accentBorder: string;
  tagBg: string;
  defaultOverlay: number;
  previewGradient: string;
}

export type SlideLayout = 'center' | 'left' | 'hero' | 'bullet-list' | 'quote' | 'stats';

export interface Slide {
  id: string;
  type: 'cover' | 'intro' | 'point' | 'stats' | 'conclusion' | 'source';
  badge: string;
  title: string;
  subtitle?: string;
  bullets: string[];
  statsNumber?: string;
  statsLabel?: string;
  imageUrl?: string;
  imagePrompt?: string;
  imageOverlayOpacity: number; // 0 to 1
  imageBlur?: boolean;
  layout: SlideLayout;
  customBgGradient?: string;
  highlightTag?: string;
  oneLineSummary?: string;
}

export interface CardDeck {
  id: string;
  originalUrl?: string;
  pressName: string;
  publishDate: string;
  originalTitle: string;
  slides: Slide[];
  themeId: CardThemeId;
  aspectRatio: AspectRatio;
  channelHandle: string;
  showWatermark: boolean;
  showPageNumbers: boolean;
  showSourceBadge: boolean;
  showSwipeHint: boolean;
  tags: string[];
  caption: string;
  images?: string[];
}

export interface ScrapedArticle {
  url: string;
  title: string;
  press: string;
  publishDate: string;
  description: string;
  content: string;
  ogImage?: string;
  images?: string[];
  domain: string;
  tags: string[];
}

export type GenerationTone = 'news' | 'summary' | 'friendly' | 'punchy';

export interface GenerationOptions {
  tone: GenerationTone;
  slideCount: number;
  channelHandle?: string;
  aspectRatio: AspectRatio;
  themeId: CardThemeId;
  selectedCategory?: string; // 'auto' or custom category
}
