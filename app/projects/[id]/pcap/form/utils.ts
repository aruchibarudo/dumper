import * as z from 'zod'
import { UploadFileUrlParams } from '@/app/projects/[id]/pcap/form/types'

export const dumpUploadSchema = z.object({
  filename: z
    .string()
    .nullable()
    .transform((val) => val ?? '')
    .refine((val) => val.length > 0, 'Имя файла обязательно'),
  path: z
    .string()
    .nullable()
    .transform((val) => val ?? '')
    .refine((val) => val.length > 0, 'Путь обязателен'),
  author: z
    .string()
    .nullable()
    .transform((val) => val ?? '')
    .refine((val) => val.length > 0, 'Автор обязателен'),
  hostname: z
    .string()
    .nullable()
    .transform((val) => val ?? '')
    .refine((val) => val.length > 0, 'Имя хоста обязательно'),
  description: z
    .string()
    .nullable()
    .transform((val) => val ?? '')
    .refine((val) => val.length > 0, 'Описание обязательно'),
  file: z
    .instanceof(File)
    .refine(
      (file) => file.name.endsWith('.pcap'),
      'Файл должен быть в формате .pcap',
    ),
})

export const dumpUploadDefaultValues = {
  filename: '',
  path: 'uploads',
  author: 'me',
  hostname: '',
  description: '',
  file: undefined,
}

export const createUploadRequestUrl = ({
  data: { filename, path, author, hostname, description },
  projectId,
}: UploadFileUrlParams) => {
  const params = new URLSearchParams({
    filename,
    path,
    author,
    hostname,
    description,
  })

  return `/project/${projectId}/uploadlink?${params}`
}
