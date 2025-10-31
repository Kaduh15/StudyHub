import { z } from "zod";

export const envSchema = z.object({
	VITE_APP_URL_API: z.url(),
});

export const ENV = envSchema.parse(import.meta.env);
export type EnvSchema = z.infer<typeof envSchema>;
