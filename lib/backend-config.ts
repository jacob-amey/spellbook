export type BackendConfig = {
  databaseUrl: string | null;
  authSecret: string | null;
  authOrigin: string | null;
  databaseReady: boolean;
  authenticationReady: boolean;
};

type Environment = Record<string, string | undefined>;

function readOptionalValue(value: string | undefined): string | null {
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : null;
}

function isPostgresUrl(value: string | null): boolean {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);

    return url.protocol === "postgres:" || url.protocol === "postgresql:";
  } catch {
    return false;
  }
}

function isHttpUrl(value: string | null): boolean {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function readBackendConfig(environment: Environment): BackendConfig {
  const databaseUrl = readOptionalValue(environment.DATABASE_URL);
  const authSecret = readOptionalValue(environment.AUTH_SECRET);
  const authOrigin = readOptionalValue(environment.AUTH_ORIGIN);

  return {
    databaseUrl,
    authSecret,
    authOrigin,
    databaseReady: isPostgresUrl(databaseUrl),
    authenticationReady:
      Boolean(authSecret && authSecret.length >= 32) && isHttpUrl(authOrigin),
  };
}
