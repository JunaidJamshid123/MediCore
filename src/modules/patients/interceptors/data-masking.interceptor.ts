import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor that masks sensitive patient data for unauthorized users.
 * - Admins and Doctors: full data access
 * - Nurses: SSN masked, partial sensitive fields
 * - Receptionists/Others: SSN fully hidden, limited medical data
 */
@Injectable()
export class DataMaskingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.role;

    return next.handle().pipe(
      map((data) => {
        if (!data) return data;

        // Admins and Doctors get full access
        if (userRole === 'admin' || userRole === 'doctor') {
          return this.removeSsnEncrypted(data);
        }

        // Nurses get partial masking
        if (userRole === 'nurse') {
          return this.applyNurseMasking(data);
        }

        // Receptionists and others get heavy masking
        return this.applyFullMasking(data);
      }),
    );
  }

  /**
   * Always remove the raw encrypted SSN field â€” only show ssn_last_four
   */
  private removeSsnEncrypted(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.removeSsnEncrypted(item));
    }

    // Handle paginated responses
    if (data && data.data && Array.isArray(data.data)) {
      return {
        ...data,
        data: data.data.map((item: any) => this.removeSsnEncrypted(item)),
      };
    }

    if (data && typeof data === 'object') {
      const { ssn_encrypted, ...rest } = data;
      return rest;
    }

    return data;
  }

  /**
   * Nurses: SSN shown as last 4 only, medical data visible
   */
  private applyNurseMasking(data: any): any {
    const cleaned = this.removeSsnEncrypted(data);
    return this.maskSsnField(cleaned);
  }

  /**
   * Full masking for receptionists/others:
   * - SSN completely hidden
   * - Medical details reduced
   */
  private applyFullMasking(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.applyFullMasking(item));
    }

    // Handle paginated responses
    if (data && data.data && Array.isArray(data.data)) {
      return {
        ...data,
        data: data.data.map((item: any) => this.applyFullMasking(item)),
      };
    }

    if (data && typeof data === 'object') {
      const {
        ssn_encrypted,
        ssn_last_four,
        allergies,
        chronic_conditions,
        current_medications,
        ...rest
      } = data;

      return {
        ...rest,
        ssn_last_four: ssn_last_four ? '****' : null,
        medical_data_restricted: true,
      };
    }

    return data;
  }

  /**
   * Mask SSN to show only last 4: "***-**-6789"
   */
  private maskSsnField(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.maskSsnField(item));
    }

    if (data && data.data && Array.isArray(data.data)) {
      return {
        ...data,
        data: data.data.map((item: any) => this.maskSsnField(item)),
      };
    }

    if (data && typeof data === 'object' && data.ssn_last_four) {
      return {
        ...data,
        ssn_last_four: `***-**-${data.ssn_last_four}`,
      };
    }

    return data;
  }
}
