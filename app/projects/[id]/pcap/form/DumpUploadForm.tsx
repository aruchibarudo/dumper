import { ChangeEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@consta/uikit/Button'
import { Text } from '@consta/uikit/Text'
import { FileFieldProps } from '@consta/uikit/__internal__/src/components/FileField/FileField'
import { IconDocFilled } from '@consta/icons/IconDocFilled'
import { TextField } from '@consta/uikit/TextField'
import { FileField } from '@consta/uikit/FileField'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiService } from '@/app/utils/api'
import { Project } from '@/app/projects/[id]/types'
import {
  DumpUploadFormData,
  DumpUploadFormProps,
} from '@/app/projects/[id]/pcap/form/types'
import {
  dumpUploadSchema,
  createUploadRequestUrl,
  dumpUploadDefaultValues,
  POLLING_TIMEOUT_MS,
  POLLING_INTERVAL_MS,
} from '@/app/projects/[id]/pcap/form/utils'

export const DumpUploadForm = ({
  projectId,
  onClose,
  onSuccess,
  onError,
}: DumpUploadFormProps) => {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<DumpUploadFormData>({
    resolver: zodResolver(dumpUploadSchema),
    defaultValues: dumpUploadDefaultValues,
  })

  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: DumpUploadFormData) => {
      const uploadUrl = await ApiService.get<string>(
        createUploadRequestUrl({ data, projectId }),
      )

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: data.file,
      })

      if (!uploadResponse.ok) {
        throw new Error(`Ошибка загрузки файла: ${uploadResponse.statusText}`)
      }

      const initialProject = queryClient.getQueryData<Project>([
        'project',
        projectId,
        'summary',
      ])
      const initialPcapCount = initialProject?.pcaps.length ?? 0

      // поллинг для проверки появления нового PCAP
      const pollForNewPcap = (): Promise<Project> =>
        new Promise((resolve, reject) => {
          const interval = setInterval(async () => {
            try {
              const project = await ApiService.get<Project>(
                `/project/${projectId}/summary`,
              )
              if (project.pcaps.length > initialPcapCount) {
                clearInterval(interval)
                resolve(project)
              }
            } catch (error) {
              clearInterval(interval)
              reject(error)
            }
          }, POLLING_INTERVAL_MS)

          // максимальное время ожидания
          setTimeout(() => {
            clearInterval(interval)
            reject(new Error('Таймаут ожидания обработки файла'))
          }, POLLING_TIMEOUT_MS)
        })

      return await pollForNewPcap()
    },
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(
        ['project', projectId, 'summary'],
        updatedProject,
      )
      onSuccess(updatedProject)
      onClose()
    },
    onError: (error) => {
      console.error('Ошибка при загрузке дампа:', error)
      onError({ message: 'Не удалось загрузить дамп', status: 'alert' })
    },
  })

  const onSubmit = (data: DumpUploadFormData) => {
    mutate(data)
  }

  const selectedFile = watch('file')

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 min-w-96"
    >
      <div className="flex items-center gap-2">
        <>
          <Controller
            name="file"
            control={control}
            render={() => (
              <FileField
                id="file-upload"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setValue('file', file, { shouldValidate: true })
                    setValue('filename', file.name, { shouldValidate: true })
                  }
                }}
                accept=".pcap"
              >
                {(props: FileFieldProps) => (
                  <Button
                    {...props}
                    label="Выбрать файл .pcap"
                    size="s"
                    disabled={isPending}
                    iconRight={selectedFile ? IconDocFilled : undefined}
                  />
                )}
              </FileField>
            )}
          />

          {isSubmitted && errors.file && (
            <Text view="alert" size="s">
              Пожалуйста, выберите файл
            </Text>
          )}
        </>
      </div>

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
            disabled={isPending}
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
            disabled={isPending}
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
            disabled={isPending}
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
            disabled={isPending}
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
            disabled={isPending}
          />
        )}
      />
      <div className="flex items-center gap-4">
        <Button
          type="submit"
          label="Загрузить"
          loading={isPending}
          disabled={isPending}
        />

        <Button
          label="Отмена"
          view="secondary"
          onClick={() => {
            if (!isPending) {
              onClose()
            }
          }}
          disabled={isPending}
        />
      </div>
    </form>
  )
}
