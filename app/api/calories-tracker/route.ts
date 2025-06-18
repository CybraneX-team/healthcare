import { NextResponse } from "next/server";
import GROQ, { Groq } from "groq-sdk";
import {Buffer} from "buffer";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const combinedPrompt = `
You are a helpful assistant for nutritional analysis. Analyse the input image and provide information about the individual food items in it.

Respond in this **EXACT** JSON format:
[
  { "item": "string", "quantity": "string", "calories": number, "protein": number, "carbs": number, "fats": number }
]

Example response with common foods:
[
  {
    "item": "Sambar",
    "quantity": "1 small bowl (~100 ml)",
    "calories": 90,
    "protein": 4,
    "carbs": 14,
    "fats": 2
  },
  {
    "item": "Chapati",
    "quantity": "1 medium (~30g)",
    "calories": 80,
    "protein": 3,
    "carbs": 15,
    "fats": 1
  },
  {
    "item": "Rice",
    "quantity": "1 cup cooked (~150g)",
    "calories": 205,
    "protein": 4,
    "carbs": 45,
    "fats": 0
  }
]

Only output JSON. No explanations.
`;

export async function POST(req: Request){
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if(!file){
        return NextResponse.json({error: "No image provided"}, {status: 400});
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);    const result = await groq.chat.completions.create({
        model: "meta-llama/llama-4-maverick-17b-128e-instruct",
        messages: [
            {
                role: "user",
                content: [{type: "text", "text": combinedPrompt}, {type: "image_url", image_url: {
                    "url": `data:${file.type};base64,${buffer.toString('base64')}`,
                }}]
            },
            
        ]
    });

    const responseRaw = result.choices[0].message.content ?? `[]`;

    if (!responseRaw || responseRaw.trim() === "") {
        return NextResponse.json({error: "No valid response from model"}, {status: 500});
    }
    try {
        let parsed_response = JSON.parse(responseRaw);
        return NextResponse.json(parsed_response, {status: 200, headers: { "Content-Type": "application/json" } });
    } catch (error) {
        return NextResponse.json({error: "Invalid JSON response from model"}, {status: 500});
    }
}