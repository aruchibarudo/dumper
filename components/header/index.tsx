import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { Text } from '@consta/uikit/Text'
import { IconAdd } from '@consta/icons/IconAdd'
import { IconInfo } from '@consta/icons/IconInfo'
import { Button } from '@consta/uikit/Button'

import { useProject } from '@/app/context/project/ProjectContext'
import { useModal } from '@/components/ui/modal/hooks'
import { DumpUploadForm } from '@/app/projects/[id]/pcap/form/DumpUploadForm'
import { ProjectForm } from '@/app/projects/form/add/ProjectForm'
import { useSnackbar } from '@/components/ui/snackbar/hooks'

const Header = () => {
  const pathname = usePathname()
  const { project, setProject } = useProject()
  const { setModal, closeModal } = useModal()
  const { addSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const isHomePage = pathname === '/'
  const isProjectPage = pathname.startsWith('/projects/')

  const handleOpenUploadModal = () => {
    if (!project) return

    setModal({
      title: 'Загрузить дамп',
      content: (
        <DumpUploadForm
          projectId={project.id}
          onSuccess={(updatedProject) => {
            queryClient.setQueryData(
              ['project', project.id, 'summary'],
              updatedProject,
            )
            setProject(updatedProject)
            addSnackbar({ message: 'Дамп успешно добавлен', status: 'success' })
          }}
          onError={addSnackbar}
          onClose={closeModal}
        />
      ),
    })
  }

  const openAddProjectModal = () => {
    setModal({
      title: 'Добавить проект',
      content: (
        <ProjectForm
          onSuccess={({ message, status }) => addSnackbar({ message, status })}
          onError={addSnackbar}
          onClose={closeModal}
        />
      ),
      modalProps: { className: 'p-4 max-w-md' },
    })
  }

  const openProjectInfoModal = () => {
    if (!project) return

    setModal({
      title: project.name,
      content: (
        <>
          <Text className="mb-4">
            <strong>Описание:</strong>{' '}
            {project.description || 'Описание отсутствует'}
          </Text>
          <Text size="s" className="mb-4">
            <strong>Номер проекта</strong>: {project.number}
          </Text>
        </>
      ),
    })
  }

  return (
    <header className="p-4 bg-gray-100 border-b">
      <div className="flex justify-between items-center container mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Text size="xl">Dumper</Text>
          </Link>
          {isHomePage && (
            <Button
              label="Добавить проект"
              iconLeft={IconAdd}
              view="primary"
              onClick={openAddProjectModal}
              size="s"
            />
          )}
          {isProjectPage && project && (
            <div className="flex items-center gap-2">
              <Button
                label={project.name}
                size="s"
                view="ghost"
                onClick={openProjectInfoModal}
                iconLeft={IconInfo}
              />
            </div>
          )}
          {isProjectPage && project && (
            <Button
              label="Загрузить дамп"
              size="s"
              iconLeft={IconAdd}
              view="primary"
              onClick={handleOpenUploadModal}
            />
          )}
        </div>
        <div>
          <Link href="#">Вход</Link>
        </div>
      </div>
    </header>
  )
}

export default Header
