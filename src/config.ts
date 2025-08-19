import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const ConfigSchema = z.object({
  environment: z.enum(['local', 'production']).default('local'),
  sadminApiUrl: z.string().url().default('http://localhost:3006/api/claude'),
  sadminApiKey: z.string().min(1),
  sadminProjectId: z.string().uuid().optional(),
  mcpServerPort: z.number().default(3010),
  mcpLogLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  try {
    return ConfigSchema.parse({
      environment: process.env.ENVIRONMENT || 'local',
      sadminApiUrl: process.env.SADMIN_API_URL,
      sadminApiKey: process.env.SADMIN_API_KEY,
      sadminProjectId: process.env.SADMIN_PROJECT_ID,
      mcpServerPort: process.env.MCP_SERVER_PORT ? parseInt(process.env.MCP_SERVER_PORT) : 3010,
      mcpLogLevel: process.env.MCP_LOG_LEVEL || 'info',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation failed:', error.errors);
      throw new Error('Invalid configuration. Please check your .env file.');
    }
    throw error;
  }
}

export const config = loadConfig();