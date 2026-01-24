import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Convert allergies array to JSON string if provided
    const allergiesString = createUserDto.allergies
      ? JSON.stringify(createUserDto.allergies)
      : undefined;

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      allergies: allergiesString,
    });

    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      select: [
        'id',
        'email',
        'role',
        'status',
        'first_name',
        'last_name',
        'gender',
        'date_of_birth',
        'profile_picture',
        'phone',
        'address',
        'license_number',
        'specialization',
        'department',
        'employee_id',
        'medical_record_number',
        'blood_type',
        'email_verified',
        'created_at',
        'updated_at',
      ],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'role',
        'status',
        'first_name',
        'last_name',
        'gender',
        'date_of_birth',
        'profile_picture',
        'phone',
        'address',
        'license_number',
        'specialization',
        'department',
        'employee_id',
        'medical_record_number',
        'blood_type',
        'allergies',
        'email_verified',
        'last_login_at',
        'created_at',
        'updated_at',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);

    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.softRemove(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { last_login_at: new Date() });
  }
}
