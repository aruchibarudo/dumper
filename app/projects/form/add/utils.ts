import { z } from 'zod'

export const projectSchema = z.object({
  number: z.string().min(1, 'ID проекта обязателен'),
  name: z.string().min(1, 'Краткое имя обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
})
