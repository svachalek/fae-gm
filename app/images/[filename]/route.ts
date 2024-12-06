import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "path";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ filename: string }> },
): Promise<NextResponse> {
  const { filename } = await context.params;
  const imagePath = path.join(process.cwd(), "generated_images", filename);

  let buffer: Buffer;
  try {
    buffer = await readFile(imagePath);
  } catch (error) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
    },
  });
}
