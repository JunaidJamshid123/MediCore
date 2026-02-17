import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleRef } from '@nestjs/core';

export interface OwnershipConfig {
  service: any;
  method: string;
  paramName: string;
}

@Injectable()
export class ResourceOwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ownershipConfig = this.reflector.get<OwnershipConfig>(
      'ownership',
      context.getHandler(),
    );

    if (!ownershipConfig) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    const resourceId = request.params[ownershipConfig.paramName];

    if (!resourceId) {
      throw new ForbiddenException(
        `Resource parameter '${ownershipConfig.paramName}' not found`,
      );
    }

    try {
      // Get the service to check ownership
      const service = this.moduleRef.get(ownershipConfig.service, {
        strict: false,
      });

      if (!service || !service[ownershipConfig.method]) {
        throw new ForbiddenException('Ownership validation service not found');
      }

      // Check if user owns or can access the resource
      const canAccess = await service[ownershipConfig.method](
        resourceId,
        user.id,
        user.role,
      );

      if (!canAccess) {
        throw new ForbiddenException('You do not have access to this resource');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      return false;
    }
  }
}
