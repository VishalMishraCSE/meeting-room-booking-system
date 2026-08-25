import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensurePermissionsSeeded, SYSTEM_PERMISSIONS } from '@/lib/permissions';
import { cookies } from 'next/headers';

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

// GET /api/permissions — Fetch RBAC Matrix with all roles & capabilities
export async function GET() {
  try {
    await ensurePermissionsSeeded();

    const roles = await prisma.role.findMany({
      orderBy: { id: 'asc' },
    });

    const permissions = await prisma.permission.findMany({
      orderBy: { id: 'asc' },
    });

    const rolePermissions = await prisma.rolePermission.findMany({
      include: {
        role: true,
        permission: true,
      },
    });

    // Structure into a quick-access matrix: matrix[roleName][permCode] = boolean
    const matrix: Record<string, Record<string, boolean>> = {};
    for (const r of roles) {
      matrix[r.name] = {};
      for (const p of permissions) {
        matrix[r.name][p.code] = false;
      }
    }

    for (const rp of rolePermissions) {
      if (matrix[rp.role.name]) {
        matrix[rp.role.name][rp.permission.code] = rp.isEnabled;
      }
    }

    return NextResponse.json({
      success: true,
      roles,
      permissions,
      matrix,
    });
  } catch (error: any) {
    console.error('Failed to fetch permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions: ' + error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/permissions — Toggle a permission capability for a role
export async function PATCH(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role?.toLowerCase() !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized: Only SysAdmins can configure RBAC permissions' },
      { status: 403 }
    );
  }

  try {
    const { roleName, permissionCode, isEnabled } = await request.json();

    if (!roleName || !permissionCode || typeof isEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'roleName, permissionCode, and isEnabled boolean are required' },
        { status: 400 }
      );
    }

    // Guard: Prevent disabling RBAC matrix or promotions for Admin to avoid lockout
    if (roleName.toLowerCase() === 'admin' && !isEnabled) {
      if (['PROMOTE_DEMOTE_USERS', 'CONFIGURE_RBAC_PERMISSIONS'].includes(permissionCode)) {
        return NextResponse.json(
          { error: 'Cannot disable core governance permissions for the Admin role' },
          { status: 400 }
        );
      }
    }

    const role = await prisma.role.findFirst({
      where: { name: { equals: roleName } },
    });

    const permission = await prisma.permission.findUnique({
      where: { code: permissionCode },
    });

    if (!role || !permission) {
      return NextResponse.json(
        { error: 'Target role or permission not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: permission.id,
        },
      },
      update: { isEnabled },
      create: {
        roleId: role.id,
        permissionId: permission.id,
        isEnabled,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Updated capability "${permission.name}" for role "${role.name}" to ${isEnabled ? 'Enabled' : 'Disabled'}`,
      updated,
    });
  } catch (error: any) {
    console.error('Failed to update permission:', error);
    return NextResponse.json(
      { error: 'Failed to update permission: ' + error.message },
      { status: 500 }
    );
  }
}
