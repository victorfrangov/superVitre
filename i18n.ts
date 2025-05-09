// filepath: c:\dev\VSCODE-GIT\CPP\superVitre\i18n.ts
import { getRequestConfig } from "next-intl/server"

export default getRequestConfig(async ({ locale }) => {
  console.log('[i18n.ts] Received locale:', locale); // Add this line for debugging
  
  // It's good practice to validate the locale
  if (typeof locale !== 'string' || !locale) {
    console.error('[i18n.ts] Error: Invalid or undefined locale received from middleware. Value:', locale);
    // Fallback to a default locale's messages or throw an error
    // For now, let's try to load 'en' as a fallback if messages/en.json exists
    // Or, re-throw to see the original error more clearly if you prefer
    // throw new Error(`[i18n.ts] Invalid locale: ${locale}`);
    // Attempting to load default 'en' messages as a temporary measure:
    // return { messages: (await import('./messages/en.json')).default };
    // For now, let's allow the original error to occur to pinpoint the undefined locale issue
     throw new Error(`[i18n.ts] Attempting to load messages for undefined locale: ${locale}`);
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})