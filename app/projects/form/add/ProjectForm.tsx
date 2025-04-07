import { Button } from '@consta/uikit/Button'
import { TextField } from '@consta/uikit/TextField'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ProjectFormData,
  ProjectFormProps,
} from '@/app/projects/form/add/types'
import { projectSchema } from '@/app/projects/form/add/utils'
import { ApiService } from '@/app/utils/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const ProjectForm = ({
  onClose,
  onSuccess,
  onError,
}: ProjectFormProps) => {
  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      number: '',
      name: '',
      description: '',
    },
  })

  const addProjectMutation = useMutation({
    mutationFn: (data: ProjectFormData) => ApiService.post('/project', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      reset()
      onSuccess({
        message: 'Проект успешно добавлен',
        status: 'success',
      })
      onClose()
    },
    onError: (error) => {
      onError({ message: 'Ошибка при добавлении проекта', status: 'alert' })
      console.error('Ошибка при добавлении проекта:', error)
    },
  })

  const onSubmit = (data: ProjectFormData) => {
    addProjectMutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Controller
        name="number"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="ID"
            placeholder="Введите ID"
            status={errors.number ? 'alert' : undefined}
            caption={errors.number?.message}
          />
        )}
      />

      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Название"
            placeholder="Введите название"
            status={errors.name ? 'alert' : undefined}
            caption={errors.name?.message}
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
          label="Создать"
          loading={addProjectMutation.isPending}
          disabled={addProjectMutation.isPending}
        />
        <Button label="Отмена" view="secondary" onClick={onClose} />
      </div>
    </form>
  )
}
