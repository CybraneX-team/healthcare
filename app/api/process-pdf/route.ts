// app/api/process-pdf-batch/route.ts
import { samplePdfData, samplePdfSchema } from '@/sameple-text-json'
import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const parsed = await pdf(buffer)
    // console.log("📄 Raw extracted text length:", parsed.text?.length);
    return parsed.text?.trim() ?? ''
  } catch (err) {
    console.error('❌ PDF parse error:', err)
    return ''
  }
}

const extractUnifiedJson = (groqRawOutput: string) => {
  const arrays = groqRawOutput
    .split(/\n\s*\n/) // split by double newlines (most likely between arrays)
    .map((str) => str.trim())
    .filter(Boolean)
    .map((str) => {
      try {
        return JSON.parse(str)
      } catch {
        return null
      }
    })
    .filter(Boolean) // remove failed parses
    .flat() // flatten multiple arrays into one big array of objects

  // Merge all objects into one
  const unifiedJson = arrays.reduce((acc, curr) => {
    return {
      ...acc,
      ...curr,
    }
  }, {})

  return unifiedJson
}

async function sendToGroqLLM(allText: string): Promise<any> {
  const prompt = `
You are a medical report parser.

Your job is to extract structured data from multiple medical reports. Below is the combined raw text.

Please return ONLY one unified JSON object based on the schema below — combining all the information found across all reports.

Important mapping hints:
- "AST (SGOT)" refers to "ast"
- "ALT (SGPT)" refers to "alt"
- "Bilirubin Total" maps to "bilirubin"
- "GGT" or "GGTP" maps to "ggt"

🧠 Also extract imaging and neurological impression notes:

- If the raw text contains CT Chest or radiology findings like:
  - "lungs are clear without consolidation, effusion..."
  - "no mass or pneumothorax noted"
  - "CT shows no abnormalities"
  → Store this full sentence in \`lungs.chest_impression_log\`

- If the text contains neurological or migraine-related findings like:
  - "rhythmic heartbeat"
  - "above high heart rate"
  - "migraine symptoms reported"
  → Store these impressions in \`brain.brain_impression_log\`

Only extract clean natural-sentence logs, not diagnoses or interpretations. If not found, use an empty string.

❗️STRICT RULES:
- Return ONLY the raw JSON.
- NO markdown code fences.
- NO explanations.
- NO comments.
- The response MUST start with '{' and end with '}'.
- If no value is found, use null or empty string appropriately.
- Do NOT wrap the response or include any text outside the JSON.

JSON Schema:
${JSON.stringify(samplePdfData, null, 2)}

Combined Reports:
${allText}
`

  // console.log("🧠 Prompt sent to Groq:\n", prompt.slice(0, 1000), "...[truncated]");

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('❌ Groq error response:', errText)
    return null
  }

  const result = await res.json()
  const content = result.choices?.[0]?.message?.content

  // console.log("📬 Raw Groq reply:\n", content);
  return content
}

// app/api/process-pdf/route.ts

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const files = formData.getAll('files') as File[]

  if (!files.length) {
    return NextResponse.json({ error: 'No files uploaded.' }, { status: 400 })
  }

  let combinedText = ''
  const extractedTexts: string[] = []

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const text = await extractTextFromPDF(buffer)
    extractedTexts.push(`--- FILE: ${file.name} ---\n${text}`)
  }

  combinedText = extractedTexts.join('\n\n')

  const rawReply = await sendToGroqLLM(combinedText)

  try {
    const cleaned = rawReply.replace(/```json|```/gi, '').trim()
    const finalData = extractUnifiedJson(cleaned)

    const parsed = samplePdfSchema.parse(finalData) // ✅ Zod validation

    return NextResponse.json({ extractedJsonArray: parsed })
  } catch (err) {
    console.error(
      '❌ Failed to parse JSON from Groq or validate with Zod:',
      err,
      rawReply,
    )
    return NextResponse.json({ extractedJsonArray: [] }, { status: 400 })
  }
}
