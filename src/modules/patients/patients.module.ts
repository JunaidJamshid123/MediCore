import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { Patient } from './entities/patient.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { InsuranceInfo } from './entities/insurance-info.entity';
import { PatientRelationship } from './entities/patient-relationship.entity';
import { PatientConsent } from './entities/patient-consent.entity';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      EmergencyContact,
      InsuranceInfo,
      PatientRelationship,
      PatientConsent,
    ]),
    RolesModule,
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
