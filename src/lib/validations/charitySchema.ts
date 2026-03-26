import { z } from 'zod'

export const charitySchema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters'),
  slug:        z.string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  image_url:   z.string().url('Must be a valid URL').optional().or(z.literal('')),
  website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  is_featured: z.boolean().optional().default(false),
  is_active:   z.boolean().optional().default(true),
})

export const charityUpdateSchema = charitySchema.partial()

export type CharityInput       = z.infer<typeof charitySchema>
export type CharityUpdateInput = z.infer<typeof charityUpdateSchema>