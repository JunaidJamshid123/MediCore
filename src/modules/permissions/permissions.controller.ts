import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new permission (Admin only)' })
  @ApiResponse({ status: 201, description: 'Permission successfully created' })
  @ApiResponse({ status: 409, description: 'Permission already exists' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiQuery({ name: 'resource', required: false, description: 'Filter by resource' })
  @ApiResponse({ status: 200, description: 'Returns all permissions' })
  findAll(@Query('resource') resource?: string) {
    if (resource) {
      return this.permissionsService.findByResource(resource);
    }
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Returns the permission' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update permission (Admin only)' })
  @ApiParam({ name: 'id', description: 'Permission ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Permission successfully updated',
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete permission (Admin only)' })
  @ApiParam({ name: 'id', description: 'Permission ID (UUID)' })
  @ApiResponse({ status: 204, description: 'Permission successfully deleted' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
