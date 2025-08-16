import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get API base URL from environment or default to localhost
    const API_BASE_URL = process.env.NOVA_API_URL || 'http://localhost:3000';
    
    // Try to fetch from Nova Core API
    const response = await fetch(`${API_BASE_URL}/api/dashboard/user-stats`, {
      headers: {
        'Authorization': `Bearer ${request.headers.get('Authorization')}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      throw new Error(`API responded with ${response.status}`);
    }
  } catch (error) {
    console.warn('Failed to fetch from Core API, returning mock data:', error);
    
    // Return mock data as fallback
    return NextResponse.json({
      totalTickets: 12,
      openTickets: 3,
      completedTickets: 9,
      avgResolutionTime: '2.5 days'
    });
  }
}
