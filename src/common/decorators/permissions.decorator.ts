import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to require specific permissions for an endpoint
 * @param permissions - Permission codes in format "resource:action"
 * @example @RequirePermissions('users:create', 'users:read')
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
