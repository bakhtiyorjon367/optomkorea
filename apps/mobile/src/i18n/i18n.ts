import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uz from './uz.json';
import ru from './ru.json';

const STORAGE_KEY = 'koruz_lang';

/**
 * Reads persisted locale from localStorage, falling back to Uzbek.
 *
 * Returns:
 *   string: 'uz' or 'ru'
 */
function getSavedLocale(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'uz' || stored === 'ru') {
    return stored;
  }
  return 'uz';
}

void i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
  },
  lng: getSavedLocale(),
  fallbackLng: 'uz',
  interpolation: {
    escapeValue: false,
  },
  defaultNS: 'translation',
});

export default i18n;
