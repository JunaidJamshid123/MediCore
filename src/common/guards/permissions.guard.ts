import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesService } from '../../modules/roles/roles.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionMatcher } from '../utils/permission-matcher.util';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
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
      const userRole = await this.rolesService.findOne(user.roleId);

      if (!userRole || !userRole.permissions) {
        return false;
      }

      const userPermCodes = userRole.permissions.map((p) => p.code);
      return PermissionMatcher.hasPermission(userPermCodes, requiredPermissions);
    } catch (error) {
      return false;
    }
  }
}
