import { z } from 'zod';

export const egyptianPhoneRegex = /^0(10|11|12|15)\d{8}$/;

const phoneField = z
  .string()
  .min(1, 'Phone number is required')
  .refine((val) => {
    const digits = val.replace(/\D/g, '');
    return digits.length === 11;
  }, 'Phone number must be 11 digits')
  .refine((val) => {
    const digits = val.replace(/\D/g, '');
    const prefix = digits.slice(0, 3);
    return ['010', '011', '012', '015'].includes(prefix);
  }, 'Phone number must start with 010, 011, 012, or 015');

export const registrationSchema = z
  .object({
    phone: phoneField,
    password: z.string().min(4, 'Password must be at least 4 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    phoneVerified: z.boolean().refine((val) => val === true, {
      message: 'Please verify your phone number before creating an account',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export const loginSchema = z.object({
  phone: phoneField,
  password: z.string().min(1, 'Password is required').min(4, 'Password must be at least 4 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
