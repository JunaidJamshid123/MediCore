import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InsuranceType } from '../entities/insurance-info.entity';

export class CreateInsuranceInfoDto {
  @ApiPropertyOptional({
    description: 'Insurance type',
    enum: InsuranceType,
    default: InsuranceType.PRIMARY,
  })
  @IsEnum(InsuranceType)
  @IsOptional()
  insurance_type?: InsuranceType;

  @ApiProperty({
    description: 'Insurance provider name',
    example: 'Blue Cross Blue Shield',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  provider_name: string;

  @ApiProperty({
    description: 'Policy number',
    example: 'POL-123456789',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  policy_number: string;

  @ApiPropertyOptional({
    description: 'Group number',
    example: 'GRP-001',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  group_number?: string;

  @ApiPropertyOptional({
    description: 'Subscriber name',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  subscriber_name?: string;

  @ApiPropertyOptional({
    description: 'Subscriber relationship to patient',
    example: 'self',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  subscriber_relationship?: string;

  @ApiPropertyOptional({
    description: 'Effective date',
    example: '2025-01-01',
  })
  @IsDateString()
  @IsOptional()
  effective_date?: string;

  @ApiPropertyOptional({
    description: 'Expiration date',
    example: '2026-12-31',
  })
  @IsDateString()
  @IsOptional()
  expiration_date?: string;

  @ApiPropertyOptional({
    description: 'Copay amount',
    example: '30.00',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  copay_amount?: string;

  @ApiPropertyOptional({
    description: 'Deductible amount',
    example: '1500.00',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  deductible_amount?: string;

  @ApiPropertyOptional({
    description: 'Is the insurance currently active?',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
