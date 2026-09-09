import { NextResponse } from 'next/server';
import connectDB from '@/src/lib/DBconnection';
import User from '@/src/models/user';

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({ provider: 'google' })
      .select('name email provider image canAccess role createdAt')
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin Google users list error:', error);
    return NextResponse.json({ message: error.message || 'Unable to load Google users.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { userId, canAccess } = body;

    if (!userId) {
      return NextResponse.json({ message: 'User id is required.' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { canAccess: Boolean(canAccess) },
      { new: true }
    ).select('name email provider image canAccess role createdAt');

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ user, message: user.canAccess ? 'Access granted.' : 'Access revoked.' });
  } catch (error) {
    console.error('Admin Google access update error:', error);
    return NextResponse.json({ message: error.message || 'Unable to update access.' }, { status: 500 });
  }
}
