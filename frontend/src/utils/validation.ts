/**
 * Validate the email address
 * @param value - The email address to validate
 * @returns The error message if the email address is invalid, otherwise null
 */
export function validateEmail(value: string): string | null {
  if (!value) return 'Email is required.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return 'Invalid email address.';
  return null;
}

/**
 * Validate the password
 * @param value - The password to validate
 * @returns The error message if the password is invalid, otherwise null
 */
export function validatePassword(value: string): string | null {
  if (!value) return 'Password is required.';
  if (value.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

/**
 * Validate the name
 * @param value - The name to validate
 * @returns The error message if the name is invalid, otherwise null
 */
export function validateName(value: string): string | null {
  if (!value) return 'Name is required.';
  return null;
} 