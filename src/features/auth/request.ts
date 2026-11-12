export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  name: string;
};

export function loginRequestBody(input: LoginInput): LoginInput {
  return {
    email: input.email.trim(),
    password: input.password,
  };
}

export function registerRequestBody(input: RegisterInput): RegisterInput {
  return {
    name: input.name.trim(),
    email: input.email.trim(),
    password: input.password,
  };
}
