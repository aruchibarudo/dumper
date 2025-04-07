import { z } from 'zod'
import { projectSchema } from '@/app/projects/form/add/utils'
import { SnackbarAddProps } from '@/components/ui/snackbar/types'

export type ProjectFormData = z.infer<typeof projectSchema>

export type ProjectFormProps = {
  onClose: () => void
  onSuccess: ({ message, status }: SnackbarAddProps) => void
  onError: ({ message, status }: SnackbarAddProps) => void
}
