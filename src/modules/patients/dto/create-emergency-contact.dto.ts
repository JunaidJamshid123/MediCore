import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsEmail,
  IsBoolean,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmergencyContactRelationship } from '../entities/emergency-contact.entity';

export class CreateEmergencyContactDto {
  @ApiProperty({ description: 'Contact name', example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Relationship to patient',
    enum: EmergencyContactRelationship,
  })
  @IsEnum(EmergencyContactRelationship)
  @IsNotEmpty()
  relationship: EmergencyContactRelationship;

  @ApiProperty({ description: 'Phone number', example: '+1-234-567-8900' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^[\d\s\-\+\(\)]+$/, {
    message: 'Phone number can only contain numbers, spaces, and +-()',
  })
  phone: string;

  @ApiPropertyOptional({
    description: 'Secondary phone',
    example: '+1-234-567-8901',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  secondary_phone?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'jane.doe@email.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Address',
    example: '456 Family St, Same City, SC 12345',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Is this the primary emergency contact?',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;
}
