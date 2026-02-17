import * as crypto from 'crypto';

/**
 * Field-level encryption utility for HIPAA-sensitive data (SSN, etc.)
 * Uses AES-256-GCM authenticated encryption.
 */
export class EncryptionUtil {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16;
  private static readonly ENCODING: BufferEncoding = 'hex';

  /**
   * Get the encryption key from environment or generate a deterministic one.
   * In production, ENCRYPTION_KEY must be set via environment variable.
   */
  private static getKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error(
        'ENCRYPTION_KEY environment variable is required for field-level encryption',
      );
    }
    // Ensure key is 32 bytes (256 bits)
    return crypto.scryptSync(key, 'medicore-salt', 32);
  }

  /**
   * Encrypt a plaintext string.
   * Returns a hex-encoded string: iv + authTag + ciphertext
   */
  static encrypt(plaintext: string): string {
    if (!plaintext) return plaintext;

    const key = this.getKey();
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', this.ENCODING);
    encrypted += cipher.final(this.ENCODING);

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:ciphertext
    return [
      iv.toString(this.ENCODING),
      authTag.toString(this.ENCODING),
      encrypted,
    ].join(':');
  }

  /**
   * Decrypt an encrypted string back to plaintext.
   */
  static decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText;

    const key = this.getKey();
    const parts = encryptedText.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], this.ENCODING);
    const authTag = Buffer.from(parts[1], this.ENCODING);
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, this.ENCODING, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Extract last N characters from a string (for display purposes).
   * E.g., "123-45-6789" â†’ "6789"
   */
  static maskExceptLast(value: string, visibleChars = 4): string {
    if (!value) return value;
    const cleaned = value.replace(/[^0-9]/g, '');
    return cleaned.slice(-visibleChars);
  }
}
