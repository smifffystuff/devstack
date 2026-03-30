import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadToR2, deleteFromR2, validateFile, getUploadType } from "@/lib/r2";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const typeName = formData.get("typeName") as string | null;

  if (!file || !typeName) {
    return NextResponse.json(
      { error: "File and typeName are required" },
      { status: 400 },
    );
  }

  const uploadType = getUploadType(typeName);
  if (!uploadType) {
    return NextResponse.json(
      { error: "Invalid type for file upload" },
      { status: 400 },
    );
  }

  if (!session.user.isPro && uploadType === "file") {
    return NextResponse.json(
      { error: "File uploads require a Pro subscription" },
      { status: 403 },
    );
  }

  const validationError = validateFile(file, uploadType);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await uploadToR2(
      session.user.id,
      buffer,
      file.name,
      file.type,
    );

    return NextResponse.json({
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileUrl } = (await request.json()) as { fileUrl?: string };
  if (!fileUrl) {
    return NextResponse.json({ error: "fileUrl is required" }, { status: 400 });
  }

  // Only allow users to delete files in their own directory
  const expectedPrefix = `${process.env.R2_PUBLIC_URL}/${session.user.id}/`;
  if (!fileUrl.startsWith(expectedPrefix)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await deleteFromR2(fileUrl);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
