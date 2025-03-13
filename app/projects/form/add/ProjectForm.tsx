import { Button } from '@consta/uikit/Button'
import { TextField } from '@consta/uikit/TextField'
import { Text } from '@consta/uikit/Text'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProjectFormData } from '@/app/projects/form/add/types'
import { projectSchema } from '@/app/projects/form/add/utils'
import { ApiService } from '@/app/utils/api'

interface ProjectFormProps {
  onClose: () => void
  onSuccess: () => void // Для обновления списка после добавления
}

export const ProjectForm = ({ onClose, onSuccess }: ProjectFormProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      number: '',
      name: '',
      description: '',
    },
  })

  const onSubmit = async (data: ProjectFormData) => {
    try {
      await ApiService.post('/project', data)
      reset()
      onSuccess()
      onClose()
    } catch (error) {
      alert('Не удалось добавить проект') // @todo: заменить на toast
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Text size="xl" weight="bold" as="h2">
        Добавить проект
      </Text>
      <Controller
        name="number"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="ID проекта"
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
            label="Краткое имя"
            placeholder="Введите имя"
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
            label="Описание проекта"
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
          label="Сохранить"
          loading={isSubmitting}
          disabled={isSubmitting}
        />
        <Button label="Отмена" view="secondary" onClick={onClose} />
      </div>
    </form>
  )
}
