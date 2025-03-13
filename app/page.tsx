'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@consta/uikit/Button'
import { Modal } from '@consta/uikit/Modal'
import { Text } from '@consta/uikit/Text'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Project } from '@/app/projects/[id]/types'
import { ApiService } from '@/app/utils/api'
import { ProjectForm } from '@/app/projects/form/add/ProjectForm'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => ApiService.get<Project[]>('/projects'),
  })

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      ApiService.post('/project', data),
    onSuccess: () => {
      mutation.client.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const handleProjectAdded = () => {
    mutation.mutate({})
    setIsModalOpen(false)
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Text size="2xl" weight="bold" as="h1">
          Projects
        </Text>
        {isLoading ? (
          <Text>Загрузка...</Text>
        ) : (
          <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
            {projects?.map((project) => (
              <li key={project.id} className="mb-2">
                <Link href={`/projects/${project.id}`}>{project.name}</Link>
              </li>
            ))}
          </ol>
        )}
        <Button label="Добавить проект" onClick={() => setIsModalOpen(true)} />

        <Modal
          isOpen={isModalOpen}
          onClickOutside={() => setIsModalOpen(false)}
          onClose={() => setIsModalOpen(false)}
          className="p-4"
        >
          <ProjectForm
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleProjectAdded}
          />
        </Modal>
      </main>
    </div>
  )
}
