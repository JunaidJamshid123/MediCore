import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ConsentType,
  ConsentStatus,
} from '../entities/patient-consent.entity';

export class CreatePatientConsentDto {
  @ApiProperty({
    description: 'Type of consent',
    enum: ConsentType,
  })
  @IsEnum(ConsentType)
  consent_type: ConsentType;

  @ApiPropertyOptional({
    description: 'Consent status',
    enum: ConsentStatus,
    default: ConsentStatus.GRANTED,
  })
  @IsEnum(ConsentStatus)
  @IsOptional()
  status?: ConsentStatus;

  @ApiPropertyOptional({
    description: 'Description of what is being consented to',
    example: 'Consent for general medical treatment',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Date/time consent was granted',
    example: '2026-02-16T10:00:00.000Z',
  })
  @IsDateString()
  granted_at: string;

  @ApiPropertyOptional({
    description: 'Expiration date of consent',
    example: '2027-02-16T10:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  expires_at?: string;

  @ApiPropertyOptional({
    description: 'Name or ID of person who granted consent',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  granted_by?: string;

  @ApiPropertyOptional({
    description: 'Name of witness',
    example: 'Nurse Jane Smith',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  witnessed_by?: string;

  @ApiPropertyOptional({
    description: 'URL of signed consent document',
    example: 'https://storage.medicore.com/consents/doc-123.pdf',
  })
  @IsString()
  @IsOptional()
  document_url?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
