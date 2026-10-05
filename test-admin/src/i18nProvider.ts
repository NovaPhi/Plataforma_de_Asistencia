import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';
import spanishMessages from './Spanish';

const translations: { [locale: string]: any } = {
    en: englishMessages,
    es: spanishMessages,
};

export const i18nProvider = polyglotI18nProvider(
    locale => translations[locale],
    'es', // idioma por defecto
    [
        { locale: 'en', name: 'English' },
        { locale: 'es', name: 'Español' },
    ]
);