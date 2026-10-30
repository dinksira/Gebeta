import i18n from '../src/i18n';

describe('i18n configuration', () => {
  it('loads English and Amharic dictionaries', () => {
    expect(i18n.hasResourceBundle('en', 'translation')).toBe(true);
    expect(i18n.hasResourceBundle('am', 'translation')).toBe(true);
  });

  it('translates keys correctly in English', () => {
    expect(i18n.t('splash.title', { lng: 'en' })).toBe('Gebeta');
  });

  it('translates keys correctly in Amharic', () => {
    expect(i18n.t('splash.title', { lng: 'am' })).toBe('ገበጣ');
  });
});
