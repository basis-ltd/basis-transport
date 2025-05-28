/**
 * LocalStorage adapter for storing and retrieving data
 */

import { environment } from '@/constants/environment.constants';

// Simple AES encryption/decryption helpers using Web Crypto API
async function encryptData(data: string, key: string): Promise<string> {
  if (window.crypto && window.crypto.subtle) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(key.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      enc.encode(data)
    );
    return btoa(
      String.fromCharCode(...iv) +
        String.fromCharCode(...new Uint8Array(encrypted))
    );
  } else {
    // Fallback: simple XOR (not secure, for demonstration only)
    return btoa(
      data
        .split('')
        .map((c, i) =>
          String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
        )
        .join('')
    );
  }
}

async function decryptData(data: string, key: string): Promise<string> {
  if (window.crypto && window.crypto.subtle) {
    const enc = new TextEncoder();
    const raw = atob(data);
    const iv = Uint8Array.from(raw.slice(0, 12), (c) => c.charCodeAt(0));
    const encrypted = Uint8Array.from(raw.slice(12), (c) => c.charCodeAt(0));
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(key.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      encrypted
    );
    return new TextDecoder().decode(decrypted);
  } else {
    // Fallback: simple XOR (not secure, for demonstration only)
    return atob(data)
      .split('')
      .map((c, i) =>
        String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
      )
      .join('');
  }
}

export const localStorageAdapter = {
  /**
   * Set an item in localStorage
   * @param key - The key to store the data under
   * @param value - The value to store
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      const encryptedValue = await encryptData(
        serializedValue,
        environment.storageEncryptionKey
      );
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  },

  /**
   * Get an item from localStorage
   * @param key - The key to retrieve data from
   * @param defaultValue - Default value to return if key doesn't exist
   * @returns The stored value or defaultValue if not found
   */
  async getItem<T>(
    key: string,
    defaultValue: T | null = null
  ): Promise<T | null> {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (encryptedValue === null) {
        return defaultValue;
      }
      const decryptedValue = await decryptData(
        encryptedValue,
        environment.storageEncryptionKey
      );
      return JSON.parse(decryptedValue) as T;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Remove an item from localStorage
   * @param key - The key to remove
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  /**
   * Clear all data from localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  /**
   * Check if a key exists in localStorage
   * @param key - The key to check
   * @returns True if the key exists, false otherwise
   */
  hasKey(key: string): boolean {
    return localStorage.getItem(key) !== null;
  },
};
