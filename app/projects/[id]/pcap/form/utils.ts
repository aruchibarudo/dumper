import * as z from 'zod'
import { UploadFileUrlParams } from '@/app/projects/[id]/pcap/form/types'

export const POLLING_INTERVAL_MS = 2000
export const POLLING_TIMEOUT_MS = 30000

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
  timestamp: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val ?? ''),
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
  timestamp: '',
  file: undefined,
}

export const createUploadRequestUrl = ({
  data: { filename, path, author, hostname, description, timestamp },
  projectId,
}: UploadFileUrlParams) => {
  const params = new URLSearchParams({
    filename,
    path,
    author,
    hostname,
    description,
    ...(timestamp && { timestamp }),
  })

  return `/project/${projectId}/uploadlink?${params}`
}

const pad = (n: number, length = 2) => String(n).padStart(length, '0')
export const formatTimestamp = (value: Date) => {
  /*
   * YYYY-MM-DDThh:mm:ss.sss (ISO 8601 без часового пояса)
   * */

  // убедиться, что сервер хранит дату в UTC
  // return value.toISOString()

  const get = {
    year: value.getFullYear(),
    month: value.getMonth() + 1,
    day: value.getDate(),
    hours: value.getHours(),
    minutes: value.getMinutes(),
    seconds: value.getSeconds(),
    ms: value.getMilliseconds(),
  }

  return (
    `${get.year}-${pad(get.month)}-${pad(get.day)}T` +
    `${pad(get.hours)}:${pad(get.minutes)}:${pad(get.seconds)}.` +
    `${pad(get.ms, 3)}`
  )
}
