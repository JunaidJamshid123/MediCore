import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active sessions for current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all active sessions',
  })
  async getUserSessions(@Request() req: any) {
    return await this.sessionsService.getUserActiveSessions(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get session statistics for current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns session statistics',
  })
  async getSessionStats(@Request() req: any) {
    return await this.sessionsService.getSessionStats(req.user.id);
  }

  @Delete(':sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Terminate a specific session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID (UUID)' })
  @ApiResponse({ status: 204, description: 'Session terminated successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async terminateSession(
    @Param('sessionId') sessionId: string,
    @Request() req: any,
  ) {
    await this.sessionsService.invalidateSessionById(sessionId, req.user.id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Terminate all sessions except current' })
  @ApiResponse({
    status: 204,
    description: 'All other sessions terminated',
  })
  async terminateAllSessions(@Request() req: any) {
    await this.sessionsService.invalidateAllUserSessions(req.user.id);
  }
}
