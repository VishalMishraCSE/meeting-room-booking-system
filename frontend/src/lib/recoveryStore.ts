// In-memory Recovery Store for OTP verification with automatic expiration
interface RecoveryEntry {
  otp: string;
  expiresAt: number;
}

const globalForRecovery = globalThis as unknown as {
  recoveryStore: Map<string, RecoveryEntry> | undefined;
};

export const recoveryStore = globalForRecovery.recoveryStore ?? new Map<string, RecoveryEntry>();

if (process.env.NODE_ENV !== 'production') {
  globalForRecovery.recoveryStore = recoveryStore;
}

/**
 * Save a 6-digit OTP code for a given email (valid for 10 minutes)
 */
export function saveRecoveryOtp(email: string, otp: string): void {
  const normalized = email.trim().toLowerCase();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  recoveryStore.set(normalized, { otp, expiresAt });
}

/**
 * Verify if the submitted OTP is valid and unexpired
 */
export function verifyRecoveryOtp(email: string, otp: string): { valid: boolean; reason?: string } {
  const normalized = email.trim().toLowerCase();
  const entry = recoveryStore.get(normalized);

  if (!entry) {
    return { valid: false, reason: "No security code was requested for this email or it has expired." };
  }

  if (Date.now() > entry.expiresAt) {
    recoveryStore.delete(normalized);
    return { valid: false, reason: "Security code has expired. Please request a new code." };
  }

  if (entry.otp.trim() !== otp.trim()) {
    return { valid: false, reason: "Invalid security code. Please double-check the code sent to your email." };
  }

  return { valid: true };
}

/**
 * Clear the OTP after successful update
 */
export function clearRecoveryOtp(email: string): void {
  const normalized = email.trim().toLowerCase();
  recoveryStore.delete(normalized);
}
