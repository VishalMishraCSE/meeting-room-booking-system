import { prisma } from './prisma';

/**
 * Finds the active Manager with the fewest assigned employees to ensure
 * equal / load-balanced distribution across all managers.
 */
export async function getLeastLoadedManagerId(): Promise<number | null> {
  try {
    // Find all active managers
    const managers = await prisma.user.findMany({
      where: {
        role: {
          in: ['Manager', 'manager'],
        },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { id: 'asc' },
    });

    if (!managers || managers.length === 0) {
      return null;
    }

    // Get count of employees assigned to each manager
    const managerCounts = await Promise.all(
      managers.map(async (mgr) => {
        const count = await prisma.user.count({
          where: {
            managerId: mgr.id,
            isActive: true,
          },
        });
        return { managerId: mgr.id, count };
      })
    );

    // Sort by count ascending, then by managerId ascending
    managerCounts.sort((a, b) => {
      if (a.count !== b.count) {
        return a.count - b.count;
      }
      return a.managerId - b.managerId;
    });

    return managerCounts[0].managerId;
  } catch (error) {
    console.error('Error finding least loaded manager:', error);
    return null;
  }
}

/**
 * Backfills any active employees who do not have an assigned managerId,
 * distributing them equally across all available active managers.
 */
export async function backfillEmployeeManagers(): Promise<{ updatedCount: number }> {
  try {
    const unassignedEmployees = await prisma.user.findMany({
      where: {
        role: {
          in: ['Employee', 'employee'],
        },
        managerId: null,
        isActive: true,
      },
      orderBy: { id: 'asc' },
    });

    if (unassignedEmployees.length === 0) {
      return { updatedCount: 0 };
    }

    let updatedCount = 0;
    for (const emp of unassignedEmployees) {
      const assignedManagerId = await getLeastLoadedManagerId();
      if (assignedManagerId) {
        await prisma.user.update({
          where: { id: emp.id },
          data: { managerId: assignedManagerId },
        });
        updatedCount++;
      }
    }

    return { updatedCount };
  } catch (error) {
    console.error('Error backfilling employee manager assignments:', error);
    return { updatedCount: 0 };
  }
}
