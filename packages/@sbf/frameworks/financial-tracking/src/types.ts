/**
 * Shared types for financial tracking framework
 */

export type CurrencyCode = 'USD' | 'CAD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'BTC' | 'ETH' | string;

export type AccountType = 'checking' | 'savings' | 'credit_card' | 'brokerage' | 'crypto_wallet' | 'cash' | 'loan' | 'other';

export type AccountStatus = 'active' | 'closed' | 'frozen';

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
