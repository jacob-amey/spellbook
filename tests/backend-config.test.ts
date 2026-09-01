import { describe, expect, it } from "vitest";

import { readBackendConfig } from "@/lib/backend-config";

describe("backend configuration readiness", () => {
  it("keeps optional backend features disabled without secrets", () => {
    expect(readBackendConfig({})).toEqual({
      databaseUrl: null,
      authSecret: null,
      authOrigin: null,
      databaseReady: false,
      authenticationReady: false,
    });
  });

  it("recognizes complete PostgreSQL and authentication settings", () => {
    const config = readBackendConfig({
      DATABASE_URL: "postgresql://user:password@localhost:5432/spellbook",
      AUTH_SECRET: "a-secure-example-value-with-32-characters",
      AUTH_ORIGIN: "https://spellbook.example.com",
    });

    expect(config.databaseReady).toBe(true);
    expect(config.authenticationReady).toBe(true);
  });

  it("rejects unsupported database and origin protocols", () => {
    const config = readBackendConfig({
      DATABASE_URL: "mysql://localhost/spellbook",
      AUTH_SECRET: "short",
      AUTH_ORIGIN: "javascript:alert(1)",
    });

    expect(config.databaseReady).toBe(false);
    expect(config.authenticationReady).toBe(false);
  });

  it("handles malformed and partially supplied URLs", () => {
    const malformed = readBackendConfig({
      DATABASE_URL: "not a url",
      AUTH_SECRET: "a-secure-example-value-with-32-characters",
      AUTH_ORIGIN: "also not a url",
    });
    const missingOrigin = readBackendConfig({
      AUTH_SECRET: "a-secure-example-value-with-32-characters",
    });

    expect(malformed.databaseReady).toBe(false);
    expect(malformed.authenticationReady).toBe(false);
    expect(missingOrigin.authenticationReady).toBe(false);
  });
});
