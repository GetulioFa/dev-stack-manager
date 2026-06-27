import { z } from 'zod';
import { LanguageType, Seniority } from '@/types';

// Auth

export const loginSchema = z.object({
  email:    z.string().min(1, 'E-mail obrigatório.').email('E-mail inválido.'),
  password: z.string().min(1, 'Senha obrigatória.'),
});

export const registerSchema = z.object({
  name:     z.string().min(1, 'Nome obrigatório.').max(150, 'Máximo 150 caracteres.'),
  email:    z.string().min(1, 'E-mail obrigatório.').email('E-mail inválido.').max(254),
  password: z
    .string()
    .min(8,  'Mínimo 8 caracteres.')
    .max(128,'Máximo 128 caracteres.')
    .regex(/[A-Z]/, 'Deve conter ao menos uma letra maiúscula.')
    .regex(/[a-z]/, 'Deve conter ao menos uma letra minúscula.')
    .regex(/[0-9]/, 'Deve conter ao menos um número.'),
});

export type LoginFormValues    = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

// Users

export const userUpdateSchema = z.object({
  name:  z.string().min(1, 'Nome obrigatório.').max(150, 'Máximo 150 caracteres.'),
  email: z.string().min(1, 'E-mail obrigatório.').email('E-mail inválido.').max(254),
});

export type UserUpdateFormValues = z.infer<typeof userUpdateSchema>;

// States

export const stateSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(100, 'Máximo 100 caracteres.'),
  uf:   z
    .string()
    .min(1, 'UF obrigatória.')
    .length(2, 'A UF deve ter exatamente 2 caracteres.')
    .regex(/^[a-zA-Z]+$/, 'A UF deve conter apenas letras.')
    .transform(v => v.toUpperCase()),
});

export type StateFormValues = z.infer<typeof stateSchema>;

// Cities

export const citySchema = z.object({
  name:    z.string().min(1, 'Nome obrigatório.').max(150, 'Máximo 150 caracteres.'),
  stateId: z.string().min(1, 'Estado obrigatório.').uuid('Estado inválido.'),
});

export type CityFormValues = z.infer<typeof citySchema>;

// Languages

export const languageSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(100, 'Máximo 100 caracteres.'),
  type: z.nativeEnum(LanguageType, { errorMap: () => ({ message: 'Tipo obrigatório.' }) }),
});

export type LanguageFormValues = z.infer<typeof languageSchema>;

// Developers

export const developerSchema = z.object({
  name:        z.string().min(1, 'Nome obrigatório.').max(150, 'Máximo 150 caracteres.'),
  email:       z.string().min(1, 'E-mail obrigatório.').email('E-mail inválido.').max(254),
  seniority:   z.nativeEnum(Seniority, { errorMap: () => ({ message: 'Senioridade obrigatória.' }) }),
  stateId:     z.string().min(1, 'Estado obrigatório.'),
  cityId:      z.string().min(1, 'Cidade obrigatória.').uuid('Cidade inválida.'),
  languageIds: z
    .array(z.string().uuid())
    .min(1, 'Selecione ao menos uma linguagem de programação.'),
});

export type DeveloperFormValues = z.infer<typeof developerSchema>;
