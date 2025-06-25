import { NextRequest, NextResponse } from 'next/server'

// Placeholder for Firebase services during build time
let bucket: any = null
let isBuildTime = true

// Only import and initialize Firebase if not in build time
if (process.env.NODE_ENV !== 'production') {
  try {
    const admin = require('firebase-admin')
    const { getStorage } = require('firebase-admin/storage')

    // Initialize Firebase Admin if not already initialized
    const app = admin.apps.length
      ? admin.app()
      : admin.initializeApp({
          credential: admin.credential.cert({
            projectId: 'healthcare-17c9a',
            clientEmail:
              process.env.FIREBASE_CLIENT_EMAIL || 'placeholder@example.com',
            privateKey:
              process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') ||
              'placeholder-key',
          }),
          storageBucket: 'healthcare-17c9a.appspot.com',
        })

    bucket = getStorage().bucket()
    isBuildTime = false
  } catch (error) {
    console.warn('Failed to initialize Firebase Admin:', error)
  }
}

// Maximum duration for file uploads
export const maxDuration = 60

export async function POST(request: NextRequest) {
  // If we're in build time, just return a placeholder response
  if (isBuildTime) {
    return NextResponse.json(
      {
        error:
          'This is a build-time placeholder. Firebase services are not available during build.',
      },
      { status: 503 },
    )
  }

  try {
    // Get path parameter from query
    const path = request.nextUrl.searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 },
      )
    }

    // Get the file from the request
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file found in request' },
        { status: 400 },
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Firebase Storage
    const fileRef = bucket.file(path)

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          size: file.size.toString(),
        },
      },
    })

    // Make the file publicly accessible
    await fileRef.makePublic()

    // Get the download URL
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future expiration
    })

    return NextResponse.json({
      success: true,
      url,
      path,
      name: file.name,
      type: file.type,
      size: file.size,
    })
  } catch (error) {
    console.error('Error uploading to Firebase Storage:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: String(error),
      },
      { status: 500 },
    )
  }
}
