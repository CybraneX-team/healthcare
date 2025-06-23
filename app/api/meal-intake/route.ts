import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/firebase';
import { db } from '@/utils/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');
    const limitCount = searchParams.get('limit');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Build query
    let q = query(
      collection(db, 'mealIntakes'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    // Add date filter if specified
    if (date) {
      q = query(
        collection(db, 'mealIntakes'),
        where('userId', '==', userId),
        where('date', '==', date),
        orderBy('timestamp', 'desc')
      );
    }

    // Add limit if specified
    if (limitCount) {
      q = query(q, limit(parseInt(limitCount)));
    }

    const querySnapshot = await getDocs(q);
    const meals = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp
    }));

    return NextResponse.json({ meals });
  } catch (error) {
    console.error('Error fetching meal intake data:', error);
    return NextResponse.json({ error: 'Failed to fetch meal data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, mealData } = body;

    if (!userId || !mealData) {
      return NextResponse.json({ error: 'User ID and meal data are required' }, { status: 400 });
    }

    // This endpoint could be used for additional meal processing if needed
    // For now, the main saving is handled directly in the component
    
    return NextResponse.json({ message: 'Meal intake processed successfully' });
  } catch (error) {
    console.error('Error processing meal intake:', error);
    return NextResponse.json({ error: 'Failed to process meal data' }, { status: 500 });
  }
}
