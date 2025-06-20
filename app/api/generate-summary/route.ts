import { NextRequest, NextResponse } from "next/server";
import removeMd from 'remove-markdown';

function flattenAndFilter(
  data: Record<string, any>,
  prefix = '',
  result: Record<string, any> = {}
): Record<string, any> {
  for (const [key, value] of Object.entries(data)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenAndFilter(value, newKey, result);
    } else if (value !== null && value !== '' && value !== 'N/A') {
      result[newKey] = value;
    }
  }
  return result;
}



export async function POST(req: NextRequest) {
  const body = await req.json();
  const { extractedText, type } = body;

  if (!extractedText || !type) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

let data = typeof extractedText === 'string'
  ? JSON.parse(extractedText)
  : extractedText;

const flattened = flattenAndFilter(data);

const prompt = `
You are a medical assistant. Based on the following medical data, generate a concise ${
  type === "summary" ? "clinical summary with key findings and recommended action items" : "personalized sales script for a sales rep to speak with the patient about their report"
}.

Data:
${JSON.stringify(flattened, null, 2)}

Your response should be plain text, easy to read, and tailored to the user's context.
`;


  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    const json = await res.json();
    const responseText = json.choices?.[0]?.message?.content ?? "No response.";
    const cleanedText = removeMd(responseText)

    return NextResponse.json({ result: cleanedText });
  } catch (err) {
    console.error("Groq summary generation failed", err);
    return NextResponse.json({ error: "Groq failed" }, { status: 500 });
  }
}
