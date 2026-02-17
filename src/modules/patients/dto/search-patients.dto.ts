import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PatientStatus } from '../entities/patient.entity';

export enum PatientSortField {
  FIRST_NAME = 'first_name',
  LAST_NAME = 'last_name',
  DATE_OF_BIRTH = 'date_of_birth',
  CREATED_AT = 'created_at',
  MEDICAL_RECORD_NUMBER = 'medical_record_number',
  STATUS = 'status',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class SearchPatientsDto {
  // â”€â”€ Text Search â”€â”€
  @ApiPropertyOptional({
    description: 'Search by name (first or last)',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by Medical Record Number',
    example: 'MRN-2026-00001',
  })
  @IsString()
  @IsOptional()
  mrn?: string;

  @ApiPropertyOptional({
    description: 'Filter by date of birth',
    example: '1990-03-15',
  })
  @IsDateString()
  @IsOptional()
  date_of_birth?: string;

  @ApiPropertyOptional({
    description: 'Filter by phone number',
    example: '+1-234-567-8900',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Filter by email',
    example: 'john@email.com',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filter by patient status',
    enum: PatientStatus,
  })
  @IsEnum(PatientStatus)
  @IsOptional()
  status?: PatientStatus;

  @ApiPropertyOptional({
    description: 'Filter by primary care provider ID',
  })
  @IsString()
  @IsOptional()
  primary_care_provider_id?: string;

  // â”€â”€ Pagination â”€â”€
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of records per page',
    example: 20,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  // â”€â”€ Sorting â”€â”€
  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: PatientSortField,
    default: PatientSortField.CREATED_AT,
  })
  @IsEnum(PatientSortField)
  @IsOptional()
  sortBy?: PatientSortField = PatientSortField.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;
}
