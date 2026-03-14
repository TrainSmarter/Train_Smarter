import { describe, it, expect } from "vitest";

// Import the magic bytes validation function directly
// We need to re-export it or test it via a helper since the module has "use client"
// The validateImageMagicBytes function is pure logic, safe to test

// Helper to create a File-like object from bytes
function createFileFromBytes(bytes: number[], name = "test.bin"): File {
  return new File([new Uint8Array(bytes)], name);
}

// Since the module uses "use client", we dynamically import the function
async function getValidator() {
  const mod = await import("./use-avatar-upload");
  return mod.validateImageMagicBytes;
}

describe("validateImageMagicBytes", () => {
  it("detects valid JPEG files", async () => {
    const validate = await getValidator();
    // JPEG magic bytes: FF D8 FF + padding
    const file = createFileFromBytes([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    ]);
    expect(await validate(file)).toBe("jpg");
  });

  it("detects valid PNG files", async () => {
    const validate = await getValidator();
    // PNG magic bytes: 89 50 4E 47
    const file = createFileFromBytes([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    ]);
    expect(await validate(file)).toBe("png");
  });

  it("detects valid WebP files", async () => {
    const validate = await getValidator();
    // WebP magic bytes: RIFF....WEBP
    const file = createFileFromBytes([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);
    expect(await validate(file)).toBe("webp");
  });

  it("rejects random bytes", async () => {
    const validate = await getValidator();
    const file = createFileFromBytes([
      0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
    ]);
    expect(await validate(file)).toBeNull();
  });

  it("rejects GIF files (not supported)", async () => {
    const validate = await getValidator();
    // GIF87a magic bytes
    const file = createFileFromBytes([
      0x47, 0x49, 0x46, 0x38, 0x37, 0x61, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);
    expect(await validate(file)).toBeNull();
  });

  it("rejects files with too few bytes", async () => {
    const validate = await getValidator();
    const file = createFileFromBytes([0xff, 0xd8]);
    // Only 2 bytes — not enough for any valid check except partial JPEG
    // JPEG check needs 3 bytes, so this won't match
    expect(await validate(file)).toBeNull();
  });

  it("rejects empty files", async () => {
    const validate = await getValidator();
    const file = createFileFromBytes([]);
    expect(await validate(file)).toBeNull();
  });

  it("rejects a text file disguised as .jpg", async () => {
    const validate = await getValidator();
    // ASCII text content with .jpg extension
    const file = new File(
      [new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x57, 0x6f, 0x72, 0x6c, 0x64, 0x21])],
      "fake.jpg"
    );
    expect(await validate(file)).toBeNull();
  });
});
