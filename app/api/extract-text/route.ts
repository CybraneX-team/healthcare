import { NextResponse } from "next/server";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
});

export async function POST(req: Request) {
  try {
    // Use dynamic import for pdf-parse to avoid webpack bundling issues
    const { default: pdf } = await import("pdf-parse/lib/pdf-parse");

    // Get the file from formData
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert the uploaded file to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const key = `uploads/${Date.now()}-${file.name}`;
    await s3
      .putObject({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: "application/pdf",
      })
      .promise();

    // Fetch the file back from S3 for parsing
    const s3Object = await s3
      .getObject({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: key,
      })
      .promise();

    const pdfBuffer = s3Object.Body as Buffer;
    const data = await pdf(pdfBuffer);
    const text = data.text ? data.text.replace(/\s+/g, ' ') : '';
    return NextResponse.json({ extractedText: text });

  } catch (error: any) {
    console.error("Error extracting text:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
