import {defineRouting} from 'next-intl/routing';
import { locales } from "@/config/locales";
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: locales.map((locale) => locale.code),
 
  // Used when no locale matches
  defaultLocale: 'fr'
});