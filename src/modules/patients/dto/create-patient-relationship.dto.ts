import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FamilyRelationship } from '../entities/patient-relationship.entity';

export class CreatePatientRelationshipDto {
  @ApiPropertyOptional({
    description: 'Related patient ID (if registered in system)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  related_patient_id?: string;

  @ApiPropertyOptional({
    description: 'Relationship type',
    enum: FamilyRelationship,
  })
  @IsEnum(FamilyRelationship)
  relationship_type: FamilyRelationship;

  @ApiPropertyOptional({
    description: 'Name of related person (if not a patient in system)',
    example: 'Robert Doe',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  related_person_name?: string;

  @ApiPropertyOptional({
    description: 'Phone number of related person',
    example: '+1-234-567-8900',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  related_person_phone?: string;

  @ApiPropertyOptional({
    description: 'Notes about the relationship',
    example: 'Lives in same household',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
