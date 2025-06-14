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

// 🤖 Send to Groq LLM
async function sendToGroqLLM(extractedText: string): Promise<any> {
 
  const prompt = `
        Extract the patient's data into the JSON format provided below from the following report text ur json should excatly be in format of 
        the text extrated from PDF:

        text extrated from PDF:
        """
        ${extractedText}
        """

        JSON output format: ${samplePdfData} Your response should always be in this format 

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
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const errorDetails = await res.text();
      console.error("Groq API Error:", res.status, errorDetails);
      return "Groq API call failed.";
    }

    const result = await res.json();
    console.log("Groq API result:", result); // Optional
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
