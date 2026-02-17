import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesService } from '../../modules/roles/roles.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roleId) {
      return false;
    }

    try {
      // Load user's role with permissions
      const userRole = await this.rolesService.findOneWithPermissions(
        user.roleId,
      );

      if (!userRole || !userRole.permissions) {
        return false;
      }

      // Check if user has required permissions
      return this.checkPermissions(userRole.permissions, requiredPermissions);
    } catch (error) {
      return false;
    }
  }

  private checkPermissions(
    userPermissions: any[],
    requiredPermissions: string[],
  ): boolean {
    const userPermCodes = userPermissions.map((p) => p.code);

    // Check for wildcard (Super Admin)
    if (userPermCodes.includes('*:*')) {
      return true;
    }

    // Check each required permission
    return requiredPermissions.every((required) => {
      const [resource, action] = required.split(':');

      return userPermCodes.some((userPerm) => {
        const [userResource, userAction] = userPerm.split(':');

        // Exact match or wildcard match
        return (
          (userResource === resource && userAction === action) ||
          (userResource === resource && userAction === '*') ||
          (userResource === '*' && userAction === '*')
        );
      });
    });
  }
}
