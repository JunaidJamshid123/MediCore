import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsEmail,
  IsArray,
  IsUUID,
  MaxLength,
  MinLength,
  Matches,
  IsNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  BloodType,
  MaritalStatus,
  Ethnicity,
} from '../entities/patient.entity';
import { CreateEmergencyContactDto } from './create-emergency-contact.dto';
import { CreateInsuranceInfoDto } from './create-insurance-info.dto';

export class CreatePatientDto {
  // â”€â”€ Link to existing user (optional) â”€â”€
  @ApiPropertyOptional({
    description: 'Link to an existing user account (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  user_id?: string;

  // â”€â”€ Demographics â”€â”€
  @ApiProperty({ description: 'First name', example: 'John', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  first_name: string;

  @ApiProperty({ description: 'Last name', example: 'Doe', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  last_name: string;

  @ApiProperty({ description: 'Date of birth', example: '1990-03-15' })
  @IsDateString()
  @IsNotEmpty()
  date_of_birth: string;

  @ApiPropertyOptional({ description: 'Gender', example: 'male' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  gender?: string;

  @ApiPropertyOptional({
    description: 'Marital status',
    enum: MaritalStatus,
  })
  @IsEnum(MaritalStatus)
  @IsOptional()
  marital_status?: MaritalStatus;

  @ApiPropertyOptional({
    description: 'Ethnicity',
    enum: Ethnicity,
  })
  @IsEnum(Ethnicity)
  @IsOptional()
  ethnicity?: Ethnicity;

  @ApiPropertyOptional({
    description: 'Preferred language',
    example: 'English',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  preferred_language?: string;

  @ApiPropertyOptional({
    description: 'Nationality',
    example: 'American',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nationality?: string;

  // â”€â”€ Sensitive Data â”€â”€
  @ApiPropertyOptional({
    description: 'Social Security Number (will be encrypted)',
    example: '123-45-6789',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{3}-?\d{2}-?\d{4}$/, {
    message: 'SSN must be in format XXX-XX-XXXX or XXXXXXXXX',
  })
  ssn?: string;

  // â”€â”€ Contact Information â”€â”€
  @ApiPropertyOptional({
    description: 'Primary phone number',
    example: '+1-234-567-8900',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[\d\s\-\+\(\)]+$/, {
    message: 'Phone number can only contain numbers, spaces, and +-()',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Secondary phone number',
    example: '+1-234-567-8901',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  secondary_phone?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'john.doe@email.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Address line 1',
    example: '123 Medical Drive',
  })
  @IsString()
  @IsOptional()
  address_line_1?: string;

  @ApiPropertyOptional({
    description: 'Address line 2',
    example: 'Suite 200',
  })
  @IsString()
  @IsOptional()
  address_line_2?: string;

  @ApiPropertyOptional({ description: 'City', example: 'Healthcare City' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'State', example: 'CA' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ description: 'ZIP code', example: '90210' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  zip_code?: string;

  @ApiPropertyOptional({ description: 'Country', example: 'USA' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  // â”€â”€ Medical Information â”€â”€
  @ApiPropertyOptional({
    description: 'Blood type',
    enum: BloodType,
  })
  @IsEnum(BloodType)
  @IsOptional()
  blood_type?: BloodType;

  @ApiPropertyOptional({
    description: 'Known allergies',
    example: ['Penicillin', 'Peanuts'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergies?: string[];

  @ApiPropertyOptional({
    description: 'Chronic conditions',
    example: ['Diabetes Type 2', 'Hypertension'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  chronic_conditions?: string[];

  @ApiPropertyOptional({
    description: 'Current medications',
    example: 'Metformin 500mg twice daily',
  })
  @IsString()
  @IsOptional()
  current_medications?: string;

  @ApiPropertyOptional({
    description: 'Height in centimeters',
    example: 175.5,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(300)
  height_cm?: number;

  @ApiPropertyOptional({
    description: 'Weight in kilograms',
    example: 70.0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(700)
  weight_kg?: number;

  // â”€â”€ Primary Care Provider â”€â”€
  @ApiPropertyOptional({
    description: 'Primary care provider (doctor) user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  primary_care_provider_id?: string;

  // â”€â”€ Emergency Contacts â”€â”€
  @ApiPropertyOptional({
    description: 'Emergency contacts list',
    type: [CreateEmergencyContactDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateEmergencyContactDto)
  @IsOptional()
  emergency_contacts?: CreateEmergencyContactDto[];

  // â”€â”€ Insurance Information â”€â”€
  @ApiPropertyOptional({
    description: 'Insurance information',
    type: [CreateInsuranceInfoDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateInsuranceInfoDto)
  @IsOptional()
  insurance_info?: CreateInsuranceInfoDto[];

  // â”€â”€ Notes â”€â”€
  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Patient prefers morning appointments',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
