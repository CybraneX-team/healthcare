import { NextRequest, NextResponse } from 'next/server'

// /api/youtube-duration?videoId=VIDEO_ID
export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get('videoId')
  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 })
  }

  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
    const html = await response.text()

    // Extract the ytInitialPlayerResponse JSON
    const jsonStrMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/)
    if (!jsonStrMatch) {
      return NextResponse.json(
        { error: 'Could not extract video data' },
        { status: 404 },
      )
    }

    const jsonStr = jsonStrMatch[1]
    const playerResponse = JSON.parse(jsonStr)
    const durationSeconds = parseInt(
      playerResponse.videoDetails?.lengthSeconds,
      10,
    )

    if (!durationSeconds) {
      return NextResponse.json(
        { error: 'Could not find duration' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      videoId,
      durationSeconds,
    })
  } catch (error) {
    console.error('Error fetching video duration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
