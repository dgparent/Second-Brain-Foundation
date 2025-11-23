import { PieceAuth, Property } from '@activepieces/pieces-framework';

export const sbfAuth = PieceAuth.CustomAuth({
  displayName: 'SBF Connection',
  description: 'Connect to your Second Brain Foundation instance',
  props: {
    baseUrl: Property.ShortText({
      displayName: 'API Base URL',
      description: 'Your SBF instance URL (e.g., https://sbf.yourdomain.com)',
      required: true,
      defaultValue: 'http://localhost:3000',
    }),
    apiKey: Property.SecretText({
      displayName: 'API Key',
      description: 'Generate an API key from SBF Settings > API',
      required: true,
    }),
  },
  required: true,
});

export interface SBFAuthValue {
  baseUrl: string;
  apiKey: string;
}
