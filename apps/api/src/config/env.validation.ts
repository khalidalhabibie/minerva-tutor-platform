type Environment = Record<string, string | undefined>;

type ValidatedEnvironment = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  PORT: number;
  UPLOAD_DIR: string;
  MAX_FILE_SIZE_MB: number;
  CORS_ORIGIN?: string;
};

const requiredVariables = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "PORT",
  "UPLOAD_DIR",
  "MAX_FILE_SIZE_MB"
] as const;

export function validateEnvironment(config: Environment): ValidatedEnvironment {
  const missing = requiredVariables.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  const port = Number(config.PORT);
  const maxFileSizeMb = Number(config.MAX_FILE_SIZE_MB);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  if (!Number.isInteger(maxFileSizeMb) || maxFileSizeMb <= 0) {
    throw new Error("MAX_FILE_SIZE_MB must be a positive integer");
  }

  return {
    DATABASE_URL: config.DATABASE_URL as string,
    JWT_SECRET: config.JWT_SECRET as string,
    JWT_EXPIRES_IN: config.JWT_EXPIRES_IN as string,
    PORT: port,
    UPLOAD_DIR: config.UPLOAD_DIR as string,
    MAX_FILE_SIZE_MB: maxFileSizeMb,
    CORS_ORIGIN: config.CORS_ORIGIN
  };
}
