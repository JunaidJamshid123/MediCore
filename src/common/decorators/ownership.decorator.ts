import { SetMetadata } from '@nestjs/common';
import { OwnershipConfig } from '../guards/resource-ownership.guard';

export const OWNERSHIP_KEY = 'ownership';

/**
 * Decorator to check resource ownership
 * @param config - Configuration for ownership checking
 * @example @CheckOwnership({ service: PatientsService, method: 'canUserAccessPatient', paramName: 'patientId' })
 */
export const CheckOwnership = (config: OwnershipConfig) =>
  SetMetadata(OWNERSHIP_KEY, config);
