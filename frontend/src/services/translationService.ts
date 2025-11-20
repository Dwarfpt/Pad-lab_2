/**
 * Translation Service Stub
 * This service is currently not implemented but needed for RouteChangeTranslator component
 */

export const translationService = {
  getLanguage: () => {
    return localStorage.getItem('language') || 'ro';
  },
  
  translatePage: () => {
    // Placeholder for future translation implementation
    console.log('Translation service not yet implemented');
  }
};
