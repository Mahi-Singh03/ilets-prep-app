import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/src/lib/DBconnection';
import User from '@/src/models/user';

function getAdminPayload(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : '';
    if (!token) {
      return null;
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  try {
    if (!getAdminPayload(request)) {
      return NextResponse.json({ message: 'Admin authorization required.' }, { status: 401 });
    }

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
    if (!getAdminPayload(request)) {
      return NextResponse.json({ message: 'Admin authorization required.' }, { status: 401 });
    }

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

export async function DELETE(request) {
  try {
    if (!getAdminPayload(request)) {
      return NextResponse.json({ message: 'Admin authorization required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'User id is required.' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findByIdAndDelete(userId).select('name email provider image canAccess role createdAt');

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ user, message: `${user.name || user.email || 'User'} deleted.` });
  } catch (error) {
    console.error('Admin Google user delete error:', error);
    return NextResponse.json({ message: error.message || 'Unable to delete Google user.' }, { status: 500 });
  }
}
