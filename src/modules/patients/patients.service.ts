import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, DataSource } from 'typeorm';
import { Patient, PatientStatus } from './entities/patient.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { InsuranceInfo } from './entities/insurance-info.entity';
import { PatientRelationship } from './entities/patient-relationship.entity';
import { PatientConsent, ConsentStatus } from './entities/patient-consent.entity';
import {
  CreatePatientDto,
  UpdatePatientDto,
  SearchPatientsDto,
  CreateEmergencyContactDto,
  CreateInsuranceInfoDto,
  CreatePatientRelationshipDto,
  CreatePatientConsentDto,
  AssignProviderDto,
} from './dto';
import { EncryptionUtil } from '../../utils/encryption.util';
import { ResponseUtil } from '../../utils/response.util';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(EmergencyContact)
    private readonly emergencyContactRepository: Repository<EmergencyContact>,
    @InjectRepository(InsuranceInfo)
    private readonly insuranceRepository: Repository<InsuranceInfo>,
    @InjectRepository(PatientRelationship)
    private readonly relationshipRepository: Repository<PatientRelationship>,
    @InjectRepository(PatientConsent)
    private readonly consentRepository: Repository<PatientConsent>,
    private readonly dataSource: DataSource,
  ) {}

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 3.1 PATIENT REGISTRATION
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  async create(
    createPatientDto: CreatePatientDto,
    registeredBy?: string,
  ): Promise<Patient> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if user_id is already linked to a patient
      if (createPatientDto.user_id) {
        const existingPatient = await queryRunner.manager.findOne(Patient, {
          where: { user_id: createPatientDto.user_id },
        });
        if (existingPatient) {
          throw new ConflictException(
            'A patient record already exists for this user',
          );
        }
      }

      // Check duplicate by email if provided
      if (createPatientDto.email) {
        const existingByEmail = await queryRunner.manager.findOne(Patient, {
          where: { email: createPatientDto.email },
        });
        if (existingByEmail) {
          throw new ConflictException(
            'A patient with this email already exists',
          );
        }
      }

      // Generate unique MRN using DB sequence (within transaction to avoid races)
      const mrn = await this.generateMRN(queryRunner.manager);

      // Handle SSN encryption
      let ssnEncrypted: string | undefined;
      let ssnLastFour: string | undefined;
      if (createPatientDto.ssn) {
        try {
          ssnEncrypted = EncryptionUtil.encrypt(createPatientDto.ssn);
          ssnLastFour = EncryptionUtil.maskExceptLast(createPatientDto.ssn, 4);
        } catch (error) {
          this.logger.warn('Encryption not configured, storing SSN hash only');
          ssnLastFour = EncryptionUtil.maskExceptLast(createPatientDto.ssn, 4);
        }
      }

      // Extract nested DTOs
      const { emergency_contacts, insurance_info, ssn, ...patientData } =
        createPatientDto;

      // Create patient entity
      const patient = queryRunner.manager.create(Patient, {
        ...patientData,
        medical_record_number: mrn,
        ssn_encrypted: ssnEncrypted,
        ssn_last_four: ssnLastFour,
        registered_by: registeredBy,
      });

      const savedPatient = await queryRunner.manager.save(patient);

      // Save emergency contacts if provided
      if (emergency_contacts && emergency_contacts.length > 0) {
        const contacts = emergency_contacts.map((ec) =>
          queryRunner.manager.create(EmergencyContact, {
            ...ec,
            patient_id: savedPatient.id,
          }),
        );
        await queryRunner.manager.save(contacts);
      }

      // Save insurance info if provided
      if (insurance_info && insurance_info.length > 0) {
        const insurances = insurance_info.map((ins) =>
          queryRunner.manager.create(InsuranceInfo, {
            ...ins,
            patient_id: savedPatient.id,
          }),
        );
        await queryRunner.manager.save(insurances);
      }

      await queryRunner.commitTransaction();

      this.logger.log(
        `Patient registered: ${savedPatient.medical_record_number} by user ${registeredBy}`,
      );

      return this.findOne(savedPatient.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Generate unique Medical Record Number: MRN-YYYY-NNNNN
   * Uses SELECT ... FOR UPDATE to prevent race conditions under concurrent registration.
   */
  private async generateMRN(manager?: any): Promise<string> {
    const repo = manager
      ? manager.getRepository(Patient)
      : this.patientRepository;
    const year = new Date().getFullYear();
    const prefix = `MRN-${year}-`;

    // Get the last MRN for this year (with lock if inside a transaction)
    const qb = repo
      .createQueryBuilder('patient')
      .where('patient.medical_record_number LIKE :prefix', {
        prefix: `${prefix}%`,
      })
      .orderBy('patient.medical_record_number', 'DESC');

    if (manager) {
      qb.setLock('pessimistic_write');
    }

    const lastPatient = await qb.getOne();

    let nextNumber = 1;
    if (lastPatient) {
      const lastNumber = parseInt(
        lastPatient.medical_record_number.replace(prefix, ''),
        10,
      );
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 3.2 PATIENT PROFILE MANAGEMENT (CRUD)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: [
        'emergency_contacts',
        'insurance_info',
        'relationships',
        'consents',
        'primary_care_provider',
      ],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async findByMRN(mrn: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { medical_record_number: mrn },
      relations: [
        'emergency_contacts',
        'insurance_info',
        'relationships',
        'consents',
        'primary_care_provider',
      ],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with MRN ${mrn} not found`);
    }

    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Handle SSN update
      const { emergency_contacts, insurance_info, ssn, ...updateData } =
        updatePatientDto as any;

      if (ssn) {
        try {
          (updateData as any).ssn_encrypted = EncryptionUtil.encrypt(ssn);
          (updateData as any).ssn_last_four = EncryptionUtil.maskExceptLast(ssn, 4);
        } catch {
          (updateData as any).ssn_last_four = EncryptionUtil.maskExceptLast(ssn, 4);
        }
      }

      Object.assign(patient, updateData);
      await queryRunner.manager.save(patient);

      // Update emergency contacts if provided
      if (emergency_contacts) {
        await queryRunner.manager.delete(EmergencyContact, { patient_id: id });
        if (emergency_contacts.length > 0) {
          const contacts = emergency_contacts.map((ec: CreateEmergencyContactDto) =>
            queryRunner.manager.create(EmergencyContact, { ...ec, patient_id: id }),
          );
          await queryRunner.manager.save(contacts);
        }
      }

      // Update insurance info if provided
      if (insurance_info) {
        await queryRunner.manager.delete(InsuranceInfo, { patient_id: id });
        if (insurance_info.length > 0) {
          const insurances = insurance_info.map((ins: CreateInsuranceInfoDto) =>
            queryRunner.manager.create(InsuranceInfo, { ...ins, patient_id: id }),
          );
          await queryRunner.manager.save(insurances);
        }
      }

      await queryRunner.commitTransaction();

      this.logger.log(`Patient updated: ${patient.medical_record_number}`);
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientRepository.softRemove(patient);
    this.logger.log(`Patient soft-deleted: ${patient.medical_record_number}`);
  }

  async updateStatus(id: string, status: PatientStatus): Promise<Patient> {
    const patient = await this.findOne(id);

    if (patient.status === status) {
      throw new BadRequestException(`Patient is already ${status}`);
    }

    patient.status = status;
    const saved = await this.patientRepository.save(patient);
    this.logger.log(
      `Patient ${patient.medical_record_number} status changed to ${status}`,
    );
    return saved;
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 3.3 ADVANCED SEARCH
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  async search(searchDto: SearchPatientsDto) {
    const {
      search,
      mrn,
      date_of_birth,
      phone,
      email,
      status,
      primary_care_provider_id,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = searchDto;

    const qb: SelectQueryBuilder<Patient> = this.patientRepository
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.primary_care_provider', 'provider');

    // Name search (first_name OR last_name ILIKE)
    if (search) {
      qb.andWhere(
        '(patient.first_name ILIKE :search OR patient.last_name ILIKE :search OR CONCAT(patient.first_name, \' \', patient.last_name) ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // MRN filter
    if (mrn) {
      qb.andWhere('patient.medical_record_number ILIKE :mrn', {
        mrn: `%${mrn}%`,
      });
    }

    // Date of birth filter
    if (date_of_birth) {
      qb.andWhere('patient.date_of_birth = :dob', { dob: date_of_birth });
    }

    // Phone filter
    if (phone) {
      qb.andWhere(
        '(patient.phone ILIKE :phone OR patient.secondary_phone ILIKE :phone)',
        { phone: `%${phone}%` },
      );
    }

    // Email filter
    if (email) {
      qb.andWhere('patient.email ILIKE :email', { email: `%${email}%` });
    }

    // Status filter
    if (status) {
      qb.andWhere('patient.status = :status', { status });
    }

    // Provider filter
    if (primary_care_provider_id) {
      qb.andWhere('patient.primary_care_provider_id = :providerId', {
        providerId: primary_care_provider_id,
      });
    }

    // Sorting
    qb.orderBy(`patient.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    // Pagination
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return ResponseUtil.paginated(data, total, page, limit);
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 3.4 PATIENT RELATIONSHIPS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  // â”€â”€ Emergency Contacts â”€â”€

  async addEmergencyContact(
    patientId: string,
    dto: CreateEmergencyContactDto,
  ): Promise<EmergencyContact> {
    await this.findOne(patientId); // ensure patient exists
    const contact = this.emergencyContactRepository.create({
      ...dto,
      patient_id: patientId,
    });
    return this.emergencyContactRepository.save(contact);
  }

  async getEmergencyContacts(patientId: string): Promise<EmergencyContact[]> {
    await this.findOne(patientId);
    return this.emergencyContactRepository.find({
      where: { patient_id: patientId },
      order: { is_primary: 'DESC', created_at: 'ASC' },
    });
  }

  async removeEmergencyContact(
    patientId: string,
    contactId: string,
  ): Promise<void> {
    const contact = await this.emergencyContactRepository.findOne({
      where: { id: contactId, patient_id: patientId },
    });
    if (!contact) {
      throw new NotFoundException('Emergency contact not found');
    }
    await this.emergencyContactRepository.remove(contact);
  }

  // â”€â”€ Insurance â”€â”€

  async addInsurance(
    patientId: string,
    dto: CreateInsuranceInfoDto,
  ): Promise<InsuranceInfo> {
    await this.findOne(patientId);
    const insurance = this.insuranceRepository.create({
      ...dto,
      patient_id: patientId,
    });
    return this.insuranceRepository.save(insurance);
  }

  async getInsurance(patientId: string): Promise<InsuranceInfo[]> {
    await this.findOne(patientId);
    return this.insuranceRepository.find({
      where: { patient_id: patientId },
      order: { insurance_type: 'ASC', created_at: 'ASC' },
    });
  }

  async removeInsurance(
    patientId: string,
    insuranceId: string,
  ): Promise<void> {
    const insurance = await this.insuranceRepository.findOne({
      where: { id: insuranceId, patient_id: patientId },
    });
    if (!insurance) {
      throw new NotFoundException('Insurance record not found');
    }
    await this.insuranceRepository.remove(insurance);
  }

  // â”€â”€ Family Relationships â”€â”€

  async addRelationship(
    patientId: string,
    dto: CreatePatientRelationshipDto,
  ): Promise<PatientRelationship> {
    await this.findOne(patientId);

    // Validate related_patient_id if provided
    if (dto.related_patient_id) {
      await this.findOne(dto.related_patient_id);
    }

    const relationship = this.relationshipRepository.create({
      ...dto,
      patient_id: patientId,
    });
    return this.relationshipRepository.save(relationship);
  }

  async getRelationships(patientId: string): Promise<PatientRelationship[]> {
    await this.findOne(patientId);
    return this.relationshipRepository.find({
      where: { patient_id: patientId },
      relations: ['related_patient'],
    });
  }

  async removeRelationship(
    patientId: string,
    relationshipId: string,
  ): Promise<void> {
    const rel = await this.relationshipRepository.findOne({
      where: { id: relationshipId, patient_id: patientId },
    });
    if (!rel) {
      throw new NotFoundException('Relationship not found');
    }
    await this.relationshipRepository.remove(rel);
  }

  // â”€â”€ Primary Care Provider Assignment â”€â”€

  async assignProvider(
    patientId: string,
    dto: AssignProviderDto,
  ): Promise<Patient> {
    const patient = await this.findOne(patientId);
    patient.primary_care_provider_id = dto.provider_id;
    const saved = await this.patientRepository.save(patient);
    this.logger.log(
      `Provider ${dto.provider_id} assigned to patient ${patient.medical_record_number}`,
    );
    return this.findOne(saved.id);
  }

  async getPatientsByProvider(providerId: string): Promise<Patient[]> {
    return this.patientRepository.find({
      where: { primary_care_provider_id: providerId, status: PatientStatus.ACTIVE },
      order: { last_name: 'ASC', first_name: 'ASC' },
    });
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 3.5 DATA PRIVACY â€” CONSENT TRACKING
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  async addConsent(
    patientId: string,
    dto: CreatePatientConsentDto,
  ): Promise<PatientConsent> {
    await this.findOne(patientId);
    const consent = this.consentRepository.create({
      ...dto,
      patient_id: patientId,
    });
    return this.consentRepository.save(consent);
  }

  async getConsents(patientId: string): Promise<PatientConsent[]> {
    await this.findOne(patientId);
    return this.consentRepository.find({
      where: { patient_id: patientId },
      order: { created_at: 'DESC' },
    });
  }

  async revokeConsent(
    patientId: string,
    consentId: string,
  ): Promise<PatientConsent> {
    const consent = await this.consentRepository.findOne({
      where: { id: consentId, patient_id: patientId },
    });
    if (!consent) {
      throw new NotFoundException('Consent record not found');
    }
    consent.status = ConsentStatus.REVOKED;
    consent.revoked_at = new Date();
    return this.consentRepository.save(consent);
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // OWNERSHIP CHECK (for ResourceOwnershipGuard)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  async canUserAccessPatient(
    patientId: string,
    userId: string,
    userRole: string,
  ): Promise<boolean> {
    // Admins can access all patients
    if (userRole === 'admin') return true;

    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) return false;

    // If the user is linked to this patient
    if (patient.user_id === userId) return true;

    // If the user is the primary care provider
    if (patient.primary_care_provider_id === userId) return true;

    // Doctors and nurses can access patients (with proper permissions handled by PermissionsGuard)
    if (userRole === 'doctor' || userRole === 'nurse') return true;

    return false;
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // STATISTICS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  async getStats() {
    const [total, active, inactive] = await Promise.all([
      this.patientRepository.count(),
      this.patientRepository.count({
        where: { status: PatientStatus.ACTIVE },
      }),
      this.patientRepository.count({
        where: { status: PatientStatus.INACTIVE },
      }),
    ]);

    return { total, active, inactive };
  }
}
