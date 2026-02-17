import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignProviderDto {
  @ApiProperty({
    description: 'Doctor/Provider user ID to assign as primary care provider',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  provider_id: string;
}
