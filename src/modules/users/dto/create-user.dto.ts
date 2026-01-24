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
import { UserRole, Gender } from '../entities/user.entity';

export class CreateUserDto {
  // AUTHENTICATION & AUTHORIZATION
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  // PERSONAL INFORMATION
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  last_name: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsDateString()
  @IsOptional()
  date_of_birth?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  profile_picture?: string;

  // CONTACT INFORMATION
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[\d\s\-\+\(\)]+$/, {
    message: 'Phone number can only contain numbers, spaces, and +-()',
  })
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  // PROFESSIONAL FIELDS (Healthcare Providers Only)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  license_number?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  specialization?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  department?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  employee_id?: string;

  // PATIENT FIELDS (Patients Only)
  @IsString()
  @IsOptional()
  @MaxLength(50)
  medical_record_number?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  blood_type?: string;

  @IsArray()
  @IsOptional()
  allergies?: string[];
}
