import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto, AssignRoleDto } from './dto';
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

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    const hashedToken = refreshToken
      ? await bcrypt.hash(refreshToken, 10)
      : undefined;
    await this.userRepository.update(id, { refresh_token: hashedToken });
  }

  // ===== ENHANCED USER MANAGEMENT =====

  async activateUser(userId: string): Promise<User> {
    const user = await this.findOne(userId);
    
    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestException('User is already active');
    }

    user.status = UserStatus.ACTIVE;
    return await this.userRepository.save(user);
  }

  async deactivateUser(userId: string): Promise<User> {
    const user = await this.findOne(userId);

    if (user.status === UserStatus.INACTIVE) {
      throw new BadRequestException('User is already inactive');
    }

    user.status = UserStatus.INACTIVE;
    // Note: Sessions should be invalidated by the controller
    return await this.userRepository.save(user);
  }

  async suspendUser(userId: string): Promise<User> {
    const user = await this.findOne(userId);

    if (user.status === UserStatus.SUSPENDED) {
      throw new BadRequestException('User is already suspended');
    }

    user.status = UserStatus.SUSPENDED;
    // Note: Sessions should be invalidated by the controller
    return await this.userRepository.save(user);
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    await this.userRepository.update(userId, {
      password: hashedPassword,
      password_changed_at: new Date(),
    });
  }

  async assignRole(userId: string, assignRoleDto: AssignRoleDto): Promise<User> {
    const user = await this.findOne(userId);
    user.role_id = assignRoleDto.roleId;
    return await this.userRepository.save(user);
  }

  async getUsersByRole(roleId: string): Promise<User[]> {
    return await this.userRepository.find({
      where: { role_id: roleId },
      select: [
        'id',
        'email',
        'role',
        'status',
        'first_name',
        'last_name',
        'created_at',
      ],
    });
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
  }> {
    const [total, active, inactive, suspended] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { status: UserStatus.ACTIVE } }),
      this.userRepository.count({ where: { status: UserStatus.INACTIVE } }),
      this.userRepository.count({ where: { status: UserStatus.SUSPENDED } }),
    ]);

    return { total, active, inactive, suspended };
  }
}

