import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsDateString,
  IsArray,
  MaxLength,
  Matches,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, Gender } from '../entities/user.entity';

export class CreateUserDto {
  // AUTHENTICATION & AUTHORIZATION
  @ApiProperty({
    description: 'User email address',
    example: 'doctor@medicore.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description:
      'User password (min 8 chars, must include uppercase, lowercase, number, and special character)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  // PERSONAL INFORMATION
  @ApiProperty({
    description: 'First name',
    example: 'John',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  first_name: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  last_name: string;

  @ApiPropertyOptional({
    description: 'Gender',
    enum: Gender,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Date of birth',
    example: '1990-01-15',
  })
  @IsDateString()
  @IsOptional()
  date_of_birth?: string;

  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://example.com/avatar.jpg',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  profile_picture?: string;

  // CONTACT INFORMATION
  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1-234-567-8900',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[\d\s\-\+\(\)]+$/, {
    message: 'Phone number can only contain numbers, spaces, and +-()',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Full address',
    example: '123 Medical St, Healthcare City, HC 12345',
  })
  @IsString()
  @IsOptional()
  address?: string;

  // PROFESSIONAL FIELDS (Healthcare Providers Only)
  @ApiPropertyOptional({
    description: 'Medical license number (for healthcare providers)',
    example: 'MED123456',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  license_number?: string;

  @ApiPropertyOptional({
    description: 'Medical specialization (for healthcare providers)',
    example: 'Cardiology',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  specialization?: string;

  @ApiPropertyOptional({
    description: 'Department (for healthcare providers)',
    example: 'Emergency Medicine',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({
    description: 'Employee ID (for healthcare providers)',
    example: 'EMP001',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  employee_id?: string;

  // PATIENT FIELDS (Patients Only)
  @ApiPropertyOptional({
    description: 'Medical record number (for patients)',
    example: 'MRN123456',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  medical_record_number?: string;

  @ApiPropertyOptional({
    description: 'Blood type (for patients)',
    example: 'A+',
    maxLength: 10,
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  blood_type?: string;

  @ApiPropertyOptional({
    description: 'List of allergies (for patients)',
    example: ['Penicillin', 'Peanuts'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  allergies?: string[];
}
