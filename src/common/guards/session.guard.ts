import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionsService } from '../../modules/sessions/sessions.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private sessionsService: SessionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionToken = request.headers['x-session-token'];

    if (!sessionToken) {
      throw new UnauthorizedException('No session token provided');
    }

    const isValid = await this.sessionsService.validateSession(sessionToken);

    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Attach session data to request
    const sessionData = await this.sessionsService.getSessionData(sessionToken);
    request.session = sessionData;

    return true;
  }
}
