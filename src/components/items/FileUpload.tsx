"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, X, File, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  typeName: "file" | "image";
  onUploadComplete: (data: {
    fileUrl: string;
    fileName: string;
    fileSize: number;
  }) => void;
  onError: (message: string) => void;
}

const IMAGE_ACCEPT = ".png,.jpg,.jpeg,.gif,.webp,.svg";
const FILE_ACCEPT = ".pdf,.txt,.md,.json,.yaml,.yml,.xml,.csv,.toml,.ini";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({
  typeName,
  onUploadComplete,
  onError,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isImage = typeName === "image";
  const accept = isImage ? IMAGE_ACCEPT : FILE_ACCEPT;
  const maxSize = isImage ? 5 : 10;

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("typeName", typeName);

      try {
        const xhr = new XMLHttpRequest();

        const result = await new Promise<{
          fileUrl: string;
          fileName: string;
          fileSize: number;
        }>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              const body = JSON.parse(xhr.responseText);
              reject(new Error(body.error || "Upload failed"));
            }
          });

          xhr.addEventListener("error", () => reject(new Error("Upload failed")));

          xhr.open("POST", "/api/items/upload");
          xhr.send(formData);
        });

        setUploadedFile(result);
        onUploadComplete(result);
      } catch (err) {
        onError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [typeName, onUploadComplete, onError],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile],
  );

  const handleRemove = useCallback(() => {
    setUploadedFile(null);
    onUploadComplete({ fileUrl: "", fileName: "", fileSize: 0 });
    if (inputRef.current) inputRef.current.value = "";
  }, [onUploadComplete]);

  if (uploadedFile && uploadedFile.fileUrl) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
        {isImage ? (
          <img
            src={uploadedFile.fileUrl}
            alt={uploadedFile.fileName}
            className="h-12 w-12 rounded object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
            <File className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{uploadedFile.fileName}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(uploadedFile.fileSize)}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/50",
        uploading && "pointer-events-none opacity-60",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="absolute inset-0 cursor-pointer opacity-0"
        disabled={uploading}
      />

      {uploading ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Uploading... {progress}%</p>
          <div className="h-1.5 w-full max-w-48 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      ) : (
        <>
          {isImage ? (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            Drag & drop or click to upload
          </p>
          <p className="text-xs text-muted-foreground/70">
            Max {maxSize} MB
          </p>
        </>
      )}
    </div>
  );
}
