import { z } from 'zod'

// ── Auth ─────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(1, 'Name is required').max(100).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

// ── Assessment ───────────────────────────────────────────────────────────────

export const progressStatusSchema = z.enum(['NOT_STARTED', 'WORKING_ON_IT', 'COMPLETED'])

export const progressUpdateSchema = z.object({
  checklistItemId: z.string().min(1),
  status: progressStatusSchema,
  confidenceScore: z.number().int().min(0).max(100),
})

export const batchProgressUpdateSchema = z.object({
  updates: z.array(progressUpdateSchema).min(1).max(200),
})

// ── Type exports ─────────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ProgressUpdate = z.infer<typeof progressUpdateSchema>
export type BatchProgressUpdate = z.infer<typeof batchProgressUpdateSchema>
