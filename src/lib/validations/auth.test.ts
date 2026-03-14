import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileSchema,
} from "./auth";

// ── loginSchema ──────────────────────────────────────────────────

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret",
      rememberMe: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret",
      rememberMe: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
      rememberMe: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing rememberMe", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });
});

// ── registerSchema ───────────────────────────────────────────────

describe("registerSchema", () => {
  const validData = {
    firstName: "Lukas",
    lastName: "Kitzberger",
    email: "lukas@example.com",
    password: "Test1234",
    confirmPassword: "Test1234",
  };

  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("accepts names with umlauts (ä ö ü ß)", () => {
    const result = registerSchema.safeParse({
      ...validData,
      firstName: "Günther",
      lastName: "Müßig-Öttl",
    });
    expect(result.success).toBe(true);
  });

  it("accepts names with hyphens and apostrophes", () => {
    const result = registerSchema.safeParse({
      ...validData,
      firstName: "Jean-Pierre",
      lastName: "O'Brien",
    });
    expect(result.success).toBe(true);
  });

  it("rejects names with numbers", () => {
    const result = registerSchema.safeParse({
      ...validData,
      firstName: "Lukas123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects names longer than 100 characters", () => {
    const result = registerSchema.safeParse({
      ...validData,
      firstName: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty first name", () => {
    const result = registerSchema.safeParse({
      ...validData,
      firstName: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase letter", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "test1234",
      confirmPassword: "test1234",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without number", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "Testtest",
      confirmPassword: "Testtest",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "Test1",
      confirmPassword: "Test1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "Test1234",
      confirmPassword: "Test5678",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      ...validData,
      email: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

// ── forgotPasswordSchema ─────────────────────────────────────────

describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "user@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "not-valid" });
    expect(result.success).toBe(false);
  });
});

// ── resetPasswordSchema ──────────────────────────────────────────

describe("resetPasswordSchema", () => {
  it("accepts valid matching passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "NewPass1!",
      confirmPassword: "NewPass1!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "NewPass1!",
      confirmPassword: "DifferentPass2!",
    });
    expect(result.success).toBe(false);
  });

  it("enforces uppercase requirement", () => {
    const result = resetPasswordSchema.safeParse({
      password: "newpass1!",
      confirmPassword: "newpass1!",
    });
    expect(result.success).toBe(false);
  });

  it("enforces number requirement", () => {
    const result = resetPasswordSchema.safeParse({
      password: "NewPasss!",
      confirmPassword: "NewPasss!",
    });
    expect(result.success).toBe(false);
  });
});

// ── profileSchema ────────────────────────────────────────────────

describe("profileSchema", () => {
  it("accepts valid profile data", () => {
    const result = profileSchema.safeParse({
      firstName: "Lukas",
      lastName: "Kitzberger",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional birthDate", () => {
    const result = profileSchema.safeParse({
      firstName: "Lukas",
      lastName: "Kitzberger",
      birthDate: "1995-06-15",
    });
    expect(result.success).toBe(true);
  });

  it("accepts profile without birthDate", () => {
    const result = profileSchema.safeParse({
      firstName: "Lukas",
      lastName: "Kitzberger",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.birthDate).toBeUndefined();
    }
  });

  it("accepts international characters", () => {
    const result = profileSchema.safeParse({
      firstName: "Ñoño",
      lastName: "Björk",
    });
    expect(result.success).toBe(true);
  });
});
