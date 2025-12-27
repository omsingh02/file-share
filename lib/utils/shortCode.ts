import { nanoid } from 'nanoid';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const SHORT_CODE_LENGTH = 6;

/**
 * Generates a short, URL-safe code for file sharing
 * Uses base62 encoding (0-9, A-Z, a-z) for maximum efficiency
 */
export function generateShortCode(): string {
    return nanoid(SHORT_CODE_LENGTH);
}

/**
 * Generates a custom short code using only alphanumeric characters
 */
export function generateCustomShortCode(): string {
    let result = '';
    for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
        result += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return result;
}

/**
 * Validates if a string is a valid short code format
 */
export function isValidShortCode(code: string): boolean {
    if (code.length !== SHORT_CODE_LENGTH) return false;
    return /^[A-Za-z0-9]+$/.test(code);
}
