import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { sendEmail } from '@/lib/mail';

async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('userSession');
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch (e) {
    return null;
  }
}

// PATCH /api/users/[id]/approve — Approve or Reject a pending manager registration
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role?.toLowerCase() !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized: Only SysAdmins can authorize manager accounts' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const targetUserId = parseInt(id, 10);
    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const { decision } = await request.json(); // "Approve" | "Reject"

    if (!decision || !['Approve', 'Reject'].includes(decision)) {
      return NextResponse.json(
        { error: 'decision must be either "Approve" or "Reject"' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (decision === 'Approve') {
      const updated = await prisma.user.update({
        where: { id: targetUserId },
        data: {
          isActive: true,
          role: 'Manager',
        },
      });

      // Send approval confirmation email
      sendEmail({
        to: targetUser.email,
        subject: 'Payswiff Portal: Manager Account Approved',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <h2 style="color: #E8292B; margin-top: 0;">Manager Account Verified 🎉</h2>
            <p>Hello <strong>${targetUser.name}</strong>,</p>
            <p>Your request for a <strong>Manager</strong> account on the Payswiff Meeting Room Booking System has been approved by the SysAdmin team.</p>
            <p>You can now sign in at <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" style="color: #E8292B; font-weight: bold;">Payswiff Portal</a> to manage space allocations and team reservations.</p>
          </div>
        `,
      }).catch(e => console.error('Failed to send manager approval email:', e));

      return NextResponse.json({
        success: true,
        message: `Manager account for ${targetUser.name} has been approved and activated`,
        user: updated,
      });
    } else {
      // Reject: delete or deactivate account
      await prisma.user.delete({
        where: { id: targetUserId },
      });

      return NextResponse.json({
        success: true,
        message: `Manager registration for ${targetUser.name} has been rejected and removed`,
      });
    }
  } catch (error: any) {
    console.error('Approve manager error:', error);
    return NextResponse.json(
      { error: 'Failed to process manager decision: ' + error.message },
      { status: 500 }
    );
  }
}
