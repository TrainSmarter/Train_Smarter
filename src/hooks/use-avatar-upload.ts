"use client";

import { createClient } from "@/lib/supabase/client";

const MAGIC_BYTES = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
  webp: {
    riff: [0x52, 0x49, 0x46, 0x46],
    webp: [0x57, 0x45, 0x42, 0x50],
  },
} as const;

/**
 * Validates image magic bytes to prevent disguised file uploads.
 * Returns the detected extension or null if invalid.
 */
export async function validateImageMagicBytes(
  file: File
): Promise<"jpg" | "png" | "webp" | null> {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  const isJpeg =
    header[0] === MAGIC_BYTES.jpeg[0] &&
    header[1] === MAGIC_BYTES.jpeg[1] &&
    header[2] === MAGIC_BYTES.jpeg[2];
  if (isJpeg) return "jpg";

  const isPng =
    header[0] === MAGIC_BYTES.png[0] &&
    header[1] === MAGIC_BYTES.png[1] &&
    header[2] === MAGIC_BYTES.png[2] &&
    header[3] === MAGIC_BYTES.png[3];
  if (isPng) return "png";

  const isWebp =
    header[0] === MAGIC_BYTES.webp.riff[0] &&
    header[1] === MAGIC_BYTES.webp.riff[1] &&
    header[2] === MAGIC_BYTES.webp.riff[2] &&
    header[3] === MAGIC_BYTES.webp.riff[3] &&
    header[8] === MAGIC_BYTES.webp.webp[0] &&
    header[9] === MAGIC_BYTES.webp.webp[1] &&
    header[10] === MAGIC_BYTES.webp.webp[2] &&
    header[11] === MAGIC_BYTES.webp.webp[3];
  if (isWebp) return "webp";

  return null;
}

/**
 * Uploads an avatar to Supabase Storage after magic-byte validation.
 * Deletes any existing avatar files before uploading the new one.
 *
 * @returns The storage file path on success, or null on failure.
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ path: string | null; error: string | null }> {
  const ext = await validateImageMagicBytes(file);
  if (!ext) {
    return { path: null, error: "INVALID_TYPE" };
  }

  const supabase = createClient();
  const filePath = `${userId}/avatar.${ext}`;

  // Delete existing avatar files (different extensions)
  const { data: existingFiles } = await supabase.storage
    .from("avatars")
    .list(userId);

  if (existingFiles?.length) {
    await supabase.storage
      .from("avatars")
      .remove(existingFiles.map((f) => `${userId}/${f.name}`));
  }

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    return { path: null, error: "UPLOAD_FAILED" };
  }

  // Get the public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  // Update profile with public avatar URL
  await supabase
    .from("profiles")
    .update({ avatar_url: publicUrlData.publicUrl })
    .eq("id", userId);

  return { path: publicUrlData.publicUrl, error: null };
}
