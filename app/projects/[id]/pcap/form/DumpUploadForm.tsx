import { useState } from 'react'
import { Button } from '@consta/uikit/Button'
import { TextField } from '@consta/uikit/TextField'
import { FileField } from '@consta/uikit/FileField'
import { Text } from '@consta/uikit/Text'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ApiService } from '@/app/utils/api'

const dumpUploadSchema = z.object({
  filename: z.string().min(1, 'Имя файла обязательно'),
  path: z.string().min(1, 'Путь обязателен'),
  author: z.string().min(1, 'Автор обязателен'),
  hostname: z.string().min(1, 'Имя хоста обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  file: z
    .instanceof(File)
    .refine(
      (file) => file.name.endsWith('.pcap'),
      'Файл должен быть в формате .pcap',
    ),
})

type DumpUploadFormData = z.infer<typeof dumpUploadSchema>

interface DumpUploadFormProps {
  projectId: string
  onClose: () => void
  onSuccess: () => void
}

export const DumpUploadForm = ({
  projectId,
  onClose,
  onSuccess,
}: DumpUploadFormProps) => {
  const [isUploading, setIsUploading] = useState(false)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DumpUploadFormData>({
    resolver: zodResolver(dumpUploadSchema),
    defaultValues: {
      filename: '',
      path: 'uploads',
      author: 'user',
      hostname: '',
      description: '',
      file: undefined,
    },
  })

  const onSubmit = async (data: DumpUploadFormData) => {
    setIsUploading(true)
    try {
      const uploadUrl = await ApiService.get<string>(
        `/project/${projectId}/uploadlink?filename=${encodeURIComponent(data.filename)}&path=${encodeURIComponent(data.path)}&author=${encodeURIComponent(data.author)}`,
      )

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: data.file,
      })

      if (!response.ok) {
        throw new Error(`Ошибка загрузки файла: ${response.statusText}`)
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Ошибка при загрузке дампа:', error)
      alert('Не удалось загрузить дамп') // @todo: заменить на toast
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 min-w-96"
      // style={{ width: 512 }}
    >
      <Text size="xl" weight="bold" as="h2" className="">
        Загрузить дамп
      </Text>
      <Controller
        name="file"
        control={control}
        render={({ field }) => (
          <FileField
            id="file-upload"
            onChange={(e) => {
              const file = e.target.files?.[0]
              console.log('file', file)
              if (file) {
                setValue('file', file, { shouldValidate: true })
                setValue('filename', file.name, { shouldValidate: true }) // Автоматически заполняем имя файла
              }
            }}
            accept=".pcap"
            status={errors.file ? 'alert' : undefined}
            caption={errors.file?.message}
          >
            {(props) => <Button {...props} label="Выбрать файл .pcap" />}
          </FileField>
        )}
      />
      <Controller
        name="filename"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Имя файла"
            placeholder="например, dump.pcap"
            status={errors.filename ? 'alert' : undefined}
            caption={errors.filename?.message}
          />
        )}
      />
      <Controller
        name="path"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Путь в бакете"
            placeholder="например, uploads"
            status={errors.path ? 'alert' : undefined}
            caption={errors.path?.message}
          />
        )}
      />
      <Controller
        name="author"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Автор"
            placeholder="Введите автора"
            status={errors.author ? 'alert' : undefined}
            caption={errors.author?.message}
          />
        )}
      />
      <Controller
        name="hostname"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Имя хоста"
            placeholder="Введите имя хоста"
            status={errors.hostname ? 'alert' : undefined}
            caption={errors.hostname?.message}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Описание"
            placeholder="Введите описание"
            type="textarea"
            status={errors.description ? 'alert' : undefined}
            caption={errors.description?.message}
          />
        )}
      />

      <div className="flex gap-4">
        <Button
          type="submit"
          label="Загрузить"
          loading={isUploading}
          disabled={isUploading}
        />
        <Button label="Отмена" view="secondary" onClick={onClose} />
      </div>
    </form>
  )
}
