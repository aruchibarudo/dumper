'use client'

import React from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Text } from '@consta/uikit/Text'
import { Card } from '@consta/uikit/Card'
import { Badge } from '@consta/uikit/Badge'
import { Button } from '@consta/uikit/Button'
import { Loader } from '@consta/uikit/Loader'
import { IconTrash } from '@consta/icons/IconTrash'
import { Informer } from '@consta/uikit/Informer'

import { useModal } from '@/components/ui/modal/hooks'
import { useSnackbar } from '@/components/ui/snackbar/hooks'
import ContentWrapper from '@/components/content/ContentWrapper'
import { Project } from '@/app/projects/[id]/types'
import { ApiService } from '@/app/utils/api'

export default function Home() {
  const queryClient = useQueryClient()
  const { setModal, closeModal } = useModal()
  const { addSnackbar } = useSnackbar()

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => ApiService.get<Project[]>('/projects'),
  })

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) =>
      ApiService.delete(`/project/${projectId}`),
    onSuccess: async () => {
      addSnackbar({ message: 'Проект успешно удален', status: 'success' })
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (error) => {
      console.error('Ошибка при удалении проекта:', error)
      addSnackbar({ message: 'Не удалось удалить проект', status: 'alert' })
    },
  })

  if (isLoading) {
    return (
      <ContentWrapper>
        <Loader />
      </ContentWrapper>
    )
  }

  if (!projects?.length) {
    return (
      <ContentWrapper>
        <Informer
          status="system"
          view="filled"
          label="Проектов не найдено. Создайте новый"
        />
      </ContentWrapper>
    )
  }

  return (
    <main className="h-[calc(100vh-5rem)] p-4">
      <div className="container mx-auto">
        <div className="flex flex-col gap-6">
          <Text size="2xl" weight="bold">
            Проекты
          </Text>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <Link href={`/projects/${project.id}`} key={project.id}>
                <Card
                  shadow
                  border
                  className="p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <Text
                        size="l"
                        weight="semibold"
                        truncate
                        className="hover:underline"
                      >
                        {project.name}
                      </Text>
                      <Badge
                        label={`#${project.number}`}
                        size="s"
                        status="system"
                        view="stroked"
                      />
                    </div>
                    <Text size="m" view="secondary" lineHeight="m">
                      {project.description || 'Описание отсутствует'}
                    </Text>
                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        label="Удалить"
                        iconLeft={IconTrash}
                        size="s"
                        view="secondary"
                        onClick={(e) => {
                          e.preventDefault()
                          setModal({
                            title: 'Удалить проект',
                            content: (
                              <div className="flex flex-col gap-4">
                                <Text>
                                  Вы уверены, что хотите удалить &#34;
                                  {project.name}
                                  &#34;?
                                </Text>
                                <div className="flex gap-2">
                                  <Button
                                    label="Удалить"
                                    view="primary"
                                    onClick={() => {
                                      deleteProjectMutation.mutate(project.id)
                                      closeModal()
                                    }}
                                    loading={
                                      deleteProjectMutation.isPending &&
                                      deleteProjectMutation.variables ===
                                        project.id
                                    }
                                  />
                                  <Button
                                    label="Отмена"
                                    view="secondary"
                                    onClick={() => closeModal()}
                                  />
                                </div>
                              </div>
                            ),
                            modalProps: { className: 'max-w-md' },
                          })
                        }}
                        loading={
                          deleteProjectMutation.isPending &&
                          deleteProjectMutation.variables === project.id
                        }
                        disabled={deleteProjectMutation.isPending}
                      />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
