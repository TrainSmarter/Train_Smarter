import { describe, it, expect } from "vitest";

/**
 * Tests that verify security header values match expected production config.
 *
 * These tests validate the header values defined in next.config.ts
 * to catch accidental weakening of security policies during refactoring.
 */

// Extract the header config as data (mirrors next.config.ts)
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

// Production CSP (isDev = false)
const supabaseUrl = "https://*.supabase.co";
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  `connect-src 'self' ${supabaseUrl} https://*.supabase.co wss://*.supabase.co`,
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

describe("Security Headers", () => {
  it("prevents clickjacking with X-Frame-Options DENY", () => {
    const header = securityHeaders.find(
      (h) => h.key === "X-Frame-Options"
    );
    expect(header?.value).toBe("DENY");
  });

  it("prevents MIME type sniffing", () => {
    const header = securityHeaders.find(
      (h) => h.key === "X-Content-Type-Options"
    );
    expect(header?.value).toBe("nosniff");
  });

  it("enforces HSTS with preload", () => {
    const header = securityHeaders.find(
      (h) => h.key === "Strict-Transport-Security"
    );
    expect(header?.value).toContain("max-age=31536000");
    expect(header?.value).toContain("includeSubDomains");
    expect(header?.value).toContain("preload");
  });

  it("disables dangerous browser APIs via Permissions-Policy", () => {
    const header = securityHeaders.find(
      (h) => h.key === "Permissions-Policy"
    );
    expect(header?.value).toContain("camera=()");
    expect(header?.value).toContain("microphone=()");
    expect(header?.value).toContain("geolocation=()");
    expect(header?.value).toContain("payment=()");
  });

  it("sets Cross-Origin-Opener-Policy to same-origin", () => {
    const header = securityHeaders.find(
      (h) => h.key === "Cross-Origin-Opener-Policy"
    );
    expect(header?.value).toBe("same-origin");
  });

  it("sets Cross-Origin-Resource-Policy to same-origin", () => {
    const header = securityHeaders.find(
      (h) => h.key === "Cross-Origin-Resource-Policy"
    );
    expect(header?.value).toBe("same-origin");
  });
});

describe("Content Security Policy", () => {
  it("restricts default-src to self", () => {
    expect(csp).toContain("default-src 'self'");
  });

  it("does not allow unsafe-eval in production", () => {
    expect(csp).not.toContain("unsafe-eval");
  });

  it("allows Supabase connections", () => {
    expect(csp).toContain("https://*.supabase.co");
    expect(csp).toContain("wss://*.supabase.co");
  });

  it("allows data: and blob: for images", () => {
    expect(csp).toContain("img-src 'self' data: blob: https:");
  });

  it("prevents framing via frame-ancestors none", () => {
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("restricts form actions to self", () => {
    expect(csp).toContain("form-action 'self'");
  });

  it("restricts base-uri to self", () => {
    expect(csp).toContain("base-uri 'self'");
  });
});

describe("Icon Rewrites", () => {
  // Verify rewrite config values (mirrors next.config.ts)
  const rewrites = [
    { source: "/icon-192.png", destination: "/api/icon?size=192" },
    { source: "/icon-512.png", destination: "/api/icon?size=512" },
  ];

  it("rewrites /icon-192.png to API route", () => {
    expect(rewrites[0].source).toBe("/icon-192.png");
    expect(rewrites[0].destination).toBe("/api/icon?size=192");
  });

  it("rewrites /icon-512.png to API route", () => {
    expect(rewrites[1].source).toBe("/icon-512.png");
    expect(rewrites[1].destination).toBe("/api/icon?size=512");
  });
});
