import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Returns system health status',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-01-24T15:45:30.000Z',
        uptime: 12345,
      },
    },
  })
  getHealth() {
    return this.healthService.getHealth();
  }
}
