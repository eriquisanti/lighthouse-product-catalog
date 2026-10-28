import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.url().default('http://localhost:3333'),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  throw new Error('Invalid environment variables: VITE_API_URL must be a valid URL');
}

export const env = {
  apiUrl: parsedEnv.data.VITE_API_URL.replace(/\/$/, ''),
};
