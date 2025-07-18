import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Buffer } from 'buffer'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File
    const targetWeight = formData.get('targetWeight') as string
    const currentWeight = formData.get('currentWeight') as string
    if (!file || !targetWeight || !currentWeight) {
      return NextResponse.json(
        { error: 'Image, currentWeight, and targetWeight are required' },
        { status: 400 },
      )
    }

    // Validate weight values
    const currentWeightNum = parseFloat(currentWeight)
    const targetWeightNum = parseFloat(targetWeight)

    if (
      isNaN(currentWeightNum) ||
      isNaN(targetWeightNum) ||
      currentWeightNum <= 0 ||
      targetWeightNum <= 0
    ) {
      return NextResponse.json(
        { error: 'Please provide valid weight values' },
        { status: 400 },
      )
    }

    if (currentWeightNum > 300 || targetWeightNum > 300) {
      return NextResponse.json(
        {
          error: 'Weight values seem unusually high. Please check your input.',
        },
        { status: 400 },
      )
    }

    // Convert image to base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg' // Calculate weight difference and direction
    const weightDifference = Math.abs(targetWeightNum - currentWeightNum)
    const isWeightLoss = targetWeightNum < currentWeightNum
    const isWeightGain = targetWeightNum > currentWeightNum

    let transformationType = 'maintenance'
    if (isWeightLoss) {
      transformationType = 'weight loss'
    } else if (isWeightGain) {
      transformationType = 'weight gain'
    }

    // Create a comprehensive prompt for analysis
    const analysisPrompt = `
        You are a fitness and health expert analyzing a body transformation scenario. 

        Current weight: ${currentWeight} kg
        Target weight: ${targetWeight} kg
        Transformation type: ${transformationType}
        Weight difference: ${weightDifference} kg

        Analyze the person in this image and provide a comprehensive transformation plan. 
        
        IMPORTANT: Respond ONLY with valid JSON in this exact format:
        
        {
            "description": "A detailed description of the expected transformation based on the person's current physique",
            "timeline": "Realistic timeframe for achieving this transformation safely",
            "key_changes": ["Array of 3-5 key physical changes expected"],
            "recommendations": ["Array of 4-6 specific actionable recommendations"],
            "note": "Important health and safety note about this transformation"
        }

        Guidelines:
        - Be realistic and health-focused
        - Consider the person's apparent build and fitness level
        - For weight loss >10kg: recommend 6-12 months
        - For weight loss <10kg: recommend 3-6 months  
        - For weight gain: focus on muscle building
        - Always emphasize professional guidance for significant changes
        - Include both diet and exercise recommendations
        - Mention sustainable habits
        
        Return only the JSON object, no other text.` // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: analysisPrompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const analysisText = response.choices[0]?.message?.content
    // console.log(response)

    if (!analysisText) {
      return NextResponse.json(
        {
          error:
            'No analysis generated by AI. Please try again with a different image.',
        },
        { status: 500 },
      )
    }

    // Try to parse JSON from the response
    let analysisData
    try {
      // Extract JSON from the response if it's wrapped in other text
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0])
      } else {
        // If no JSON found, create a structured response from the text
        analysisData = {
          description: analysisText,
          timeline: 'Results may vary based on individual factors',
          key_changes: ['Body composition changes', 'Improved fitness levels'],
          recommendations: [
            'Consult with healthcare professionals',
            'Follow a balanced approach',
          ],
          note: 'Individual results may vary. Consult healthcare professionals before starting any transformation program.',
        }
      }
    } catch (parseError) {
      // If JSON parsing fails, structure the text response
      analysisData = {
        description: analysisText,
        timeline: `${weightDifference > 10 ? '6-12 months' : '3-6 months'} for sustainable results`,
        key_changes: isWeightLoss
          ? [
              'Reduced body fat percentage',
              'Improved muscle definition',
              'Better posture',
            ]
          : ['Increased muscle mass', 'Improved strength', 'Enhanced physique'],
        recommendations: [
          'Follow a structured diet plan',
          'Include regular exercise',
          'Stay consistent with habits',
          'Monitor progress regularly',
        ],
        note: 'This analysis is for informational purposes. Consult healthcare professionals for personalized advice.',
      }
    }

    return NextResponse.json(analysisData, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Transformation analysis error:', error)
    return NextResponse.json(
      {
        error: 'Failed to analyze transformation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
