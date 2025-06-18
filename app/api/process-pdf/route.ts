import { samplePdfData } from "@/sameple-text-json";
import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";


// 📄 Extract text from PDFs using only pdf-parse
async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const parsed = await pdf(pdfBuffer);
    return parsed.text?.trim() ?? "";
  } catch (err) {
    console.error("PDF parse error:", err);
    return "";
  }
}


async function sendToGroqLLM(extractedText: string): Promise<any> {
 
  const prompt = `
You are a medical report parser.

Your job is to extract data from the following medical report into the **exact JSON schema** shown below. Do not add, rename, or remove any keys.

🧠 Mapping Instructions:
- Some field names in the report may differ in wording or format (e.g., "Bilirubin-Total" or "Total Bilirubin" → "bilirubin").
- When this happens, **intelligently match** the report value to the most appropriate field in the schema.
- Use medical reasoning to assign values to the correct schema key.

📝 Output Rules:
- The output must include **every field** from the schema, even if it was not found in the report.
- Use the **string "null"** (not the value null) for missing or unavailable values.
- Output only valid raw JSON — no explanations, markdown, or formatting.

📄 Report:
"""
${extractedText}
"""

📘 JSON Schema:
${JSON.stringify(samplePdfData, null, 2)}
`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      const errorDetails = await res.text();
      console.error("Groq API Error:", res.status, errorDetails);
      return "Groq API call failed.";
    }

    const result = await res.json();
    return result.choices?.[0]?.message?.content ?? "No response from Groq";

    }

  // 📬 Main API entry point
  export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromPDF(buffer);
    const extractedJson = await sendToGroqLLM(text);

    return NextResponse.json({ extractedJson });
  }
