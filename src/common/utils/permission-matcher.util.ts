/**
 * Centralized permission matching logic.
 * Used by both PermissionsGuard and RolesService.
 */
export class PermissionMatcher {
  /**
   * Check if a set of user permission codes satisfies all required permissions.
   * Supports exact match, resource wildcard (resource:*), and super wildcard (*:*).
   */
  static hasPermission(
    userPermissionCodes: string[],
    requiredPermissions: string[],
  ): boolean {
    // Check for super wildcard (Super Admin)
    if (userPermissionCodes.includes('*:*')) {
      return true;
    }

    return requiredPermissions.every((required) => {
      const [resource, action] = required.split(':');

      return userPermissionCodes.some((userPerm) => {
        const [userResource, userAction] = userPerm.split(':');

        return (
          // Exact match
          (userResource === resource && userAction === action) ||
          // Resource wildcard match (e.g., users:* matches users:create)
          (userResource === resource && userAction === '*') ||
          // Global wildcard match
          (userResource === '*' && userAction === '*')
        );
      });
    });
  }
}
