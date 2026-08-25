import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getLeastLoadedManagerId } from '@/lib/managerAssignment';
import { sendEmail } from '@/lib/mail';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    const { name, email, password, role, managerId } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this corporate email already exists. Please sign in.' },
        { status: 400 }
      );
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const normalizedRole = role && ['Admin', 'Manager', 'Employee'].includes(role) ? role : 'Employee';

    const isManagerRole = normalizedRole === 'Manager';
    const isEmployeeRole = normalizedRole === 'Employee';

    // If employee, assign chosen managerId or fallback to least-loaded active manager
    let assignedManagerId: number | null = null;
    if (isEmployeeRole) {
      if (managerId) {
        const parsedMgrId = parseInt(managerId.toString(), 10);
        const validMgr = await prisma.user.findFirst({
          where: { id: parsedMgrId, role: 'Manager', isActive: true },
        });
        if (validMgr) {
          assignedManagerId = validMgr.id;
        }
      }
      if (!assignedManagerId) {
        assignedManagerId = await getLeastLoadedManagerId();
      }
    }

    // Manager role registrations start as inactive until approved by SysAdmin
    const isAccountActive = !isManagerRole;

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: normalizedRole,
        managerId: assignedManagerId,
        isActive: isAccountActive,
      },
    });

    // If newly registered user is a Manager requesting verification:
    if (isManagerRole) {
      // Find all SysAdmins
      const admins = await prisma.user.findMany({
        where: { role: 'Admin', isActive: true },
      });

      // Send in-app notification to admins
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'New Manager Registration',
            message: `New Manager account registered: ${user.name} (${user.email}). Admin approval is required before they can sign in.`,
            type: 'MANAGER_APPROVAL',
          },
        }).catch(e => console.error('Failed to create admin notification:', e));
      }

      // Trigger email to admin
      if (admins.length > 0) {
        sendEmail({
          to: admins[0].email,
          subject: `Action Required: New Manager Registration (${user.name})`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
              <h2 style="color: #E8292B; margin-top: 0;">New Manager Registration Request</h2>
              <p>A new user has registered for a <strong>Manager Authority Account</strong> and is awaiting administrative verification:</p>
              
              <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Name:</strong> ${user.name}</p>
                <p style="margin: 4px 0;"><strong>Email:</strong> ${user.email}</p>
                <p style="margin: 4px 0;"><strong>Requested Role:</strong> Operations Manager</p>
              </div>

              <p>Please log in to the <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin" style="color: #E8292B; font-weight: bold;">Admin Console</a> under <strong>Team Hierarchy & Roles</strong> to authorize or reject this account.</p>
            </div>
          `,
        }).catch(e => console.error('Failed to send admin email:', e));
      }

      // WhatsApp trigger hook
      sendWhatsAppNotification({
        recipientPhone: '+919999999999',
        recipientName: 'SysAdmin',
        messageType: 'SECURITY_ALERT',
        parameters: {
          alertTitle: 'New Manager Registration',
          userName: user.name,
          userEmail: user.email,
        },
      }).catch(e => console.error('WhatsApp manager trigger failed:', e));

      return NextResponse.json({
        success: true,
        requiresApproval: true,
        message: 'Your Manager account has been registered successfully. An Administrator will verify and activate your account shortly.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase(),
          isActive: false,
        },
      });
    }

    const response = NextResponse.json({
      success: true,
      requiresApproval: false,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
      },
    });

    response.cookies.set('userSession', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
      isActive: user.isActive,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Registration failed: ' + error.message },
      { status: 500 }
    );
  }
}
