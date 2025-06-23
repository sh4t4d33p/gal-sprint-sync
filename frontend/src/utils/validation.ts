export function validateEmail(value: string): string | null {
  if (!value) return 'Email is required.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return 'Invalid email address.';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Password is required.';
  if (value.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

export function validateName(value: string): string | null {
  if (!value) return 'Name is required.';
  return null;
} 