export const NAME_MAX_LENGTH = 120;
export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthField = 'name' | 'email' | 'password';
export type FieldErrors = Partial<Record<AuthField, string>>;

export type LoginValues = {
  email: string;
  password: string;
};

export type RegisterValues = LoginValues & {
  name: string;
};

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some((message) => typeof message === 'string' && message.length > 0);
}

export function validateLogin(values: LoginValues): FieldErrors {
  return omitEmpty({
    email: validateEmail(values.email),
    password: validatePassword(values.password),
  });
}

export function validateRegistration(values: RegisterValues): FieldErrors {
  return omitEmpty({
    name: validateName(values.name),
    email: validateEmail(values.email),
    password: validatePassword(values.password),
  });
}

function omitEmpty(errors: FieldErrors): FieldErrors {
  const result: FieldErrors = {};

  for (const [field, message] of Object.entries(errors) as [AuthField, string | undefined][]) {
    if (message) {
      result[field] = message;
    }
  }

  return result;
}

function validateName(name: string): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Name is required.';
  }

  if (trimmed.length > NAME_MAX_LENGTH) {
    return `Name must be ${NAME_MAX_LENGTH} characters or fewer.`;
  }

  return undefined;
}

function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email is required.';
  }

  if (trimmed.length > EMAIL_MAX_LENGTH) {
    return `Email must be ${EMAIL_MAX_LENGTH} characters or fewer.`;
  }

  if (!EMAIL_PATTERN.test(trimmed)) {
    return 'Enter a valid email address.';
  }

  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (password.trim().length === 0) {
    return 'Password is required.';
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`;
  }

  return undefined;
}
