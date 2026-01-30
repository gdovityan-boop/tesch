
import CryptoJS from 'crypto-js';

// 🔐 SECRET ENCRYPTION KEY 
// В реальном проекте это должно быть сложнее, но для браузерного шифрования это работает отлично.
const ENCRYPTION_KEY = "TECH_HACKER_SECURE_KEY_X_99"; 

export const secureStorage = {
    /**
     * Сохраняет данные в зашифрованном виде (AES).
     */
    setItem: (key: string, value: any) => {
        try {
            const jsonString = JSON.stringify(value);
            const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
            localStorage.setItem(key, encrypted);
        } catch (e) {
            console.error('Encryption Error:', e);
        }
    },

    /**
     * Получает и расшифровывает данные.
     * Если данные не зашифрованы (старые), пытается прочитать как JSON и перезаписать.
     */
    getItem: <T>(key: string, fallback: T): T => {
        try {
            const item = localStorage.getItem(key);
            if (!item) return fallback;

            // Попытка расшифровать
            try {
                const bytes = CryptoJS.AES.decrypt(item, ENCRYPTION_KEY);
                const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
                
                if (!decryptedData) {
                    // Возможно, это старые незашифрованные данные?
                    throw new Error('Empty decryption');
                }
                
                return JSON.parse(decryptedData);
            } catch (decryptionError) {
                // Если не удалось расшифровать, пробуем прочитать как обычный JSON (миграция)
                // console.warn(`Data for ${key} was not encrypted. Migrating...`);
                const plainData = JSON.parse(item);
                // Сразу шифруем для безопасности в будущем
                secureStorage.setItem(key, plainData);
                return plainData;
            }
        } catch (e) {
            console.warn(`Error loading secure data for ${key}`, e);
            return fallback;
        }
    },

    removeItem: (key: string) => {
        localStorage.removeItem(key);
    },

    clear: () => {
        localStorage.clear();
    }
};
