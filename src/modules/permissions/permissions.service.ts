import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    // Generate code from resource and action
    const code = `${createPermissionDto.resource}:${createPermissionDto.action}`;

    // Check if permission already exists
    const existingPermission = await this.permissionRepository.findOne({
      where: { code },
    });

    if (existingPermission) {
      throw new ConflictException('Permission with this code already exists');
    }

    const permission = this.permissionRepository.create({
      ...createPermissionDto,
      code,
    });

    return await this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async findByCode(code: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { code },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with code ${code} not found`);
    }

    return permission;
  }

  async findByResource(resource: string): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { resource },
      order: { action: 'ASC' },
    });
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.findOne(id);

    // If resource or action is being changed, regenerate code
    if (updatePermissionDto.resource || updatePermissionDto.action) {
      const newResource =
        updatePermissionDto.resource || permission.resource;
      const newAction = updatePermissionDto.action || permission.action;
      const newCode = `${newResource}:${newAction}`;

      // Check if new code already exists
      if (newCode !== permission.code) {
        const existingPermission = await this.permissionRepository.findOne({
          where: { code: newCode },
        });

        if (existingPermission) {
          throw new ConflictException(
            'Permission with this code already exists',
          );
        }

        permission.code = newCode;
      }
    }

    Object.assign(permission, updatePermissionDto);
    return await this.permissionRepository.save(permission);
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionRepository.remove(permission);
  }

  async bulkCreate(permissions: CreatePermissionDto[]): Promise<Permission[]> {
    const createdPermissions: Permission[] = [];

    for (const permissionDto of permissions) {
      try {
        const permission = await this.create(permissionDto);
        createdPermissions.push(permission);
      } catch (error) {
        // Skip if already exists
        if (error instanceof ConflictException) {
          const existing = await this.findByCode(
            `${permissionDto.resource}:${permissionDto.action}`,
          );
          createdPermissions.push(existing);
        } else {
          throw error;
        }
      }
    }

    return createdPermissions;
  }
}
