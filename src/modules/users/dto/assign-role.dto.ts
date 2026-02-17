import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({
    description: 'Role ID to assign to the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  roleId: string;
}
