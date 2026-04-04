import { publicSiteUrl } from './seo.constants';

export const environment = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  storageEncryptionKey:
    import.meta.env.VITE_STORAGE_ENCRYPTION_KEY || 'basisTransport',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  /** Same as [seo.constants](seo.constants.ts) — public web origin for links */
  publicSiteUrl,
};
