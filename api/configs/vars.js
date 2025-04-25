export const FOOT_PRINT_API_KEY = process.env.FOOT_PRINT_API_KEY // API key for footprint
export const FOOT_PRINT_BASE_URL = process.env.FOOT_PRINT_BASE_URL // Base URL for footprint API
export const SKIPPED_COUNTRIES = ['all']; //Countries to skip to data for, currently skipping All because it is not a country
export const ALLOWED_ORIGINS = [ //allowed origins to be added in the CORS
    'http://localhost:5173'
];
export const RATE_LIMITER_OPTIONS = {
    windowMs: 10000,
    max: 1000,
    handler: (req, res) => {
      return res.status(429).json({
        message: "Too Many Requests, please try again in a moment"
      });
    },
}

export const SUCCESS_STATUS_CODE = 200
export const PORT = process.env.PORT
export const BATCH_SIZE = 10;

export const REDIS_KEYS = {
  COUNTRIES: 'footprint:countries',
  COUNTRY_DATA: (countryCode) => `footprint:country:${countryCode}`,
  OFFSET: 'footprint:offset',
};
