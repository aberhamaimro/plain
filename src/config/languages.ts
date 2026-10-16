import { LanguageOption } from '../types';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', localName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', localName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', localName: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', localName: 'العربية', flag: '🇸🇦' },
  { code: 'am', name: 'Amharic', localName: 'አማርኛ', flag: '🇪🇹' },
  { code: 'hi', name: 'Hindi', localName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pt', name: 'Portuguese', localName: 'Português', flag: '🇧🇷' },
  { code: 'sw', name: 'Swahili', localName: 'Kiswahili', flag: '🇰🇪' },
];

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0].name;
