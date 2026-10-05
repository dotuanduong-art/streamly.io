export const TOKEN_STORAGE_KEY = 'streamly_access_token';

const IS_PRODUCTION = import.meta.env.PROD;

export const USE_MOCK = IS_PRODUCTION
  ? false
  : import.meta.env.VITE_USE_MOCK !== 'false';

export const USE_MOCK_AUTH = IS_PRODUCTION
  ? false
  : import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

export const USE_MOCK_USER_DATA = IS_PRODUCTION
  ? false
  : import.meta.env.VITE_USE_MOCK_USER_DATA !== 'false';