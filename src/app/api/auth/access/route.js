import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import connectDB from '@/src/lib/DBconnection';
import User from '@/src/models/user';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ authenticated: false, provider: null, canAccess: false, message: 'No active session.' }, { status: 200 });
    }

    await connectDB();
    const email = String(session.user.email).toLowerCase();
    const dbUser = await User.findOne({ email }).select('email provider canAccess role name image');

    if (!dbUser) {
      return NextResponse.json({ authenticated: true, provider: session.user.provider || 'google', canAccess: false, message: 'User is not registered.' }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      provider: dbUser.provider || session.user.provider || 'google',
      canAccess: Boolean(dbUser.canAccess),
      role: dbUser.role || 'student',
      name: dbUser.name,
      image: dbUser.image,
      message: Boolean(dbUser.canAccess) ? 'Access granted.' : 'Please subscribe to the AI to continue.',
    }, { status: 200 });
  } catch (error) {
    console.error('Access check error:', error);
    return NextResponse.json({ authenticated: false, provider: null, canAccess: false, message: 'Unable to verify access.' }, { status: 500 });
  }
}
