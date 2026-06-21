import { z } from 'zod';

export const egyptianPhoneRegex = /^0(10|11|12|15)\d{8}$/;

// Translation keys for validation errors
export const validationErrorKeys = {
  phoneRequired: 'auth.registration.errorPhoneRequired',
  phoneLength: 'auth.registration.errorPhoneLength',
  phonePrefix: 'auth.registration.errorPhonePrefix',
  passwordMinLength: 'auth.registration.errorPasswordMinLength',
  confirmPasswordRequired: 'auth.registration.errorConfirmPasswordRequired',
  passwordMatch: 'auth.registration.errorPasswordMatch',
  phoneVerification: 'auth.registration.errorPhoneVerification',
  passwordRequired: 'Password is required', // Keep this for login as fallback
} as const;

const phoneField = z
  .string()
  .min(1, validationErrorKeys.phoneRequired)
  .refine((val) => {
    const digits = val.replace(/\D/g, '');
    return digits.length === 11;
  }, validationErrorKeys.phoneLength)
  .refine((val) => {
    const digits = val.replace(/\D/g, '');
    const prefix = digits.slice(0, 3);
    return ['010', '011', '012', '015'].includes(prefix);
  }, validationErrorKeys.phonePrefix);

export const registrationSchema = z
  .object({
    phone: phoneField,
    password: z.string().min(4, validationErrorKeys.passwordMinLength),
    confirmPassword: z.string().min(1, validationErrorKeys.confirmPasswordRequired),
    phoneVerified: z.boolean().refine((val) => val === true, {
      message: validationErrorKeys.phoneVerification,
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: validationErrorKeys.passwordMatch,
    path: ['confirmPassword'],
  });

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export const loginSchema = z.object({
  phone: phoneField,
  password: z.string().min(1, validationErrorKeys.passwordRequired).min(4, validationErrorKeys.passwordMinLength),
});

export type LoginFormData = z.infer<typeof loginSchema>;
