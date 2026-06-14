import { z } from 'zod'

export const extractedJDSchema = z.object({
  platform: z.string().nullable(),
  company: z.string(),
  position: z.string(),
  location: z.string().nullable(),
  salary_range: z.string().nullable(),
  experience_level: z.enum(['junior', 'mid', 'senior', 'lead']).nullable(),
  required_skills: z.array(z.string()),
  summary: z.string().nullable(),
})

export const applicationSchema = z.object({
  url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  platform: z.string().optional(),
  position: z.string().min(1, 'Position is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().optional(),
  salary_range: z.string().optional(),
  experience_level: z.enum(['junior', 'mid', 'senior', 'lead']).optional(),
  required_skills: z.array(z.string()).default([]),
  summary: z.string().optional(),
  status: z.enum(['applied', 'response', 'interview', 'tech_test', 'offer', 'rejected', 'ghosted']).default('applied'),
  notes: z.string().optional(),
  applied_date: z.string().min(1, 'Applied date is required'),
  interview_date: z.string().optional(),
})

export type ExtractedJD = z.infer<typeof extractedJDSchema>
export type ApplicationFormData = z.infer<typeof applicationSchema>