import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Set max duration to 60 seconds for file uploads

export async function GET(request: NextRequest) {
  // Get the URL from the query parameter
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }
  
  try {
    // Forward the request to Firebase Storage
    const response = await fetch(url, {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    
    if (!response.ok) {
      console.error(`Firebase Storage GET error: ${response.status} ${response.statusText}`);
      return NextResponse.json({ error: `Firebase Storage error: ${response.statusText}` }, { status: response.status });
    }
    
    const data = await response.arrayBuffer();
    
    // Return the response with appropriate headers
    return new NextResponse(data, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error proxying request to Firebase Storage:', error);
    return NextResponse.json({ error: 'Failed to proxy request' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the URL from the query parameter
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }
    
    let file: File | null = null;
    
    // Handle multipart/form-data
    if (request.headers.get('Content-Type')?.includes('multipart/form-data')) {
      const formData = await request.formData();
      file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json({ error: 'No file found in form data' }, { status: 400 });
      }
    } else {
      // Handle direct body upload
      const contentType = request.headers.get('Content-Type') || 'application/octet-stream';
      const body = await request.arrayBuffer();
      file = new File([body], 'upload', { type: contentType });
    }
    
    // Convert File to ArrayBuffer for direct upload
    const arrayBuffer = await file.arrayBuffer();
    
    // Forward the request to Firebase Storage with proper headers
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': file.type,
        'X-Goog-Upload-Protocol': 'raw',
        'Origin': 'http://localhost:3000',
        'X-Goog-Upload-Content-Type': file.type,
      },
      body: arrayBuffer,
    });
    
    if (!response.ok) {
      console.error(`Firebase Storage POST error: ${response.status} ${response.statusText}`);
      const responseText = await response.text();
      console.error(`Response body: ${responseText}`);
      return NextResponse.json({ 
        error: `Firebase Storage error: ${response.statusText}`,
        details: responseText
      }, { status: response.status });
    }
    
    // Get the response data
    const data = await response.json();
    
    // Return the response with appropriate headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error proxying POST request to Firebase Storage:', error);
    return NextResponse.json({ error: 'Failed to proxy request', details: String(error) }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Goog-Upload-Protocol, X-Goog-Upload-Content-Type',
    },
  });
} 