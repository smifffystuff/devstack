import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

// Allowed file types and size limits
const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
]);
const FILE_EXTENSIONS = new Set([
  ".pdf",
  ".txt",
  ".md",
  ".json",
  ".yaml",
  ".yml",
  ".xml",
  ".csv",
  ".toml",
  ".ini",
]);

const IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);
const FILE_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "application/x-yaml",
  "text/yaml",
  "application/xml",
  "text/xml",
  "text/csv",
  "application/toml",
]);

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export type UploadType = "image" | "file";

export function getUploadType(typeName: string): UploadType | null {
  const lower = typeName.toLowerCase();
  if (lower === "image") return "image";
  if (lower === "file") return "file";
  return null;
}

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
}

export function validateFile(
  file: File,
  uploadType: UploadType,
): string | null {
  const ext = getExtension(file.name);
  const allowedExts = uploadType === "image" ? IMAGE_EXTENSIONS : FILE_EXTENSIONS;
  const allowedMimes =
    uploadType === "image" ? IMAGE_MIME_TYPES : FILE_MIME_TYPES;
  const maxSize = uploadType === "image" ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

  if (!allowedExts.has(ext)) {
    return `File extension "${ext}" is not allowed for ${uploadType} uploads`;
  }
  if (!allowedMimes.has(file.type)) {
    return `File type "${file.type}" is not allowed for ${uploadType} uploads`;
  }
  if (file.size > maxSize) {
    const maxMB = maxSize / (1024 * 1024);
    return `File size exceeds ${maxMB} MB limit`;
  }
  return null;
}

function generateKey(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const ext = getExtension(fileName);
  const baseName = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 50);
  return `${userId}/${timestamp}-${random}-${baseName}${ext}`;
}

export async function uploadToR2(
  userId: string,
  file: Buffer,
  fileName: string,
  contentType: string,
): Promise<string> {
  const key = generateKey(userId, fileName);

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    }),
  );

  return `${PUBLIC_URL}/${key}`;
}

export async function deleteFromR2(fileUrl: string): Promise<void> {
  if (!fileUrl.startsWith(PUBLIC_URL)) return;
  const key = fileUrl.slice(PUBLIC_URL.length + 1);

  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }),
  );
}

export async function getFromR2(
  fileUrl: string,
): Promise<{ body: ReadableStream; contentType: string } | null> {
  if (!fileUrl.startsWith(PUBLIC_URL)) return null;
  const key = fileUrl.slice(PUBLIC_URL.length + 1);

  const response = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }),
  );

  if (!response.Body) return null;

  return {
    body: response.Body.transformToWebStream(),
    contentType: response.ContentType || "application/octet-stream",
  };
}
