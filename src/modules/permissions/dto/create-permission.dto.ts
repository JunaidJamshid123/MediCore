import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Resource name',
    example: 'users',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  resource: string;

  @ApiProperty({
    description: 'Action on resource',
    example: 'create',
    enum: ['create', 'read', 'update', 'delete', 'manage', 'read_own', 'manage_own', '*'],
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  action: string;

  @ApiPropertyOptional({
    description: 'Permission description',
    example: 'Allows creating new users',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
