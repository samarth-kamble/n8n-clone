import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
];

async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  switch (mimeType) {
    case "application/pdf": {
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const textResult = await parser.getText();
      return textResult.text;
    }
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case "text/plain":
    case "text/csv": {
      return buffer.toString("utf-8");
    }
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type: ${file.type}. Allowed: PDF, DOCX, TXT, CSV`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const content = await extractText(buffer, file.type);

    const document = await prisma.document.create({
      data: {
        name: file.name,
        mimeType: file.type,
        size: file.size,
        content,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        mimeType: document.mimeType,
        size: document.size,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process document",
      },
      { status: 500 }
    );
  }
}
