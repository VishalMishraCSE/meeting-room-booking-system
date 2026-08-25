import { prisma } from './prisma';

export interface PermissionDefinition {
  code: string;
  name: string;
  category: string;
  description: string;
  defaultRoles: ('Employee' | 'Manager' | 'Admin')[];
}

export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  // ─── Reservations & Booking ───
  {
    code: 'BOOK_STANDARD_ROOMS',
    name: 'Book Standard Rooms',
    category: 'Reservations',
    description: 'Reserve standard conference, huddle, and training rooms',
    defaultRoles: ['Employee', 'Manager', 'Admin'],
  },
  {
    code: 'BOOK_VIP_ROOMS',
    name: 'Direct VIP Room Booking',
    category: 'Reservations',
    description: 'Direct priority booking of Executive Boardrooms without mandatory approval',
    defaultRoles: ['Manager', 'Admin'],
  },
  {
    code: 'OVERRIDE_PAST_LIMITS',
    name: 'Exceed Quota & Time Limits',
    category: 'Reservations',
    description: 'Book sessions longer than 2 hours or override daily department quotas',
    defaultRoles: ['Manager', 'Admin'],
  },

  // ─── Approvals & Extensions ───
  {
    code: 'APPROVE_TEAM_BOOKINGS',
    name: 'Approve Subordinate Bookings',
    category: 'Approvals',
    description: 'Review and approve/reject booking requests from direct team members',
    defaultRoles: ['Manager', 'Admin'],
  },
  {
    code: 'AUTHORIZE_EXTENSIONS',
    name: 'Authorize Meeting Extensions',
    category: 'Approvals',
    description: 'Grant +30m / +60m emergency room extensions for running sessions',
    defaultRoles: ['Manager', 'Admin'],
  },
  {
    code: 'APPROVE_MANAGER_SIGNUPS',
    name: 'Approve Manager Registrations',
    category: 'Approvals',
    description: 'Authorize and verify newly registered Manager user accounts',
    defaultRoles: ['Admin'],
  },

  // ─── Facility & Equipment Management ───
  {
    code: 'MANAGE_ROOMS',
    name: 'Manage Facility Rooms',
    category: 'Facilities',
    description: 'Add new rooms, toggle maintenance status, and update equipment/amenities',
    defaultRoles: ['Admin'],
  },
  {
    code: 'MANAGE_ROOM_SUPPLIES',
    name: 'Manage Supplies & Restock',
    category: 'Facilities',
    description: 'Report missing equipment, order accessories, and replenish supplies',
    defaultRoles: ['Manager', 'Admin'],
  },

  // ─── Governance, RBAC & Promotions ───
  {
    code: 'VIEW_AUDIT_LOGS',
    name: 'View Security Audit Trail',
    category: 'Governance & Security',
    description: 'Access telemetry, reservation histories, cancellation reasons, and system logs',
    defaultRoles: ['Admin'],
  },
  {
    code: 'PROMOTE_DEMOTE_USERS',
    name: 'Promote / Demote Users',
    category: 'Governance & Security',
    description: 'Elevate employees to managers or admins, and reassign reporting structures',
    defaultRoles: ['Admin'],
  },
  {
    code: 'CONFIGURE_RBAC_PERMISSIONS',
    name: 'Configure Dynamic RBAC Matrix',
    category: 'Governance & Security',
    description: 'Toggle system capabilities for specific enterprise roles',
    defaultRoles: ['Admin'],
  },
];

/**
 * Ensures all core Roles, Permissions, and Default Mappings exist in the database
 */
export async function ensurePermissionsSeeded() {
  try {
    const roles = ['Employee', 'Manager', 'Admin'];

    // 1. Ensure Roles exist
    for (const r of roles) {
      await prisma.role.upsert({
        where: { name: r },
        update: {},
        create: {
          name: r,
          description: `${r} Workspace Authority Level`,
          isDefault: r === 'Employee',
        },
      });
    }

    // 2. Ensure Permissions exist
    for (const p of SYSTEM_PERMISSIONS) {
      await prisma.permission.upsert({
        where: { code: p.code },
        update: {
          name: p.name,
          category: p.category,
          description: p.description,
        },
        create: {
          code: p.code,
          name: p.name,
          category: p.category,
          description: p.description,
        },
      });
    }

    // 3. Ensure Role-Permission Mappings exist
    const dbRoles = await prisma.role.findMany();
    const dbPerms = await prisma.permission.findMany();

    for (const pDef of SYSTEM_PERMISSIONS) {
      const permObj = dbPerms.find((p: { id: number; code: string }) => p.code === pDef.code);
      if (!permObj) continue;

      for (const roleObj of dbRoles as Array<{ id: number; name: string }>) {
        const isDefaultEnabled = pDef.defaultRoles.includes(
          roleObj.name as 'Employee' | 'Manager' | 'Admin'
        );

        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: roleObj.id,
              permissionId: permObj.id,
            },
          },
          update: {},
          create: {
            roleId: roleObj.id,
            permissionId: permObj.id,
            isEnabled: isDefaultEnabled,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error during ensurePermissionsSeeded:', error);
  }
}

/**
 * Checks if a given role has permission for a specific capability code
 */
export async function hasPermission(roleName: string, permissionCode: string): Promise<boolean> {
  try {
    await ensurePermissionsSeeded();

    const normalizedRole = roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();

    const rolePerm = await prisma.rolePermission.findFirst({
      where: {
        role: { name: normalizedRole },
        permission: { code: permissionCode },
        isEnabled: true,
      },
    });

    return !!rolePerm;
  } catch (err) {
    console.error(`Permission check failed for ${roleName}:${permissionCode}`, err);
    // Fallback: Admin has all permissions by default
    return roleName.toLowerCase() === 'admin';
  }
}
