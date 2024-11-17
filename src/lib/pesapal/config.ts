export const PESAPAL_CONFIG = {
  CONSUMER_KEY: process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_KEY || '',
  CONSUMER_SECRET: process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_SECRET || '',
  // Use sandbox URLs for development
  API_URL: process.env.NODE_ENV === 'production'
    ? 'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3',
  CALLBACK_URL: process.env.NODE_ENV === 'production'
    ? 'https://your-production-domain.com/api/payment/callback'
    : 'http://localhost:3000/api/payment/callback',
  IPN_URL: process.env.NODE_ENV === 'production'
    ? 'https://your-production-domain.com/api/payment/ipn'
    : 'http://localhost:3000/api/payment/ipn',
};
