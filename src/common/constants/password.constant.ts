/**
 * Shared password validation constants for consistent enforcement across DTOs.
 */
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export const PASSWORD_MESSAGE =
  'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character';
