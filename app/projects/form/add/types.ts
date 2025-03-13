import { z } from 'zod'
import { projectSchema } from '@/app/projects/form/add/utils'

export type ProjectFormData = z.infer<typeof projectSchema>
