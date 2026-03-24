import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getItemById } from "@/lib/db/items";
import { getFromR2 } from "@/lib/r2";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const item = await getItemById(session.user.id, id);

  if (!item || !item.fileUrl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const file = await getFromR2(item.fileUrl);
  if (!file) {
    return NextResponse.json(
      { error: "File not found in storage" },
      { status: 404 },
    );
  }

  const fileName = item.fileName || "download";
  const safeFileName = fileName.replace(/["\\\r\n]/g, "_");

  return new Response(file.body, {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    },
  });
}
