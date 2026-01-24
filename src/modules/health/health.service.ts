import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'ok',
      message: 'MediCore Healthcare Backend is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'MediCore',
    };
  }
}
