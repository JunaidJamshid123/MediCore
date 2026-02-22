import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { randomUUID } from 'crypto';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionsService {
  private readonly SESSION_TTL = 86400000; // 24 hours in milliseconds
  private readonly MAX_CONCURRENT_SESSIONS = 3;

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async createSession(
    userId: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<string> {
    // Check concurrent session limit
    await this.enforceConcurrentSessionLimit(userId);

    const sessionToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + this.SESSION_TTL);

    // Store in PostgreSQL for audit
    const session = this.sessionRepository.create({
      user_id: userId,
      session_token: sessionToken,
      device_info: deviceInfo,
      ip_address: ipAddress,
      expires_at: expiresAt,
    });
    await this.sessionRepository.save(session);

    // Store in Redis for fast validation
    await this.cacheManager.set(
      `session:${sessionToken}`,
      { userId, sessionId: session.id },
      this.SESSION_TTL,
    );

    return sessionToken;
  }

  async validateSession(sessionToken: string): Promise<boolean> {
    // Check Redis first (fast)
    const cachedSession = await this.cacheManager.get(
      `session:${sessionToken}`,
    );

    if (!cachedSession) {
      // Check database as fallback
      const session = await this.sessionRepository.findOne({
        where: {
          session_token: sessionToken,
          is_active: true,
          expires_at: MoreThan(new Date()),
        },
      });

      if (!session) {
        return false;
      }

      // Re-cache it
      await this.cacheManager.set(
        `session:${sessionToken}`,
        { userId: session.user_id, sessionId: session.id },
        this.SESSION_TTL,
      );
    }

    // Update last activity
    await this.sessionRepository.update(
      { session_token: sessionToken },
      { last_activity_at: new Date() },
    );

    return true;
  }

  async getSessionData(sessionToken: string): Promise<any> {
    return await this.cacheManager.get(`session:${sessionToken}`);
  }

  async getUserActiveSessions(userId: string): Promise<Session[]> {
    return await this.sessionRepository.find({
      where: { user_id: userId, is_active: true },
      order: { last_activity_at: 'DESC' },
    });
  }

  async invalidateSession(sessionToken: string): Promise<void> {
    // Remove from Redis
    await this.cacheManager.del(`session:${sessionToken}`);

    // Mark as inactive in DB
    await this.sessionRepository.update(
      { session_token: sessionToken },
      { is_active: false },
    );
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    const sessions = await this.sessionRepository.find({
      where: { user_id: userId, is_active: true },
    });

    // Remove all from Redis
    await Promise.all(
      sessions.map((s) => this.cacheManager.del(`session:${s.session_token}`)),
    );

    // Mark all as inactive
    await this.sessionRepository.update(
      { user_id: userId, is_active: true },
      { is_active: false },
    );
  }

  async invalidateSessionById(sessionId: string, userId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, user_id: userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.invalidateSession(session.session_token);
  }

  async enforceConcurrentSessionLimit(userId: string): Promise<void> {
    const sessions = await this.getUserActiveSessions(userId);

    if (sessions.length >= this.MAX_CONCURRENT_SESSIONS) {
      // Invalidate oldest session
      const oldestSession = sessions[sessions.length - 1];
      await this.invalidateSession(oldestSession.session_token);
    }
  }

  async cleanupExpiredSessions(): Promise<number> {
    const expiredSessions = await this.sessionRepository.find({
      where: {
        expires_at: LessThan(new Date()),
        is_active: true,
      },
    });

    // Remove from Redis and mark inactive
    await Promise.all(
      expiredSessions.map((s) => this.invalidateSession(s.session_token)),
    );

    return expiredSessions.length;
  }

  async getSessionStats(userId: string): Promise<{
    activeSessions: number;
    maxAllowed: number;
  }> {
    const activeSessions = await this.getUserActiveSessions(userId);

    return {
      activeSessions: activeSessions.length,
      maxAllowed: this.MAX_CONCURRENT_SESSIONS,
    };
  }
}
