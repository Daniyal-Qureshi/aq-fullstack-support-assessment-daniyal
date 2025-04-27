import dotenv from 'dotenv';
dotenv.config();

export const FOOT_PRINT_API_KEY = process.env.FOOT_PRINT_API_KEY // API key for footprint
export const FOOT_PRINT_BASE_URL = process.env.FOOT_PRINT_BASE_URL // Base URL for footprint API
export const SKIPPED_COUNTRIES = ['all']; //Countries to skip to data for, currently skipping All because it is not a country
export const ALLOWED_ORIGINS = [ //allowed origins to be added in the CORS
    'http://localhost:5173'
];
export const REDIS_URL = process.env.REDIS_URL // Redis URL for connecting to Redis
export const RATE_LIMITER_OPTIONS = {
  windowMs: 60 * 1000, // 1 minute
  max: 100,             // Limit each IP to 30 requests per minute
};

export const SUCCESS_STATUS_CODE = 200
export const PORT = process.env.PORT
export const BATCH_SIZE = 5;

export const REDIS_KEYS = {
  COUNTRIES: 'footprint:countries',
  COUNTRY_DATA: (countryCode) => `footprint:country:${countryCode}`,
  OFFSET: 'footprint:offset',
};
