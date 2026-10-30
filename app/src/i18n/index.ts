import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import en from './en';
import am from './am';

const resources = {
  en: { translation: en },
  am: { translation: am },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export { useTranslation };
export default i18n;
