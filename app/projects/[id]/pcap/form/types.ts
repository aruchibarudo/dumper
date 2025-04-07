import * as z from 'zod'
import { Project } from '@/app/projects/[id]/types'
import { SnackbarAddProps } from '@/components/ui/snackbar/types'
import { dumpUploadSchema } from '@/app/projects/[id]/pcap/form/utils'

export type DumpUploadFormProps = {
  projectId: string
  onClose: () => void
  onSuccess: (project: Project) => void
  onError: ({ message, status }: SnackbarAddProps) => void
}

export type DumpUploadFormData = z.infer<typeof dumpUploadSchema>

export type UploadFileUrlParams = Pick<DumpUploadFormProps, 'projectId'> & {
  data: DumpUploadFormData
}
