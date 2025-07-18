import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() // ← already [{role,content}]

    const groqRes = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            {
              role: 'system',
              content: `You are a prompt editor. 
        Your job is to ONLY update the current prompt based on the user's request. 
        Never generate a summary or result. Simply return the updated prompt text.

        The prompt is used by another AI model later. DO NOT perform the task inside the prompt. 
        Just revise the text of the prompt.

        Reply ONLY with the updated prompt. No explanations. No formatting.`,
            },
            ...messages, // 👈 keep the real chat history intact
          ],
          temperature: 0.3,
        }),
      },
    )

    const data = await groqRes.json()
    const assistant = data.choices?.[0]?.message
    return NextResponse.json({ assistant })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Groq failed' }, { status: 500 })
  }
}
