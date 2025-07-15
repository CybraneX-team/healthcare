import { samplePdfData } from '@/sameple-text-json'
import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'
import pLimit from 'p-limit'
import { db } from '@/utils/firebase'
import { doc, getDoc } from 'firebase/firestore'

const OCR_API_ENDPOINT = 'https://api.ocr.space/parse/image'
const ocrLimit = pLimit(3)

function bufferToArrayBuffer(buf: Buffer): any {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
}

async function extractTextViaOcr(buffer: Buffer, filename: string): Promise<string> {
  try {
    const form = new FormData()
    form.append('apikey', process.env.OCR_SPACE_API_KEY ?? '')
    form.append('language', 'eng')
    form.append('isOverlayRequired', 'false')
    form.append('OCREngine', '2')
    form.append('file', new Blob([bufferToArrayBuffer(buffer)], { type: 'application/pdf' }), filename)

    const res = await fetch(OCR_API_ENDPOINT, { method: 'POST', body: form })
    if (!res.ok) throw new Error(`OCR.space error: HTTP ${res.status}`)

    const data = await res.json()
    return data?.ParsedResults?.[0]?.ParsedText?.trim() ?? ''
  } catch (err) {
    console.error(`OCR failed for ${filename}:`, err)
    return ''
  }
}

async function extractTextFromPDF(buffer: Buffer, filename: string): Promise<string> {
  try {
    const parsed = await pdf(buffer)
    const raw = parsed.text?.trim() ?? ''
    if (raw.length / Math.max(parsed.numpages, 1) >= 25) return raw
    return await ocrLimit(() => extractTextViaOcr(buffer, filename))
  } catch (err) {
    console.error(`PDF parse failed, fallback to OCR (${filename})`, err)
    return await ocrLimit(() => extractTextViaOcr(buffer, filename))
  }
}

async function sendToGroqLLM(allText: string, currentData: any): Promise<string | null> {
const prompt = `
You are a medical report parser.

You are given:
1. The current lab data JSON (may have null or real values)
2. Combined raw text from newly uploaded medical documents

Your task is to return a complete updated JSON object with **all fields present**, preserving the exact schema below.

---

RULES:
- If a field is **null** and a new value is found → update it.
- If a field has a value and a **new/different** value is found → replace it.
- If a field has a value and no new mention in the reports → keep the original.
- If no value is found for a field → keep it as null or empty string.
- You MUST preserve **every single key** from the schema, even if the value remains null.

---

MAPPING HINTS:
"AST (SGOT)" → ast  
"ALT (SGPT)" → alt  
"GGT" / "GGTP" → ggt  
"Total Bilirubin" → bilirubin

---

SPECIAL LOG FIELDS:
- If report contains radiology phrases (e.g. "lungs are clear…") → store in \`lungs.chest_impression_log\`
- If it contains neuro or migraine findings → store in \`brain.brain_impression_log\`
Use full natural sentences. Leave as empty string "" if not found.

---

⚠️ STRICT OUTPUT REQUIREMENTS:
- Return only valid raw JSON.
- No comments, markdown, or explanations.
- Response must start with "{" and end with "}"
- Must match this full schema:

${JSON.stringify(samplePdfData, null, 2)}

---

Current Data (to be updated):

${JSON.stringify(currentData)}

---

Combined Report Text:

${allText}
`


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
    console.error('Groq error:', await res.text())
    return null
  }

  const result = await res.json()
  return result.choices?.[0]?.message?.content ?? null
}

export async function POST(req: NextRequest) {
  const uid = req.headers.get('x-user-id') // ✅ Sent by client (securely)

  if (!uid) {
    return NextResponse.json({ error: 'Missing UID' }, { status: 401 })
  }

  const formData = await req.formData()
  const files = formData.getAll('files') as File[]
  if (!files.length) {
    return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
  }

  const extractedTexts = await Promise.all(
    files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer())
      const text = await extractTextFromPDF(buffer, file.name)
      return `--- FILE: ${file.name} ---\n${text}`
    })
  )
  const combinedText = extractedTexts.join('\n\n')

  let currentData = samplePdfData
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    if (userSnap.exists() && userSnap.data().extractedLabData) {
      currentData = userSnap.data().extractedLabData
    }
  } catch (err) {
    console.warn('Could not fetch user data:', err)
  }

  const rawReply = await sendToGroqLLM(combinedText, currentData)

  try {
    const cleaned = rawReply?.replace(/```json|```/gi, '').trim() ?? '{}'
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end === -1 || end <= start) throw new Error('Bad JSON')
    const jsonSlice = cleaned.slice(start, end + 1)
    const finalData = JSON.parse(jsonSlice)

    return NextResponse.json({ extractedJsonArray: finalData })
  } catch (err) {
    console.error('JSON parsing faileda:', err, rawReply)
    return NextResponse.json({ error: 'Groq returned invalid JSON' }, { status: 400 })
  }
}
