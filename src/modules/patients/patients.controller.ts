import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PatientsService } from './patients.service';
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
import { PatientStatus } from './entities/patient.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { UserRole } from '../users/entities/user.entity';
import { DataMaskingInterceptor } from './interceptors/data-masking.interceptor';

@ApiTags('Patients')
@Controller('patients')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 3.1 PATIENT REGISTRATION
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new patient' })
  @ApiResponse({ status: 201, description: 'Patient registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 409, description: 'Patient already exists' })
  create(@Body() createPatientDto: CreatePatientDto, @Request() req: any) {
    return this.patientsService.create(createPatientDto, req.user?.id);
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 3.3 ADVANCED SEARCH
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  @Get('search')
  @UseInterceptors(DataMaskingInterceptor)
  @ApiOperation({
    summary: 'Search patients with filtering, pagination, and sorting',
  })
  @ApiResponse({ status: 200, description: 'Returns paginated patient list' })
  search(@Query() searchDto: SearchPatientsDto, @Request() req: any) {
    return this.patientsService.search(searchDto);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get patient statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns patient statistics' })
  getStats() {
    return this.patientsService.getStats();
  }

  @Get('by-provider/:providerId')
  @ApiOperation({ summary: 'Get patients by primary care provider' })
  @ApiParam({ name: 'providerId', description: 'Provider user ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Returns patients for the provider' })
  getByProvider(@Param('providerId') providerId: string) {
    return this.patientsService.getPatientsByProvider(providerId);
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 3.2 PATIENT PROFILE MANAGEMENT (CRUD)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  @Get(':id')
  @UseInterceptors(DataMaskingInterceptor)
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiParam({ name: 'id', description: 'Patient ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Returns the patient profile' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.patientsService.findOne(id);
  }

  @Get('mrn/:mrn')
  @UseInterceptors(DataMaskingInterceptor)
  @ApiOperation({ summary: 'Get patient by Medical Record Number' })
  @ApiParam({ name: 'mrn', description: 'Medical Record Number' })
  @ApiResponse({ status: 200, description: 'Returns the patient profile' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  findByMRN(@Param('mrn') mrn: string) {
    return this.patientsService.findByMRN(mrn);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Update patient profile' })
  @ApiParam({ name: 'id', description: 'Patient ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete patient (Admin only, soft delete)' })
  @ApiParam({ name: 'id', description: 'Patient ID (UUID)' })
  @ApiResponse({ status: 204, description: 'Patient deleted' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async remove(@Param('id') id: string) {
    await this.patientsService.remove(id);
  }

  // â”€â”€ Status Management â”€â”€

  @Patch(':id/status/:status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Update patient status' })
  @ApiParam({ name: 'id', description: 'Patient ID (UUID)' })
  @ApiParam({ name: 'status', enum: PatientStatus, description: 'New status' })
  @ApiResponse({ status: 200, description: 'Patient status updated' })
  updateStatus(
    @Param('id') id: string,
    @Param('status') status: PatientStatus,
  ) {
    return this.patientsService.updateStatus(id, status);
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // EMERGENCY CONTACTS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  @Post(':id/emergency-contacts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add emergency contact to patient' })
  @ApiParam({ name: 'id', description: 'Patient ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Emergency contact added' })
  addEmergencyContact(
    @Param('id') id: string,
    @Body() dto: CreateEmergencyContactDto,
  ) {
    return this.patientsService.addEmergencyContact(id, dto);
  }

  @Get(':id/emergency-contacts')
  @ApiOperation({ summary: 'Get patient emergency contacts' })
  @ApiParam({ name: 'id', description: 'Patient ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Returns emergency contacts' })
  getEmergencyContacts(@Param('id') id: string) {
    return this.patientsService.getEmergencyContacts(id);
  }

  @Delete(':id/emergency-contacts/:contactId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove emergency contact' })
  @ApiParam({ name: 'id', description: 'Patient ID (UUID)' })
  @ApiParam({ name: 'contactId', description: 'Emergency contact ID (UUID)' })
  async removeEmergencyContact(
    @Param('id') id: string,
    @Param('contactId') contactId: string,
  ) {
    await this.patientsService.removeEmergencyContact(id, contactId);
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // INSURANCE
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  @Post(':id/insurance')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add insurance information' })
  @ApiParam({ name: 'id', description: 'Patient ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Insurance info added' })
  addInsurance(
    @Param('id') id: string,
    @Body() dto: CreateInsuranceInfoDto,
  ) {
    return this.patientsService.addInsurance(id, dto);
  }

  @Get(':id/insurance')
  @ApiOperation({ summary: 'Get patient insurance information' })
  @ApiParam({ name: 'id', description: 'Patient ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Returns insurance information' })
  getInsurance(@Param('id') id: string) {
    return this.patientsService.getInsurance(id);
  }

  @Delete(':id/insurance/:insuranceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove insurance record' })
  @ApiParam({ name: 'id', description: 'Patient ID (UUID)' })
  @ApiParam({ name: 'insuranceId', description: 'Insurance record ID (UUID)' })
  async removeInsurance(
    @Param('id') id: string,
    @Param('insuranceId') insuranceId: string,
  ) {
    await this.patientsService.removeInsurance(id, insuranceId);
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 3.4 PATIENT RELATIONSHIPS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  @Post(':id/relationships')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add family/relationship to patient' })
  @ApiParam({ name: 'id', description: 'Patient ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Relationship added' })
  addRelationship(
    @Param('id') id: string,
    @Body() dto: CreatePatientRelationshipDto,
  ) {
    return this.patientsService.addRelationship(id, dto);
  }

  @Get(':id/relationships')
  @ApiOperation({ summary: 'Get patient family relationships' })
  @ApiParam({ name: 'id', description: 'Patient ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Returns relationships' })
  getRelationships(@Param('id') id: string) {
    return this.patientsService.getRelationships(id);
  }

  @Delete(':id/relationships/:relationshipId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove relationship' })
  @ApiParam({ name: 'id', description: 'Patient ID (UUID)' })
  @ApiParam({ name: 'relationshipId', description: 'Relationship ID (UUID)' })
  async removeRelationship(
    @Param('id') id: string,
    @Param('relationshipId') relationshipId: string,
  ) {
    await this.patientsService.removeRelationship(id, relationshipId);
  }

  // â”€â”€ Provider Assignment â”€â”€

  @Post(':id/assign-provider')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Assign primary care provider to patient' })
  @ApiParam({ name: 'id', description: 'Patient ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Provider assigned' })
  assignProvider(
    @Param('id') id: string,
    @Body() dto: AssignProviderDto,
  ) {
    return this.patientsService.assignProvider(id, dto);
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 3.5 CONSENT TRACKING
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  @Post(':id/consents')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add consent record for patient' })
  @ApiParam({ name: 'id', description: 'Patient ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Consent recorded' })
  addConsent(
    @Param('id') id: string,
    @Body() dto: CreatePatientConsentDto,
  ) {
    return this.patientsService.addConsent(id, dto);
  }

  @Get(':id/consents')
  @ApiOperation({ summary: 'Get patient consent records' })
  @ApiParam({ name: 'id', description: 'Patient ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Returns consent records' })
  getConsents(@Param('id') id: string) {
    return this.patientsService.getConsents(id);
  }

  @Patch(':id/consents/:consentId/revoke')
  @ApiOperation({ summary: 'Revoke a consent' })
  @ApiParam({ name: 'id', description: 'Patient ID (UUID)' })
  @ApiParam({ name: 'consentId', description: 'Consent record ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Consent revoked' })
  revokeConsent(
    @Param('id') id: string,
    @Param('consentId') consentId: string,
  ) {
    return this.patientsService.revokeConsent(id, consentId);
  }
}
