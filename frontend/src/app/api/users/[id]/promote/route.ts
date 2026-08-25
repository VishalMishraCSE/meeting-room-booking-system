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

// PATCH /api/users/[id]/promote — Promote / Demote user & reassign manager
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role?.toLowerCase() !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized: Only SysAdmins can promote or demote users' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const targetUserId = parseInt(id, 10);
    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const { newRole, managerId, reason } = await request.json();

    if (!newRole || !['Employee', 'Manager', 'Admin'].includes(newRole)) {
      return NextResponse.json(
        { error: 'Valid newRole is required (Employee, Manager, Admin)' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        employees: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const previousRole = targetUser.role;

    // Self-demotion guard
    if (targetUser.id === sessionUser.id && newRole !== 'Admin') {
      const activeAdminCount = await prisma.user.count({
        where: { role: 'Admin', isActive: true },
      });
      if (activeAdminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot demote the last remaining active Admin in the workspace' },
          { status: 400 }
        );
      }
    }

    // Determine target managerId:
    // If promoted to Admin or Manager, they typically don't have a direct manager (or optional).
    // If Employee, set to provided managerId or leave existing.
    let updatedManagerId: number | null = targetUser.managerId;
    if (newRole === 'Admin') {
      updatedManagerId = null;
    } else if (newRole === 'Manager') {
      updatedManagerId = null;
    } else if (newRole === 'Employee') {
      if (managerId !== undefined) {
        updatedManagerId = managerId ? parseInt(managerId.toString(), 10) : null;
      }
    }

    // Update target user
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        role: newRole,
        managerId: updatedManagerId,
      },
    });

    // If demoted from Manager to Employee and had subordinates, reassign or unassign subordinates
    if (previousRole === 'Manager' && newRole === 'Employee' && targetUser.employees.length > 0) {
      // Find another active manager to reassign to, or unassign
      const fallbackManager = await prisma.user.findFirst({
        where: {
          role: 'Manager',
          isActive: true,
          id: { not: targetUserId },
        },
      });

      await prisma.user.updateMany({
        where: { managerId: targetUserId },
        data: {
          managerId: fallbackManager ? fallbackManager.id : null,
        },
      });
    }

    // Create in-app notification for the user
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: `Workspace Role Elevation: ${newRole}`,
        message: `Your corporate access authority has been updated to ${newRole} by System Administrator ${sessionUser.name || 'Admin'}.${reason ? ` Reason: "${reason}"` : ''}`,
        type: 'ROLE_UPDATE',
      },
    }).catch(e => console.error('Failed to create in-app notification:', e));

    // Send email alert to the promoted/demoted user
    sendEmail({
      to: targetUser.email,
      subject: `Payswiff Workspace: Role Update Notice (${newRole})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #E8292B, #F15B2D); padding: 24px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px;">Workspace Access Level Updated</h2>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 13px;">Payswiff Enterprise Authority Governance</p>
          </div>
          <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
            <p>Hello <strong>${targetUser.name}</strong>,</p>
            <p>Your enterprise access role on the <strong>Payswiff Meeting Room Platform</strong> has been updated by workspace administration:</p>
            
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 18px 0;">
              <table style="width: 100%; font-size: 13px;">
                <tr><td style="color: #64748b; padding: 4px 0;">Previous Role:</td><td style="font-weight: bold; color: #475569;">${previousRole}</td></tr>
                <tr><td style="color: #64748b; padding: 4px 0;">New Position:</td><td style="font-weight: bold; color: #E8292B; font-size: 15px;">${newRole}</td></tr>
                ${reason ? `<tr><td style="color: #64748b; padding: 4px 0;">Administrative Note:</td><td style="font-style: italic;">"${reason}"</td></tr>` : ''}
              </table>
            </div>

            <p style="font-size: 13px; color: #64748b;">Please log in or refresh your active session to experience your newly granted workspace capabilities.</p>
          </div>
        </div>
      `,
    }).catch(e => console.error('Failed to send promotion email:', e));

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${targetUser.name}'s role from ${previousRole} to ${newRole}`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        managerId: updatedUser.managerId,
      },
    });
  } catch (error: any) {
    console.error('Promotion error:', error);
    return NextResponse.json(
      { error: 'Failed to update user role: ' + error.message },
      { status: 500 }
    );
  }
}
